module.exports = {
    run: async function (message, ) {
        let m = await message.channel.send(':thinking: Ping');
        m = await m.edit(':thinking: Ping...');
        await m.edit(`:bulb: Pong! My responsiness is about ${m.editedTimestamp - m.createdTimestamp}ms`);
        m.delete(5000);
    },

    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Ping';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'ping';
        // All these will trigger the run function aswell
        this.alias = ['pong'];
        // If more needed than in the module already configured e.g. MESSAGE_DELETE
        this.permissions = [];
        // 'GUILD_ONLY', 'DM_ONLY', 'ALL' - where the command can be triggered
        this.location = 'ALL';
        // Description for the help / menue
        this.description = 'Gets feedback about the ping of the bot.';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function() {
            return `Just do: \`${this.bot.prefix}${this.cmd}\``;
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
    }
};