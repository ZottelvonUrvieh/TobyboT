function rejectOrErrFilterDiscord (reason, p) {
    if (reason && reason.name === 'DiscordAPIError')
        return this.discordDebug(reason + ' do do something! (Like deleting already deleted messages, ' +
            'to little permissions but trying to kicking people, delete messages out of dms, changing servers' +
            ' / roles etc.. just to name a couple examples)'
        );
    else if (reason.stack)
        return self.error(reason.message + '   ' + reason.stack, `Promise ${p}: `);
    return self.error(reason, `Promise ${p}: `);
}

module.exports = {
    inject: function () {
        self = this;
        this.bot.on('error', this.error);
        this.bot.on('warn', this.warn);
        this.bot.on('debug', this.bot.discordDebug);
        // This doesn't seem to fire... maye it's because of the auto reconnect option?
        this.bot.on('disconnect', this.bot.moduleManager.disconnectCalls);
        // Not yet used... maybe one of these is the one that should be used insead of 'disconnect'?
        // this.bot.on('resume', this.error);
        // this.bot.on('reconnecting', this.error);

        process.on('uncaughtException', rejectOrErrFilterDiscord);
        process.on('unhandledRejection', rejectOrErrFilterDiscord);
    },
    eject: function () {
        this.bot.removeListener('error', this.error);
        this.bot.removeListener('warn', this.warn);
        this.bot.removeListener('debug', this.bot.discordDebug);
        this.bot.removeListener('disconnect', this.bot.moduleManager.disconnectCalls);
        // Not yet used... (see above)
        // this.bot.removeListener('resume', this.debug);
        // this.bot.removeListener('reconnecting', this.debug);
        process.removeListener('uncaughtException', rejectOrErrFilterDiscord);
        process.removeListener('unhandledRejection', rejectOrErrFilterDiscord);
    },
    configs: function () {
        this.name = 'Core Error Handler';
        this.permissions = [];
        this.location = 'ALL';
        this.description = 'Handles uncaught errors and prettifies caught ones';
        this.debugMode = true;
        this.category = 'Debug';
        this.tags = ['Core', 'Debugging'];
    }
};
let self = null;
