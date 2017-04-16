'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const User = require('./user');
// Einstell hier das 'drug' Modell

let drugSchema = mongoose.Schema({
	_id: String,
	name : String,
	fancyName : String,
	price : Number,
	rating: [Number],
	discount : Number,
	imgUrl: String,
});

// Modell 'init' funktion
/*drugSchema.pre('save', function(next){

});*/

module.exports = mongoose.model('Drug', drugSchema);
