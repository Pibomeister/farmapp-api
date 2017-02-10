'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const User = require('./user');
// Einstell hier das 'drug' Modell

let drugSchema = mongoose.Schema({
	name : String,
	fancyName : String,
	price : Number,
	rating: [Number],
	discount : Number,
	imgUrl: String,
    user: {type: Schema.Types.ObjectId, ref: 'User'}
});

// Modell 'init' funktion
/*drugSchema.pre('save', function(next){

});*/

module.exports = mongoose.model('Drug', drugSchema);
