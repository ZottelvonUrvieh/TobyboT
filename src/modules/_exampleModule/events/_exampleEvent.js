module.exports = {
    inject: function (bot) {
        bot.on('message', () => {
            bot.log('Got a message Master!');
        });
    },

    configs: function () {
        this.name = 'Message event';
        this.permissions = [];
        this.location = 'ALL';
        this.description = 'Runs every time a message is written in any guild the Bot is on.';
        this.debugMode = true;
        this.category = 'Debug';
        this.tags = ['Core', 'Debugging'];
    }
};
