function generateMessages(headString, footerString, items, detailed) {
    let itemStrings = [];
    let msgsStrings = [];

    // Generate the descriptions for the items
    items.forEach(function (item) {
        itemStrings.push(item.help(detailed));
    }, this);

    msgsStrings.push(headString);

    // Make sure we never excede 2000 chars in one message and have the header on top and the footer on bottom.
    for (let index = 0; index < itemStrings.length; index++) {
        let itemString = `\n${itemStrings[index]}\nㅤ`;
        let cString = msgsStrings.pop();
        if (cString.length + itemString.length < 2000)
            msgsStrings.push(cString + itemString);
        else {
            msgsStrings.push(cString);
            msgsStrings.push(itemString);
        }
        if (index < itemStrings.length - 1) continue;
        cString = msgsStrings.pop();
        if (cString.length + footerString.length < 2000)
            msgsStrings.push(cString + footerString);
        else {
            msgsStrings.push(cString);
            msgsStrings.push(footerString);
        }
    }
    return msgsStrings;
}

async function displayGeneralHelp(message, cmd) {
    let headString = '**Currently loaded Bot-Modules**\n';
    let footerString = `ㅤ\nTo get more information about the individual modules use \`${cmd.bot.settings.prefix}${cmd.cmd} moduleID\`ㅤ`;

    // Generate all the text for the (possibly) multiple messages
    let msgsStrings = generateMessages(headString, footerString, cmd.bot.moduleManager.modules, false);

    // Send all messages and delete them after 60 seconds.
    msgsStrings.map(async msgSring => { return await message.channel.send(msgSring); });
    return true;
}

async function displayModuleHelp(message, id, cmd) {
    let mod = cmd.bot.moduleManager.getModuleByID(id);
    if (!mod) return false;
    let headString =  `${mod.help()} \n\n**This mod includes the commands:**\n`;
    let footerString = `ㅤ\nTo get more information about the individual Commands use \`${cmd.bot.settings.prefix}${cmd.cmd} commandOrAlias\`ㅤ`;

    // Generate all the text for the (possibly) multiple messages
    let msgsStrings = generateMessages(headString, footerString, mod.commands, false);

    // Send all messages and delete them after 60 seconds.
    msgsStrings.map(async msgSring => { return await message.channel.send(msgSring); });
    return true;
}

async function displayCommandHelp(message, callable, cmd) {
    cmd = cmd.bot.componentManager.getCommandByCallable(callable);
    if (!cmd) return false;
    // Generate all the text for the (possibly) multiple messages
    message.channel.send(cmd.help(true));
    return true;
}

module.exports = {
    run: async function (message, args) {
        let success;
        if (args.length === 0) {
            success = await displayGeneralHelp(message, this);
        }
        if (!success) {
            success = await displayModuleHelp(message, args[0], this);
        }
        if (!success) {
            success = await displayCommandHelp(message, args[0], this);
        }
        if (success) return;
        // TODO: Throw an error and add the feature of then showing usage insead of doing this.
        message.channel.send(`Nothing found... what do you mean with \`${args[0]}\`?`);
    },

    // all settings but cmd and location are optional - the other are just to increase useability
    configs: function () {
        // You can add your own individual settings and variables here if you like
        // (accessable with this.yourSetting in the run function aswell)
        // You could edit everything aswell in the run function but that won't persist!
        // So for clearity I would highly recommend to use this here for settings that are not
        // needed to be changed dynamically

        // Displayname that gets shown in help etc.
        this.name = 'Help';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'help';
        // All these will trigger the run function aswell
        this.alias = ['h'];
        // If more needed than in the module already configured e.g. MESSAGE_DELETE
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Can give an overview what commands are available and what they do.';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function() {
            return  `General help: \`${this.bot.settings.prefix}${this.cmd}\`\n` +
                    `Module specific help: \`${this.bot.settings.prefix}${this.cmd} moduleID\`` +
                    `Command specific help: \`${this.bot.settings.prefix}${this.cmd} commandName\``;
        };
        // Makes the bot message how to use the command correctly if you throw an exception
        this.showUsageOnError = false;
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
