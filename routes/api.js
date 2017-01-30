'use strict';

const express = require('express');
const router = express.Router();
const Drug = require('../models/drugs.js');
/* Einstell hier der API Endpunkt - e.g. GET /drugs */
router.get('/drugs', function(req, res, next) {
  Drug.find((err,data) => {
  	if(err) console.log(err);
  	else {
  		res.json(data);
  	}
  });
  //res.send('Bienvenido a mi servidorcito');

});

router.get('/insert', function(req, res, next) {
  console.log('hit the route jack');
  var dr = new Drug({
	name : 'Nombre',
	fancyName : 'Pene',
	price: 120,
	rating : [4,5,4,4,3],
	discount : 18
  }).save((err,data)=>{
		  if(err) console.log(err);
		  else console.log(data);
	}
  );


});	

module.exports = router;
