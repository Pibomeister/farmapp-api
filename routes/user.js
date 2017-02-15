/**
 * Created by Farid on 8/2/2017.
 */

'use strict';
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets');
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
            let token = jwt.sign({user: user}, secrets.jwt, {expiresIn: 7200});
            res.json({id: user.id, token: token});
        }

    })

    });



    router.post("/fbuser", function(req, res) {
        console.log(req.body);
        User.findOne({'facebook.email': req.body.user.email}, function(err, user){
            if (err) {
                console.log(err);
                return res.status(500).json({
                    title: 'error occured',
                    error: err
                });
            }

            if(user){
                console.log('fb user already on our DB');
                let token = jwt.sign({user: user}, secrets.jwt, {expiresIn: 7200});
                res.status(201).json({
                    id: user.id,
                    token: token
                });

            }
            else{
                user = new User();
                user.facebook.email = req.body.user.email;
                user.facebook.id = req.body.user.id;
                user.facebook.token = req.body.user.token;
                user.facebook.name = req.body.user.name;
                console.log('user to be saved', user);
                user.save(function (err, doc, num) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            title: 'Internal error occured',
                            error: err
                        });
                    }
                    else {
                        res.status(201).json({
                            message: 'User created',
                            user_id: doc._id,
                            count: num
                        });
                    }
                });
            }
    });
    });

    /*router.get('/login/facebook',
        passport.authenticate('facebook', { scope : ['email'] }), function(req,res){
            console.log('gat me');
        });
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
    });*/

module.exports = router;