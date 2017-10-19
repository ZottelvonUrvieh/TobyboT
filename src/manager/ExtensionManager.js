const fs        = require('fs');
const path      = require('path');
const isJSFile  = source => path.extname(source) === '.js';
const isDir     = source => exists(source) ? fs.lstatSync(source).isDirectory() : null;
const exists    = source => fs.existsSync(source);
const getFolderContents = source =>
    exists(source)
        ? fs.readdirSync(source).map(name => {
            if (name.startsWith('_')) return '';
            return path.join(source, name);
        }) : [];
const loadExtensionsInFolder = function (folder, object) {
    getFolderContents(folder).filter(isJSFile).forEach(js => {
        this.coreDebug(`Loading extension ${js}`);
        try {
            delete require.cache[js];
            let loaded = require(js);
            for (let funcName in loaded) {
                if (loaded.hasOwnProperty(funcName)) {
                    object[funcName] = loaded[funcName];
                }
            }
        } catch (err) { this.error(err, js + ' '); }
    });
};

class ExtensionManager {
    constructor(bot) {
        this.bot = bot;
        bot.coreDebug('Initializing ExtensionManager! ');
        let extensionsFolder = path.resolve(__dirname, '../extensions');
        loadExtensionsInFolder.call(bot, extensionsFolder, this);
        getFolderContents(extensionsFolder).filter(isDir).forEach(folder => {
            bot.coreDebug(`Loading extensions in ${folder}`);
            if (typeof this[path.basename(folder)] !== 'undefined')
                return bot.error(`Loading the Extensions in the folder \n${folder} \nwould override an already loaded function...` +
                    ' \nThere has to be a previously loaded Extension that has a property named like this folder...' +
                    ' \nRename either the property (and all occurences of it or you break even more stuff)' +
                    ` or this folder (and update all references that access extentions.${path.basename(folder)}` +
                    ' to extensions.newFoldername)');
            this[path.basename(folder)] = {};
            loadExtensionsInFolder.call(bot, folder, this[path.basename(folder)]);
        }, this);

    }
}

module.exports = ExtensionManager;
