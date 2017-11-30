async function displayModuleHelp(menu, mod, message) {
    let help = mod.help(true);
    menu.newCategory()
        .setTitle(help.title)
        .setDescription(help.text)
        .setFooter('To get more information about a Command just click on the corresponding emoji');
    mod.commands.forEach(c => {
        let help = c.help(false);
        menu.addOption(help.title, help.text, displayCommandHelp, menu, c, message);
    }, this);
    menu.update(true);
}

async function displayCommandHelp(menu, cmd, message) {
    let help = cmd.help(true);
    menu.newCategory()
        .setTitle(help.title)
        .setDescription(help.text)
        .setFooter('Not all commands can be executed without arguments!')
        .addOption('Execute command with no arguments', 'ㅤ', function() {
            cmd.bot.componentManager.runCommand({ msg: message, cmd: cmd, args: [] });
        })
        .update();
}

module.exports = {
    run: async function (message) {
        // Display general help - overview over all available Modules
        let menu = new this.bot.extensions.core.Menu(this, 4)
            .setTitle(`**Hello ${message.author.username}! I am Toby and I am a bot!**`)
            .setDescription('This is my help menu.\nYou can navigate it using the emoji reactions underneath.' +
            'Only your interactions will be counted.\n**Currently installed modules are:**')
            .setFooter('To get more information about an item just click on the corresponding emoji')
            .addAllowedIds(message.author.id);
        this.bot.moduleManager.modules.forEach(function (mod) {
            menu.addOption(mod.help(false).title, mod.help(false).text, displayModuleHelp, menu, mod, message);
        }, this);
        menu.send(message.channel);
    },

    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Help';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'help';
        // All these will trigger the run function aswell
        this.alias = ['h'];
        // If more needed than in the module already configured e.g. MESSAGE_DELETE
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Can give an overview what commands are available and what they do.';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function() {
            return  `General help-menu: \`${this.bot.configs.prefix}${this.cmd}\`\n`;
        };
        // Makes the bot message how to use the command correctly if you throw an exception
        this.showUsageOnError = false;
        // Decides where it will be listen in the help menue
        this.category = 'General';
        // Gives some tags in the help menue
        this.tags = ['Core', 'General'];
        // If true the debugmessages of this Command will be displayed in the console
        this.debugMode = true;
        // If true the Command is only usable for the configured owners
        this.ownersOnly = false;
        // If this is > 0 the event autoCleanup will delete user messages with this command after these amount of ms
        this.autoDelete = 10000;
    }
};
