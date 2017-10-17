function connect() {
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
        this.bot.on('ready', connect);
        // This doesn't seem to fire... maye it's because of the auto reconnect option?
        this.bot.on('disconnect', this.bot.moduleManager.disconnectCalls);
        // Not yet used... maybe one of these is the one that should be used insead of 'disconnect'?
        // this.bot.on('resume', this.error);
        // this.bot.on('reconnecting', this.error);
    },
    eject: function () {
        this.bot.removeListener('ready', connect);
        this.bot.removeListener('disconnect', this.bot.moduleManager.disconnectCalls);
        // Not yet used... (see above)
        // this.bot.removeListener('resume', this.debug);
        // this.bot.removeListener('reconnecting', this.debug);
    },
    configs: function () {
        this.name = 'Discord connection handler';
        this.permissions = [];
        this.location = 'ALL';
        this.description = 'Handles changes of the connection to Discord';
        this.debugMode = true;
        this.category = 'Debug';
        this.tags = ['Core', 'Debugging'];
    }
};
let self = null;
