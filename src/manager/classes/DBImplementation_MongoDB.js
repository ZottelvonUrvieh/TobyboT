const mongoose = require('mongoose');
// Use native promises
mongoose.Promise = global.Promise;

const DBInterface = require('./DBInterface');
class MongoDBHandler extends DBInterface{
    constructor(bot) {
        super(bot);
        // These are the required functions that the DBManager wants to have implemented
        // TODO: complete these functions!!
        this.disconnectDB           = function ()                      { };

        this.local                  = false;
        this.tables                 = {};

        this.setup();
    }
    setup() {
        this.db = mongoose.connection;
        this.db.on('error', err => this.error(err));

        let mongodbHost = 'localhost';
        let mongodbPort = '27017';
        let authenticate = '';
        let mongodbDatabase = 'tobebot';

        if (this.local === false) {
            let sets = this.setSettings(require('path').resolve(__dirname, 'mongoDBConfig.js'));
            mongodbHost = sets.mongodbHost;
            mongodbPort = sets.mongodbPort;
            authenticate = sets.authenticate + '@';
            mongodbDatabase = sets.mongodbDatabase;
        }
        // constructed connect string for mongodb server that works no matter if locally hosted or
        // remote as it changes depending on the this.local variable
        this.mongoDBurl = 'mongodb://' + authenticate + mongodbHost + ':' + mongodbPort + '/' + mongodbDatabase;
        this.connectDB();
    }

    setSettings(file) {
        return (require(file));
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

    async getTableRowsByKey(table, key) {
        let tab = this.getTable(table);
        let db_entries = await tab.find(key, function (err, ) {
            if (err) return console.error(err.stack);
        }.bind(this));
        return db_entries;
    }

    async getTableRows(table) {
        let tab = this.getTable(table);
        let db_entries = await tab.find({}, function (err, ) {
            if (err) return this.error(err.stack);
        }.bind(this));
        return db_entries;
    }

    async setTableRowByKey(table, key, row) {
        if (row === null) this.deleteTableRowsByKey(table, key);
        let tab = this.getTable(table);
        return tab.findOneAndUpdate(key, row, { upsert: true }, function (err, ) {
            if (err) return this.error(err.stack);
        }.bind(this));
    }

    async insertTableRows(table, rows) {
        let tab = this.getTable(table);
        return tab.insertMany(rows, function (err) {
            if (err) return this.error(err.stack);
        }.bind(this));
    }

    async deleteTable(table) {
        let tab = this.getTable(table);
        return tab.collection.drop();
    }

    async deleteTableRowsByKey(table, key) {
        let tab = this.getTable(table);
        return tab.remove(key, function (err,) {
            if (err) return this.error(err.stack);
        }.bind(this));
    }
}

module.exports =  MongoDBHandler;
