module.exports = {
    run: async function (message, args) {
        let command = args[0];
        let text = args.slice(1);
        if (command === 'create') {
            this.bot.dbManager.setUserDataByKey(message.author, `ptag_${text[0]}`, text.slice(1).join(' '));
            let m = await message.channel.send(`Alright! Your input was saved to your personal tag ${text[0]} :ok_hand:`);
            m.delete(5000);
            return;
        }
        let data = await this.bot.dbManager.getUserDataByKey(message.author, command);
        if (!data) return;
        message.channel.send(data);
    },

    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Personal tags';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'ptag';
        // All these will trigger the run function aswell
        this.alias = ['pt'];
        // If more needed than in the module already configured e.g. MESSAGE_DELETE
        this.permissions = [];
        // 'GUILD_ONLY', 'DM_ONLY', 'ALL' - where the command can be triggered
        this.location = 'ALL';
        // Description for the help / menue
        this.description = 'Make your own awesome personal tags that only you can use on any server the bot is on!';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function () {
            return  `Create tags with: \`${this.bot.prefix}${this.cmd} create nameOfTheTag This is some cool text.\`\n` +
                    `Show a tag with: \`${this.bot.prefix}${this.cmd} nameOfTheTag\``;
        };
        // Makes the bot message how to use the command correctly if you throw an exception
        this.showUsageOnError = false;
        // Decides where it will be listen in the help menue
        this.category = 'General';
        // Gives some tags in the help menue
        this.tags = ['Core', 'Genera', 'Social'];
        // If true the debugmessages of this Command will be displayed in the console
        this.debugMode = false;
        // If true the Command is only usable for the configured owners
        this.ownersOnly = false;
    }
};
