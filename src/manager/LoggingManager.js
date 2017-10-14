const chalk = require('chalk');
class LoggingManager {
    constructor(bot) {
        process.on('uncaughtException', function (err) {
            // handle the error safely
            if (err.stack)
                return this.error(err.stack, 'UNCAUGHT: ');
            return this.error(err, 'UNCAUGHT: ');
        }.bind(this));

        process.on('unhandledRejection', (reason, p) => {
            if (reason.stack)
                return this.error(reason.stack, `Promise ${p}: `);
            return this.error(reason, `Promise ${p}: `);
        });

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
        bot.log(`Bot Prefix is set to: '${bot.prefix}'`);
        bot.coreDebug(`Bot debug flags are set to: [${bot.debugFlags.join(', ')}]`);
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
        if (['true', 'discord'].some(e => this.debugFlags.indexOf(e) !== -1)) {
            return process.stdout.write(chalk.cyan(this.loggify('[D]', label + output)));
        }
    }

    debug(output, label = '') {
        return process.stdout.write(chalk.blue(this.loggify('[M]', label + output)));
    }

    coreDebug(output, label = '') {
        if (this.debugFlags.indexOf('core') !== -1) {
            return process.stdout.write(chalk.magenta(this.loggify('[C]', label + output)));
        }
    }
}

module.exports = LoggingManager;
