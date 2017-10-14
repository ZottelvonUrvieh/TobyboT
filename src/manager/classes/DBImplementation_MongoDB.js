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
        this.getSettings            = function ()                      { };

        this.local                  = false;
        this.tables                 = {};

        this.setup();
    }
    setup() {
        this.db = mongoose.connection;
        this.db.on('error', err => this.error(err));

        // Use a table for each category to keep it a bit organized - TODO: maybe add more than just id, key and data?
        // this.users = this.db.model('user', mongoose.Schema({ id: String, key: Object, data: Object }));
        // this.guilds = this.db.model('guild', mongoose.Schema({ id: String, key: Object, data: Object }));
        // this.channels = this.db.model('channel', mongoose.Schema({ id: String, Object: Object, data: Object }));
        this.getTable({ name: 'user', schemaOptions: { id: String, key: Object, data: Object } });
        this.getTable({ name: 'guild', schemaOptions: { id: String, key: Object, data: Object } });
        this.getTable({ name: 'channel', schemaOptions: { id: String, key: Object, data: Object } });

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
        // Are we are already connected / connecting atm?
        if (this.db._readyState === 1 || this.db._readyState === 2)
            return;
        this.log('Connecting to MongoDB...');
        mongoose.connect(this.mongoDBurl, { useMongoClient: true }).catch(() => { }); // we handle errors with the function: this.db.on
        this.db.once('open', function () {
            this.log('Successfully connected to MongoDB.');
        }.bind(this));
    }

    getTable(table) {
        let retTable = this.tables[table.name];
        if (retTable) return retTable;
        if (!table.schemaOptions || !table.name) return false;
        retTable = this.db.model(table.name, mongoose.Schema(table.schemaOptions));
        this.tables[table.name] = retTable;
        return retTable;
    }

    async getTableRowByKey(table, key) {
        let tab = this.getTable(table);
        let db_entry = await tab.findOne(key, function (err, ) {
            if (err) return console.error(err.stack);
        }.bind(this));
        return db_entry;
    }

    async getTableRows(table) {
        let tab = this.getTable(table);
        let db_entries = await tab.find({}, function (err, ) {
            if (err) return this.error(err.stack);
        }.bind(this));
        return db_entries;
    }

    async setTableRowByKey(table, key, row) {
        if (row === null) this.deleteTableRowByKey(table, key);
        let tab = this.getTable(table);
        return tab.findOneAndUpdate(key, row, { upsert: true }, function (err, ) {
            if (err) return this.error(err.stack);
        }.bind(this));
    }

    // eslint-disable-next-line
    async setTableRows(table, rows) {
        // Not implemented yet
    }

    // eslint-disable-next-line
    async deleteTable(table) {
        // Not implemented yet
    }

    async deleteTableRowByKey(table, key) {
        let tab = this.getTable(table);
        tab.findOneAndRemove(key, function (err,) {
            if (err) return this.error(err.stack);
        }).bind(this);
    }
}

module.exports =  MongoDBHandler;
