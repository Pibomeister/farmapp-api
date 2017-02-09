'use strict';
const mongoose = require('mongoose');
const nombre = "FARMACIA";
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/farmacia');


mongoose.connection.on('error', (err) => {
  console.log('Error conectando con la base de datos', err);
});

mongoose.connection.on('open', () => {
  console.log(`Conectado a base de datos ${nombre}`);
});

module.exports = mongoose;
