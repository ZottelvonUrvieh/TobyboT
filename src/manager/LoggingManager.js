const chalk = require('chalk');
class LoggingManager {
    constructor(bot) {
        bot.log = this.log;
        bot.error = this.error;
        bot.warn = this.warn;
        bot.debug = this.debug;
        bot.discordDebug = this.discordDebug;
        bot.coreDebug = this.coreDebug;
        bot.loggify = this.loggify;

        // Sugar for clearity and to understand everything
        console.log(chalk.green(chalk.bold(`Color / Symbol legende:`)));
        console.log(
            chalk.red       (chalk.bold(`[E]`) + ` Error `) +
            chalk.yellow    (chalk.bold(`[W]`) + ` Warning `) +
            chalk.green     (chalk.bold(`[-]`) + ` Normal output `) +
            chalk.cyan      (chalk.bold(`[D]`) + ` Discord debug `) +
            chalk.blue      (chalk.bold(`[M]`) + ` Module debug `) +
            chalk.magenta   (chalk.bold(`[C]`) + ` Bot-Core debug \n`)
        );
        bot.log("Starting up the bot...");
        bot.log(`Bot Prefix is set to: '${bot.prefix}'`);
        bot.coreDebug(`Bot global debug mode is set to: '${bot.debugMode}'`);
    }

    loggify(symbol, output) {
        if (output.toString !== undefined)
            return `${chalk.bold(symbol)} ${output.toString().replace(/\n/g, '\n' + new Array(symbol.length + 2).join(' '))}`;
        else
            return `${chalk.bold(symbol)} ${chalk.yellow('(This is not an error per se) But something went wrong... something tried to print out something that was not able to be stringified...')}`;
    }

    log(output) {
        return console.log(chalk.green(this.loggify('[-]', output)));
    }

    error(output) {
        return console.log(chalk.red(this.loggify('[E]', output)));
    }

    warn(output) {
        return console.log(chalk.yellow(this.loggify('[W]', output)));
    }

    discordDebug(output) {
        if (['true', 'discord'].some(e => this.debugFlags.indexOf(e) !== -1)) {
            return console.log(chalk.cyan(this.loggify('[D]', output)));
        }
    }

    debug(output) {
        return console.log(chalk.blue(this.loggify('[M]', output)));
    }

    coreDebug(output) {
        if (this.debugFlags.indexOf('core') !== -1) {
            return console.log(chalk.magenta(this.loggify('[C]', output)));
        }
    }
}

module.exports = LoggingManager;
// module.exports = function () {
//     console.log = LoggingManager.log;
// }