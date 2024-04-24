const mongoose = require('mongoose');
const User = require('./users.js');

const exerciseSchema = mongoose.Schema({
    _id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:User['_id']
    },
    username: {
        type: User.username,
        ref: User,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

const Exercise = mongoose.model('Exercise', exerciseSchema, 'exercises');
module.exports = Exercise;
