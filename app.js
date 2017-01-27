'use strict';

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const db = require('./db/config');

const api = require('./routes/api');

const app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(helmet());
app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', api);

app.use(bodyParser.urlencoded({ extended: false }));
//Always send the angular app regardless of the route
app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname, 'dist/index.html'));
});

module.exports = app;
