module.exports = {
    run: async function (message, args) {
        this.debug('stuff');
        let m = await message.channel.send(':thinking: Ping');
        m = await m.edit(`:thinking: Ping...`);
        await m.edit(`:bulb: Pong! My responsiness is about ${m.editedTimestamp - m.createdTimestamp}ms`);
        m.delete(5000);
    },

    // all settings but cmd and location are optional - the other are just to increase useability
    config: function (bot) {
        return {
            // Displayname that gets shown in help etc.
            name: 'asdf',
            // Command that will be used to trigger the bot to execute the run function
            cmd: 'asdf',
            // All these will trigger the run function aswell
            alias: [],
            // If more needed than in the module already configured e.g. MESSAGE_DELETE
            permissions: [],
            // 'GUILD_ONLY', 'DM_ONLY', 'ALL' - where the command can be triggered
            location: 'ALL',
            // Description for the help / menue
            description: 'Gets feedback about the ping of the bot.',
            // Gets shown in specific help and depening on setting (one below) if a command throws an error
            usage: `Just do \`${bot.prefix}${this.config.cmd}\``,
            // Makes the bot message how to use the command correctly if you throw an exception
            showUsageOnError: false,
            // Decides where it will be listen in the help menue
            category: 'Core',
            // Gives some tags in the help menue
            tags: ['Core', 'General'],
            // If true the debugmessages of this Command will be displayed in the console
            debugMode: true,
            // If true the Command is only usable for the configured owners
            ownersOnly: true
        }
    }
};