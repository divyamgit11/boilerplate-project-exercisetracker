const mongoose = require('mongoose');
const User = require('./users');
const Exercise = require('./exercises');

const logSchema = mongoose.Schema({
    _id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:User['_id']
    },
    username: {
        type: User.username,
        ref: User,
        required: true
    },
    count: {
        type: Number,
        default: 1
    },
    log: [{
        description: {
            type: String,
            ref: Exercise.description
        },
        duration: {
            type: Number,
            ref: Exercise.duration
        },
        date: {
            type: Date,
            ref: Exercise.date
        }
    }]
});

const Log = mongoose.model('Log', logSchema, 'logs');
module.exports = Log;
