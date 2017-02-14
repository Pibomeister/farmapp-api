/**
 * Created by Farid on 8/2/2017.
 */

'use strict';
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const passport_conf = require('../config/passport');
const passport = require('passport');
var jwtOptions = {}
jwtOptions.jwtFromRequest = passport_conf.options.jwtFromRequest;
jwtOptions.secretOrKey = passport_conf.options.secretOrKey;
const fbstrategy = passport_conf.fbstrategy;
const express = require('express');
const router = express.Router();
    router.post('/signup', function(req,res){
        console.log('Hit the route jack');
        var usr = new User();
        usr.local.password = usr.generateHash(req.body.password), //one way, cannot be decrypted
        usr.local.email = req.body.email

        usr.save(function(err, doc, num){
            if(err){
                return res.status(500).json({
                    title : 'Internal error occured',
                    error: err
                });
            }
            res.status(201).json({
            message: 'User created',
            user_id: doc._id,
            count: num
            });
        });


    });

    router.post("/fbuser", function(req, res){
        console.log(req.body);
        User.findOne({'facebook.email': req.body.user.email}, (err,user)=>{
            if (err) {
                return res.status(500).json({
                    title: 'error occured',
                    error: err
                });
            }

            if(user){
                res.status(201).json({
                    message : 'User already exists',
                    id : user._id
                });
            }

            else{
                user = new User();
                user.facebook.email = req.body.user.email;
                user.facebook.id = req.body.user.id;
                user.facebook.token = req.body.user.token;
                user.facebook.name = req.body.user.name;
                console.log('user to be saved', user);
                user.save(function(err, doc, num){
                    if(err){
                        return res.status(500).json({
                            title : 'Internal error occured',
                            error: err
                        });
                    }
                    res.status(201).json({
                    message: 'User created',
                    user_id: doc._id,
                    count: num
                    });
                });
            }
        })
    })

    router.post("/login", function(req, res) {
        if (req.body.email && req.body.password) {
            var email = req.body.email;
            var password = req.body.password;
        }
        User.findOne({'local.email': email}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    title: 'error occured',
                    error: err
                });
            }
            if (!user || !user.validPassword(password)) {
                console.log(password);
                return res.status(404).json({
                    title: 'Login Failed',
                    error: {message: 'invalid credentials'}
                });
            }

            if (user.validPassword(password)) {
                var payload = {id: user.id, email: user.local.email};
                var token = jwt.sign(payload, jwtOptions.secretOrKey);
                res.json({id: user.id, token: token});
            }

        })

    });


    router.get('/login/facebook', 
        passport.authenticate('facebook', { scope : ['email'] }), function(req,res){
            console.log('gat me');
        });
    
    // handle the callback after facebook has authenticated the user
    /*router.get('/login/facebook/callback',
        passport.authenticate('fb', {
            successRedirect : '/bien',
            failureRedirect : '/error'
        })
    );*/

    router.get('/login/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/error'}),
       
    function(req, res) {
        console.log('bien');
        console.log(req.user);
        res.json({
            userid: req.user.id,
            token: req.user.facebook.token,
            email : req.user.facebook.email
        });
        
    });

    router.get('/account', function(req,res){
        console.log(req.user);
        res.send("todo salio chingon");
    });

module.exports = router;