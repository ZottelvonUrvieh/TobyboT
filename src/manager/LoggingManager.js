const chalk = require('chalk');
class LoggingManager {
    constructor(bot) {
        bot.log = this.log;
        bot.error = this.error;
        bot.warn = this.warn;
        bot.debug = this.debug;
        bot.discordDebug = this.discordDebug; 
        bot.coreDebug = this.coreDebug;       
        
        // Sugar for clearity and to understand everything
        bot.log(`Color/Symbol legende:`);
        console.log(`${chalk.red(`[E] Error `)} ${chalk.yellow(`[W] Warning `)} ${chalk.green(`[-] Normal output `)} ${chalk.cyan(`[D] Discord debug `)} ${chalk.blue(`[M] Module debug `)} ${chalk.magenta(`[C] Bot-Core debug \n`)}`);
        bot.log("Starting up the bot...");
        bot.log(`Bot Prefix is set to: '${bot.prefix}'`);
        bot.coreDebug(`Bot global debug mode is set to: '${bot.debugMode}'`);
    }

    log(output) {
        return console.log(`${chalk.green(`[-] ${output}`)}`);
    }

    error(output) {
        return console.error(`${chalk.red(`[E] ${output}`)}`);
    }

    warn(output) {
        return console.error(`${chalk.yellow(`[W] ${output}`)}`);
    }

    discordDebug(output) {
        if (['true'].indexOf(this.debugMode) !== -1) {
            return console.log(`${chalk.cyan(`[D] ${output}`)}`);
        }
    }

    debug(output, opts) {
        if (['true', 'noDiscord'].indexOf(this.debugMode) !== -1 || opts) {
            return console.log(`${chalk.blue(`[M] ${output}`)}`);
        }
    }

    coreDebug(output) {
        if (['true', 'noDiscord'].indexOf(this.debugMode) !== -1) {
            return console.log(`${chalk.magenta(`[C] ${output}`)}`);
        }
    }
}   

module.exports = LoggingManager;