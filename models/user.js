const mongoose = require('mongoose');

var User = mongoose.model('User', {
    steamuserID: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
        minLength: 1,
    },
    password: {
        type: String,
        required: false,
    }
});

module.exports = {User};