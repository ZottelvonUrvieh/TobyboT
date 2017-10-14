/* eslint-disable no-unused-vars */
class DBInterface  {
    constructor(bot) {
        // Define which properties has to be set and what their arguments have to be called (ordered)
        // (to avoid wrong order of arguments throwing errors)

        // ?: Should I also define what they should return? Like that setter should return a
        // ?: resolvable promise<boolean> to have a respond if the insert/update worked?
        this.delegates = new class {
            constructor() {
                this.connectDB              = function ()                      { };
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
                this.getGuildDataByKey      = function (guild, key)            { };
                this.setGuildDataByKey      = function (guild, key, data)      { };
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

            }
        };
        this.error = function (error) { return bot.error(error, 'DB Error: '); };
        this.warn = function (message) { return bot.warn(message, 'DB Warning: '); };
        this.debug = function (message) { return bot.debug(message, 'DB Debug: '); };
        this.log = function (message) { return bot.log(message, 'DB: '); };

        this.implementationCheck = function (obj) {
            let STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
            let ARGUMENT_NAMES = /([^\s,]+)/g;
            function getParamNames(func) {
                let fnStr = func.toString().replace(STRIP_COMMENTS, '');
                let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
                if (result === null)
                    result = [];
                return result;
            }

            let notImplemented = [], parameterMissmatch = [], wrongType = [];
            for (let property in this.delegates) {
                if (typeof this[property] === 'undefined') {
                    if (typeof this.delegates[property] === 'function')
                        notImplemented.push(`${property} should be ${property}(${getParamNames(this.delegates[property]).join(', ')})`);
                }
                else if (typeof this[property] === 'function') {
                    let thisParams = getParamNames(this[property]).join(', ');
                    let delegateParams = getParamNames(this.delegates[property]).join(', ');
                    if (thisParams !== delegateParams)
                        parameterMissmatch.push(`${property}(${thisParams}) should be ${property}(${delegateParams})`);
                }
                else if (typeof this[property] !== typeof this.delegates[property]){
                    wrongType.push(`${property} should be a ${typeof this.delegates[property]} but is a ${typeof property}`);
                }
            }
            let allCorrect = (notImplemented.length + parameterMissmatch.length + wrongType.length) === 0;
            return {notImplemented, parameterMissmatch, wrongType, allCorrect};
        };
    }
}

module.exports = DBInterface;
