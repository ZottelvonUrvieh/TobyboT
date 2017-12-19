let fs = require('fs');
let Discord = require('discord.js');
module.exports = {
    run: async function (message, args) {
        let channels = message.mentions.channels.array();
        if (channels.length === 0) channels = [message.channel];
        channels.forEach(channel => {
            if (channel.type === 'text') {
                // Only log the ones the user has actually the permissions to read
                if (channel.permissionsFor(message.author).has(['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'], true) === false) {
                    message.channel.send('Sorry you are missing permissions be able to see/log #' + channel.name);
                    return;
                }
                message.channel.send(`I am logging ${channel}... it might take a while depending on when it got logged the last time (or at all)...\nI will send the log to you when I am done! :)`);
            }
            this.logChannel(channel, message);
        });
    },

    writeMessagesToFile: async function (chan, msgs) {
        let dir = './logs/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        for (const msg of msgs) {
            // TODO: Implement file splitting on ~7.5MB bc of Discord upload limit
            fs.appendFileSync(`${dir}${chan.id}.md`, this.msgToMarkdown(msg));
        }
    },

    // TODO: What happens when the message we stored as reference gets deleted?
    logChannel: async function (chan, message) {
        // Access the db to see if this channel already got logged
        let db_entry = await this.bot.dbManager.getTableRowsByKey(this.db, { channel_id: chan.id });
        if (db_entry.length > 0) {
            db_entry = db_entry[0];
            if (db_entry.processing === true) return Error('Someone else is logging this channel right now... try again later...');
            db_entry.processing = true;
            await this.bot.dbManager.setTableRowByKey(this.db, { channel_id: chan.id }, db_entry);
        }

        // First time logging this channel - create a new db entry
        else {
            db_entry = {
                channel_id: chan.id, last_logged_message_id: -1,
                processing_position: -1, processing: true
            };
            await this.bot.dbManager.insertTableRows(this.db, [db_entry]);
        }

        // Store last message where the channel got logged fully to, to stop
        // loading messages when we reach this message again
        let previous_last_logged_message_id = db_entry.last_logged_message_id;

        // Load all not yet logged messages
        let newest_history = [];
        let new_messages = [];
        do {
            let options = { limit: 100 };
            if (db_entry.processing_position > -1) {
                options.before = db_entry.processing_position;
            }
            // Loading 100 messages from the channel
            new_messages = await chan.fetchMessages(options);

            // This comparison works because the id is based on the timestamp of the message (snowflake)
            if (new_messages.size > 0) {
                if (new_messages.first().id > db_entry.last_logged_message_id) {
                    db_entry.last_logged_message_id = new_messages.first().id;
                }
                db_entry.processing_position = new_messages.last().id;
            }
            // Make sure we only log newer messages and stop when we reached the old logging point
            new_messages = new_messages.filter(msg => msg.id > previous_last_logged_message_id);
            // Add all messages to the newest_history array to write them to file later
            newest_history.push(...new_messages.array());
        } while (new_messages.size > 0);

        // Done fetching all newest messages lets sort them to be chronological. (Latest message first)
        newest_history.sort((a, b) => { if (a.id > b.id) return 1; else return -1; });

        // Append new lines to the file
        this.writeMessagesToFile(chan, newest_history);

        // Reset processing state and update the db with newest state and
        // to reset the locking so that others can get the log sent
        db_entry.processing = false;
        db_entry.processing_position = -1;

        await this.bot.dbManager.setTableRowByKey(this.db, { channel_id: chan.id }, db_entry);
        // Send out the log to the person who requested it
        let att = new Discord.Attachment(`./logs/${chan.id}.md`, `${chan.name ? chan.name : chan.id}.md` );
        message.author.send(`Here is the log for the Channel "${chan.name ? chan.name : chan.id}"`, att);
    },

    msgToMarkdown(message) {
        let name = `**${message.author.username}**${message.member && message.member.nickname ? ' - ' + message.member.nickname : ''}`;
        if (message.member != undefined && message.member.highestRole != undefined && message.member.highestRole.hexColor != undefined) {
            name = `<span style="color:${message.member.highestRole.hexColor}">${name}</span>`;
        }
        let header = `#### ${name}` +
            ` at **${message.createdAt.getUTCHours()}:${message.createdAt.getUTCMinutes()}:${message.createdAt.getUTCSeconds()}** (UTC), ` +
            `on **${message.createdAt.toDateString()}**:  \n`;
        let fixed_content = message.cleanContent       // shenanegans for making content's code blocks and newlines correctly displayed in md
            .split('```')
            .join('\n```\n')    // sadly I have not yet found a way to keep language tags for code blocks...
            .split('\n')
            .filter(l => { return l !== ''; }) // and also ignore #'s on the beginning on lines by adding a space before...
            .map(s => { if (s.startsWith('#')) return ' ' + s; else return s; })
            .join('  \n');
        if (fixed_content.split('```').length % 2 === 0) {
            fixed_content += '\n```'; // closes unclosed code tags so that no input like ``` ``` ``` can screw other messages
        }

        let embeds = '';
        for (let emb of message.embeds) {
            let tmp_string = '  \n ';
            if (emb.author != undefined && emb.author != 'undefined' && emb.author != null) {
                tmp_string += `>From: ${emb.author.name} `;
            }
            if (emb.title != undefined && emb.title !== '') {
                tmp_string += `  \n>${emb.title}`;
                if (emb.title === 'Youtube') {
                    tmp_string += `[![Youtube link](${emb.thumbnail.url})](${emb.url})`;
                    embeds += tmp_string;
                    continue;
                }
            }
            if (emb.description != undefined && emb.description !== '') {
                tmp_string += `  \n${emb.description.split('\n').join('  \n>')}`; // markdown requires 2 spaces at the end to recognize newlines and '>' for quotes that contain empty new lines...
            }
            // Now add all the fields
            emb.fields.forEach(field => {
                tmp_string += `  \n${field.name.split('\n').join('  \n>')}`; // markdown requires 2 spaces at the end to recognize newlines and '>' for quotes that contain empty new lines...
                tmp_string += `  \n${field.value.split('\n').join('  \n>')}`; // markdown requires 2 spaces at the end to recognize newlines and '>' for quotes that contain empty new lines...
            });

            let media = false;
            if (emb.thumbnail != undefined && emb.thumbnail != null && emb.thumbnail.url !== '') {
                tmp_string += `  \n![Attachment](${emb.thumbnail.url})`;
                media = true;
            }
            if (emb.image != undefined && emb.image != null) {
                tmp_string += `  \n![Attachment](${emb.image.url})`;
                media = true;
            }
            // if (!media && emb.url != undefined && emb.url != '') {
                //     tmp_string += `  \n![url](${emb.url})`;
                // }
            if (emb.footer != undefined && emb.footer != null && emb.footer.text != '') {
                tmp_string += '  \n>' + emb.footer.text;
            }
            embeds += tmp_string;
        }
        let attatchs = message.attachments.map(att => { return `  \n> ${att.filename.match(/^.*\.(png|jpg|jpeg|gif|raw|pic|giff)/ig)?'!':''}[${att.filename}](${att.url})  \n`; }).join('');

        let seperator = '\n\n---\n';
        return header + fixed_content + embeds + attatchs + seperator;
    },

    configs: function () {
        // Logging db table
        this.db = {
            name: 'logging',
            schemaOptions: {
                channel_id: String,
                last_logged_message_id: String,
                processing_position: String,
                processing: Boolean,
            }
        },
        // Displayname that gets shown in help etc.
        this.name = 'Log Channel';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'log';
        // All these will trigger the run function aswell
        this.alias = [];
        // If more needed than in the module already configured e.g. MANAGE_MESSAGES (see config.conf for all)
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['text', 'group', 'dm'];
        // Description for the help / menue
        this.description = 'Log an entire channel. Sends you a markdown file with everything that got said in the specified channel.';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function () {
            return  `To log this channel do: \`${this.bot.configs.prefix}${this.cmd}\`\n` +
                    `To log another channel do: \`${this.bot.configs.prefix}${this.cmd} #someChannel\`\n` +
                    `To log multiple channels do: \`${this.bot.configs.prefix}${this.cmd} #channel1 #channel2 #channel3\`\n`;
        };
        // Makes the bot message how to use the command correctly if you return an error
        this.showUsageOnError = false;
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
