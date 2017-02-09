/**
 * Created by Farid on 8/2/2017.
 */

'use strict';
const Drug = require('../models/user.js');


module.exports = function(app, passport){
    app.post('/signup', passport.authenticate('local-signup', { session: false }),
        function(req,res){
            var user = {
                id : req.user._id,
                email : req.user.local.email
            }
            res.json(user);
        }
        );
};