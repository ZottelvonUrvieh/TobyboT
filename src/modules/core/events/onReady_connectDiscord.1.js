function run() {
    this.log('Successfully logged into Discord!');
    this.user.setGame(`Use ${this.settings.prefix}help for Information`);
    // bot.user.setAvatar('./tobybot2.png').catch(error => bot.error(error));
    this.generateInvite(this.settings.permissions).then(link => {
        this.log(`Generated bot invite link (permissions: [${this.settings.permissions}]):`);
        this.log(`${require('chalk').underline(link)}`);
    });
    this.dbManager.connectDB();
    this.moduleManager.connectCalls();
}

module.exports = {
    inject: function () {
        self = this;
        this.bot.on('ready', run);
    },
    eject: function () {
        this.bot.removeListener('ready', run);
    },
    configs: function () {
        this.name = 'Discord connect';
        this.permissions = [];
        this.location = 'ALL';
        this.description = 'Happens every time the bot successfully establishes a connection with Discord';
        this.forceMode = 1; // 0: Do not force to delete messages, 1: Force deleting messages, 2: Force not deleting messages
        this.debugMode = true;
        this.category = 'Debug';
        this.tags = ['Core', 'Debugging'];
    }
};
let self = null;
