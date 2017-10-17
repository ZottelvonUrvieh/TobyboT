const DBImplement = require('./classes/DBImplement_MongoDB');
// TODO: implement this? Or naw?
// const DBHandler2 = require('./classes/LowDBHandler'); // fallback
class DBManager extends DBImplement {
    constructor(bot) {
        super(bot);
        this.bot = bot;

        // lets check if all required properties are correctly assigned in the extended DBHandler
        let impCheck = this.implementationCheck(this);

        // if (impCheck.notImplemented.length +  > 0)
        if (impCheck.allCorrect === false) {
            bot.error('The chosen DBHandler has some wrong / missing implementations!');
            if (impCheck.notImplemented.length > 0) {
                bot.warn(`Flollowing properties are not implemented\n${impCheck.notImplemented.join('\n')}`);
            }
            if (impCheck.parameterMissmatch.length > 0) {
                bot.warn(`Following properties have wrong / missnamed arguments:\n${impCheck.parameterMissmatch.join('\n')}`);
            }
            if (impCheck.wrongType.length > 0) {
                bot.warn(`Following properties have a wrong type:\n${impCheck.wrongType.join('\n')}`);
            }
            bot.warn('If any module / command will try to access any of these listed properties, errors may occur!');
        }
    }
}

module.exports = DBManager;
