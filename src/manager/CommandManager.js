const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const Command = require('../modules/Command.js');

class CommandManager {
    constructor(bot) {
        this.bot = bot;
        this.allCommands = [];
        // initialize all the modules and their commands
        bot.moduleManager.modules.map(mod => {
            bot.log(`Loading commands of module ${mod.name}`);
            this.loadCommands(mod);
            if (mod.init) mod.init();
        });
    }

    // load all commands of a mod
    loadCommands(mod)  {
        const isJSFile = source => require('path').extname(source) === '.js';
        const getCommandFiles = source =>        
        readdirSync(source).map(name => {
            if (name.startsWith('_')) return __filename;
            return join(source, name);
        }).filter(isJSFile);
        
        getCommandFiles(mod.commandsPath).map(commandFile => this.loadCommand(commandFile, mod));

    }

    loadCommand(commandFile, mod) {
        let command = new Command(commandFile, mod, this.bot);
        if (!command) return false;
        if (this.manageDuplicates(command) === false) 
            return false;
        this.bot.coreDebug(`  - ${command}`);
        this.addPermissions(command);
        this.allCommands.push(command); 
        mod.commands.push(command);
        return true;
    }

    /**
     * Requires the module that contains the command to be loaded
     * 
     * @param {any} commandName 
     * @memberof CommandManager
     */
    loadCommandByNameAndModuleFolderName(commandName, moduleFolderName) {
        if (this.getCommandByName(commandName)) return false; // command already loaded
        let mod = this.bot.moduleManager.getModuleByFolderName(moduleFolderName);
        if (!mod) return; 
        const isJSFile = source => require('path').extname(source) === '.js';
        const getCommandFiles = source =>        
        readdirSync(source).map(name => {
            if (name.startsWith('_')) return __filename;
            return join(source, name);
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
     * Unloads all the commands of a module - not the module itself (for easier reloding purposes)
     * 
     * @param {any} mod 
     * @memberof CommandManager
     */
    unloadModuleCommands(mod) {
        mod.forEach(module => {
            module.commands.forEach( cmd => this.unloadCommand(cmd), this);
        });
    }

    unloadCommand(command) {
        if (command === false) return false;
        this.removeUnneededPermissions(command);
        this.allCommands.splice(this.allCommands.indexOf(command), 1); 
        command.mod.commands.splice(command.mod.commands.indexOf(command), 1); 
        this.bot.coreDebug(`Unloaded ${command}`);
        return true;
    }

    unloadCommandByName(commandName) {
        return this.unloadCommand(this.getCommandByName(commandName));
    }

    reloadCommand(command) {
        return  this.unloadCommand(command) &&
                this.loadCommand(command.path, command.mod);      
    }

    reloadCommandByName(commandName) {
        let command = this.getCommandByName(commandName);
        if (command === false) {
            this.bot.coreDebug(`No command that listens to ${commandName} found.`);   
            return false;
        }
        this.bot.coreDebug(`Reloading  ${command}.`);   
        this.reloadCommand(command);  
        return true;
    }

    /**
     * This function handles:
     * 1. What happens if a commands defined 'cmd' in the settings is the same
     *    as the 'cmd' from another command? -> Command will be rejected -> return false
     * 2. What happens if a commands defined 'cmd' is alread taken from another
     *    commands alias? -> remove the alias from that command
     * 3. What happens if a command defined 'alias' contains a callable ('cmd' + 'alias')
     *    from other commands? -> remove that alias from the inputted command
     * 
     * @param {Command} command 
     * @returns {bool} bool if the command is addable to the current commandpool
     * @memberof CommandManager
     */
    manageDuplicates(command) {
        // check if command name is already taken from another command name
        let conflictingCommand = false;
        this.allCommands.forEach( cmd => {
            if (cmd.cmd === command.cmd) conflictingCommand = cmd;
        }, this);
        if (conflictingCommand !== false) {
            this.bot.error(`Command '${command}' could not be added - cmd is already in use from ${conflictingCommand}`);
            return false;
        }

        // check if command name is already taken from another alias - then remove the alias for the old command
        this.allCommands.forEach( cmd => {
            let index = cmd.callables.indexOf(command.cmd);
            if (index !== -1) {
                cmd.callables.splice(index, 1);
                this.bot.warn(`Your chosen cmd ${command.cmd} for ${command} is used as an alias in ${cmd}. Removing the alias for this command. You might want to update it - just so it is clean...`);
            }
        }, this);

        // check if alias are already taken from another command - if so remove the alias from the new command
        this.allCommands.forEach( cmd => {
            let aliasArray = command.alias.filter( function( el ) {
                return cmd.alias.indexOf( el ) < 0;
            } );
            if (aliasArray.length !== command.alias.length) {
                command.alias = aliasArray;
                this.bot.warn(`At least one of your chosen alias was already taken... Removed the alias from ${command}. Your alias now are: [ ${command.alias.join(', ')} ] You might want to update it - just so it is clean...`);
            }
        }, this);
        return true;
    }

    addPermissions(cmd) {
        let newPerms = cmd.permissions.filter( perm => {
            return this.bot.permissions.indexOf(perm) === -1;
        });
        if (newPerms.length === 0) return;
        this.bot.permissions = this.bot.permissions.concat(newPerms);
        this.bot.coreDebug(`      Adding permissions due to ${cmd} settings: ${newPerms}`);        
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
    getCommandByName(cmdName) {
        for (let i = 0; i < this.allCommands.length; i++) {
            let cmd = this.allCommands[i];
            if (cmd.callables.indexOf(cmdName) !== -1) {
                return cmd;
            }
        }
        return false;
    }

    parseCommand(msg) {
        if (msg.content.startsWith(this.bot.prefix) === false) return;

        const args = msg.content.slice(this.bot.prefix.length).trim().split(/ +/g);
        const cmdName = args.shift();//.toLowerCase(); maybe want to do this... 
        
        let cmd = this.getCommandByName(cmdName);
        if (!cmd) return;
        cmd.run(msg, args);
    }
}   

module.exports = CommandManager;