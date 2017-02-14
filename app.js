'use strict';

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const flash    = require('connect-flash');
const db = require('./config/db');

var passport_conf = require('./config/passport');

const apiRoutes = require('./routes/api');
const userRoutes = require('./routes/user');
const app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));


app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());


passport.use('local-login', passport_conf.strategy);
passport.use('facebook',passport_conf.fbstrategy);
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(passport_conf.strategy);

app.use('/api', apiRoutes(passport));
app.use('/user', userRoutes)


app.use(bodyParser.urlencoded({ extended: false }));
//Always send the angular app regardless of the route



app.get('/error', (req,res)=>{
    res.json({error:"Hubo un error bien culero"});
});

app.get('/bien', (req,res)=>{
    res.send("succesfulll");
});

app.get('*', (req, res) => {
	
   res.sendFile(path.join(__dirname, 'dist/index.html'));
   
});




module.exports = app;
