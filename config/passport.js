const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const passport = require("passport");
const passportJWT = require("passport-jwt");
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'dsahfh783618HVJHD&!&%GTre3s';
var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, done) {
    console.log('payload received', jwt_payload);
    // usually this would be a database call:

    User.findOne({_id: jwt_payload.id}, function (err, user) {
        if (err) {
            return res.status(500).json({
                title: 'error occured',
                error: err
            });
        }
        if (user) {
            done(null, user);
        }
        else {
            done(null, false);
        }
    });
});

module.exports = {
    strategy : strategy,
    options : jwtOptions
}