const path = require('path');
class ModuleComponent {
    constructor(filePath, mod, bot) {
        this.bot = bot;
        this.path = filePath;
        this.mod = mod;
        let fileName = path.resolve(filePath);
        this.type = path.basename(path.dirname(fileName)).slice(0, -1);
        InjectDebugAndLogging.call(this, bot);
        delete require.cache[fileName];
        let loadedData;
        try {
            loadedData = require(fileName);
        } catch (err) {
            this.error(err);
            return false;
        }
        // set all the properties
        let configs = function () { };
        for (let param in loadedData) {
            if (loadedData.hasOwnProperty(param)) {
                if (param === 'configs' && typeof loadedData[param] === 'function')
                    configs = loadedData[param];
                else this[param] = loadedData[param];
            }
        }
        try {
            configs.call(this);
        } catch (err) {
            this.error(err);
            return false;
        }
    }
}

let InjectDebugAndLogging = function (bot) {
    this.debug = function (output) {
        if (bot.settings.debugFlags.indexOf('dependant') !== -1 && (this.debugMode === true || this.mod.debugMode === true))
            bot.debug(output, `${this.toLog()}: `);
    };
    this.log = function (output) {
        bot.log(output, `${this.toString()}: `);
    };
    this.warn = function (output) {
        bot.warn(output, `${this.toLog()}: `);
    };
    this.error = function (output) {
        bot.error(output, `${this.toLog()}:\n`);
    };
    this.toString = function () {
        return `[${this.mod.name}] - ${this.name}`;
    };
    this.toLog = function () {
        return `[${this.mod.id}] - ${require('path').basename(this.path)}`;
    };
};


module.exports = ModuleComponent;
