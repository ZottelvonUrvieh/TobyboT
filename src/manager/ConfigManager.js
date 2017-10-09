class ConfigManager {
    constructor(bot) {
        this.bot = bot;
        this.parse_config_file();
        this.checkSettings();
    }

    parse_config_file() {
        let lines = require('fs').readFileSync('config.cfg').toString().split('\n');
        function startsWith(text, test) {
            let r = new RegExp(`^${test}.*=`, `g`);
            return r.test(text);
        }
        lines.forEach(function(line) {
            if (line.startsWith('#') || line.length === 0) return;
            if (startsWith(line, 'token')) {
                this.bot.token = line.split('=')[1].trim();
            }
            else if (startsWith(line, 'owners')) {
                this.bot.owners = line.split('=')[1].split(',').map(s => s.trim());
            }
            else if (startsWith(line, 'prefix')) {
                this.bot.prefix = line.split('=')[1].trim();
            }
            else if (startsWith(line, 'debugFlags')) {
                this.bot.debugFlags = line.split('=')[1].split(',').map(s => s.trim());
            }
            else if (startsWith(line, 'permissions')) {
                this.bot.defaultPermissions = line.split('=')[1].split(',').map(s => s.trim());
                if (this.bot.defaultPermissions[0] === '') this.bot.defaultPermissions = [];
            }
        }, this);
        if (this.bot.defaultPermissions) this.bot.permissions = this.bot.defaultPermissions;
        else this.bot.permissions = [];
    }

    // TODO: expand!
    checkSettings() {
        let output = [];
        if (this.bot.prefix == '') {
            output.push('You have chosen an empty prefix... that is not allowed. (Or your config is broken) Go check the config.cfg!');
        }
    }

    // kinda dirty... maybe move it to a database at some point?!
    setPrefix(prefix) {
        if (prefix === '' || prefix === this.bot.prefix) {
            return false;
        }
        var fs = require('fs');
        let config = fs.readFileSync('config.cfg').toString();
        let newConfig = config.replace(new RegExp('prefix=.*\n', 'g'), `prefix=${prefix}\n`);
        fs.writeFileSync('config.cfg', newConfig, 'utf8', function (err) {
            if (err) return console.log(err.stack);
        });
        this.bot.prefix = prefix;
        return true;
    }

    // TODO: functions for:
    // 1. DONE changing prefix
    // 2. adding / removing owners
}

module.exports = ConfigManager;