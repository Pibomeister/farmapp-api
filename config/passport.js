const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const passport = require("passport");
const passportJWT = require("passport-jwt");
const fbConfig = require('./facebook');
var FacebookStrategy = require('passport-facebook').Strategy;
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'dsahfh783618HVJHD&!&%GTre3s';
var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, done) {
    
    var dec = jwt.decode(jwt_payload);
    // usually this would be a database call:
    console.log(jwt_payload);
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

var fbstrategy = new FacebookStrategy({
  clientID        : fbConfig.appID,
  clientSecret    : fbConfig.appSecret,
  callbackURL     : fbConfig.callbackUrl,
  profileFields : fbConfig.profileFields
},
 
  // facebook will send back the tokens and profile
  function(access_token, refresh_token, profile, done) {
    // asynchronous
    process.nextTick(function() {
      console.log('profile', profile);
      // find the user in the database based on their facebook id
      User.findOne({'facebook.id' : profile.id }, function(err, user) {
 
        // if there is an error, stop everything and return that
        // ie an error connecting to the database
        if (err)
          return done(err);
 
          // if the user is found, then log them in
          if (user) {
            console.log("I FOUND AN EXISTING USER");
            return done(null, user); // user found, return that user
          } else {
            // if there is no user found with that facebook id, create them
            var newUser = new User();
            
            //newUser.local.email =  profile.emails[0].value;
            newUser.local.email = profile.emails[0].value; 
            newUser.local.password = newUser.generateHash("randompwd123");

            // set all of the facebook information in our user model
            newUser.facebook.id    = profile.id; // set the users facebook id                 
            newUser.facebook.token = access_token; // we will save the token that facebook provides to the user                    
            newUser.facebook.name  = profile.displayName;
            if(profile.emails !== undefined){
                newUser.facebook.email = profile.emails[0].value; 
            }
            // facebook can return multiple emails so we'll take the first
 
            // save our user to the database
            newUser.save(function(err) {
              if (err)
                throw err;
 
              // if successful, return the new user
              return done(null, newUser);
            });
         } 
      });
    });
});

module.exports = {
    strategy : strategy,
    fbstrategy :fbstrategy,
    options : jwtOptions
}