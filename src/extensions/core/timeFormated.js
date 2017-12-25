module.exports = {
    msToTimeDifferenceString: function (ms) {
        let d, h, m, s;
        s = Math.floor(ms / 1000);
        m = Math.floor(s / 60);
        s = s % 60;
        h = Math.floor(m / 60);
        m = m % 60;
        d = Math.floor(h / 24);
        h = h % 24;
        let timeleft_array = [];
        d = d === 0 ? null : d === 1 ? timeleft_array.push('1 day') : timeleft_array.push(`${d} days`);
        h = h === 0 ? null : h === 1 ? timeleft_array.push('1 hour') : timeleft_array.push(`${h} hours`);
        m = m === 0 ? null : m === 1 ? timeleft_array.push('1 minute') : timeleft_array.push(`${m} minutes`);
        s = s === 0 ? null : s === 1 ? timeleft_array.push('1 second') : timeleft_array.push(`${s} seconds`);
        return timeleft_array.join(', ');
    }
};
