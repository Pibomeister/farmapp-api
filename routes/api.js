'use strict';

const express = require('express');
const router = express.Router();
const Drug = require('../models/drugs.js');
const User = require('../models/user');
const secrets = require('../config/secrets');
const jwt = require('jsonwebtoken');

/* Einstell hier der API Endpunkt - e.g. GET /drugs */
module.exports = function(passport) {

    /*router.use('/', function(req,res,next){

        jwt.verify(req.get('Authorization'), secrets.jwt, function(err, decoded){
            if(err){ //token invaild/expired
                return res.status(401).json({
                    title : 'Not authenticated',
                    error :err
                });
            }
            next(); //let the request continue
        })
    });*/

    router.get('/drugs', function (req, res, next) {
        //console.log(req.header('Authorization'));
        console.log('VALID');
        Drug.find(function (err, data) {
            if (err) console.log(err);
            else {
                res.json(data);
            }
        });

    });

    router.post('/drugs', function (req, res, next) {
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
};
