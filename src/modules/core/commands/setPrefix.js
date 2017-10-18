module.exports = {
    run: async function (message, args) {
        let success = false;
        if (args[0] && args[0].length > 0 && args[0] !== this.bot.configs.prefix) {
            this.bot.configManager.updateConfig('prefix', args[0]);
            this.bot.configs.prefix = args[0];
            success = true;
        }
        if (success === true) message.channel.send(`Prefix successfully set to \`${args[0]}\`!`);
        else message.channel.send(`Was not able to successfully set Prefix to \`${args[0]}\``);
    },

    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Set Prefix';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'setprefix';
        // All these will trigger the run function aswell
        this.alias = ['setPrefix', 'sp'];
        // If more needed than in the module already configured e.g. MESSAGE_DELETE
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Allows you to change the prefix the bot reacts to.';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function () { return `To change the prefix of the bot do: \`${this.bot.configs.prefix}${this.cmd} newPrefix\``; };
        // Makes the bot message how to use the command correctly if you throw an exception
        this.showUsageOnError = false;
        // Decides where it will be listen in the help menue
        this.category = 'Core';
        // Gives some tags in the help menue
        this.tags = ['Core'];
        // If true the debugmessages of this Command will be displayed in the console
        this.debugMode = false;
        // If true the Command is only usable for the configured owners
        this.ownersOnly = true;
        // If this is > 0 the event autoCleanup will delete user messages with this command after these amount of ms
        this.autoDelete = 10000;
    }
};
