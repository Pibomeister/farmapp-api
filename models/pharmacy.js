'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
let pharmacySchema = mongoose.Schema({
    name : String,
    address : String,
    lat : Number,
    lng : Number
});

module.exports = mongoose.model('Pharmacy', pharmacySchema);
/**
 * Created by Farid on 6/6/2017.
 */
