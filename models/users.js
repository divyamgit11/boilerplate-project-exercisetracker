// /models/users.js
const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    username: {type: String, required:true}
});

const Users = mongoose.model('User',userSchema, 'users');

module.exports = Users;