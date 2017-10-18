module.exports = {
    // Called when bot starts, before login into Discord, before the commands get loaded. One time only.
    pre_init: function () {
        this.debug('In pre_init!');
    },

    // Called when bot starts, before login into Discord, after the commands got loaded. One time only.
    init: function () {
        this.debug('In init!');
    },

    // Called when bot logs into Discord. Keep in mind, this may be called multiple times.
    connect: function () {
        this.debug('In connect!');
    },

    // Called when module gets loaded. Keep in mind, this may be called multiple times. (E.g. manually reloading module)
    module_load: function () {
        this.debug('In module_load!');
    },

    // Called when module gets unloaded. Keep in mind, this may be called multiple times.
    module_unload: function () {
        this.debug('In module_unload!');
    },

    // Called when the bot disconnects from Discord - carefull! This might be called less often than connect!
    disconnect: function () {
        this.debug('In disconnect!');
    },

    // General configs for the Module
    config: function () {
        // you can add your own individual settings and variables here if you like
        return {
            name: 'Mafia',
            description: 'Mafia-Games Module to handle moderation, votes, etc...',
            categories: ['Games', 'Secret'],           // Some tags for the menu
            permissions: [],    // Permissions your module requires (eg. MESSAGE_DELETE)
            debugMode: false,   // weather or not to show the debug messages in the console
            ownersOnly: true   // If true this module is unusable to anyone besides the configured owners
        };
    }
};
