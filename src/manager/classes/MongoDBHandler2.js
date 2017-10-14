const mongoose = require('mongoose');
const discordjs = require('discord.js');
// Use native promises
mongoose.Promise = global.Promise;

const DBInterface = require('./DBInterface');
class MongoDBHandler extends DBInterface{
    constructor(bot) {
        super(bot);
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
        this.setOtherData           = function (other, data)           { return this.setData(other, data); };
        this.deleteOtherData        = function (other)                 { return this.setData(other, undefined); };
        this.getOtherDataByKey      = function (other, key)            { return this.getDataByKey(other, key); };
        this.setOtherDataByKey      = function (other, key, data)      { return this.setDataByKey(other, key, data); };
        this.deleteOtherDataByKey   = function (other, key)            { return this.setDataByKey(other, key, undefined); };
        this.local                  = false;

        this.setup();
    }
    setup() {
        this.db = mongoose.connection;
        this.db.on('error', err => this.error(err));

        // Use a table for each category to keep it a bit organized - TODO: maybe add more than just ID, key and data?
        this.users = this.db.model('user', mongoose.Schema({ ID: String, key: Object, data: Object }));
        this.guilds = this.db.model('guild', mongoose.Schema({ ID: String, key: Object, data: Object }));
        this.channels = this.db.model('channel', mongoose.Schema({ ID: String, Object: Object, data: Object }));


        let mongodbHost = 'localhost';
        let mongodbPort = '27017';
        let authenticate = '';

        // TODO: Move these remote settings into a config!
        // And: Yes I know that you could access my database with me publishing these here
        //      But eh... if you like to... I don't really care... and by the time anyone reads this
        //      I have moved this to a config file anyways and changed the authentication...
        if (this.local === false) {
            mongodbHost = 'ds113455.mlab.com';
            mongodbPort = '13455';
            authenticate = 'admin:sonentergang@';
        }

        let mongodbDatabase = 'tobebot';

        // constructed connect string for mongodb server that works no matter if locally hosted or
        // remote as it changes depending on the this.local variable
        this.mongoDBurl = 'mongodb://' + authenticate + mongodbHost + ':' + mongodbPort + '/' + mongodbDatabase;
        this.connectDB();
    }

    connectDB() {
        if (this.db._readyState === 1 || this.db._readyState === 2)
            return; // we are already connected / connecting atm
        this.log('Connecting to MongoDB...');
        mongoose.connect(this.mongoDBurl, { useMongoClient: true }).catch(() => { }); // we handle errors with the function: this.db.on
        this.db.once('open', function () {
            this.log('Successfully connected to MongoDB.', 'Sweet label');
        }.bind(this));
    }

    getCategoryFromDiscordObject(category) {
        if (category instanceof discordjs.Channel)
            return this.channels;
        else if (category instanceof discordjs.User || category instanceof discordjs.GuildMember)
            return this.users;
        else if (category instanceof discordjs.Guild)
            return this.guilds;
        return this.others;
    }

    async getDataByKey(category, key) {
        let catDB = this.getCategoryFromDiscordObject(category);
        // eslint-disable-next-line
        let db_entry = await catDB.findOne({ ID: category.id, key: key }, function (err, entry) {
            if (err) return console.error(err.stack);
        }.bind(this));
        return db_entry ? db_entry.data : null;
    }

    async getData(category) {
        let catDB = this.getCategoryFromDiscordObject(category);
        // eslint-disable-next-line
        let db_entries = await catDB.find({ ID: category.id }, function (err, entry) {
            if (err) return this.error(err.stack);
        }.bind(this));
        return db_entries ? db_entries : null;
    }

    async setDataByKey(category, key, data) {
        let catDB = this.getCategoryFromDiscordObject(category);
        return catDB.findOne({ ID: category.id, key: key }, function (err, entry) {
            if (err) return this.error(err.stack);
            if (typeof data === 'undefined') {
                if (!entry) return;
                return entry.remove();
            }
            else {
                if (!entry) {
                    entry = new catDB({ ID: category.id, key: key, data: data });
                }
                else entry.data = data;
            }
            entry.markModified();
            entry.save(function (err, ) {
                if (err) this.error(err.stack);
            });
        }.bind(this));
    }

    async setData(category, data) {
        let catDB = this.getCategoryFromDiscordObject(category);
        if (typeof data === 'undefined') {
            return catDB.find({ ID: category.id }).remove().exec();
        }

        return catDB.findOne({ ID: category.id }, function (err, entry) {
            if (err) return this.error(err.stack);
            else {
                if (!entry) {
                    entry = new catDB({ ID: category.id });
                }
                else entry.key = data;
            }
            entry.markModified();
            entry.save(function (err, ) {
                if (err) return this.error(err.stack);
            });
        });
    }

    // eslint-disable-next-line
    async deleteData(category) {
        // Not implemented yet
    }

    async deleteDataByKey(category, key) {
        let catDB = this.getCategoryFromDiscordObject(category);
        catDB.findOneAndRemove({ ID: category.id , key: key}, function (err) {
            if (err) return this.error(err.stack);
        });
    }
}

module.exports =  MongoDBHandler;
