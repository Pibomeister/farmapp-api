'use strict';
// load the things we need
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const mongooseUniqueValidator = require('mongoose-unique-validator');

// Define our constant variables
const emailRgx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const validateEmail = (email) =>  emailRgx.test(email);

// define the schema for our user model
var userSchema = mongoose.Schema({
        _id:  String,
        createdAt: Number,
        local: {
        name : String,
        email: String,
        password : String,
        verified : Boolean
    },
    facebook : {
        id : String,
        token : String,
        email : String,
        name : String
    },
    google : {
        id : String,
        name : String,
        email :String
    }

}
// , {
//   timestamps: true
// }
);

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

//userSchema.plugin(mongooseUniqueValidator);

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
