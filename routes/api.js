'use strict';

const express = require('express');
const router = express.Router();
const Drug = require('../models/drugs.js');
const User = require('../models/user');
const passport = require('passport');
/* Einstell hier der API Endpunkt - e.g. GET /drugs */
module.exports = function(passport) {

    router.get('/drugs', passport.authenticate('jwt', {session: false}), function (req, res, next) {

        console.log(req.header('Authorization'));

        Drug.find(function (err, data) {
            if (err) console.log(err);
            else {
                res.json(data);
            }
        });

    });

    router.post('/drugs', passport.authenticate('jwt', {session: false}), function (req, res, next) {
        var body = req.body;
        var userid = req.query.userid;
        User.findById(userid, function(err, user){
            /*if(!user){
               return res.json({error: "Usuario invalido"});
            }*/
            var dr = new Drug({
                name : body.name,
                fancyName : body.fancyName,
                price : body.price,
                discount: body.discount,
                rating : body.rating,
                imgUrl : body.imgUrl,
                user : userid
            }).save(function(err, data){
                if(err) res.json({"Error": err});
                else
                    res.json({"Respuesta": "Satisfactorio"});
            });


        });


    });

    return router;
}
