module.exports = {
    run: async function (message, args) {
        const m = await message.channel.send(`Trying to load ${args[0]}`);
        let success = this.bot.commandManager.loadCommandByNameAndModuleFolderName(args[0], args[1]);
        if (success === true) await m.edit(`Command ${args[0]} successfully loaded!`);
        else await m.edit(`An error occurred while trying to load \`${args[0]}\` from the Modulefolder \`${args[1]}\`...\n\nAre you sure the command exists and the folder was the correct one and the command was not already loaded?`);
        m.delete(10000);
    },
    // all settings but cmd and location are optional - the other are just to increase useability
    config: function (bot) {
        return {
            // Displayname that gets shown in help etc.
            name: 'Load command',
            // Command that will be used to trigger the bot to execute the run function
            cmd: 'load',
            // All these will trigger the run function aswell
            alias: ['l'],
            // If more needed than in the module already configured e.g. MESSAGE_DELETE
            permissions: [],
            // 'GUILD_ONLY', 'DM_ONLY', 'ALL' - where the command can be triggered
            location: 'ALL',
            // Description for the help / menue
            description: 'Loads a command by the commands name (or alias).',
            // Gets shown in specific help and depening on setting (one below) if a command throws an error
            usage: `To achive ... do this: \`${bot.prefix}${this.config.cmd} theCommandToLoad\``,
            // Makes the bot message how to use the command correctly if you throw an exception
            showUsageOnError: false,
            // Decides where it will be listen in the help menue
            category: 'Debug',
            // Gives some tags in the help menue
            tags: ['Core', 'Debugging'],
            // If true the debugmessages of this Command will be displayed in the console
            debugMode: true,
            // If true the Command is only usable for the configured owners
            ownersOnly: true
        }
    }
};