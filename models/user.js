// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcryptjs');
var mongooseUniqueValidator = require('mongoose-unique-validator');
// define the schema for our user model
var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

var userSchema = mongoose.Schema({

    local: {
        email: String,
        password : String
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

});

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
