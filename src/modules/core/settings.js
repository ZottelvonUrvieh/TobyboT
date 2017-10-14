module.exports = {
    // Called when bot starts, before login into Discord, before the commands get loaded. One time only.
    pre_init: function () {
        this.debug('In pre_init!');
    },

    // Called when bot starts, before login into Discord, after the commands got loaded. One time only.
    init: function () {
        // this.log(`in init`);
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

    config: function () {
        return {
            name: 'The Core of the bot',
            description: 'This is the barebone that is needed to operate the bot.',
            tags: ['core'],           // Some tags for the menu
            permissions: [],    // Permissions your module requires (eg. MESSAGE_DELETE)
            debugMode: false,   // weather or not to show the debug messages in the console
            ownersOnly: false   // If true this module is unusable to anyone besides the configured owners
        };
    }
};
