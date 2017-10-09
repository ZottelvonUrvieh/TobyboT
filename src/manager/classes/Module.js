// this class is the
class Module {
    constructor(path, bot) {
        this.debug = function (output) {
            if (bot.debugFlags.indexOf('dependant') !== -1 && this.debugMode === true)
                bot.debug(`In ${this.toString()}: ${output}`);
        };

        this.log = function (output) {
            bot.log(`In ${this.toString()}: ${output}`);
        };

        this.error = function (output) {
            bot.error(`In ${this.toString()}: ${output}`);
        };
        this.toString = function () {
            return `Module '${this.name}'`;
        };

        this.id = require('path').basename(path);
        let loadedData;
        try {
            let fileName = require('path').resolve(path, 'settings.js');
            delete require.cache[fileName];
            loadedData = require(fileName);
        } catch(e) {
            bot.error(`Not able to read the required file 'settings.js' for the Module located in the folder ${path}` +
                      `\nCheck that you have this file in the Module folder and that is does not contains mistakes.` +
                      `\nLook at the example settings.js in the Modulefolders '_exampleModule' or 'builtin' as reference.` +
                      `\n-> Skipping the module!`);
        }
        this.bot = bot;
        this.name = loadedData.config().name;
        this.commands = [];
        this.path = path;
        this.commandsPath = require('path').resolve(path, 'commands');
        this.eventsPath = require('path').resolve(path, 'events');
        this.permissions = loadedData.config().permissions;
        this.debugMode = loadedData.config().debugMode;

        // Called when bot starts, before login into Discord, before the commands get loaded. One time only.
        this.pre_init = loadedData.pre_init;

        // Called when bot starts, before login into Discord, after the commands got loaded. One time only.
        this.init = loadedData.init;

        // Called when bot logs into Discord. Keep in mind, this may be called multiple times.
        this.connect = loadedData.connect;

        // Called when module gets loaded. Keep in mind, this may be called multiple times. (E.g. manually reloading module)
        this.module_load = loadedData.module_load;

        // Called when module gets unloaded. Keep in mind, this may be called multiple times.
        this.module_unload = loadedData.module_unload;

        // Called when the bot disconnects from Discord
        this.disconnect = loadedData.disconnect;
        if (this.pre_init) this.pre_init();
    }
}
module.exports = Module;