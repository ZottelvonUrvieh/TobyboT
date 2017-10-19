// Putting .js files into the src/extensions folder will make every property you assign inside
// the module.exports = {} to be accessable through 'bot.extensions.propertyName'
// So in this example we could use the doSomething method in any module because every module has access to
// the property 'bot'.
// I would recommend only putting broadly usable functions / functions that explain themselfs with their name
// in here. For more specific stuff or if you have a bunch of functions that clearly belong together
// I would use a folder and put the file in there so they get accessable bundled together through
// bot.extensions.folderName.function1, bot.extensions.folderName.function2, bot.extensions.folderName.function3 ...
module.exports = {
    doSomething: function (param) {
        // this.log won't work! If you want to log stuff it would be best practice to give your function an argument
        // for handing over a mod, event, task or command and use .log(), .debug(), .warn() or .error() on them.
        // Doing so you get correctly indicated in the console where what happens instead of just a console.log()
        // that doesn't give you information from where this function got called...
        console.log(param);
    }
};
