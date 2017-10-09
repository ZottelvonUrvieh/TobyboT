module.exports = {
    run: async function (message, args) {
        // this.debug(Object.keys(this));
        let command = args[0];
        let text = args.slice(1);
        if (command === 'create') {
            this.bot.dbManager.setGuildDataByKey(message.author, text[0], text.slice(1).join(' '));
            let m = await message.channel.send(`Alright! Your input was saved to ${text[0]} :ok_hand:`);
            m.delete(5000);
            return
        }
        let data = await this.bot.dbManager.getGuildDataByKey(message.author, command);
        if (!data) return;
        message.channel.send(data);
    },

    // all settings but cmd and location are optional - the other are just to increase useability
    config: function (bot) {
        return {
            // Displayname that gets shown in help etc.
            name: 'Personal tags',
            // Command that will be used to trigger the bot to execute the run function
            cmd: 'ptag',
            // All these will trigger the run function aswell
            alias: ['personaltag'],
            // If more needed than in the module already configured e.g. MESSAGE_DELETE
            permissions: [],
            // 'GUILD_ONLY', 'DM_ONLY', 'ALL' - where the command can be triggered
            location: 'ALL',
            // Description for the help / menue
            description: 'Make awesome personal tags that only you can use!',
            // Gets shown in specific help and depening on setting (one below) if a command throws an error
            usage: `Create tags with: \`${bot.prefix}${this.config.cmd}ptag create nameOfYourTag This is some cool text.\´\n` +
                   `Show a tag with: \`${bot.prefix}ptag nameOfYourTag\``,
            // Makes the bot message how to use the command correctly if you throw an exception
            showUsageOnError: false,
            // Decides where it will be listen in the help menue
            category: 'General',
            // Gives some tags in the help menue
            tags: ['Core', 'General'],
            // If true the debugmessages of this Command will be displayed in the console
            debugMode: false,
            // If true the Command is only usable for the configured owners
            ownersOnly: true
        }
    }
};