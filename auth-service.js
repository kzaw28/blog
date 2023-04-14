
/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Kaung Khant Zaw Student ID: 157467218 Date: 14th April, 2023
*
*  Cyclic Web App URL: https://mushy-school-uniform-toad.cyclic.app/about
*
*  GitHub Repository URL: https://github.com/kzaw28/web322-app
*
********************************************************************************/ 
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

let userSchema = new Schema({
    userName: String,
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }]
});

let User; // to be defined on new connection (see initialize)


// EXPORTED FUNCTIONS -----------------------------------------------------
exports.initialize = function () {
    return new Promise(function(resolve, reject){
        let db = mongoose.createConnection("mongodb+srv://JuroZaw:JmpF0OFjRbtKtKJz@jurozaw.utaidcs.mongodb.net/userData");
        /*
        on() and once() work the same way as in Node.js's EventEmitter. on() is used to register a callback function to be
        called every time the specified event is emitted, while once() is used to register a callback function to be called
        only once when the specified event is emitted for the first time.
        */
        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
            User = db.model("users", userSchema); // create users model on userSchema
            resolve();
        });
    });
};

exports.registerUser = function(userData) {
    return new Promise(function(resolve, reject){
        // check if the password and password2 match
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        } else {
            // Encrypt the plain text: "myPassword123"
            bcrypt.hash(userData.password, 10).then(hash=>{ // Hash the password using a Salt that was generated using 10 rounds
                userData.password = hash; // Replace the plain text password with the hashed password
                // create a new user object
                let newUser = new User(userData);
                // save the new user object to the database
                newUser.save().then((data) => {
                    resolve();
                }).catch((err) => {
                    if(err.code == 11000) {
                        reject("User Name already taken");
                    } else {
                        reject("There was an error creating the user: " + err);
                    }
                });
            })
            .catch(err=>{
                reject("There was an error encrypting the password");
            });
        };
    });
};

exports.checkUser = function(userData) {
    return new Promise(function(resolve, reject){
        User.find({userName: userData.userName})
        .exec()
        .then((users) => {
            if (users.length == 0) {
                reject("Unable to find user1: " + userData.userName);
            } 
            else {
                // check if the password matches
                 bcrypt.compare(userData.password, users[0].password).then(result => {
                    if (!result) {
                        reject("Incorrect Password for user: " + userData.userName);
                    } 
                    else
                    {
                        // add the current date and time to the loginHistory
                        users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                        // update the user object
                        User.updateOne({userName: users[0].userName}, {$set: {loginHistory: users[0].loginHistory}})
                        .exec()
                        .then(() => {
                            resolve(users[0]);
                        })
                        .catch(() => {
                            reject("There was an error verifying the user: " + err);
                        });
                    }
                 });
            }
        })
        .catch((err) => {
            reject("Unable to find user: " + userData.userName);
        });
    });
};