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
        this.getUserData            = function (user)                  { return this.getData(user); };
        this.setUserData            = function (user, data)            { return this.setData(user, data); };
        this.deleteUserData         = function (user)                  { return this.setData(user, undefined); };
        this.getUserDataByKey       = function (user, key)             { return this.getDataByKey(user, key); };
        this.setUserDataByKey       = function (user, key, data)       { return this.setDataByKey(user, key, data); };
        this.deleteUserDataByKey    = function (user, key)             { return this.setDataByKey(user, key, undefined); };

        this.getGuildData           = function (guild)                 { return this.getData(guild); };
        this.setGuildData           = function (guild, data)           { return this.setData(guild, data); };
        this.deleteGuildData        = function (guild)                 { return this.setData(guild, undefined); };
        this.getGuildDataByKey      = function (guild, key)            { return this.getDataByKey(guild, key); };
        this.setGuildDataByKey      = function (guild, key, data)      { return this.setDataByKey(guild, key, data); };
        this.deleteGuildDataByKey   = function (guild, key)            { return this.setDataByKey(guild, key, undefined); };

        this.getChannelData         = function (channel)               { return this.getData(channel); };
        this.setChannelData         = function (channel, data)         { return this.setData(channel, data); };
        this.deleteChannelData      = function (channel)               { return this.setData(channel, undefined); };
        this.getChannelDataByKey    = function (channel, key)          { return this.getDataByKey(channel, key); };
        this.setChannelDataByKey    = function (channel, key, data)    { return this.setDataByKey(channel, key, data); };
        this.deleteChannelDataByKey = function (channel, key)          { return this.setDataByKey(channel, key, undefined); };

        // ?: Do I want all the functions above? Or would be just having this (or renamed
        // ?: version like getData(key) ...) enough? Would be less clear tho...
        this.getOtherData           = function (other)                 { return this.getData(other); };
        this.setOtherData           = function (other, data)           { return this.setDataByKey(other, key, data); };
        this.deleteOtherData        = function (other)                 { return this.setData(other, undefined); };
        this.getOtherDataByKey      = function (other, key)            { return this.getDataByKey(other, key); };
        this.setOtherDataByKey      = function (other, key, data)      { return this.setDataByKey(other, key, data); };
        this.deleteOtherDataByKey   = function (other, key)            { return this.setDataByKey(other, key, undefined); };
        this.local                  = false;

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
        // And: Yes I know that you could access my database with me publishing these here
        //      But eh... if you like to... I don't really care... and by the time anyone reads this
        //      I have moved this to a config file anyways and changed the authentication...
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
            if (err) return this.error(err.stack);
        });
        return db_entry.keys[key] ? db_entry.keys[key] : null;
    }

    async getData(category) {
        let db_entry = await entries.findOne({ ID: category.id }, function (err, entry) {
            if (err) return this.error(err.stack);
        });
        return db_entry.keys ? db_entry.keys : null;
    }

    async setDataByKey(category, key, data) {
        return entries.findOne({ ID: category.id }, function (err, entry) {
            if (err) return this.error(err.stack);
            if (typeof data === 'undefined') {
                if (!entry) return;
                delete entry.keys[key];
            }
            else {
                if (!entry) {
                    entry = new entries({ ID: category.id, keys: {} });
                }
                entry.keys[key] = data;
            }
            entry.markModified('keys')
            entry.save(function (err, _) {
                if (err) this.error(err.stack)
            });
        });
    }

    async setData(category, data) {
        return entries.findOne({ ID: category.id }, function (err, entry) {
            if (err) return this.error(err.stack);
            if (typeof data === 'undefined') {
                if (!entry) return;
                return entry.remove();
            }
            else {
                if (!entry) {
                    entry = new entries({ ID: category.id, keys: {} });
                }
                entry.keys = data;
            }
            entry.markModified();
            entry.save(function (err, _) {
                if (err) return this.error(err.stack);
            });
        });
    }

    async deleteData(category) {
        entries.findOneAndRemove({ ID: category.id }, function (err) {
            if (err) return this.error(err.stack);
        });
    }

    async deleteDataByKey(category, data) {
        entries.findOneAndRemove({ ID: category.id }, function (err) {
            if (err) return this.error(err.stack);
        });
    }
}

module.exports =  MongoDBHandler;