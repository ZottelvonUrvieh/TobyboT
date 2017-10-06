module.exports = {
    run: async function (message, args) {
        const m = await message.channel.send(`Trying to unload ${args[0]}`);        
        let success = this.bot.commandManager.unloadCommandByName(args[0]);
        if (success === true) await m.edit(`Command ${args[0]} successfull unloaded!`);
        else await m.edit(`No command that listens on ${args[0]} found...`);
        m.delete(5000);
    },

    config: {
        name: 'Unload command',
        cmd: 'unload',
        alias: ['ul', 'uload', 'unl'],
        permissions: [], 
        location: 'ALL',
        description: 'Unloads a command by the commands name (or alias).',
        debugMode: true 
    }
};