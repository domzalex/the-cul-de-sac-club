const moment = require('moment');

function messageFormat(user, text) {
    return {
        user,
        text,
        time: moment().format('h:mm a')
    }
}

module.exports = messageFormat;