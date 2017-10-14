module.exports = {
    run: async function (message, args) {
        if (this.mod.permissions.concat(this.permissions).indexOf('MANAGE_MESSAGES') !== -1) message.delete(10000);
        let tag = args[0];
        let text = args.slice(1);
        // Define options of the table to use:
        let table = {
            // Name of the table:
            name: 'personal_tag',
            // Define how the rows of the table will look like:
            schemaOptions: { owner_id: String, tag: Object, text: Object }
        };
        if (tag === 'edit') {
            // insert/update row in the table containing the tag owners id, the tagname and the tagtext
            this.bot.dbManager.setTableRowByKey(
                table,
                { owner_id: message.author.id, tag: text[0] },
                { text: text.slice(1).join(' ') }
            );
            let m = await message.channel.send(`Alright! Your input was saved to your personal tag ${text[0]} :ok_hand:`);
            m.delete(5000);
            return;
        }
        let row = await this.bot.dbManager.getTableRowByKey(table, { owner_id: message.author.id, tag:tag });
        if (row === null || !row.text) return;
        message.channel.send(row.text);
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
            return  `Create/edit tags with: \`${this.bot.prefix}${this.cmd} edit nameOfTheTag This is some cool text.\`\n` +
                    `Show a tag with: \`${this.bot.prefix}${this.cmd} nameOfTheTag\``;
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
    }
};
