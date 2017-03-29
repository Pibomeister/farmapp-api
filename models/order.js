'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const User = require('./user');
let drugSchema = mongoose.Schema(
    {
	products : [],
    status : Number,
    total : Number,
    user: {type: Schema.Types.ObjectId, ref: 'User'}
    }, {
  timestamps: true
});

module.exports = mongoose.model('Order', drugSchema);
