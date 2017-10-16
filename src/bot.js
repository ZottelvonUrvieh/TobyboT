const discordjs = require('discord.js');
const LoggingManager = require('./manager/LoggingManager');
const ConfigManager = require('./manager/ConfigManager');
const ModuleManager = require('./manager/ModuleManager');
const CommandManager = require('./manager/CommandManager');
const DBManager = require('./manager/DBManager');

// Discord client
const bot = new discordjs.Client({autoReconnect:true});

// initialize all the managers
bot.loggingManager = new LoggingManager(bot);
bot.configManager = new ConfigManager(bot);
bot.moduleManager = new ModuleManager(bot);
bot.commandManager = new CommandManager(bot);
bot.dbManager = new DBManager(bot);

bot.log('Waiting for bot to log in...');
bot.login(bot.settings.token).catch(e => {
    bot.warn('Login failed! Have you edited the config.cfg with your correct token and are you connected to the internet?');
    bot.error(e.stack);
});
