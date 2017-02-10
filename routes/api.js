'use strict';

const express = require('express');
const router = express.Router();
const Drug = require('../models/drugs.js');
const passport = require('passport');
/* Einstell hier der API Endpunkt - e.g. GET /drugs */
module.exports = function(passport) {

    router.get('/drugs', passport.authenticate('jwt', {session: false}), function (req, res, next) {
        Drug.find(function (err, data) {
            if (err) console.log(err);
            else {
                res.json(data);
            }
        });

    });

    router.post('/drugs', passport.authenticate('jwt', {session: false}), function (req, res, next) {
        var body = req.body;
        var dr = new Drug(body).save(function(err, data){
                if(err) res.json({"Error": err});
        else
        res.json({"Respuesta": "Satisfactorio"});
    	});


    });

    return router;
}
