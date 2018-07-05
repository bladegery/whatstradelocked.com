const mongoose = require('mongoose');

var Bookmark = mongoose.model('Bookmark', {
    itemID: {
        type: String,
        required: true,
    },
    itemName: {
        type: String,
        required: true,
    },
    bookmarkedBY: {
        type: String,
        required: true,
    },
    ownedBy: {
        type: String,
        required: true,
    },
    tradable: {
        type: String,
        required: true,
    },
    addedOn: {
        type: Date,
        required: true,
    },
    notify: {
        type: Boolean,
        required: false,
        default: false,
    },
    notifyOn: {
        type: String,
        required: false,
    },
    notifyVia: {
        type: String,
        required: false,
    }
});

module.exports = {Bookmark};