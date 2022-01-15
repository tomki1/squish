const express = require('express');
const knex = require('../connection')
const router = express.Router();
const Collector_messsages = require('../models/collector_messages')
const { ensureLoggedIn } = require('../auth/middleware')


// page for user to see what users they have a message chain with
router.get('/', ensureLoggedIn, async (req, res, next) => {
    const fromUser = req.signedCookies.user_id; // me


    // grab users that have messages with logged in user, but don't display logged in user
    const messageChain = await knex('collector_messages')
        .select('collector_messages.read','collector_messages.created_at', 'collector_messages.message', 'collector_messages.from_user_id', 'collector.collector_id', 'collector.username')    
        .join('collector', 'collector.collector_id', 'collector_messages.from_user_id')
        .orderBy('collector.collector_id')
        .orderBy('collector_messages.created_at', 'desc')
        .distinctOn('collector.collector_id')
        .whereNot('collector.collector_id', fromUser)
        .where('from_user_id', '=', fromUser)
        .orWhere('to_user_id', '=', fromUser)


    

    if (messageChain.length == 0) {
        var noUsersWithMessage = 1;
    }

    res.render('inbox', { 
        title: `Squishmallows Trading | Messages`,
        fromUser,
        messagesChain: messageChain,
        noUsersWithMessage
    });
});


// page that user can use to see messages with other user or send messages to other user
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    const { id } = req.params; // them
    const fromUser = req.signedCookies.user_id; // me

    var isLoggedInUser = null;

    if (id == req.signedCookies.user_id) {
        isLoggedInUser = 1;
    }


    // can't message ourself, so redirect ot profile if we are on our own page
    if (id == req.signedCookies.user_id) {
        res.redirect('/profile');
    }

    // get information of other user
    const collectorData = await knex('collector')
        .select('username', 'email', 'collector_id', 'is_admin')
        .where('collector_id', id );

    // if no this other user doesn't exist, redirect to hompage
    if (collectorData.length == 0) {
        res.redirect('/');
        return;
    }

    const collectorsMessages = await knex('collector_messages')
        .select('collector_messages.created_at', 'collector_messages.message', 'collector_messages.from_user_id', 'collector.collector_id', 'collector.username')
        .join('collector', 'collector.collector_id', 'collector_messages.from_user_id')
        .orderBy('collector_messages.created_at', 'asc')
        .where('to_user_id', '=', id)
        .andWhere('from_user_id', '=', fromUser)
        .orWhere('from_user_id', '=', id)
        .andWhere('to_user_id', '=', fromUser);


        
        await knex('collector_messages')
        .where('from_user_id', '=', id)
        .andWhere('to_user_id', '=', fromUser)
        .update({ read: '1' })

    console.log(collectorsMessages);

    if (collectorsMessages.length == 0) {
        var noMessagesToList = 1;
    }


    res.render('messages', { 
        title: `Squishmallows Trading | Messages`,
        collector: collectorData,
        id,
        fromUser,
        messages: collectorsMessages,
        noMessagesToList,
        isLoggedInUser
    });
});



// post request to give user a message
router.post('/:id', async (req, res, next) => { 
    const { id } = req.params;
    const toUser = id;
    const fromUser = req.signedCookies.user_id;
    const userMessage = req.body.message;
    const read = 0;

    
    const collectorData = await knex('collector')
        .select('username', 'email', 'collector_id', 'is_admin')
        .where('collector_id', id );


    // if user message is over 300 characters, render error
    if (userMessage.length > 300) {
        const collectorsMessages = await knex('collector_messages')
        .select('collector_messages.created_at', 'collector_messages.message', 'collector_messages.from_user_id', 'collector.collector_id', 'collector.username')       
        .join('collector', 'collector.collector_id', 'collector_messages.from_user_id')
        .orderBy('collector_messages.created_at', 'asc')
        .where('to_user_id', '=', id)
        .andWhere('from_user_id', '=', fromUser)
        .orWhere('from_user_id', '=', id)
        .andWhere('to_user_id', '=', fromUser);

        res.render('messages', { 
            title: `Squishmallows Trading | Messages`,
            message: 'Error: Your message must be 300 characters or less',
            messageClass: 'alert-danger',
            collector: collectorData,
            id,
            fromUser,
            messages: collectorsMessages,
            isLoggedInUser
        });
        return;
        
    }

    // if no such collector, redirect to hompage
    if (collectorData.length == 0) {
        res.redirect('/');
        return;
    }


    // ensure to user and from user are not the same, otherwise render error
    if (toUser == fromUser) {
        var isLoggedInUser = 1;

        const collectorsMessages = await knex('collector_messages')
        .select('collector_messages.created_at', 'collector_messages.message', 'collector_messages.from_user_id', 'collector.collector_id', 'collector.username')       
        .join('collector', 'collector.collector_id', 'collector_messages.from_user_id')
        .orderBy('collector_messages.created_at', 'asc')
        .where('to_user_id', '=', id)
        .andWhere('from_user_id', '=', fromUser)
        .orWhere('from_user_id', '=', id)
        .andWhere('to_user_id', '=', fromUser);

        res.render('messages', { 
            title: `Squishmallows Trading | Messages`,
            message: 'Error: You cannot give yourself a message',
            messageClass: 'alert-danger',
            collector: collectorData,
            id,
            fromUser,
            messages: collectorsMessages,
            isLoggedInUser
        });
        return;
    }

        // ensure user exists
        if (toUser == fromUser) {
            var isLoggedInUser = 1;
    
            const collectorsMessages = await knex('collector_messages')
            .select('collector_messages.created_at', 'collector_messages.message', 'collector_messages.from_user_id', 'collector.collector_id', 'collector.username')       
            .join('collector', 'collector.collector_id', 'collector_messages.from_user_id')
            .orderBy('collector_messages.created_at', 'asc')
            .where('to_user_id', '=', id)
            .andWhere('from_user_id', '=', fromUser)
            .orWhere('from_user_id', '=', id)
            .andWhere('to_user_id', '=', fromUser);
    
            res.render('messages', { 
                title: `Squishmallows Trading | Messages`,
                message: 'Error: No such user',
                messageClass: 'alert-danger',
                collector: collectorData,
                id,
                fromUser,
                messages: collectorsMessages,
                isLoggedInUser
            });
            return;
        }
    // create the message
    await Collector_messsages.create(fromUser, toUser, userMessage, read);
    
    const collectorsMessages = await knex('collector_messages')
        .select('collector_messages.created_at', 'collector_messages.message', 'collector_messages.from_user_id', 'collector.collector_id', 'collector.username')       
        .join('collector', 'collector.collector_id', 'collector_messages.from_user_id')
        .orderBy('collector_messages.created_at', 'asc')
        .where('to_user_id', '=', id)
        .andWhere('from_user_id', '=', fromUser)
        .orWhere('from_user_id', '=', id)
        .andWhere('to_user_id', '=', fromUser);

    console.log(collectorsMessages);

    var messageGiven = 1;

    res.render('messages', { 
        title: `Squishmallows Trading | Messages`,
        message: 'Message has been sent',
        messageClass: 'alert-success',
        collector: collectorData,
        id,
        fromUser,
        messageGiven,
        messages: collectorsMessages
    }
)  
return;
});


module.exports = router;

