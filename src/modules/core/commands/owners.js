module.exports = {
    run: async function (message, args) {
        if (args.length !== 2 && args.length !== 0) return new Error('The command requires exactly 2 or 0 arguments!');
        let sendText = '';
        if (message.mentions.users.array().length > 0) args[1] = message.mentions.users.array()[0].id;
        if (args[0] === 'add') {
            this.bot.configs.owners.push(args[1]);
            sendText = 'Successfully added that userID to the owners.';
        }
        else if (args[0] === 'remove') {
            let index = this.bot.configs.owners.indexOf(args[1]);
            if (index !== -1) {
                if (args[1] === message.author.id)
                    sendText = 'You can not remove yourself from the owners. Sorry...';
                else {
                    this.bot.configs.owners.splice(index, 1);
                    sendText = 'Successfully removed that userID from the owners.';
                }
            }
            else sendText = 'There was no owner with that userID found...';
        }
        if (sendText === '')
            sendText = `**The following userID's are listed as owners:**\`\`\`${this.bot.configs.owners.join(', ')}\`\`\``;
        else this.bot.configManager.updateConfig('owners', this.bot.configs.owners);

        message.channel.send(sendText);
    },

    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Bot owners';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'owners';
        // All these will trigger the run function aswell
        this.alias = ['owner'];
        // If more needed than in the module already configured e.g. MESSAGE_DELETE
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Modify owners of the Bot';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function () {
            return  `To add an owner: \`\`\`${this.bot.configs.prefix}${this.cmd} add userID\`\`\`` +
                    `To remove an owner: \`\`\`${this.bot.configs.prefix}${this.cmd} remove userID\`\`\`` +
                    `To show all owners: \`\`\`${this.bot.configs.prefix}${this.cmd}\`\`\``;
        };
        // Makes the bot message how to use the command correctly if you throw an exception
        this.showUsageOnError = true;
        // Decides where it will be listen in the help menue
        this.category = 'Core';
        // Gives some tags in the help menue
        this.tags = ['Core'];
        // If true the debugmessages of this Command will be displayed in the console
        this.debugMode = false;
        // If true the Command is only usable for the configured owners
        this.ownersOnly = true;
        // If this is > 0 the event autoCleanup will delete user messages with this command after these amount of ms
        this.autoDelete = 10000;
    }
};
