// facebook app settings - fb.js
const secrets = require('./secrets');
module.exports = {
   appID : '287041178379781',
   appSecret : secrets.facebook,
   callbackUrl : 'http://localhost:3000/user/login/facebook/callback',
   profileFields: ['id', , 'email', 'displayName', 'name']
}