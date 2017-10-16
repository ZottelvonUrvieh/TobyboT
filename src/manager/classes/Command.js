class Command {
    constructor(filePath, mod, bot) {
        this.bot = bot;
        this.path = filePath;
        this.mod = mod;
        let fileName = require('path').resolve(filePath);
        delete require.cache[fileName];
        this.commandData = require(fileName);
        // set all the configs (this is kinda hacky to get access to 'this' in configs ^^)
        for (let param in this.commandData) {
            if (this.commandData.hasOwnProperty(param)) {
                this[param] = this.commandData[param];
            }
        }
        this.configs();

        // this is pretty much the only difference between a command and a event
        if (this.commandData.run) this.run = this.commandData.run;
        if (this.commandData.inject) this.inject = this.commandData.inject;
        if (this.commandData.eject) this.eject = this.commandData.eject;

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
            return `[${this.mod.name}] - [${this.name}]`;
        };
        this.toLog = function () {
            return `[${this.mod.id}] - [${require('path').basename(this.path)}]`;
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
        };
        this.detailedHelp = function () {
            let retString = `**__${this.name}:__**\n${this.description}\n\n**Usage:** \n${this.usage()}`;
            retString += `\n\n**Aliases:** \`${this.callables.join('`, `')}\``;
            retString += `\n\nThis command is part of the Module '${this.mod}' - (ModuleID: \`${this.mod.id}\`)`;
            return retString;
        };

        this.help = function (detailed) {
            if (detailed) return this.detailedHelp();
            let retString = `**__${this.name}:__**\n${this.description}`;
            retString += `\n**Aliases:** \`${this.callables.join('`, `')}\``;
            return retString;
        };
    }
    get callables() {
        return this.alias.concat(this.cmd);
    }
}

module.exports = Command;
