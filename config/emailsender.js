var nodemailer = require("nodemailer");
const secrets = require('../config/secrets');
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'roma.team.alpha@gmail.com',
        pass: secrets.gmail
    }
});

module.exports = transporter;