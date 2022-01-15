const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const Collector = require('../models/collector');


// routes paths are prepended with /auth
router.get('/', (req, res) => {
    res.json({
        message: '👨‍'
    });
});

// check to make sure user entered valid text in email and password fields
function validUser(collector) {
    const validEmail = typeof collector.email == 'string' && collector.email.trim() != '';
    const validPassword = typeof collector.password == 'string' && collector.password.trim() != '' && collector.password.trim().length >=8;

    return validEmail && validPassword;
}

// https://www.youtube.com/watch?v=H7qkTzxk_0I
// user registration
router.post('/register', (req, res, next) => {
    inputtedUsername = req.body.username;
    inputtedEmail = req.body.email;
    lowerEmail = inputtedEmail.toLowerCase();
    if(validUser(req.body)) {
        Collector
        .getByUsername(req.body.username)
        .then(collector => {
            // if user not found, then it is a unique email
            if(!collector) {
                Collector
                .getByEmail(lowerEmail) //validates email
                .then(collector => {
                    // if user not found, then it is a unique username
                    if(!collector) {
                       // if user is is signing up as an admin, check promo codes
                        if (req.body.is_admin != 0) {
                            // if user did not enter promocode
                            if (!req.body.allpromos) {
                                res.render('register', {
                                    message: 'Please enter a code for the admin type selected',
                                    messageClass: 'alert-danger'
                                }
                                )
                                return
                            }

                            if (req.body.is_admin === "1") {
                                if (req.body.allpromos != "AAA20"){ //admin code for plush
                                    res.render('register', {
                                        message: 'Please enter valid code for Plush admin',
                                        messageClass: 'alert-danger'
                                    }
                                    )
                                    return
                                }
                            }

                            if (req.body.is_admin === "2") {
                                if (req.body.allpromos != "BBB20"){ //admin code for pin
                                    res.render('register', {
                                        message: 'Please enter valid code for Pin admin',
                                        messageClass: 'alert-danger'
                                    }
                                    )
                                    return
                                }
                            }

                            if (req.body.is_admin === "3") {
                                if (req.body.allpromos != "CCC20") { //admin code for figure
                                    res.render('register', {
                                        message: 'Please enter valid code for Figure admin',
                                        messageClass: 'alert-danger'
                                    }
                                    )
                                    return
                                }
                            }

                            if (req.body.is_admin === "4") {
                                if (req.body.allpromos != "RRR20"){ //admin code for accessory
                                    res.render('register', {
                                        message: 'Please enter valid code for Accessory admin',
                                        messageClass: 'alert-danger'
                                    }
                                    )
                                    return
                                }
                            }

                            if (req.body.is_admin === "5") {
                                if (req.body.allpromos != "DDD20") { //admin code for hot wheels
                                    res.render('register', {
                                        message: 'Please enter valid code for Other admin',
                                        messageClass: 'alert-danger'
                                    }
                                    )
                                    return
                                }
                            }
                            if (req.body.is_admin === "6") {
                                if (req.body.allpromos != "REG20") { //admin code for admin type
                                    res.render('register', {
                                            message: 'Please enter valid code for all admin type',
                                            messageClass: 'alert-danger'
                                        }
                                    )
                                    return
                                }
                            }
                        }
                        // user has passed is_admin checks, now create the new user
                        // hash password
                        bcrypt.hash(req.body.password, 10)
                        .then((hash) => {
                            const collector = {
                                username: req.body.username,
                                email: lowerEmail,
                                password: hash,
                                is_admin: req.body.is_admin
                            };
                            Collector
                            .create(collector) //create a collector
                            .then(collector_id => {
                            });
                            res.render('login', {
                                message: 'Successfully created account. Please login to continue.',
                                messageClass: 'alert-success'
                                }
                            );
                            return
                        });
                    }
                    // username in use
                    else { 
                        res.render('register', {
                            inputtedUsername,
                            message: 'Email in use. Please input a different email.',
                            messageClass: 'alert-danger'
                        });
                        return
                    }

                });
            }
            // email in use
            else { 
                res.render('register', {
                    inputtedEmail,
                    message: 'Username in use. Please input a different username.',
                    messageClass: 'alert-danger'
                });
                return
            }
        });
      
    } 
    // email or password fields are invalid
    else {
        res.render('register', {
            message: 'Invalid email or password. Please match the requested format.',
            messageClass: 'alert-danger'
        });
        return
    }  
});

// logout user
router.get('/logout', (req, res) => {
    // clear cookie
    res.clearCookie('user_id');
    res.json({
        message: 'you are logged out'
    });
});


module.exports = router;
