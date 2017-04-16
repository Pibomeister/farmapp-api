'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const User = require('./user');
let drugSchema = mongoose.Schema(
    {
    _id: String,
    createdAt: Number,
	products : [],
    status : Number,
    total : Number,
    user: String
    });

module.exports = mongoose.model('Order', drugSchema);
