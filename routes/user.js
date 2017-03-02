/**
 * Created by Farid on 8/2/2017.
 */

'use strict';
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets');
const express = require('express');
const router = express.Router();
const transporter = require('../config/emailsender');
const host = "http://localhost:3000";


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

router.post('/signup', function(req,res){
    console.log('Hit the route jack');
    
    
    if(req.body.email !== undefined && req.body.password !== undefined){
        let usr = new User();
        usr.local.name = req.body.name;
        usr.local.password = usr.generateHash(req.body.password); //one way, cannot be decrypted
        usr.local.email = req.body.email;
        usr.local.verified = false;
        usr.save(function(err, doc, num){
        if(err){
            return res.status(500).json({
                title : 'Internal error occured',
                error: err
            });
        }
        res.status(200).send({ mail: usr.local.email});
        //res.redirect('/user/send/' + usr.local.email);

        });

    }

    else{
        res.status(401).send('not all fields provided');
    }
    

});


router.get('/send/:email',function(req,res){
    let to = validateEmail(req.params.email) ? req.params.email : null;
    if(to !== null){
        User.findOne({'local.email' : to}, function(err, user){
            if(err) res.status(500).send('Internal server error');
            if(user){
                let link="http://localhost:3000/user/verify?id="+user._id;
                console.log('link', link);
                let mailOptions = {
                from: '"Farmapp support👻" <roma.team.alpha@gmail.com>', // sender address
                to: to,
                subject:"Please confirm your Email account",
                html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
            };
            transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message %s sent: %s', info.messageId, info.response);
                    res.status(201).send({message: 'El correo ha sido enviado a su cuenta'});
            });

            }
        });
        
    }
    else{
        res.status(401).send('Incorrect parameters');
    }
    
    
});

router.get('/verify',function(req,res){
    let id = req.query.id;
    console.log(req.protocol+"://"+req.get('host'));
    if(req.protocol+"://"+req.get('host')==host)
    {
        console.log("Domain is matched. Information is from Authentic email");
        User.findOne({'_id' : id}, function(err, user){
            console.log('user',user);
            if(err) res.status(500).send('Internal error occured');
            if(user){
                user.local.verified = true;
                user.save(function(err){
                    console.log('usuario actualizado :D');
                    if(!err){
                        res.redirect("http://localhost:4200");
                        
                    }
                });
            }
        });
    }
    else
    {
        res.end("<h1>Request is from unknown source");
    }
});

router.post("/login", function(req, res) {
    if (req.body.email && req.body.password) {
        var email = req.body.email;
        var password = req.body.password;
    }
    User.findOne({'local.email': email, 'local.verified' : true}, function (err, user) {
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
                        message: 'Facebook User created',
                        user_id: doc._id,
                        count: num
                    });
                }
            });
        }
    });
});

router.post("/googleuser", function(req, res) {
    console.log(req.body);
    User.findOne({'google.email': req.body.user.email}, function(err, user){
        if (err) {
            console.log(err);
            return res.status(500).json({
                title: 'error occured',
                error: err
            });
        }

        if(user){
            console.log('google user already on our DB');
            let token = jwt.sign({user: user}, secrets.jwt, {expiresIn: 7200});
            res.status(201).json({
                id: user.id,
                token: token
            });

        }
        else{
            user = new User();
            user.google.email = req.body.user.email;
            user.google.id = req.body.user.id;
            user.google.name = req.body.user.name;
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
                        message: 'Google User created',
                        user_id: doc._id,
                        count: num
                    });
                }
            });
        }
    });
});

router.use('/', function(req,res,next){

        jwt.verify(req.get('Authorization'), secrets.jwt, function(err, decoded){
            if(err){ //token invaild/expired
                return res.status(401).json({
                    title : 'Not authenticated',
                    error :err
                });
            }
            next(); //let the request continue
        })
});


router.get('/:userid', function(req,res){
    var uid = req.params.userid;
    console.log('uid', uid);
    var returnedUser = {};
    User.findOne({'_id' : uid}, function(err, user){
        if(err) return res.status(500).send('Algo salio mal');
        if(user){
            if(user.facebook.email !== undefined){
                returnedUser.name = user.facebook.name;
                returnedUser.email = user.facebook.email;
            }
            else if(user.google.email !== undefined) {
                returnedUser.name = user.google.name;
                returnedUser.email = user.google.email;
            }

            else{
                returnedUser.name = user.local.name;
                returnedUser.email = user.local.email;
            }

            res.json(returnedUser);
        }

        else{
            res.status(404).send('Non existing user');
        }

    });


});

module.exports = router;