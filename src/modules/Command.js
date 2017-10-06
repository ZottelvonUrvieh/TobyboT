class Command {
    constructor(filePath, mod, bot) {
        this.bot = bot;
        this.path = filePath;
        this.mod = mod; // could be derived out of filePath... or is it better to have to hand the mod?
                        // also maybe only storeing the modid is enough?
        let fileName = require('path').resolve(filePath);
        delete require.cache[fileName];
        let commandData = require(fileName);
        this.name = commandData.config.name;
        this.description = commandData.config.description;        
        this.cmd = commandData.config.cmd;
        this.alias = commandData.config.alias;
        this.permissions = commandData.config.permissions;
        this.location = commandData.config.location;
        this.debugMode = commandData.config.debugMode;
        this.run = commandData.run;
        this.debug = function (output, debugMode) {
            bot.debug(`${this.toString()}: ${output}`, debugMode);
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