module.exports = {
    // Called when bot starts, before login into Discord, before the commands get loaded. One time only.
    // (Reloading with the reload command will result in this running. But the whole mod object will be
    // created from scratch then... so this should be your one time only function to setup stuff you may
    // need (like I don't know... a connection to an API or webserver or to do and cache some stuff that
    // requires a bit longer to be executed but then won't change anymore... you get the point))
    pre_init: function () {
        this.debug('In pre_init');
    },
    // Called when module gets loaded, before the commands get loaded. On bot start this will be right after
    // pre_init but  before init!(See below).
    // Keep in mind, this may be called multiple times. (E.g.manually reloading module)
    // (And yes this is different than pre_init as modules can be unloaded and reloaded. Doing so this would get executed
    // again but pre_init wouldn't. Just how I built the reload everything command (`reload` without parameters
    // that is) is that it unloads all Modules and Commands and then reinitializes them from scratch)
    module_load: function () {
        this.debug('In module_load!');
        // let loop = async function () {
        //     this.bot.taskManager.emit('repeat', this.bot);
        // }.bind(this);
        // setInterval(loop, this.bot.configs.timeout);
    },

    // Called when bot starts, before login into Discord, after the commands got loaded. One time only.
    init: function () {
        // this.log(`in init`);
        this.debug('In init!');
    },

    // Called when bot logs into Discord. Keep in mind, this may be called multiple times.
    // Will not be called if you use the reload command as the bot probably will already be connected to Discord then!
    connect: function () {
        this.debug('In connect!');
    },

    // Called when module gets unloaded, before the commands are unloaded.
    // Keep in mind, this may be called multiple times.
    module_unload: function () {
        this.debug('In module_unload!');
    },

    // Called when module gets unloaded after the commands got unloaded.
    // Keep in mind, this may be called multiple times.
    psot_module_unload: function () {
        this.debug('In module_unload!');
        this.bot.taskManager.removeListener('repeat', something);
    },

    // Called when the bot disconnects from Discord - Carefull! This might be called more less often than connect!
    disconnect: function () {
        this.debug('In disconnect!');
    },

    config: function () {
        return {
            name: 'The Core of the bot',
            description: 'This is the minimum required to operate the bot.',
            tags: ['core'],           // Some tags for the menu
            permissions: ['MANAGE_MESSAGES'],    // Permissions your module requires (eg. MANAGE_MESSAGES)
            debugMode: false,   // weather or not to show the debug messages in the console
            ownersOnly: false   // If true this module is unusable to anyone besides the configured owners
        };
    }
};
