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
const moment = require('moment');
const flash    = require('connect-flash');
const db = require('./config/db');

var passport_conf = require('./config/passport');

const apiRoutes = require('./routes/api');
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/orders');
const imgPath = path.join(__dirname, 'images/');
const app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));


app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());


passport.use('jwt', passport_conf.strategy);
passport.use('facebook',passport_conf.fbstrategy);
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});



app.use('/api', apiRoutes(passport));
app.use('/user', userRoutes);
app.use('/order', orderRoutes);
app.use('/images', express.static(imgPath));

app.use(bodyParser.urlencoded({ extended: false }));


console.log(moment().format());

app.get('/error', (req,res)=>{
    res.json({error:"Hubo un error bien culero"});
});

app.get('/bien', (req,res)=>{
    res.send("succesfulll");
});

//Always send the angular app regardless of the route
app.get('*', (req, res) => {	
   res.sendFile(path.join(__dirname, 'dist/index.html'));
});




module.exports = app;
