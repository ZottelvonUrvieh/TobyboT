module.exports = {
    run: async function (message, args) {
        if (this.mod.permissions.concat(this.permissions).indexOf('MANAGE_MESSAGES') !== -1) message.delete(10000);
        let m, success;
        switch (args.length) {
        case 0:
            m = await message.channel.send('Trying to reload everything...');
            success = this.bot.moduleManager.reloadAllModules();
            break;
        case 1:
            m = await message.channel.send(`Trying to reload Command ${args[0]}...`);
            success = this.bot.commandManager.reloadCommandByCallable(args[0]);
            break;
        case 2:
            m = await message.channel.send(`Trying to reload Module ${args[1]}...`);
            success = this.bot.moduleManager.reloadModuleByID(args[1]);
            break;

        default:
            m = await message.channel.send('Wrong usage...');
            success = false;
            break;
        }

        if (success)
            await m.edit(`${m.content}\n'${success}' successfully reloaded!`);
        else await m.edit(`${m.content}\nBut nothing that listens on that was found...`);
        m.delete(10000);
    },

    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Reload command';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'reload';
        // All these will trigger the run function aswell
        this.alias = ['rl', 'rload'];
        // If more needed than in the module already configured e.g. MESSAGE_DELETE
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Reloads a command or module by the commands name (or alias).';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function () {
            return `To reload a command: \`${this.bot.prefix}${this.cmd} command\`` +
                `\nTo reload a module: \`${this.bot.prefix}${this.cmd} mod moduleID\``;
        };
        // Makes the bot message how to use the command correctly if you throw an exception
        this.showUsageOnError = false;
        // Decides where it will be listen in the help menue
        this.category = 'Debug';
        // Gives some tags in the help menue
        this.tags = ['Core', 'Debug'];
        // If true the debugmessages of this Command will be displayed in the console
        this.debugMode = false;
        // If true the Command is only usable for the configured owners
        this.ownersOnly = true;
    }
};
