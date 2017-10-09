const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')
const Module = require('./classes/Module.js');

class ModuleManager {
    constructor(bot) {
        this.bot = bot;
        this.modules = [];
        this.loadModules();
    }

    loadModules() {
        const isDirectory = source => lstatSync(source).isDirectory();
        const getDirectories = source =>
        readdirSync(source).map(name => {
            if (name.startsWith('_')) return __filename; // ignore folders and files with leading underscore
            return join(source, name);
        }).filter(isDirectory);

        this.bot.coreDebug('Indexing Modules:');
        getDirectories(join(__dirname, '..', 'modules')).map(modFolder => {
            this.loadModule(modFolder);
        });
    }

    loadModule(modFolder) {
        let mod = new Module(modFolder, this.bot);
        if (mod.name === undefined) return;
        this.bot.coreDebug('  - ' + mod);
        this.addPermissions(mod);
        this.modules.push(mod);
        if (mod.module_load) mod.module_load();
    }

    addPermissions(mod) {
        let newPerms = mod.permissions.filter( perm => {
            return this.bot.permissions.indexOf(perm) === -1;
        });
        if (newPerms.length === 0) return;
        this.bot.permissions = this.bot.permissions.concat(newPerms);
        this.bot.coreDebug(`      Adding permissions due to Module ${mod.name} settings: ${newPerms}`);
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

    unloadModule(modFolder) {
        mod.module_unload();
    }

    connectCalls() {
        this.modules.map(mod => { if (mod.connect) mod.connect(); });
    }

    disconnectCalls() {
        this.modules.map(mod => { if (mod.disconnect) mod.disconnect(); });
    }

    getModuleByFolderName(modFolderName) {
        for (let i = 0; i < this.modules.length; i++) {
            let mod = this.modules[i];
            if (mod.id === modFolderName) return mod;
        }
    }
}

module.exports = ModuleManager;