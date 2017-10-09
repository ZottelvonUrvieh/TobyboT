module.exports = {
    run: async function (message, args){
        const m = await message.channel.send(`Setting the prefix to \`${args[0]}\``);
        let success = this.bot.configManager.setPrefix(args[0]);
        if (success === true) await m.edit(`Prefix successfully set to \`${args[0]}\`!`);
        else await m.edit(`Was not able to successfully set Prefix to \`${args[0]}\``);
        m.delete(5000);
    },
    // all settings but cmd and location are optional - the other are just to increase useability
    config: function (bot) {
        return {
            // Displayname that gets shown in help etc.
            name: 'Set Prefix',
            // Command that will be used to trigger the bot to execute the run function
            cmd: 'setprefix',
            // All these will trigger the run function aswell
            alias: ['setPrefix', 'sp'],
            // If more needed than in the module already configured e.g. MESSAGE_DELETE
            permissions: [],
            // 'GUILD_ONLY', 'DM_ONLY', 'ALL' - where the command can be triggered
            location: 'ALL',
            // Description for the help / menue
            description: 'Allows you to change the prefix the bot reacts to.',
            // Gets shown in specific help and depening on setting (one below) if a command throws an error
            usage: `To change the prefix of the bot do: \`${bot.prefix}${this.config.cmd} newPrefix\``,
            // Makes the bot message how to use the command correctly if you throw an exception
            showUsageOnError: false,
            // Decides where it will be listen in the help menue
            category: 'Core',
            // Gives some tags in the help menue
            tags: ['Core'],
            // If true the debugmessages of this Command will be displayed in the console
            debugMode: false,
            // If true the Command is only usable for the configured owners
            ownersOnly: true
        }
    }
};