module.exports = {
    run: async function (message, args) {
        if (this.mod.permissions.concat(this.permissions).indexOf('MANAGE_MESSAGES') !== -1) message.delete(10000);
        const m = await message.channel.send(`Setting the prefix to \`${args[0]}\``);
        let success = false;
        if (args[0] && args[0].length > 0) success = this.bot.configManager.setPrefix(args[0]);
        if (success === true) await m.edit(`Prefix successfully set to \`${args[0]}\`!`);
        else await m.edit(`Was not able to successfully set Prefix to \`${args[0]}\``);
        m.delete(5000);
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
        this.usage = function () { return `To change the prefix of the bot do: \`${this.bot.prefix}${this.cmd} newPrefix\``; };
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
    }
};
