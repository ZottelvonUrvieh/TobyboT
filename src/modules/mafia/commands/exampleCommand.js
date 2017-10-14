module.exports = {
    // eslint-disable-next-line
    run: async function (message, args) {
        // this code will get executed everytime the configured cmd or alias with the correct prefix is called
        // you have access to things like
        this.debug('An example debug text for the console to show more information while in debug mode');
        this.log('An example log for the console to show important information');
        this.warn('Yeah... you get the point...');
        this.error('I am still gonna list them all :P');
        // they have a bit of sugar to them to keep the console clean and easy to understand which part of
        // the bot is causing what. (Colors + Code at the beginning + Name of Module + Command where it happend)

        // this.bot is also accessible - the Discord client + several managers (most of them you don't have to
        // worry about... but maybe the this.bot.dbManager wich gives you access to the database could be handy...
        // Interesting are probably (get/set/delete)(user/guild/channel)Data[optional: ByKey] (look at DBInterface.js
        // in the folder src/manager/classes to get a list of all)
        // For example this.bot.dbManager.setUserDataByKey(user, key, data) where user is a discord user object,
        // key is a string and data anything (eg. a Sting, a Number or an Object) stores stuff in the database

        // Also all the configs you have to set below are accessable with this.[config] so e.g. this.name
        // gives you access to the name of the command. As a matter of lucidity I would recommend only to read
        // but not change the configs within the code because of the confusion it can cause.

        // also available is this.mod which gives you access to the module this command is part of

        // this.toString() returns `Command '${this.name}' in Module '${this.mod.name}'`
        // this.toDebug() returns a lot more (essencial all the configs)

        // Have fun doing your thing :)
    },
    // all settings but cmd and location are optional - the other are just to increase useability
    configs: function () {
        // You can add your own individual settings and variables here if you like
        // (accessable with this.yourSetting in the run function aswell)
        // You could edit everything aswell in the run function but that won't persist!
        // So for clearity I would highly recommend to use this here for settings that are not
        // needed to be changed dynamically

        // Displayname that gets shown in help etc.
        this.name = 'AwesomeName';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'EasyToRememberCommand';
        // All these will trigger the run function aswell
        this.alias = ['Some', 'alias', 'youLike'];
        // If more needed than in the module already configured e.g. MESSAGE_DELETE
        this.permissions = [];
        // 'GUILD_ONLY', 'DM_ONLY', 'ALL' - where the command can be triggered
        this.location = 'ALL';
        // Description for the help / menue
        this.description = 'Can be awesome with awesomeness!';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function () {
            return  `To do something do this: \`${this.bot.prefix}${this.cmd}\`\n` +
                    `To do something cooler do this: \`${this.bot.prefix}${this.cmd} someArgument orTwo\``;
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
        this.ownerOnly = false;
    }
};
