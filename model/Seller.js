const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    onboardAccount: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Seller', sellerSchema);