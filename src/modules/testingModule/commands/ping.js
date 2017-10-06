module.exports = {
    run: async function (message, args){
        const m = await message.channel.send(':thinking: Ping');
        await m.edit(`:stopwatch: Pong! \`${m.createdTimestamp - message.createdTimestamp}ms\``);
        m.delete(5000);
    },

    config: {
        name: 'Ping',
        cmd: 'we',
        alias: ['e'],
        permissions: [], 
        location: 'ALL',
        description: 'Description of the command',
        debugMode: true 
    }
};