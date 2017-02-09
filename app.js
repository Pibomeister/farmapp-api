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
passport_conf(passport);
const app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use('/api', apiRoutes);

userRoutes(app,passport);


app.use(bodyParser.urlencoded({ extended: false }));
//Always send the angular app regardless of the route
app.get('*', (req, res) => {
	
   res.sendFile(path.join(__dirname, 'dist/index.html'));
   
});


module.exports = app;
