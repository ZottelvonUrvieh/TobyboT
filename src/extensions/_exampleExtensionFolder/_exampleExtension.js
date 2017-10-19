// Putting .js files into a folder of (for example src/extensions/yourFolderName) will make every property you
// assign inside the module.exports = { } to be accessable through 'bot.extensions.yourFolderName.propertyName'
// So in this example we could use the doSomething method in any module because every module has access to
// the property 'bot'.
// Adding deeper nested folders will be ignored. So if you create a folder src/extensions/yourFolderName/example
// the bot will do nothing with this folder or it's content. So you can make complex and structured stuff! :D
module.exports = {
    doSomething: function (param) {
        console.log(param);
    }
};
