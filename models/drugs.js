'use strict';
const mongoose = require('mongoose');

// Einstell hier das 'drug' Modell

let drugSchema = mongoose.Schema({
	name : String,
	fancyName : String,
	price : Number,
	rating: [Number],
	discount : Number,
	imgUrl: String
});

// Modell 'init' funktion
/*drugSchema.pre('save', function(next){

});*/

module.exports = mongoose.model('Drug', drugSchema);
