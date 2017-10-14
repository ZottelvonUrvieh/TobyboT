const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const Module = require('./classes/Module.js');
const CommandManager = require('./CommandManager');

class ModuleManager {
    constructor(bot) {
        this.bot = bot;
        this.modules = [];
        this.indexModules();
    }
    isDirectory(source) { return lstatSync(source).isDirectory(); }
    getDirectories(source) {
        return readdirSync(source).map(name => {
            if (name.startsWith('_')) return __filename; // ignore folders and files with leading underscore
            return join(source, name);
        }).filter(this.isDirectory);
    }

    indexModules() {
        this.bot.coreDebug('Start Indexing Modules');
        this.getDirectories(join(__dirname, '..', 'modules')).map(modFolder => {
            this.indexModule(modFolder);
        });
        this.bot.coreDebug('Finished Indexing Modules');
    }

    indexModule(modFolder) {
        this.bot.coreDebug(`Index Module from folder: ${require('path').basename(modFolder)}... `);
        let mod = new Module(modFolder, this.bot);
        if (mod.name === undefined) return;
        this.addPermissions(mod);
        this.modules.push(mod);
        if (mod.module_load) mod.module_load();
        process.stdout.write(require('chalk').magenta(`DONE! Module '${mod}' is indexed!`));
        return mod;
    }

    addPermissions(mod) {
        let newPerms = mod.permissions.filter( perm => {
            return this.bot.permissions.indexOf(perm) === -1;
        });
        if (newPerms.length === 0) return;
        this.bot.permissions = this.bot.permissions.concat(newPerms);
        this.bot.coreDebug(` Adding permissions due to Module ${mod.name} settings: ${newPerms} `);
    }

    /**
     * This can acutally take either take a module or a command and removes the permissions that
     * are only needed for that module/command
     *
     * @param {Module|Command} mod
     * @memberof ModuleManager
     */
    removeUnneededPermissions(mod) {
        // Heck... can someone plz make this shorter? I am too lazy rn and it works... :D
        let neededPerms = this.bot.defaultPermissions;
        this.modules.forEach(function(module) {
            if (mod === module) return;
            module.permissions.forEach( perm => {
                if (neededPerms.indexOf(perm) === -1) neededPerms.push(perm);
            }, this);
            module.commands.forEach( cmd => {
                if (mod === cmd) return;
                cmd.permissions.forEach( perm => {
                    if (neededPerms.indexOf(perm) === -1) neededPerms.push(perm);
                }, this);
            },this);
        }, this);

        let removedPerms = this.bot.permissions.filter(perm =>{
            return neededPerms.indexOf(perm) === -1;
        });
        if (removedPerms.length === 0) return;
        this.bot.coreDebug(`Removing unneeded permissions because of unloading ${mod}: [${removedPerms}]`);
        this.bot.permissions = neededPerms;
    }

    unloadModuleByID(modID) {
        for (let index = 0; index < this.modules.length; index++) {
            let mod = this.modules[index];
            if (mod.id === modID) {
                this.bot.commandManager.unloadModuleCommands(mod);
                mod.module_unload();
                this.modules.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    reloadModule(mod) {
        this.unloadModuleByID(mod.id);
        let newMod = this.indexModule(mod.path);
        this.bot.commandManager.loadCommands(newMod);
        return newMod;
    }

    reloadModuleByID(modID) {
        if (this.unloadModuleByID(modID) === false) return false;
        let path = require('path').resolve(__dirname, '..', 'modules', modID);
        this.bot.coreDebug(`Reloading module with path ${path}`);
        if (this.isDirectory(path)) {
            let mod = this.indexModule(path);
            this.bot.commandManager.loadCommands(mod);
            return mod;
        }
        this.bot.error(`Was not able to reload Mod with ID ${modID}... Have you deleted or renamed the folder?`);
        return false;
    }

    reloadAllModules () {
        this.bot.moduleManager = new ModuleManager(this.bot);
        this.bot.commandManager = new CommandManager(this.bot);
        return 'Everything ';
    }

    connectCalls() {
        this.modules.map(mod => { if (mod.connect) mod.connect(); });
    }

    disconnectCalls() {
        this.modules.map(mod => { if (mod.disconnect) mod.disconnect(); });
    }

    getModuleByID(modID) {
        for (let i = 0; i < this.modules.length; i++) {
            let mod = this.modules[i];
            if (mod.id === modID) return mod;
        }
        return false;
    }
}

module.exports = ModuleManager;
