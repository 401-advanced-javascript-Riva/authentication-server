'use strict';

const jwt = require('jsonwebtoken');
const Users = require('../auth/models/user/user-model');
const UsersSchema = require('../auth/models/user/user-schema');

 //this function handles different roles assigned to user
 //this is a function that returns a function
const validateUser = capability => async (req, res, next) => {
    const capabilities = UsersSchema.statics.capabilities[res.role];
    const authorization = req.headers['authorization'];
    if(!authorization || !authorization.startsWith('Bearer')) {
        return res.status(401).end();
    }
    //not selecting password
    //lean returns json data
    //exec is good practice with mongoose, docs say to use it
    const user = await Users.findById(res.user._id)
      .select('-password')
      .lean()
      .exec();
    if(!user) {
        return res.status(401).send('User not found');
    }
    if(!capabilities.includes(capability)) {
        return res.status(401).send('User ' + res.user.username + ' does not have permission to ' + capability);
    }
    req.user = user;
    //changing passcode or email, user is on body of request
    next();
}

module.exports = validateUser;