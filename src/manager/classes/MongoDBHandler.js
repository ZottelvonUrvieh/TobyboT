const mongoose = require('mongoose');

let entries;

// const MongoClient = require('mongodb').MongoClient;
const DBInterface = require('./DBInterface');
class MongoDBHandler extends DBInterface{
    constructor(bot) {
        super();
        this.bot = bot;

        // These are the required functions that the DBManager wants to have implemented
        // TODO: complete these functions!!
        this.disconnectDB           = function ()                      { };
        // ?: Is this requred? Do I ever need to know any settings?
        this.getSettings            = function ()                      { };

        // ?: Am I ok with handing over the whole objects or do I just want to restrict it to the ID's?
        // ?: I think objects make thinks a bit more handy, adds options and is easier to use?
        this.getUserData            = function (user)                  { };
        this.setUserData            = function (user, data)            { };
        this.deleteUserData         = function (user)                  { };
        this.getUserDataByKey       = function (user, key)             { };
        this.setUserDataByKey       = function (user, key, data)       { };
        this.deleteUserDataByKey    = function (user, key)             { };

        this.getGuildData           = function (guild)                 { };
        this.setGuildData           = function (guild, data)           { };
        this.deleteGuildData        = function (guild)                 { };
        this.getGuildDataByKey      = function (guild, key)            { return this.getDataByKey(guild, key); };
        this.setGuildDataByKey      = function (guild, key, data)      { return this.setDataByKey(guild, key, data); };
        this.deleteGuildDataByKey   = function (guild, key)            { };

        this.getChannelData         = function (channel)               { };
        this.setChannelData         = function (channel, data)         { };
        this.deleteChannelData      = function (channel)               { };
        this.getChannelDataByKey    = function (channel, key)          { };
        this.setChannelDataByKey    = function (channel, key, data)    { };
        this.deleteChannelDataByKey = function (channel, key)          { };

        // ?: Do I want all the functions above? Or would be just having this (or renamed
        // ?: version like getData(key) ...) enough? Would be less clear tho...
        this.getOtherData           = function (other)                 { };
        this.setOtherData           = function (other, data)           { };
        this.deleteOtherData        = function (other)                 { };
        this.getOtherDataByKey      = function (other, key)            { };
        this.setOtherDataByKey      = function (other, key, data)      { };
        this.deleteOtherDataByKey   = function (other, key)            { };
        this.local                  = false;
        this.status = 'disconnected';

        this.setup();
    }
    setup() {
        this.db = mongoose.connection;
        this.db.on('error', e => this.bot.error(e.stack));
        // make db logging independed from having access to a bot object
        this.db.log = this.bot.log;
        this.db.warn = this.bot.warn;
        this.db.error = this.bot.error;
        this.db.loggify = this.bot.loggify;

        entries = this.db.model('entry', mongoose.Schema({ ID: String, keys: {} }));
        // users = this.db.model('user', mongoose.Schema({ userID: String, keys: {}}));
        // guilds = this.db.model('guild', mongoose.Schema({ guildID: String, keys: {}}));
        // channels = this.db.model('channel', mongoose.Schema({ channelID: String, keys: {}}));

        var mongodbHost = 'localhost';
        var mongodbPort = '27017';
        var authenticate = '';

        // TODO: Move these remote settings into a config!
        if (this.local === false) {
            mongodbHost = 'ds113455.mlab.com';
            mongodbPort = '13455';
            authenticate = 'admin:sonentergang@'
        }

        var mongodbDatabase = 'tobebot';

        // constructed connect string for mongodb server that works no matter if locally hosted or
        // remote as it changes depending on the this.local variable
        this.mongoDBurl = 'mongodb://' + authenticate + mongodbHost + ':' + mongodbPort + '/' + mongodbDatabase;
        this.connectDB();
    }

    connectDB() {
        if (this.db._readyState === 1 || this.db._readyState === 2)
            return; // we are already connected / connecting atm
        this.bot.log('Connecting to MongoDB...')
        mongoose.connect(this.mongoDBurl, { useMongoClient: true });
        this.db.once('open', function () {
            this.log("Successfully connected to MongoDB.");
        });
    }

    async getDataByKey(category, key) {
        let db_entry = await entries.findOne({ ID: category.id }, function (err, entry) {
            if (err) console.log(err.stack);
        });
        return db_entry.keys[key] ? db_entry.keys[key] : null;
    }

    async setDataByKey(category, key, data) {
        return entries.findOne({ ID: category.id }, function (err, entry) {
            if (err) console.log(err.stack);
            if (!entry) {
                entry = new entries({ ID: category.id, keys: {} });
            }
            entry.keys[key] = data;
            entry.markModified('keys')
            entry.save(function (err, _) {
                if (err) return console.error(err);
            });
        });
    }
}

module.exports =  MongoDBHandler;