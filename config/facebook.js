// facebook app settings - fb.js
const fbsecret = require('./facebook-secret');
module.exports = {
   appID : '287041178379781',
   appSecret : fbsecret,
   callbackUrl : 'http://localhost:3000/user/login/facebook/callback',
   profileFields: ['id', , 'email', 'displayName', 'name']
}