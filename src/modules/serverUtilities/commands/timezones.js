let Discord = require('discord.js');
module.exports = {
    run: async function (message, args) {
        if (args.length === 0) return new Error('You need to add some arguments...');
        if (['set', 'add', 'register'].indexOf(args[0]) > -1) {
            return this.setTimezone(message, args);
        }
        else if (['show', 's',].indexOf(args[0]) > -1 || args[0].startsWith('<')) {
            return this.showTimezone(message, args);
        }
        else if (['convert', 'c', 'cv', 'forme'].indexOf(args[0]) > -1) {
            return this.convert(message, args);
        }
        return new Error(`I don\'t know what to do with the argument ${args[0]}...`);
    },

    convert: async function (message, args) {
        // TODO: Implement
        return Error('Sorry this function is not implemented yet...');
    },

    showTimezone: async function (message, args) {
        let user_id;
        if (message.mentions.users.size === 0)
            user_id = message.author.id;
        else user_id = message.mentions.users.first().id;
        let db_entry1 = await this.bot.dbManager.getTableRowsByKey(this.db, { user_id: user_id });
        let db_entry2 = await this.bot.dbManager.getTableRowsByKey(this.db, { user_id: message.author.id });

        if (db_entry1.length > 0) {
            db_entry1 = db_entry1[0];
        } if (db_entry2.length > 0) {
            db_entry2 = db_entry2[0];
        }
        let difference = -(db_entry2.time_shift - db_entry1.time_shift);
        let time_string1 = `${db_entry1.time_shift >= 0 ? '+' : ''}${Math.floor(db_entry1.time_shift / 60)}:${Math.abs(db_entry1.time_shift) % 60 < 10 ? '0' + Math.abs(db_entry1.time_shift) % 60 : Math.abs(db_entry1.time_shift) % 60}`;
        let time_string2 = `${db_entry2.time_shift >= 0 ? '+' : ''}${Math.floor(db_entry2.time_shift / 60)}:${Math.abs(db_entry2.time_shift) % 60 < 10 ? '0' + Math.abs(db_entry2.time_shift) % 60 : Math.abs(db_entry2.time_shift) % 60}`;
        let difference_string = `${difference >= 0 ? '+' : ''}${Math.floor(difference / 60)}:${Math.abs(difference) % 60 < 10 ? '0' + Math.abs(difference) % 60 : Math.abs(difference) % 60}`;
        let message_string = 'This person has not yet set their Timezone...';
        if (user_id !== message.author.id) {
            if (typeof db_entry1.time_shift !== 'undefined') {
                message_string = `The timezone of this person is UTC${time_string1}.`;
                if (typeof db_entry2.time_shift !== 'undefined') {
                    let time = new Date(Date.now() + db_entry1.time_shift*60*1000);
                    message_string +=   ` \nThat is your time with an offset of ${difference_string}.` +
                                        `\nSo currently it is ${time.getUTCHours()}:${time.getUTCMinutes() < 10 ? '0' + time.getUTCMinutes() : time.getUTCMinutes()} for them.`;
                }
            }
            message.channel.send(message_string);
        }
        else {
            message_string = 'You have not set your own timezone yet...';
            if (typeof db_entry2.time_shift !== 'undefined') {
                message_string = `Your Timezone is set to ${time_string2}`;
            }
            message.channel.send(message_string);
        }
    },
    setTimezone: async function (message, args) {
        // Parse the args
        if (args.length === 1)
            return new Error('You need to add your timezone as argument.');
        if (args.length > 2)
            return new Error('I expected you to only live in one timezone at a time... was I wrong?\n(Too much arguments provided...)');
        args = args[1].split(':');
        // Hours to minutes
        args[0] = +args[0] * 60;
        // Access the db
        let db_entry = await this.bot.dbManager.getTableRowsByKey(this.db, { user_id: message.author.id });
        if (db_entry.length > 0) {
            db_entry = db_entry[0];
            // Time shift in minutes
            db_entry.time_shift = args.reduce((sum, val) => sum + +val);
            await this.bot.dbManager.setTableRowByKey(this.db, { user_id: message.author.id }, db_entry);
        }
        // First time setting the timezone - create a new db entry
        else {
            db_entry = {
                user_id: message.author.id,
                time_shift: +args[0] + +args[1]
            };
            await this.bot.dbManager.insertTableRows(this.db, [db_entry]);
        }
        message.channel.send(':ok_hand: Your timezone got set!');
    },

    configs: function () {
        // Logging db table
        this.db = {
            name: 'timezones',
            schemaOptions: {
                user_id: String,
                time_shift: Number
            }
        },
        // Displayname that gets shown in help etc.
        this.name = 'Timezones';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'timezone';
        // All these will trigger the run function aswell
        this.alias = ['tz', 'zone', 'time'];
        // If more needed than in the module already configured e.g. MANAGE_MESSAGES (see config.conf for all)
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['text', 'group', 'dm'];
        // Description for the help / menue
        this.description = 'Show what time it is for other people and convert times!';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function () {
            return `To register your timezone: \`${this.bot.configs.prefix}${this.cmd} set -3:00\`\n` +
                `To look up someones timezone: \`${this.bot.configs.prefix}${this.cmd} show @someone\`\n` +
                `To convert a timezone to your time: \`${this.bot.configs.prefix}${this.cmd} convert 1:24pm est\`\n` +
                `To convert a timezone to another: \`${this.bot.configs.prefix}${this.cmd} convert 1:24pm cest cst\`\n` +
                `To show someones time converted to your local time: \`${this.bot.configs.prefix}${this.cmd} forme @someone#channel1 #channel2 #channel3\`\n`;
        };
        // Makes the bot message how to use the command correctly if you return an error
        this.showUsageOnError = true;
        // Decides where it will be listen in the help menue
        this.category = 'General';
        // Gives some tags in the help menue
        this.tags = ['Utility'];
        // If true the debugmessages of this Command will be displayed in the console
        this.debugMode = true;
        // If true the Command is only usable for the configured owners
        this.ownerOnly = false;
    }
};
