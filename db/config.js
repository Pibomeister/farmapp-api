const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/farmacia');


mongoose.connection.on('error', err => {
  console.log('Error conectando con la base de datos', err);
});

mongoose.connection.on('open', () => {
  console.log('Conectado a base de datos.');
});

module.exports = mongoose;
