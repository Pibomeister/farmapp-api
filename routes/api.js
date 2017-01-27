'use strict';

const express = require('express');
const router = express.Router();

/* Einstell hier der API Endpunkt - e.g. GET /drugs */
router.get('/', function(req, res, next) {
  res.send('Bienvenido a mi servidorcito');
});

module.exports = router;
