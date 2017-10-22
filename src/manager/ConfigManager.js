const fs = require('fs');
/* eslint-disable no-control-regex */
class ConfigManager {
    constructor(bot) {
        this.bot = bot;
        this.bot.configs = {};
        this.parse_config_file();
        this.checkSettings();
    }

    parse_config_file() {
        let lines = fs.readFileSync('config.cfg').toString().split('\n');
        lines.forEach(function(line) {
            if (line.startsWith('#') || line.length === 0) return;
            line = line.split('=').map(s => s.trim());
            if (line.length !== 2) return;
            // Make properties that are ment to be arrays acutal arrays instead of one string
            if (line[1].includes('[')) line[1] = line[1].replace('[', '').replace(']', '').split(',').map(s => s.trim());
            this.bot.configs[line[0].trim()] = line[1];
        }, this);
        if (this.bot.configs.maxListeners) {
            // Converting to number and setting prototype + bot settings - just to be sure...
            this.bot.configs.maxListeners = +this.bot.configs.maxListeners;
            require('events').EventEmitter.prototype._maxListeners = this.bot.configs.maxListeners;
            this.bot.setMaxListeners(this.bot.configs.maxListeners);
        }
        if (this.bot.configs.defaultPermissions) this.bot.configs.permissions = this.bot.configs.defaultPermissions;
        else this.bot.configs.permissions = [];
    }

    // TODO: expand!
    checkSettings() {
        let errors = [], warnings = [];
        if (!this.bot.configs.owners || this.bot.configs.owners.length > 0)
            warnings.push('You have not set up an owner! To have at least one owner is pretty important!');
        if (this.bot.configs.prefix === '' || typeof this.bot.configs.prefix === 'undefined')
            errors.push('You have chosen an empty prefix... that is not allowed.');
        if (this.bot.configs.debugFlags instanceof Array === false)
            warnings.push('The debugFlags are in a wrong format... have you put them inside \'[\'\']\'? If you want them empty set them to \'[]\'');
        if (this.bot.configs.defaultPermissions instanceof Array === false)
            warnings.push('The defaultPermissions are in a wrong format... have you put them inside \'[\'\']\'? If you want them empty set them to \'[]\'');

        errors.forEach(function (e) { throw this.bot.error(e + ' - (Or your config is broken) Go check the config.cfg!'); }.bind(this));
        warnings.forEach(function (w) { this.bot.warn(w + ' - (Or your config is broken) Go check the config.cfg!\nThis will not crash the bot instantly but can lead to errors later on!' ); }.bind(this));
        this.bot.log(`Bot Prefix is set to: '${this.bot.configs.prefix}'`);
        this.bot.coreDebug(`Bot debug flags are set to: [${this.bot.configs.debugFlags.join(', ')}]`);
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
