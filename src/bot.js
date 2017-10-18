const discordjs = require('discord.js');
const LoggingManager = require('./manager/LoggingManager');
const ConfigManager = require('./manager/ConfigManager');
const EventEmitter = require('events');
const ModuleManager = require('./manager/ModuleManager');
const ComponentManager = require('./manager/ComponentManager');
const DBManager = require('./manager/DBManager');

// Discord client
const bot = new discordjs.Client({autoReconnect:true});

// initialize all the managers
bot.loggingManager = new LoggingManager(bot);
bot.configManager = new ConfigManager(bot);
bot.taskManager = new EventEmitter();
bot.moduleManager = new ModuleManager(bot);
bot.componentManager = new ComponentManager(bot);
bot.dbManager = new DBManager(bot);

bot.log('Waiting for bot to log in...');
bot.login('MzQ1NjQzOTI0NDgxOTAwNTQ0.DG-TQw.Y0LYwdQlvOKyaNcdl8u8RN74Etg').catch(e => {
    bot.warn('Login failed! Have you edited the config.cfg with your correct token and are you connected to the internet?');
    bot.error(e.stack);
});
