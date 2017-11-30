const ModuleComponent = require('./Module_ModuleComponent');
class Command extends ModuleComponent {

    constructor(filePath, mod, bot) {
        super(filePath, mod, bot);
    }

    detailedHelp () {
        let title = `**__${this.name}:__**`;
        let text =  `${this.description} `;
        text += `\n**Usage:** \n${this.usage()}`;
        text += `\n\n**Aliases:** \`${this.callables.join('`, `')}\``;
        // retString += `\n\nThis ${this.type} is part of the Module '${this.mod}' - (ModuleID: \`${this.mod.id}\`)`;
        return { title: title, text: text };
    }
    help (detailed) {
        if (detailed) return this.detailedHelp();
        let title = `**__${this.name}:__**`;
        let text  = `${this.description}\n**Aliases:** \`${this.callables.join('`, `')}\``;
        return { title: title, text: text };
    }
    get callables () {
        return this.alias.concat(this.cmd);
    }
}

module.exports = Command;
