const fs = require('fs');
/* eslint-disable no-control-regex */
class ConfigManager {
    constructor(bot) {
        this.bot = bot;
        this.bot.settings = {};
        this.parse_config_file();
        this.checkSettings();
    }

    parse_config_file() {
        let lines = fs.readFileSync('config.cfg').toString().split('\n');
        lines.forEach(function(line) {
            if (line.startsWith('#') || line.length === 0) return;
            line = line.split(' = ');
            if (line.length !== 2) return;
            // Make properties that are ment to be arrays acutal arrays instead of one string
            if (line[1].includes('[')) line[1] = line[1].replace('[', '').replace(']', '').split(',').map(s => s.trim());
            this.bot.settings[line[0].trim()] = line[1];
        }, this);
        if (this.bot.settings.defaultPermissions) this.bot.settings.permissions = this.bot.settings.defaultPermissions;
        else this.bot.settings.permissions = [];
    }

    // TODO: expand!
    checkSettings() {
        let output = [];
        if (this.bot.settings.prefix === '' || typeof this.bot.settings.prefix === 'undefined') {
            output.push('You have chosen an empty prefix... that is not allowed. (Or your config is broken) Go check the config.cfg!');
        }
        output.forEach(function (e) { throw this.bot.error(e); }.bind(this));
        this.bot.log(`Bot Prefix is set to: '${this.bot.settings.prefix}'`);
        this.bot.coreDebug(`Bot debug flags are set to: [${this.bot.settings.debugFlags.join(', ')}]`);
    }

    // kinda dirty... but well... it is not like the config.cfg will ever be
    // waaay too big that that will be a problem? Maybe move it to a database at some point or do something else...
    updateConfig(propertyName, propertyValue) {
        let regex = new RegExp(`\n[ ]*${propertyName}.*=.*\n`, 'g');
        let replacement = `\n${propertyName} = ${propertyValue}\n`;
        if (typeof propertyValue !== 'string')
            replacement = `\n${propertyName} = [ ${propertyValue.join(', ')} ]\n`;
        let config = fs.readFileSync('config.cfg').toString();
        let newConfig = config.replace(regex, replacement);
        return fs.writeFileSync('config.cfg', newConfig, 'utf8', function (err) {
            if (err) return this.bot.error(err.stack);
        }.bind(this));
    }
}

module.exports = ConfigManager;
