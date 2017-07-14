const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.pre('save', function (next) {
    let user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(12)
            .then(salt => bcrypt.hash(user.password, salt))
            .then(hash => {
                user.password = hash;
                next();
            })
            .catch(console.log);
    } else {
        next();
    }    
});

UserSchema.statics.findByCredentials = function (email, password) {
    let User = this;
    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return bcrypt.compare(password, user.password).then((areSame) => {
            return areSame ? user : Promise.reject();
        });    
    }).catch((err) => {
        return err;
    });
}

UserSchema.methods.generateAuthToken = function () {
    let user = this;
    let access = 'auth';
    let token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, 'abc123').toString();

    user.tokens.push({
        access,
        token
    });
    return user.save().then(() => {        
        return token;
    });
};

UserSchema.statics.findByToken = function(token) {
    let User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, 'abc123');
    } catch (error) {
        return Promise.reject();
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.methods.removeToken = function (token) {
    let user = this;
    return user.update({
        $pull: {
            tokens: {token} 
        }
    });
}

UserSchema.methods.toJSON = function() {
    let user = this;
    let userObj = user.toObject();

    return _.pick(userObj, ['_id', 'email']);
};

module.exports.User = mongoose.model('User', UserSchema);