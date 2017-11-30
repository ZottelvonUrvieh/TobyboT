const mongoose = require('mongoose');
// Use native promises
mongoose.Promise = global.Promise;

const DBInterface = require('./DBInterface');
class MongoDBHandler extends DBInterface{
    constructor(bot) {
        super(bot);
        // TODO: do we require a disconnect?
        this.disconnectDB = function () { };

        this.local  = true;
        this.tables = {};

        this.setup();
    }
    setup() {
        this.db = mongoose.connection;
        this.db.on('error', err => this.error(err));
        // Use a local hosted DB
        if (this.local === true)
            this.bot.configs.mongoDBurl = this.bot.configs.mongoDBurl_local;

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
        let options = {
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 1000,
            useMongoClient: true
        };
        mongoose.connect(this.bot.configs.mongoDBurl, options).catch((e) => {this.warn(e); }); // we handle errors with the function: this.db.on
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
