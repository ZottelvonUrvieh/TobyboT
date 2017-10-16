/* eslint-disable no-unused-vars */
class DBInterface  {
    constructor(bot) {
        // Define which properties has to be set and what their arguments have to be called (ordered)
        // (to avoid wrong order of arguments throwing errors)
        this.bot = bot;
        // ?: Should I also define what they should return? Like that setter should return a
        // ?: resolvable promise<boolean> to have a respond if the insert/update worked?
        this.delegates = new class {
            constructor() {
                this.connectDB              = function ()                      { };
                this.disconnectDB           = function ()                      { };

                this.setSettings            = function (file) { };

                // Get complete table
                this.getTableRows           = function (table)                 { };
                // Inserts multiple rows into a table - be sure to not to add duplicates!
                this.insertTableRows        = function (table, rows)           { };
                // Delete complete table
                this.deleteTable            = function (table)                 { };
                // Get an Array of rows
                this.getTableRowsByKey      = function (table, key)            { };
                // Update one row and if not yet existent insert it
                this.setTableRowByKey       = function (table, key, row)       { };
                // Delete all rows with a specific key (or set of keys)
                this.deleteTableRowsByKey   = function (table, key)            { };

                this.local                  = false;
                this.status                 = 'disconnected';

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
