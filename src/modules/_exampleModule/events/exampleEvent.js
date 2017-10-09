module.exports = {
    inject: function(bot) {
        bot.on('message', () => {
            bot.log("Got a message Master!");
        });
    },

    config: {
        name: 'Message event',
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