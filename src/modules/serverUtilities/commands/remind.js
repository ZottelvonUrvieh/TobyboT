module.exports = {
    run: async function (message, args) {
        let db_entries = await this.bot.dbManager.getTableRowsByKey(this.db, { user_id: message.author.id });
        // await this.bot.dbManager.setTableRowByKey(this.db, { user_id: message.author.id }, db_entry);
        if (args[0] === 'list' && args.length === 1) {
            return this.showReminders(message, db_entries);
        }
        else if (['delete', 'remove'].indexOf(args[0]) > -1) {
            return this.deleteReminder(message, db_entries);
        }
        return this.addReminder(message, args, db_entries);
    },

    deleteReminder: async function (message, db_entries) {
        this.showReminders(message, db_entries);
        message.channel.send('Send a message with a number for which reminder you want to delete. (The number infront of the date.)\nSend anything but a number to cancle.');
        message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1 }).then(async col => {
            let index = col.first().cleanContent;
            if (isNaN(index) === false && +index <= db_entries.length) {
                await this.bot.dbManager.deleteTableRowsByKey(this.db, db_entries[+index - 1]);
                message.channel.send(':white_check_mark: Reminder deleted!');
            }
            else message.channel.send('This was not a number (or out of range). Reminder deletion cancled.');
        });
    },

    showReminders: async function (message, db_entries) {
        let string = '**Your current reminders:**';
        for (let index = 0; index < db_entries.length; index++) {
            const entry = db_entries[index];
            string += `\n**${index + 1}.** at ${new Date(entry.time).toUTCString()}:\n` +
                `\`\`\`\n${entry.message}\n\`\`\``;
        }
        if (db_entries.length === 0) string = '**You don\'t have any reminders set at the moment.**';
        message.channel.send(string);
    },

    addReminder: async function (message, args, db_entries) {
        let index = args.lastIndexOf('in');
        let reminder_string = args.splice(0, index).join(' ');
        // after this shift() which removes the 'in',  args only contains the time arguments
        args.shift();
        if (args.length === 0) return new Error('Hmmm... you didn\'t really told me when I should remind you, did you?');
        let time_from_now = 0;
        for (let arg of args) {
            let tmp_time = 0;
            // Check if it is a valid number if the last char is taken out
            if (isNaN(arg.slice(0, -1)) === false) {
                tmp_time = +arg.slice(0, -1);
            }
            else return new Error('Sorry but it seems like you gave some weird arguments that I don\'t understand...\nIt is "d" for days, "h" for hours, "m" for minutes and "s" for seconds. They must be separated by space.');
            if (arg.endsWith('d')) {
                tmp_time = tmp_time * 24 * 60 * 60 * 1000;
            }
            else if (arg.endsWith('h')) {
                tmp_time = tmp_time * 60 * 60 * 1000;
            }
            else if (arg.endsWith('m')) {
                tmp_time = tmp_time * 60 * 1000;
            }
            else if (arg.endsWith('s')) {
                tmp_time = tmp_time * 1000;
            }
            time_from_now += tmp_time;
        }
        let db_entry = {
            user_id:  message.author.id,
            reminder_id: db_entries.length+1,
            time: Date.now() + time_from_now,
            message: reminder_string
        };
        await this.bot.dbManager.insertTableRows(this.db, [db_entry]);
        message.channel.send(`:white_check_mark: I will remind you of it! (It is scheduled for ${new Date(db_entry.time).toUTCString()})`);
    },

    configs: function () {
        // Reminder db table
        this.db = {
            name: 'reminders',
            schemaOptions: {
                user_id: String,
                time: Number,
                message: String,
            }
        },
        // Displayname that gets shown in help etc.
        this.name = 'Reminders';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'remind';
        // All these will trigger the run function aswell
        this.alias = ['reminder', 'remindme'];
        // If more needed than in the module already configured e.g. MANAGE_MESSAGES
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Set reminders that the bot will DM you after a set time.';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function() {
            return  `Just do: \`${this.bot.configs.prefix}${this.cmd} <some text here> in 8d 3h 1m 3s\`` +
                    'You can leave out any of the time arguments (for example just use `... in 24h`)';
        };
        // Makes the bot message how to use the command correctly if you throw an exception
        this.showUsageOnError = true;
        // Decides where it will be listen in the help menue
        this.category = 'General';
        // Gives some tags in the help menue
        this.tags = ['Core', 'General'];
        // If true the debugmessages of this Command will be displayed in the console
        this.debugMode = true;
        // If true the Command is only usable for the configured owners
        this.ownersOnly = false;
        // If this is > 0 the event autoCleanup will delete user messages with this command after these amount of ms
        this.autoDelete = 10000;
    }
};
