'use strict';
const mongoose = require('mongoose');
const Pharmacy = require('./pharmacy');
var Schema = mongoose.Schema;
// Einstell hier das 'drug' Modell

let drugSchema = mongoose.Schema({
	_id: String,
	name : String,
	existent : Number,
	substance : String,
	laboratory : String,
	price : Number,
	rating: [Number],
	discount : Number,
	perf : Boolean,
	medic : Boolean,
	Antib : Boolean,
	Gen: Boolean,
	Ctrl : Boolean,
	Refrig : Boolean,
	Normal : Boolean,
	Bonif : Boolean,
	Limit : Boolean,
	Expires : Boolean,
	RetForExp : Boolean,
	FFS: Boolean,
	imgUrl: String,
    pharmacies : [{ type: Schema.Types.ObjectId, ref: 'Pharmacy' }]
});

// Modell 'init' funktion
/*drugSchema.pre('save', function(next){

});*/

module.exports = mongoose.model('Drug', drugSchema);
