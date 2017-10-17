const low = require('lowdb');
const fileAsync = require('lowdb/lib/storages/file-async');
const path = require('path');
const DBInterface = require('./DBInterface');

class LowDBHandler extends DBInterface {
    // eslint-disable-next-line
    constructor(bot) {
        super();
        // this.dataFolder = path.resolve(__foldername, 'lowdb_localDB');

        this.connectDB              = function ()                      { };
        this.disconnectDB           = function ()                      { };
        // ?: Is this requred? Do I ever need to know any settings?
        this.getSettings            = function ()                      { };

        // ?: Am I ok with handing over the whole objects or do I just want to restrict it to the ID's?
        // ?: I think objects make thinks a bit more handy, adds options and is easier to use?
        // this.getUserData            = get (user);
        // this.setUserData            = set (user, data);
        // this.deleteUserData         = delete (user);
        // this.getUserDataByKey       = getKey (user, key);
        // this.setUserDataByKey       = setKey (user, key, data);
        // this.deleteUserDataByKey    = deleteKey (user, key);

        // this.getGuildData           = get (guild);
        // this.setGuildData           = set (guild, data);
        // this.deleteGuildData        = delete (guild);
        // this.getGuildDataByKey      = getKey (guild, key);
        // this.setGuildDataByKey      = setKey (guild, key, data);
        // this.deleteGuildDataByKey   = deleteKey (guild, key);

        // this.getChannelData         = get (channel);
        // this.setChannelData         = set (channel, data);
        // this.deleteChannelData      = delete (channel);
        // this.getChannelDataByKey    = getKey (channel, key);
        // this.setChannelDataByKey    = setKey (channel, key, data);
        // this.deleteChannelDataByKey = deleteKey (channel, key);

        // // ?: Do I want all the functions above? Or would be just having this (or renamed
        // // ?: version like getData(key) ...) enough? Would be less clear tho...
        // this.getOtherData           = this.get (other);
        // this.setOtherData           = set (other, data);
        // this.deleteOtherData        = delete (other);
        // this.getOtherDataByKey      = getKey (other, key);
        // this.setOtherDataByKey      = setKey (other, key, data);
        // this.deleteOtherDataByKey   = deleteKey (other, key);
        // this.local                  = false;
        // this.status                 = 'disconnected';
    }

    getDBHandle(type) {
        if (typeof type !== 'string')
            type = type.id;
        if (typeof type.id !== 'string') { throw 'dbHandle must be passed a string!'; }
        const jsonFile = path.resolve(this.dataFolder, type);

        return low(
            `${jsonFile}.json`,
            { storage: fileAsync }
        );
    }

    async getData(type, key) {
        try {
            const db = this.getDBHandle(type);
            return await db.get(key).value();
        } catch (error) {
            throw `LowDBHandler Get Error: ${error}`;
        }
    }

    async setKey(type, key, data) {
        try {
            const db = this.getDBHandle(type);
            await db.set(key, data).write();
        } catch (error) {
            throw `LowDBHandler Set Error: ${error}`;
        }
    }

    async deleteKey(type, key) {
        try {
            const db = this.getDBHandle(type);
            db.unset(key).write();
        } catch (error) {
            throw `LowDBHandler Delete Error: ${error}`;
        }
    }

}

module.exports = LowDBHandler;
