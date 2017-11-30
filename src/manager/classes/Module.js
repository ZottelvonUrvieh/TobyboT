class Module {
    constructor(path, bot) {
        injectDebugAndLogging.call(this, bot);
        this.id = require('path').basename(path);
        let loadedData;
        try {
            let fileName = require('path').resolve(path, 'settings.js');
            delete require.cache[fileName];
            loadedData = require(fileName);
        } catch(e) {
            bot.error(`Not able to read the required file 'settings.js' for the Module located in the folder ${path}` +
                      '\nCheck that you have this file in the Module folder and that is does not contains mistakes.' +
                      '\nLook at the example settings.js in the Modulefolders \'_exampleModule\' or \'core\' as reference.' +
                '\n-> Skipping the module!');
            return false;
        }
        this.bot = bot;
        this.configs = loadedData.config();
        for (let property in this.configs) {
            if (this.configs.hasOwnProperty(property)) {
                this[property] = this.configs[property];
            }
        }
        this.commands       = [];
        this.events         = [];
        this.tasks          = [];
        this.path           = path;
        this.commandsPath   = require('path').resolve(path, 'commands');
        this.eventsPath     = require('path').resolve(path, 'events');
        this.tasksPath      = require('path').resolve(path, 'tasks');

        // Called when bot starts, before login into Discord, before the commands get loaded. One time only.
        this.pre_init = loadedData.pre_init || function () { };

        // Called when bot starts, before login into Discord, after the commands got loaded. One time only.
        this.init = loadedData.init || function () { };

        // Called when bot logs into Discord. Keep in mind, this may be called multiple times.
        this.connect = loadedData.connect || function () { };

        // Called when module gets loaded. Keep in mind, this may be called multiple times. (E.g. manually reloading module)
        this.module_load = loadedData.module_load || function () { };

        // Called when module gets unloaded, before the commands are unloaded.
        // Keep in mind, this may be called multiple times.
        this.module_unload = loadedData.module_unload || function () { };

        // Called when module gets unloaded after the commands got unloaded.
        // Keep in mind, this may be called multiple times.
        this.post_module_unload = loadedData.post_module_unload || function () { };

        // Called when the bot disconnects from Discord
        this.disconnect = loadedData.disconnect || function () { };

        // directly run the pre_init for this mod
        if (this.pre_init) this.pre_init();
    }
}
let injectDebugAndLogging = function (bot) {
    this.debug = function (output) {
        if (bot.configs.debugFlags.indexOf('dependant') !== -1 && this.debugMode === true)
            bot.debug(output, this.toLog());
    };

    this.log = function (output) {
        bot.log(output, this.toLog());
    };

    this.error = function (output) {
        bot.error(output, this.toLog());
    };

    this.toLog = function () {
        return `Module ${this.id}: `;
    };

    this.toString = function () {
        return `${this.name}`;
    };

    this.help = function (detailed) {
        if (detailed) return this.detailedHelp();
        let title = `__**${this.toString()}**__ (ID: ${this.id}):`;
        let text = `${this.description} `;
        return { title: title, text: text };
    };

    this.detailedHelp = function () {
        let title = `**${this.toString()}** (ID: ${this.id}):`;
        let text = this.description;
        if (this.tags && this.tags.length > 0) {
            // TODO: If you use markdown in this it duplicates that string after moving up and down in the menu... WHY?
            text += ` - Tags: [${this.tags.join(', ')}]`;
        }
        // For safety a invisible character
        text += ' ';
        // let text = `${this.description} ${(this.tags && this.tags.length > 0) ? `\n**Tags:** [${this.tags.join(', ')}]` : ' '}`;
        return { text: text, title: title};
    };

    // Lists all own poperties and their values - for debugging
    this.toDebugString = function () {
        let moduleObjectKeysAndType = [];
        for (let key in this) {
            if (this.hasOwnProperty(key)) {
                moduleObjectKeysAndType.push(
                    `\n${key}${['string', 'bool', 'number'].indexOf(typeof this[key]) !== -1
                        ? `: ${this[key]}`
                        : `: Property of type '${typeof this[key]}'`}`
                );
            }
        }
        return `ModuleObject: ${moduleObjectKeysAndType}`;
    };
};

module.exports = Module;
