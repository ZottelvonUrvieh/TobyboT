module.exports = {
    run: async function () {
        // This would spam the console with this text ever x milliseconds
        // self.log('hheeeayyhafjekjk');
    },

    configs: function () {
        // Here you can make an array of functions you want to be repeated every x milliseconds
        // x is a a changable config that is located in the config.cfg but it will influence ALL other modules aswell!
        this.repeatFunctions = [
            {object: this.bot.taskManager, trigger:'on', event: 'repeat', function: this.run}
        ];
        // Displayname that gets shown in help etc.
        this.name = 'Reminder-Handler';
        // Give it a good and unique id - used for e.g. loading/unloading/reloading it at runtime
        // Essencially works the same like the cmd in commands. The bot will inform you if you
        // picked a non unique one on startup.
        this.id = 'uniqueId';
        // If more needed than in the module already configured e.g. MANAGE_MESSAGES
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Trackes and handles sending out set reminders.';
        // Decides where it will be listen in the help menue (taks and events are not listed yet)
        this.category = 'General';
        // Gives some tags in the help menue
        this.tags = ['Core', 'General'];
        // If true the debugmessages of this Command will be displayed in the console
        this.debugMode = true;
        // If true the Command is only usable for the configured owners
        this.ownersOnly = false;
        // If this is > 0 the event autoCleanup will delete user messages with this command after these amount of ms
        this.autoDelete = 10000;
        // To be able to acces this inside the callback functions
        self = this;
    }
};
let self = null;
