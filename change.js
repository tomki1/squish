const express = require('express');
const router = express.Router()
;const knex = require('../connection')
const { ensureLoggedIn } = require('../auth/middleware')
const bcrypt = require('bcrypt');
const Collector = require('../models/collector');


router.get('/', ensureLoggedIn, async (req, res, next) => {

    const userId = req.signedCookies.user_id



    const collectorData = await knex('collector')
    .select('username', 'email', 'collector_id', 'is_admin', 'password')
    .where('collector_id', userId );


    res.render('change', { title: "Squishmallows Trading | change",
    thisCollector: collectorData });
});


// check to make sure user entered valid text in password fields
function validUser(collector) {
    const validPassword = typeof collector.password == 'string' && collector.password.trim() != '' && collector.password.trim().length >=8;

    return validPassword;
}


// user change password
router.post('/', async (req, res, next) => {
    const userId = req.signedCookies.user_id
    // check to see if user is in database
    if(validUser(req.body)) {
        Collector    
        .getById(userId)
        .then(collector => {
            if (collector) {

                bcrypt
                .compare(req.body.oldpassword, collector.password)
                    .then((result) => {
                        if(result) {
                        }
                        


                        else {
                            // password does not match what we have in our database for that email address
                            res.render('change', {
                                message: 'Your old password does not match what we have on record.',
                                messageClass: 'alert-danger'
                                }
                            );
                            return
                        }
            
                });


            }

        });

        hash = await bcrypt.hash(req.body.password, 10);
        await knex('collector')
        .where({ collector_id: userId })
        .update({ password: hash })

        res.render('change', {
            message: 'Password successfully changed.',
            messageClass: 'alert-success'
            }
        );
        return
    }

    else {
        res.render('', {
            message: 'Invalid user.',
            messageClass: 'alert-danger'
        });
        return
    }  
});




module.exports = router;