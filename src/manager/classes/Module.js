// this class is the
class Module {
    constructor(path, bot) {
        this.debug = function (output) {
            if (bot.settings.debugFlags.indexOf('dependant') !== -1 && this.debugMode === true)
                bot.debug(`In ${this.toString()}: ${output}`);
        };

        this.log = function (output) {
            bot.log(`In ${this.toString()}: ${output}`);
        };

        this.error = function (output) {
            bot.error(`In ${this.toString()}: ${output}`);
        };
        this.toString = function () {
            return `${this.name}`;
        };

        this.id = require('path').basename(path);
        let loadedData;
        try {
            let fileName = require('path').resolve(path, 'settings.js');
            delete require.cache[fileName];
            loadedData = require(fileName);
        } catch(e) {
            bot.error(`Not able to read the required file 'settings.js' for the Module located in the folder ${path}` +
                      '\nCheck that you have this file in the Module folder and that is does not contains mistakes.' +
                      '\nLook at the example settings.js in the Modulefolders \'_exampleModule\' or \'builtin\' as reference.' +
                      '\n-> Skipping the module!');
        }
        this.bot = bot;
        this.configs = loadedData.config();
        for (let property in this.configs) {
            if (this.configs.hasOwnProperty(property)) {
                this[property] = this.configs[property];
            }
        }
        this.commands = [];
        this.events = [];
        this.path = path;
        this.commandsPath = require('path').resolve(path, 'commands');
        this.eventsPath = require('path').resolve(path, 'events');

        this.help = function (detailed) {
            if (detailed) return this.detailedHelp();
            let retString = `__**${this.name}**__ (ID: ${this.id}):\n${this.description}`;
            return retString;
        };

        this.detailedHelp = function () {
            let retString = `**${this.name}** (ID: ${this.id}):\n${this.description}`;
            if (this.tags.length > 0) retString += `\n\n**Tags:** [${this.tags.join(', ')}]`;
            else retString += '\n\n**Tags:** None';
            return retString;
        };

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
