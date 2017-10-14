const chalk = require('chalk');
const discordjs = require('discord.js');
const ConfigManager = require('./manager/ConfigManager');
const ModuleManager = require('./manager/ModuleManager');
const CommandManager = require('./manager/CommandManager');
const LoggingManager = require('./manager/LoggingManager');
const DBManager = require('./manager/DBManager');

// Discord client
const bot = new discordjs.Client({autoReconnect:true});

// initialize all the managers
bot.configManager = new ConfigManager(bot);
bot.loggingManager = new LoggingManager(bot);
bot.moduleManager = new ModuleManager(bot);
bot.commandManager = new CommandManager(bot);
bot.dbManager = new DBManager(bot);
// let eve = require('/home/zottelvonurvieh/Documents/programming/projects/discordBots/tobebot/src/modules/buildin/events/exampleEvent.js');
// eve.inject(bot);

bot.on('ready', () => {
    bot.log('Successfully logged into Discord!');
    bot.generateInvite(bot.permissions).then(link => {
        bot.log(`Generated bot invite link (permissions: [${bot.permissions}]):`);
        bot.log(`${chalk.underline(link)}`);
    });
    bot.dbManager.connectDB();
    bot.moduleManager.connectCalls();
});

bot.on('disconnect', () => {
    bot.warn('Disconnected from Discord!');
    bot.moduleManager.disconnectCalls();
});

bot.on('message', msg => {
    if (msg.author.bot) { return; }
    bot.commandManager.parseCommand(msg);
});

// simple error handling
bot.on('error', (e) => bot.error(e.stack));
bot.on('warn', (e) => bot.warn(e));
bot.on('debug', (e) => bot.discordDebug(e));

// TODO: Let this handle a client manager to handle reconnecting and stuff?
bot.log('Waiting for bot to log in...');
bot.login(bot.token).catch(e => {
    bot.warn('Login failed! Have you edited the config.cfg with your correct token and are you connected to the internet?');
    bot.error(e.stack);
});
