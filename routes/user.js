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

const { ObjectID } = require('mongodb');

const {confirmEmail, orderConfirm} = require('../emails/emails.js');
const neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", secrets.neo4j));
var session = driver.session();

const emailRgx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const validateEmail = email =>  emailRgx.test(email);



router.post('/signup', function(req,res){

    if(req.body.email !== undefined && req.body.password !== undefined){
        User.findOne({'local.email': req.body.email}, function(err,user){
            console.log(req.body.password);
            if(user){
                return res.status(403).json({
                    title : 'Correo ya existente'
                });
            }
            else{
                let usr = new User();
                usr._id = (new ObjectID()).toString();
                usr.createdAt = (new Date()).getTime();
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
                });
            }
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
                let name = user.local.name;
                console.log('Enviando correo a', name );
                let link="http://localhost:3000/user/verify?id="+user._id;
                let emailHtml = confirmEmail(link, name);
                let mailOptions = {
                from: '"Soporte a clientes Farmapp 👻" <roma.team.alpha@gmail.com>', // sender address
                to: to,
                subject:"Porfavor confirme su cuenta en Farmapp",
                html : emailHtml
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
                var mid = user.id.toString();
                session
                    .run("CREATE(n:User {mongoId:{idParam}, name:{uName}}) RETURN n.name", {idParam: mid, uName: user.local.name })
                    .then(function(result){
                        console.log('agregado a neo4j');
                        user.local.verified = true;
                        session.close();
                        user.save(function(err){
                            console.log('usuario actualizado :D');
                            if(!err){
                                res.redirect("http://localhost:4200/activate?mail="+user.local.email);
                            }
                        });
                    })
                    .catch(function(error){
                        console.log(error);
                        session.close();
                    });

            }
        });
    }
    else
    {
        res.end("<h1>Request is from unknown source</h1>");
    }
});

router.post("/login", function(req, res) {
    if (req.body.email && req.body.password) {
        var email = req.body.email;
        var password = req.body.password;
    }
    User.findOne({'local.email': email}, function (err, user) {
        console.log(user);
        if (err) {
            return res.status(500).json({
                title: 'error occured',
                error: err
            });
        }
        if (!user || !user.validPassword(password)) {
            return res.status(404).json({
                title: 'Login Failed',
                error: {message: 'invalid credentials'}
            });
        }

        if (user.validPassword(password)) {
            if(!user.local.verified){
                console.log('enter light');
                return res.status(401).json({
                    title : 'Login Failed',
                    error : {message : 'Account hasn\'t been verified, please check your email'}
                });
            }
            let token = jwt.sign({user: user}, secrets.jwt, {expiresIn: 7200});
            res.json({id: user.id, token: token});
        }

    })

});



router.post("/fbuser", function(req, res) {
    console.log('/fbuser data', req.body);
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
            let _id = (new ObjectID()).toString();
            const  createdAt = (new Date()).getTime();
            const id = req.body.user.id;
            const email = req.body.user.email;
            const token = req.body.user.token;
            const name = req.body.user.name;
            const updatedUser = {
                $setOnInsert: {
                    _id,
                    createdAt,
                    local : {
                        email,
                        name,
                        verified: true
                    }
                }, facebook : {
                    id,
                    email,
                    token,
                    name
                }
            };
            console.log('user to be saved', updatedUser);

            User.findOneAndUpdate(
                {'local.email': email}, 
                updatedUser, 
                {
                    upsert:true,
                    new: true
                }, (err, doc) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        title: 'Internal error occured',
                        error: err
                    });
                }
                else {
                    _id = (doc) ? doc._id : _id;
                     session
                    .run("MERGE(n:User {name:{uName}, _id:{idParam}}) RETURN n.name", {uName: name, idParam: _id, })
                    .then(function(result){
                        console.log(result, 'agregado a neo4j');
                        session.close();
                        let authtoken = jwt.sign({user: doc}, secrets.jwt, {expiresIn: 7200});
                    res.status(201).json({
                        message: 'Facebook User created',
                            id: _id,
                            token: authtoken,
                    });
                    })
                    .catch(function(error){
                        console.log(error);
                        session.close();
                    });
                }
            });
        }
    });
});

router.post("/googleuser", function(req, res) {
    console.log('/googleuser data', req.body);
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
            let _id = (new ObjectID()).toString();
            const createdAt = (new Date()).getTime();
            const id = req.body.user.id;
            const email = req.body.user.email;
            const name = req.body.user.name;

            const updatedUser = {
                $setOnInsert: {
                    _id,
                    createdAt,
                    local : {
                        email,
                        name,
                        verified: true
        }
                }, google : {
                    id,
                    email,
                    name
                }
            };
            console.log('user to be saved', updatedUser);

            User.findOneAndUpdate(
                {'local.email': email}, 
                updatedUser, 
                {
                    upsert:true,
                    new: true
                }, (err, doc) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        title: 'Internal error occured',
                        error: err
                    });
                }
                else {
                    _id = (doc) ? doc._id : _id;
                     session
                    .run("MERGE(n:User {name:{uName}, _id:{idParam}}) RETURN n.name", {uName: name, idParam: _id, })
                    .then(function(result){
                        console.log(result, 'agregado a neo4j');
                        session.close();
                        new User()
                        let token = jwt.sign({user: new User()}, secrets.jwt, {expiresIn: 7200});
                    res.status(201).json({
                        message: 'Google User created',
                        id: user.id,
                        token: token,
                        count: num
                    });
                    })
                    .catch(function(error){
                        console.log(error);
                        session.close();
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
            console.log(decoded);
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
