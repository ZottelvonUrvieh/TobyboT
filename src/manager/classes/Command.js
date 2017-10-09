class Command {
    constructor(filePath, mod, bot) {
        this.bot = bot;
        this.path = filePath;
        this.mod = mod;
        let fileName = require('path').resolve(filePath);
        delete require.cache[fileName];
        let commandData = require(fileName);
        let config = commandData.config;
        this.name = config.name;
        this.description = config.description;
        this.cmd = config.cmd;
        this.alias = config.alias;
        this.permissions = config.permissions;
        this.location = config.location;
        this.debugMode = config.debugMode;
        this.run = commandData.run;
        this.debug = function (output, debugMode) {
            if (bot.debugFlags.indexOf('dependant') !== -1 && (this.debugMode === true || this.mod.debugMode === true))
                bot.debug(`${this.toString()}: ${output}`);
        };
        this.log = function (output) {
            bot.log(`${this.toString()}: ${output}`);
        };
        this.warn = function (output) {
            bot.warn(`${this.toString()}: ${output}`);
        };
        this.error = function (output) {
            bot.error(`${this.toString()}: ${output}`);
        };
        this.toString = function () {
            return `Command '${this.name}' in Module '${this.mod.name}'`;
        };
        this.toDebug = function () {
            return `
                Commandname: ${this.name}
                Module: ${this.mod.name}
                Description: ${this.discription}
                File location: ${this.path}
                Command: ${this.cmd}
                Alias: ${this.alias}
                Permissions: ${this.permissions}
                Location: ${this.location}
                Debug-Mode: ${this.debugMode}`;
        }
    }
    get callables() {
        return this.alias.concat(this.cmd);
    }
}

module.exports = Command;