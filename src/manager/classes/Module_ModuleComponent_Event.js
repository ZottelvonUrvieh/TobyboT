const ModuleComponent = require('./Module_ModuleComponent');
class Event extends ModuleComponent {
    constructor(filePath, mod, bot) {
        super(filePath, mod, bot);
        this.functions = this.eventFunctions;
    }
    detailedHelp() {
        let retString = `**__${this.name}:__**\n${this.description}\n`;
        retString += `\n\nThis ${this.type} is part of the Module '${this.mod}' - (ModuleID: \`${this.mod.id}\`)`;
        return retString;
    }
    help(detailed) {
        if (detailed) return this.detailedHelp();
        let retString = `**__${this.name}:__**\n${this.description}`;
        return retString;
    }
}

module.exports = Event;
