const { readdirSync } = require('fs');
const path = require('path');
const Command = require('./classes/Command.js');
const chalk = require('chalk');

class CommandManager {
    constructor(bot) {
        this.bot = bot;
        this.commands = [];
        this.events = [];
        // initialize all the modules and their commands
        bot.moduleManager.modules.map(mod => {
            bot.log(`Loading commands of module '${mod.name}'`);
            this.loadCommandsAndEvents(mod);
            if (mod.init) mod.init();
        });
    }

    // load all commands of a mod
    loadCommandsAndEvents(mod)  {
        const isJSFile = source => path.extname(source) === '.js';
        const getCommandFiles = source =>
            readdirSync(source).map(name => {
                if (name.startsWith('_')) return '';
                return path.join(source, name);
            }).filter(isJSFile);

        getCommandFiles(mod.commandsPath).map(commandFile => this.loadCommand(commandFile, mod));
        getCommandFiles(mod.eventsPath).map(eventFile => this.loadEvent(eventFile, mod));
    }

    loadCommand(commandFile, mod) {
        this.bot.coreDebug(`Loading command: ${path.basename(commandFile)} from Modulefolder ${mod.id}... `);
        let command = new Command(commandFile, mod, this.bot);
        if (!command) return false;
        if (this.manageDuplicates(command) === false) {
            return false;
        }
        this.addPermissions(command);
        this.commands.push(command);
        mod.commands.push(command);
        process.stdout.write(chalk.magenta(`DONE! ${command} is loaded!`));
        return true;
    }

    loadEvent(eventFile, mod) {
        this.bot.coreDebug(`Loading event: ${path.basename(eventFile)} from Modulefolder ${mod.id}... `);
        let event = new Command(eventFile, mod, this.bot);
        if (!event) return false;
        this.addPermissions(event);
        this.events.push(event);
        mod.events.push(event);
        event.inject();
        process.stdout.write(chalk.magenta(`DONE! ${event} is loaded!`));
        return true;
    }

    ejectAllEvents() {
        this.bot.moduleManager.modules.forEach(function(mod) {
            mod.events.forEach(function(event) {
                event.eject();
            }, this);
        }, this);
    }

    /**
     * Requires the module that contains the command to be loaded/indexed
     *
     * @param {any} commandName
     * @memberof CommandManager
     */
    loadCommandByNameAndModuleFolderName(commandName, moduleFolderName) {
        if (this.getCommandByCallable(commandName)) return false; // command already loaded
        let mod = this.bot.moduleManager.getModuleByFolderName(moduleFolderName);
        if (!mod) return;
        const isJSFile = source => path.extname(source) === '.js';
        const getCommandFiles = source =>
            readdirSync(source).map(name => {
                if (name.startsWith('_')) return __filename;
                return path.join(source, name);
            }).filter(isJSFile);

        getCommandFiles(mod.commandsPath).map(commandFile => {
            let tmpCmd = new Command(commandFile, mod, this.bot);
            if (tmpCmd && tmpCmd.callables.indexOf(commandName) !== -1) {
                this.loadCommand(commandFile, mod, this.bot);
                return;
            }
        });
        this.bot.coreDebug(`Was unable to find a command that would be triggered by \`${commandName}\` in the Module folder \`${moduleFolderName}\``);
        return true;
    }

    /**
     * Unloads all the commands of a module - does not unindex the module itself (for easier reloding purposes)
     *
     * @param {any} mod
     * @memberof CommandManager
     */
    unloadModuleCommands(mod) {
        this.bot.debug('Current mod commands: ' + mod.commands.map(m => m.cmd));
        while (mod.commands.length > 0) {
            this.bot.debug(`Removing: ${mod.commands[0]}`);
            this.unloadCommand(mod.commands[0]);
        }
    }

    unloadCommand(command) {
        if (command === false) return false;
        this.removeUnneededPermissions(command);
        this.commands.splice(this.commands.indexOf(command), 1);
        command.mod.commands.splice(command.mod.commands.indexOf(command), 1);
        this.bot.coreDebug(`Unloaded ${command}`);
        return true;
    }

    unloadCommandByName(commandName) {
        return this.unloadCommand(this.getCommandByCallable(commandName));
    }

    reloadCommand(command) {
        return  this.unloadCommand(command) &&
                this.loadCommand(command.path, command.mod);
    }

    reloadCommandByCallable(commandName) {
        let command = this.getCommandByCallable(commandName);
        if (command === false) {
            this.bot.coreDebug(`No command that listens to ${commandName} found.`);
            return false;
        }
        this.bot.coreDebug(`Reloading  ${command}.`);
        this.reloadCommand(command);
        return command;
    }

    /**
     * This function handles:
     * a) What happens if a commands defined 'cmd' in the settings is the same
     *    as the 'cmd' from another command? -> Command will be rejected -> return false
     * b) What happens if a commands defined 'cmd' is alread taken from another
     *    commands alias? -> remove the alias from that command
     * c) What happens if a command defined 'alias' contains a callable ('cmd' + 'alias')
     *    from other commands? -> remove that alias from the inputted command
     *
     * @param {Command} command
     * @returns {bool} bool if the command is addable to the current commandpool
     * @memberof CommandManager
     */
    manageDuplicates(command) {
        // check if command name is already taken from another command name
        let conflictingCommand = false;
        this.commands.forEach( cmd => {
            if (cmd.cmd === command.cmd) conflictingCommand = cmd;
        }, this);
        if (conflictingCommand !== false) {
            process.stdout.write(chalk.red('FAILED! Due to cmd conflicts!'));
            this.bot.error(`Command '${command}' could not be added - cmd '${command.cmd}' is already in use from ${conflictingCommand}`);
            return false;
        }

        // check if command name is already taken from another alias - then remove the alias for the old command
        this.commands.forEach( cmd => {
            let index = cmd.callables.indexOf(command.cmd);
            if (index !== -1) {
                cmd.callables.splice(index, 1);
                process.stdout.write(chalk.yellow(`Alias conflicts! Your chosen cmd '${command.cmd}' for ${command} is used as an alias in ${cmd}. Removing the alias for this command. You might want to update it - just so it is clean... `));
            }
        }, this);

        // check if alias are already taken from another command - if so remove the alias from the new command
        this.commands.forEach( cmd => {
            let aliasArray = command.alias.filter( function( el ) {
                return cmd.alias.indexOf( el ) < 0;
            } );
            if (aliasArray.length !== command.alias.length) {
                command.alias = aliasArray;
                process.stdout.write(chalk.yellow(`Alias conflicts! At least one of your chosen alias was already taken... Removed the alias from ${command}. Your alias now are: [ ${command.alias.join(', ')} ] You might want to update it - just so it is clean... `));
            }
        }, this);
        return true;
    }

    addPermissions(cmd) {
        let newPerms = cmd.permissions.filter( perm => {
            return this.bot.settings.permissions.indexOf(perm) === -1;
        });
        if (newPerms.length === 0) return;
        this.bot.settings.permissions = this.bot.settings.permissions.concat(newPerms);
        this.bot.coreDebug(` Adding permissions due to ${cmd} settings: ${newPerms} `);
    }

    removeUnneededPermissions(command) {
        this.bot.moduleManager.removeUnneededPermissions(command);
    }

    /**
     * Retuns the command where the cmdName is equal to the cmd or one of the alias of the command false if no match
     *
     * @param {any} cmdName
     * @returns
     * @memberof CommandManager
     */
    getCommandByCallable(cmdName) {
        for (let i = 0; i < this.commands.length; i++) {
            let cmd = this.commands[i];
            if (cmd.callables.indexOf(cmdName) !== -1) {
                return cmd;
            }
        }
        return false;
    }

    parseMsgToCommand(msg) {
        if (msg.author.bot) return false;
        if (msg.content.startsWith(this.bot.settings.prefix) === false) return false;

        const args = msg.content.slice(this.bot.settings.prefix.length).trim().split(/ +/g);
        const cmdName = args.shift();//.toLowerCase(); maybe want to do this...
        let cmd = this.getCommandByCallable(cmdName);
        this.bot.coreDebug(cmd);
        return { cmd, msg, args };
    }

    async runCommand(cmdMsgArgs) {
        if (!cmdMsgArgs.cmd) return false;
        // Check ownership only mode and if msg author is owner
        if ((cmdMsgArgs.cmd.ownersOnly || cmdMsgArgs.cmd.mod.ownersOnly) &&
            this.bot.settings.owners.indexOf(cmdMsgArgs.msg.author.id) === -1)
            return false;
        // Check if this command should be executed in this channel ~ depending on cmd settings
        if (cmdMsgArgs.cmd.location.indexOf(cmdMsgArgs.msg.channel.type) === -1)
            return false;
        if (cmdMsgArgs) {
            let error = await cmdMsgArgs.cmd.run(cmdMsgArgs.msg, cmdMsgArgs.args);
            if (error instanceof Error) {
                if (cmdMsgArgs.cmd.showUsageOnError)
                    cmdMsgArgs.msg.channel.send(`**Something went wrong:**\n\`${error.message}\`\n\n${cmdMsgArgs.cmd.usage()}`);
                cmdMsgArgs.cmd.error(error);
            }
        }
    }
}

module.exports = CommandManager;
