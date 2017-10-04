const discordjs = require('discord.js');
const chalk = require('chalk');

const bot = new discordjs.Client();

bot.on('ready', () => {
    console.log("Ready and loaded.");
});

bot.on('message', message => {    
    if (message.author.bot) { return; }   
});

bot.login('token').catch(console.error);