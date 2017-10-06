module.exports = {
    run: async function (message, args) {
        const m = await message.channel.send(`Trying to load ${args[0]}`);        
        let success = this.bot.commandManager.loadCommandByNameAndModuleFolderName(args[0], args[1]);
        if (success === true) await m.edit(`Command ${args[0]} successfully loaded!`);
        else await m.edit(`An error occurred while trying to load \`${args[0]}\` from the Modulefolder \`${args[1]}\`...\n\nAre you sure the command exists and the folder was the correct one and the command was not already loaded?`);
        m.delete(10000);
    },

    config: {
        name: 'Load command',
        cmd: 'load',
        alias: ['l'],
        permissions: [], 
        location: 'ALL',
        description: 'Loads a command by the commands name (or alias).',
        debugMode: true,
        category: 'Debug',
        tags: ['Core', 'Debugging']
    }
};