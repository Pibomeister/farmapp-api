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

});

router.post('/drugs', function(req, res, next) {

	let body = req.body;
  var dr = new Drug(body).save((err,data)=>{
			if(err) res.json({"Error" : err});
			else res.json({"Respuesta": "Satisfactorio"});
		}
  );


});	

module.exports = router;
