const ModuleComponent = require('./Module_ModuleComponent');
class Command extends ModuleComponent {

    constructor(filePath, mod, bot) {
        super(filePath, mod, bot);
    }

    detailedHelp () {
        let retString = `**__${this.name}:__**\n${this.description}\n`;
        retString += `\n**Usage:** \n${this.usage()}`;
        retString += `\n\n**Aliases:** \`${this.callables.join('`, `')}\``;
        retString += `\n\nThis ${this.type} is part of the Module '${this.mod}' - (ModuleID: \`${this.mod.id}\`)`;
        return retString;
    }
    help (detailed) {
        if (detailed) return this.detailedHelp();
        let retString = `**__${this.name}:__**\n${this.description}`;
        retString += `\n**Aliases:** \`${this.callables.join('`, `')}\``;
        return retString;
    }
    get callables () {
        return this.alias.concat(this.cmd);
    }
}

module.exports = Command;
