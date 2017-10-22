function rejectOrErrFilterDiscord (reason, p) {
    if (reason && reason.name === 'DiscordAPIError')
        return self.bot.discordDebug(reason + ' do do something! (Like deleting already deleted messages, ' +
            'to little permissions but trying to kicking people, delete messages out of dms, changing servers' +
            ' / roles etc.. just to name a couple examples)'
        );
    else if (reason.stack)
        return self.error(reason.message + '   ' + reason.stack, `Promise ${p}: `);
    return self.error(reason, `Promise ${p}: `);
}

module.exports = {
    configs: function () {
        this.eventFunctions = [
            { object: this.bot, trigger: 'on', event: 'error',              function: this.error },
            { object: this.bot, trigger: 'on', event: 'warn',               function: this.warn },
            { object: this.bot, trigger: 'on', event: 'debug',              function: this.bot.discordDebug },
            { object: process,  trigger: 'on', event: 'uncaughtException',  function: rejectOrErrFilterDiscord },
            { object: process,  trigger: 'on', event: 'unhandledRejection', function: rejectOrErrFilterDiscord }
        ];
        this.name = 'Core Error Handler';
        this.permissions = [];
        this.location = 'ALL';
        this.description = 'Handles uncaught errors and prettifies caught ones';
        this.debugMode = true;
        this.category = 'Debug';
        this.tags = ['Core', 'Debugging'];
        self = this;
    }
};
let self = null;
