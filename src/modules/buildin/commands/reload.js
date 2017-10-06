module.exports = {
    run: async function (message, args) {
        const m = await message.channel.send(`Trying to reload ${args[0]}`);        
        let success = this.bot.commandManager.reloadCommandByName(args[0]);
        if (success === true) await m.edit(`Command ${args[0]} successfull reloaded!`);
        else await m.edit(`No command that listens on ${args[0]} found...`);
        m.delete(5000);
    },

    config: {
        name: 'Reload command',
        cmd: 'reload',
        alias: ['rl', 'r'],
        permissions: [], 
        location: 'ALL',
        description: 'Reloads a command by the commands name (or alias).',
        debugMode: true 
    }
};