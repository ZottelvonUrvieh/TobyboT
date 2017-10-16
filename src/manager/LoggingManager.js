const chalk = require('chalk');
class LoggingManager {
    constructor(bot) {
        // simple error handling - also move that into event folders like the todo below
        bot.on('error', (e) => bot.error(e.stack));
        bot.on('warn', (e) => bot.warn(e));
        bot.on('debug', (e) => bot.discordDebug(e));
        process.on('uncaughtException', function (err) {
            if (err.stack)
                return bot.error(err.stack, 'UNCAUGHT: ');
            return bot.error(err, 'UNCAUGHT: ');
        });
        process.on('unhandledRejection', function (reason, p) {
            if (reason && reason.name === 'DiscordAPIError')
                return bot.discordDebug(reason + ' do do something! (Like deleting messages, kicking people, changing servers / roles etc.. for example)');
            else if (reason.stack)
                return bot.error(reason.message + '   ' + reason.stack, `Promise ${p}: `);
            return bot.error(reason, `Promise ${p}: `);
        });

        // TODO: Make these into files in core/event folder currently it should create duplicates
        //       if you would use the reload command multiple times...
        // Seems to never fire... maybe remove it?
        bot.on('disconnect', () => {
            this.bot.warn('Disconnected from Discord!');
            this.bot.moduleManager.disconnectCalls();
        });

        bot.on('resume', () => {
            this.bot.warn('Resumed Discord!');
            // bot.moduleManager.disconnectCalls();
        });

        bot.on('reconnecting', () => {
            this.bot.warn('Reconnecting Discord!');
            // bot.moduleManager.disconnectCalls();
        });

        // beautify the logging options
        bot.log = this.log;
        bot.error = this.error;
        bot.warn = this.warn;
        bot.debug = this.debug;
        bot.discordDebug = this.discordDebug;
        bot.coreDebug = this.coreDebug;
        bot.loggify = this.loggify;

        // Sugar for clearity and to understand everything
        bot.log(chalk.green(chalk.bold('Color / Symbol legende:')));
        bot.log(
            chalk.red       (chalk.bold('[E]') + ' Error ') +
            chalk.yellow    (chalk.bold('[W]') + ' Warning ') +
            chalk.green     (chalk.bold('[-]') + ' Normal output ') +
            chalk.cyan      (chalk.bold('[D]') + ' Discord debug ') +
            chalk.blue      (chalk.bold('[M]') + ' Module debug ') +
            chalk.magenta   (chalk.bold('[C]') + ' Bot-Core debug \n')
        );
        bot.log('Starting up the bot...');
    }

    loggify(symbol, output = '') {
        if (output.toString !== undefined)
            return `\n${chalk.bold(symbol)} ${output.toString().replace(/\n/g, '\n' + new Array(symbol.length + 2).join(' '))}`;
        return `\n${chalk.bold(symbol)} ${chalk.yellow('(This is not an error per se) But something went wrong... something tried to print out something that was not able to be stringified...')}`;
    }

    log(output, label = '') {
        if (typeof output === 'undefined')
            return process.stdout.write('\n');
        return process.stdout.write(chalk.green(this.loggify('[-]', label + output)));
    }

    error(output, label = '') {
        if (typeof label === 'undefined' || label === null) label = '';
        if (output.stack)
            return process.stderr.write(chalk.red(this.loggify('[E]', label + output.stack)));
        return process.stderr.write(chalk.red(this.loggify('[E]', label + output)));
    }

    warn(output, label = '') {
        return process.stdout.write(chalk.yellow(this.loggify('[W]', label + output)));
    }

    discordDebug(output, label = '') {
        if (['true', 'discord'].some(e => this.settings.debugFlags.indexOf(e) !== -1)) {
            return process.stdout.write(chalk.cyan(this.loggify('[D]', label + output)));
        }
    }

    debug(output, label = '') {
        return process.stdout.write(chalk.blue(this.loggify('[M]', label + output)));
    }

    coreDebug(output, label = '') {
        if (this.settings.debugFlags.indexOf('core') !== -1) {
            return process.stdout.write(chalk.magenta(this.loggify('[C]', label + output)));
        }
    }
}

module.exports = LoggingManager;
