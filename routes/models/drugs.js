const mongoose = require('mongoose');

// Einstell hier das 'drug' Modell, bitte seh storeItem in Angular Swei

let drugSchema = mongoose.Schema({

});

// Modell 'init' funktion
drugSchema.pre('save', function(next){

});

module.exports = mongoose.model('Drug', drugSchema);
