var User = require('../models/user')

var AuthHandler = function() {
	this.facebookSignIn = facebookSignIn;
	this.facebookSignInCallback = facebookSignInCallback
}

function facebookSignIn(req, res, next) {
	passport = req._passport.instance;
	passport.authenticate('facebook', { scope : ['email'] }, function(err,user,info){

    })(req,res,next);

};

function facebookSignInCallback(req, res, next) {
	passport = req._passport.instance;
	passport.authenticate('facebook',function(err, user, info) {
		if(err) {
			return next(err);
		}
		if(!user) {
			return res.redirect('http://localhost:4200/login');
		}
		User.findOne({'facebook.email': user._json.email},function(err,usr) {
			res.writeHead(302, {
				'Location': 'http://localhost:4200/#/index?token=' + usr.facebook.token + '&user=' + usr.facebook.email
			});
			res.end();
		});
	})(req,res,next);
};

function facebookSignIn(req, res, next) {};
function facebookSignInCallback(req, res, next) {};

module.exports = AuthHandler; 