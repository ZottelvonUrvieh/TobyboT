module.exports = {
    run: async function (message, args){
        // this code will get executed everytime the configured cmd or alias with the correct prefix is called
        // you have access to things like
        this.debug('An example debug text for the console to show more information while in debug mode');
        this.log('An example log for the console to show important information');
        this.warn('Yeah... you get the point...');
        this.error('I am still gonna list them all :P');
        // they have a bit of sugar to them to keep the console clean and easy to understand which part of
        // the bot is causing what. (Colors + Code at the beginning + Name of Module + Command where it happend)
        
        // this.bot is also accessible - the Discord client + several managers (most of them you don't have to 
        // worry about but maybe the this.bot.dbManager wich gives you access to the database could be handy...

        // Also all the configs you have to set below are accessable with this.[config] so e.g. this.name
        // gives you access to the name of the command. As a matter of lucidity I would recommend only to read
        // but not change the configs within the code because of the confusion it can cause.

        // this.toString() returns `Command '${this.name}' in Module '${this.mod.name}'`
        // this.toDebug() returns a lot more (essencial all the configs)

        // Have fun doing your thing :)
    },
    config: {
        name: 'awesome displayname', // Displayname that gets shown in help etc.
        cmd: 'easyToRememberCommand', // Command that will be used to trigger the bot to execute the run function
        alias: ['pong', 'plob', 'blob'], // all these will trigger the run function aswell - optional 
        permissions: [], // if more needed than in the module already configured e.g. MESSAGE_DELETE
        location: 'ALL', // 'GUILD_ONLY', 'DM_ONLY', 'ALL' - where the command can be triggered
        description: 'Description of the command',
        debugMode: true // Makes it only usable for the configured owners and will show the mods debugs in the console
    }
};