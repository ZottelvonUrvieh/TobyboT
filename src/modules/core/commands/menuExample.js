let callb1 = function (args) {
    this.log('You still have access to the command object here!');
    args[0].channel.send('Choise 1! With ' + args[1]);
};
let callb2 = function (args) {
    args[0].channel.send('Choise 2! With ' + args);
};
let callb3 = function (args) {
    // Tis will fail because we did not hand any arguments over in .addOption(...) (see below)!
    args[0].channel.send('Choise 3! With ' + args);
};
let callb4 = function (args) {
    // Tis will fail because we did not hand any arguments over in .addOption(...) (see below)!
    args[0].channel.send('Choise 4! With ' + args);
};

module.exports = {
    run: async function (message, ) {
        let menu = new this.bot.extensions.core.optionMenu(this);
        menu.setTitle('Do something!')                        // Set the menu title - optional
            .setDescription('You have the choise:')           // Set the menu discription - optional
            .addOption('Choise 1', callb1, [message], '🔂')   // Define your own emoji to use for that option!
            .addOption('Choise 2', callb2, [message, 'that']) // Or use a default emoji (depending on option index it'll be A-Z)
            .addOption('Choise 3', callb3, '🇾')              // You can omit the array of arguments if the function doesnt require one
            .addOption('Choise 4', callb4)                    // You can also omit both the emoji and the arguments
            // ...
            // You can add up to 20 Options (max amount of emoji reactions a message can have)

            // Only allow the sender of the command to be able to react - if not used, everyone can.
            // This can be a single id or an array of ids
            .addAllowedIds(message.author.id)
            .send(message.channel);                           // Send the menu in the defined channel
            // You don't have to do it in this order btw... only .send should be last
            // And you could also send it multiple times if you wanted to (or edit it and then resent the edited one)
            // Or send it to multiple different channels
        menu.setTitle('Different Title now!');
        menu.send(message.channel);
    },

    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'MenueExample';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'test';
        // All these will trigger the run function aswell
        this.alias = ['test'];
        // If more needed than in the module already configured e.g. MANAGE_MESSAGES
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Shows you how to use the Menue Extension';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function() {
            return `Just do: \`${this.bot.configs.prefix}${this.cmd}\``;
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
