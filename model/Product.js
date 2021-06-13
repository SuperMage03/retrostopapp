const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 1,
        max: 1024
    },
    cost: {
        type: Number,
        required: true,
        min: 6,
        max: 1024
    },
    description: {
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
    imgName: {
        type: String,
        min: 6,
        max: 1024
    },
    romName: {
        type: String,
        min: 6,
        max: 1024
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);