module.exports = {
    run: async function (message, args){
        let m = await message.channel.send(':thinking: Ping');
        m = await m.edit(`:thinking: Ping...`);
        await m.edit(`:bulb: Pong! My responsiness is about ${m.editedTimestamp - m.createdTimestamp}ms`);
        m.delete(5000);
    },

    config: {
        name: 'Ping',
        cmd: 'ping',
        alias: ['pong'],
        permissions: [], 
        location: 'ALL',
        description: 'Gets feedback about the ping of the bot.',
        debugMode: false 
    }
};