module.exports = {
    run: async function (message, args) {
        if (this.mod.permissions.concat(this.permissions).indexOf('MANAGE_MESSAGES') !== -1) message.delete(10000).catch(e => { });
        const m = await message.channel.send(`Trying to unload ${args[0]}`);
        let success = this.bot.commandManager.unloadCommandByName(args[0]);
        if (success === true) await m.edit(`Command ${args[0]} successfull unloaded!`);
        else await m.edit(`No command that listens on ${args[0]} found...`);
        m.delete(5000);
    },

    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Unload command';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'unload';
        // All these will trigger the run function aswell
        this.alias = ['uload', 'ul'];
        // If more needed than in the module already configured e.g. MESSAGE_DELETE
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Unloads a command by the commands name (or alias).';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function () {
            return `To unload a command do: \`${this.bot.prefix}${this.cmd} commandNameOrAlias\``;
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
