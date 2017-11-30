function connect() {
    this.log('Successfully logged into Discord!');
    this.user.setGame(`Use ${this.configs.prefix}help for Information`);
    // bot.user.setAvatar('./tobybot2.png').catch(error => bot.error(error));
    this.generateInvite(this.configs.permissions).then(link => {
        this.coreDebug(`Generated bot invite link (permissions: [${this.configs.permissions}]):`);
        this.log(`To get the bot on your server just use this link to invite him:\n${require('chalk').underline(link)}`);
    });
    this.dbManager.connectDB();
    this.moduleManager.connectCalls();
}

module.exports = {
    configs: function () {
        this.eventFunctions = [
            { object: this.bot, trigger: 'on', event: 'ready', function: connect },
            // This doesn't seem to fire... maye it's because of the auto reconnect option?
            { object: this.bot, trigger: 'on', event: 'disconnect', function: this.bot.moduleManager.disconnectCalls },
            // Not yet used... maybe one of these is the one that should be used insead of 'disconnect'?
            //{ object: this.bot, trigger: 'on', event: 'disconnect', function: this.bot.moduleManager.disconnectCalls },
            //{ object: this.bot, trigger: 'on', event: 'disconnect', function: this.bot.moduleManager.disconnectCalls },
        ];
        this.name = 'Discord connection handler';
        this.permissions = [];
        this.location = 'ALL';
        this.description = 'Handles changes of the connection to Discord';
        this.debugMode = true;
        this.category = 'Debug';
        this.tags = ['Core', 'Debugging'];
        self = this;
    }
};
let self = null;
