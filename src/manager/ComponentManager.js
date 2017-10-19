const fs = require('fs');
const path = require('path');
const Command = require('./classes/Module_ModuleComponent_Command');
const Event = require('./classes/Module_ModuleComponent_Event');
const Task = require('./classes/Module_ModuleComponent_Task');
const chalk = require('chalk');

class ComponentManager {
    constructor(bot) {
        this.bot = bot;
        this.commands = [];
        this.events = [];
        this.tasks = [];

        // initialize all the modules and their commands
        bot.moduleManager.modules.map(mod => {
            bot.log(`Loading commands of module '${mod.name}'`);
            this.loadModuleComponents(mod);
            if (mod.init) mod.init();
        });
    }

    // load all components of a mod
    loadModuleComponents(mod)  {
        const isJSFile = source => path.extname(source) === '.js';
        const isDir = source => fs.existsSync(source);
        const getComponentFiles = source =>
            isDir(source) ?
            fs.readdirSync(source).map(name => {
                if (name.startsWith('_')) return '';
                return path.join(source, name);
            }).filter(isJSFile) : [];

        // Is the order important? I don't think so?
        getComponentFiles(mod.eventsPath).map(eventFile => this.loadComponent(eventFile, mod));
        getComponentFiles(mod.commandsPath).map(commandFile => this.loadComponent(commandFile, mod));
        getComponentFiles(mod.tasksPath).map(taskFile => this.loadComponent(taskFile, mod));

    }

    loadComponent(componentFile, mod) {
        let compType = this.getComponentType(componentFile);
        this.bot.coreDebug(`Loading ${compType}: ` +
            `${path.basename(componentFile)} from Modulefolder ${mod.id}... `);
        let component;
        if (compType === 'command')
            component = this.loadCommand(componentFile, mod);
        else if (compType === 'event')
            component = this.loadEvent(componentFile, mod);
        else if (compType === 'task')
            component = this.loadTask(componentFile, mod);
        if (component) process.stdout.write(chalk.magenta(`DONE! ${component} is loaded!`));
        return component;
    }

    getComponentType(componentFile) {
        return path.basename(path.dirname(componentFile)).slice(0, -1);
    }

    loadCommand(commandFile, mod) {
        let cmd;
        try {
            cmd = new Command(commandFile, mod, this.bot);
        } catch (err) {
            mod.error(err);
            return false;
        }
        if (!cmd) return false;
        if (this.manageDuplicates(cmd) === false) {
            return false;
        }
        this.commands.push(cmd);
        mod.commands.push(cmd);
        this.addPermissions(cmd);
        return cmd;
    }

    loadEvent(eventFile, mod) {
        let event;
        try {
            event = new Event(eventFile, mod, this.bot);
        } catch (err) {
            mod.error(err);
            return false;
        }
        if (!event) return false;
        this.addPermissions(event);
        this.events.push(event);
        mod.events.push(event);
        // Add listeners to EventEmitters
        if (event.functions && event.functions.length > 0)
            event.functions.forEach(function(elem) {
                elem.object.on(elem.event, elem.function);
            }, this);
        return event;
    }

    // Yeah I know currently Tasks and Events are pretty much the same thing... but that might change in the future...
    // So that is why they are split up and have different functions already.
    loadTask(taskFile, mod) {
        let task;
        try {
            task = new Task(taskFile, mod, this.bot);
        } catch (err) {
            mod.error(err);
            return false;
        }
        if (!task) return false;
        this.addPermissions(task);
        // Add listeners to EventEmitters
        if (task.functions && task.functions.length > 0)
            task.functions.forEach(function(elem) {
                elem.object.on(elem.event, elem.function);
            }, this);
        this.tasks.push(task);
        mod.tasks.push(task);
        return task;
    }

    // Is this used at all? Or can that be deleted? I was used... when I had the load command...
    // Might want to make one again... Not a priority tho... (But I know that and how it works)
    // /**
    //  * Requires the module that contains the command to be loaded/indexed
    //  *
    //  * @param {any} commandName
    //  * @memberof componentManager
    //  */
    // loadCommandByNameAndModuleFolderName(commandName, moduleFolderName) {
    //     if (this.getCommandByCallable(commandName)) return false; // command already loaded
    //     let mod = this.bot.moduleManager.getModuleByFolderName(moduleFolderName);
    //     if (!mod) return;
    //     const isJSFile = source => path.extname(source) === '.js';
    //     const getCommandFiles = source =>
    //         readdirSync(source).map(name => {
    //             if (name.startsWith('_')) return __filename;
    //             return path.join(source, name);
    //         }).filter(isJSFile);

    //     getCommandFiles(mod.commandsPath).map(commandFile => {
    //         let tmpCmd = new Command(commandFile, mod, this.bot);
    //         if (tmpCmd && tmpCmd.callables.indexOf(commandName) !== -1) {
    //             this.loadComponent(commandFile, mod, this.bot);
    //             return;
    //         }
    //     });
    //     this.bot.coreDebug(`Was unable to find a command that would be triggered by \`${commandName}\` in the Module folder \`${moduleFolderName}\``);
    //     return true;
    // }

    /**
     * Unloads all the commands of a module - does not unindex the module itself (for easier reloding purposes)
     *
     * @param {any} mod
     * @memberof ComponentManager
     */
    unloadModuleComponents(mod) {
        this.bot.debug('Current mod commands: ' + mod.commands.map(m => m.cmd));
        while (mod.commands.length > 0) {
            this.bot.debug(`Unloading command: ${mod.commands[0]}`);
            this.unloadComponent(mod.commands[0]);
        }
        while (mod.events.length > 0) {
            this.bot.coreDebug(`Unloading event: ${mod.events[0]}`);
            this.unloadComponent(mod.events[0]);
        }
        while (mod.tasks.length > 0) {
            this.bot.coreDebug(`Unloading task: ${mod.tasks[0]}`);
            this.unloadComponent(mod.tasks[0]);
        }
    }

    unloadComponent(component) {
        if (component === false) return false;
        this.removeUnneededPermissions(component);

        // Remove listeners from EventEmitters
        if (component.functions && component.functions.length > 0)
            component.functions.forEach(function(elem) {
                elem.object.removeListener(elem.event, elem.function);
            }, this);

        this[`${component.type}s`].splice(this[`${component.type}s`].indexOf(component), 1);
        component.mod[`${component.type}s`].splice(component.mod[`${component.type}s`].indexOf(component), 1);
        this.bot.coreDebug(`Unloaded ${component}`);
        return true;
    }

    unloadComponentByName(commandName) {
        return this.unloadComponent(this.getCommandByCallable(commandName));
    }

    reloadComponent(command) {
        return  this.unloadComponent(command) &&
                this.loadComponent(command.path, command.mod);
    }

    reloadCommandByCallable(commandName) {
        let command = this.getCommandByCallable(commandName);
        if (command === false) {
            this.bot.coreDebug(`No command that listens to ${commandName} found.`);
            return false;
        }
        this.bot.coreDebug(`Reloading  ${command}.`);
        this.reloadComponent(command);
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
     * @memberof ComponentManager
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

    addPermissions(component) {
        let newPerms = component.permissions.filter( perm => {
            return this.bot.configs.permissions.indexOf(perm) === -1;
        });
        if (newPerms.length === 0) return;
        this.bot.configs.permissions = this.bot.configs.permissions.concat(newPerms);
        this.bot.coreDebug(` Adding permissions due to ${component} settings: ${newPerms} `);
    }

    removeUnneededPermissions(component) {
        this.bot.moduleManager.removeUnneededPermissions(component);
    }

    /**
     * Retuns the command where the cmdName is equal to the cmd or one of the alias of the command false if no match
     *
     * @param {any} cmdName
     * @returns
     * @memberof ComponentManager
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
        if (msg.content.startsWith(this.bot.configs.prefix) === false) return false;

        const args = msg.content.slice(this.bot.configs.prefix.length).trim().split(/ +/g);
        const cmdName = args.shift();//.toLowerCase(); maybe want to do this...
        let cmd = this.getCommandByCallable(cmdName);
        return { cmd, msg, args };
    }

    async runCommand(cmdMsgArgs) {
        if (!cmdMsgArgs.cmd) return false;
        // Check ownership only mode and if msg author is owner
        if ((cmdMsgArgs.cmd.ownersOnly || cmdMsgArgs.cmd.mod.ownersOnly) &&
            this.bot.configs.owners.indexOf(cmdMsgArgs.msg.author.id) === -1)
            return false;
        // Check if this command should be executed in this channel ~ depending on cmd settings
        if (cmdMsgArgs.cmd.location.indexOf(cmdMsgArgs.msg.channel.type) === -1)
            return false;
        if (cmdMsgArgs) {
            let error = await cmdMsgArgs.cmd.run(cmdMsgArgs.msg, cmdMsgArgs.args);
            if (error instanceof Error) {
                if (cmdMsgArgs.cmd.showUsageOnError)
                    cmdMsgArgs.msg.channel.send(`**Something went wrong:**\n\`${error.message}\`\n\n${cmdMsgArgs.cmd.usage()}`);
                cmdMsgArgs.cmd.debug(error);
            }
        }
    }
}

module.exports = ComponentManager;
