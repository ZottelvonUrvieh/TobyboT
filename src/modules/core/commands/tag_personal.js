module.exports = {
    run: async function (message, args) {
        let tag = args[0];
        // Define options of the table to use:
        let table = {
            // Name of the table:
            name: 'personal_tag',
            // Define how the rows of the table will look like:
            schemaOptions: { owner_id: String, tag: Object, text: Object }
        };

        if (tag === 'list') {
            let rows = await this.bot.dbManager.getTableRowsByKey(table, { owner_id: message.author.id });
            message.channel.send(`Following personal Tags are available for you ${message.author.username}:\n\`${rows.map(i => i.tag).join(', ')}\``);
            return;
        }
        else if (tag === 'edit') {
            tag = args[1];
            let text = args.slice(2);
            // insert/update row in the table containing the tag owners id, the tagname and the tagtext
            if (text.length === 0) {
                this.bot.dbManager.deleteTableRowsByKey(table, { owner_id: message.author.id, tag: tag });
                message.channel.send(`Alright! Your personal tag ${tag} was deleted :ok_hand:`);
                return;
            }
            this.bot.dbManager.setTableRowByKey(
                table,
                { owner_id: message.author.id, tag: tag },
                { text: text.join(' ') }
            );
            message.channel.send(`Alright! Your input was saved to your personal tag \`${tag}\` :ok_hand:`);
            return;
        }
        let rows = await this.bot.dbManager.getTableRowsByKey(table, { owner_id: message.author.id, tag:tag });
        if (rows === null || !rows[0] || !rows[0].text) return;
        message.channel.send(rows[0].text);
    },

    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Personal tags';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'ptag';
        // All these will trigger the run function aswell
        this.alias = ['pt'];
        // If more needed than in the module already configured e.g. MESSAGE_DELETE
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Make your own awesome personal tags that only you can use on any server the bot is on!';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function () {
            return  `Create / edit tags: \`\`\`${this.bot.configs.prefix}${this.cmd} edit nameOfTheTag This is some cool text.\`\`\`` +
                    `To delete tags leave the text empty: \`\`\`${this.bot.configs.prefix}${this.cmd} edit nameOfTheTag\`\`\`` +
                    `Show a tag with: \`\`\`${this.bot.configs.prefix}${this.cmd} nameOfTheTag\`\`\``;
        };
        // Makes the bot message how to use the command correctly if you throw an exception
        this.showUsageOnError = false;
        // Decides where it will be listen in the help menue
        this.category = 'General';
        // Gives some tags in the help menue
        this.tags = ['Core', 'Genera', 'Social'];
        // If true the debugmessages of this Command will be displayed in the console
        this.debugMode = false;
        // If true the Command is only usable for the configured owners
        this.ownersOnly = false;
        // If this is > 0 the event autoCleanup will delete user messages with this command after these amount of ms
        this.autoDelete = 10000;
    }
};
