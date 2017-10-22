const Discord = require('discord.js');
const LoggingManager = require('./manager/LoggingManager');
const ConfigManager = require('./manager/ConfigManager');
const ExtensionManager = require('./manager/ExtensionManager');
const EventEmitter = require('events');
const ModuleManager = require('./manager/ModuleManager');
const ComponentManager = require('./manager/ComponentManager');
const DBManager = require('./manager/DBManager');

// Discord client
const bot = new Discord.Client({ autoReconnect: true });

// Initialize all the managers. Order matters!
bot.loggingManager = new LoggingManager(bot);
bot.configManager = new ConfigManager(bot);
bot.extensions = new ExtensionManager(bot);
bot.taskManager = new EventEmitter();
bot.moduleManager = new ModuleManager(bot);
bot.componentManager = new ComponentManager(bot);
bot.dbManager = new DBManager(bot);
bot.log('Waiting for bot to log in...');
bot.login(bot.configs.token).catch(e => {
    bot.warn('Login failed! Have you edited the config.cfg with your correct token and are you connected to the internet?');
    bot.error(e.stack);
});
