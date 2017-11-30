// Utility function for returning a Promise that resolves after a delay
// So chaining Promise.delay(...).delay(...).delay(...) works
function delay(t) {
    return new Promise(function (resolve) {
        setTimeout(resolve, t);
    });
}

Promise.delay = function (fn, t) {
    // fn is an optional argument
    if (!t) {
        t = fn;
        fn = function () { };
    }
    return delay(t).then(fn);
};

Promise.prototype.delay = function (fn, t) {
    // return chained promise
    return this.then(function () {
        return Promise.delay(fn, t);
    });

};
