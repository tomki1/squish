const express = require('express');
const knex = require('../connection')
const router = express.Router();
const { ensureLoggedIn } = require('../auth/middleware')

const AmountPerPage = 50;


/* router.get(['/has1',], ensureLoggedIn, async (req, res, next) => {
    const userId = req.signedCookies.user_id
    const page = req.query.page;


    const collectorData = await knex('collector')
        .select('username', 'email', 'collector_id', 'is_admin')
        .where('collector_id', userId );

    // user's has collectibles if has_quantity is greater than 0
    const collectionsHas = await knex('collection')
        .select(['collectible_type.name as typeName', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
        .select(knex.raw("to_char(collection.created_at, 'YYYY-MM-DD') as created_at")) 
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at_database")) 
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
        .where('collector_id', userId )
        .andWhere('collection.has_quantity', '>', 0)
        .paginate({
            perPage: AmountPerPage,
            currentPage: page
            });     

    res.render('has1', { 
        title: "Has1",
        collector: collectorData,
        collector_id: req.signedCookies.user_id,
        collectionHas: collectionsHas.data,
    });
}); */


router.get(['/list', '/list/:filter'], ensureLoggedIn, async (req, res, next) => {
    const userId = req.signedCookies.user_id
/*     let filterTypes = req.query.filter
    if (typeof filterTypes === 'string' || filterTypes instanceof String) {
        filterTypes = [filterTypes]
    } */
    const page1 = req.query.page1;
    const page2 = req.query.page2;
    const page3 = req.query.page3;



    // grab unread messages
    const unreadMessages = await knex('collector_messages')
    .select('collector_messages.read','collector_messages.created_at', 'collector_messages.message', 'collector_messages.from_user_id', 'collector.collector_id', 'collector.username')    
    .join('collector', 'collector.collector_id', 'collector_messages.from_user_id')
    .orderBy('collector.collector_id')
    .orderBy('collector_messages.created_at', 'desc')
    .distinctOn('collector.collector_id')
    .whereNot('collector.collector_id', userId)
    .where('from_user_id', '=', userId)
    .orWhere('to_user_id', '=', userId)
    .whereNull('collector_messages.read')

    var unreadNumber = unreadMessages.length;



    if (unreadMessages.length > 0) {
    var unread = 1;
    }    

    // get user's ratings by star count
    const rating1 = await knex('collector_ratings')
        .select('rating')
        .where('to_user_id', '=', userId)
        .andWhere('rating', '=', '1');
    const rating2 = await knex('collector_ratings')
        .select('rating')
        .where('to_user_id', '=', userId)
        .andWhere('rating', '=', '2');
    const rating3 = await knex('collector_ratings')
        .select('rating')
        .where('to_user_id', '=', userId)
        .andWhere('rating', '=', '3');
    const rating4 = await knex('collector_ratings')
        .select('rating')
        .where('to_user_id', '=', userId)
        .andWhere('rating', '=', '4');
    const rating5 = await knex('collector_ratings')
        .select('rating')
        .where('to_user_id', '=', userId)
        .andWhere('rating', '=', '5');

    var starCount = 0;
    var totalRatings = 0;
    var averageStars = 0;

    //formula for stars
    starCount = (1*rating1.length) + (2*rating2.length) + (3*rating3.length) + (4*rating4.length) + (5*rating5.length);
    totalRatings = rating1.length + rating2.length + rating3.length + rating4.length + rating5.length;
    averageStars = starCount/totalRatings;

    //show star rating on profile
    if (averageStars >= '0' && averageStars < '0.25') {
        var zeroStar = 1;
    }
    else if (averageStars >= '0.25' && averageStars < '0.75') {
        var halfStar = 1;
    }
    else if (averageStars >= '0.75' && averageStars < '1.25') {
        var oneStar = 1;
    }
    else if (averageStars >= '1.25' && averageStars < '1.75') {
        var oneHalfStar = 1;
    }
    else if (averageStars >= '1.75' && averageStars < '2.25') {
        var twoStar = 1;
    }
    else if (averageStars >= '2.25' && averageStars < '2.75') {
        var twoHalfStar = 1;
    }
    else if (averageStars >= '2.75' && averageStars < '3.25') {
        var threeStar = 1;
    }
    else if (averageStars >= '3.25' && averageStars < '3.75') {
        var threeHalfStar = 1;
    }
    else if (averageStars >= '3.75' && averageStars < '4.25') {
        var fourStar = 1;
    }
    else if (averageStars >= '4.25' && averageStars < '4.75') {
        var fourHalfStar = 1;
    }
    else if (averageStars >= '4.75' && averageStars <= '5') {
        var fiveStar = 1;
    }
    else {
        var noRating = 1;
    }

    // see if user wants to show their has/wants/trades
    const wantsPublic = await knex('collector')
        .select('wants_public')
        .where('wants_public', 'true')
        .where('collector_id', userId );

    const hasPublic = await knex('collector')
        .select('has_public')
        .where('has_public', 'true')
        .where('collector_id', userId );

    const tradesPublic = await knex('collector')
        .select('trades_public')
        .where('trades_public', 'true')
        .where('collector_id', userId );

    var showWantsPublic = null;
    var showHasPublic = null;
    var showTradesPublic = null;

    if (wantsPublic.length > 0) {
        showWantsPublic = 1;
    }

    if (hasPublic.length > 0) {
        showHasPublic = 1;
    }

    if (tradesPublic.length > 0) {
        showTradesPublic = 1;
    }

    const collectorData = await knex('collector')
        .select('username', 'email', 'collector_id', 'is_admin')
        .where('collector_id', userId );

    // user's has collectibles if has_quantity is greater than 0
    const collectionsHas = await knex('collection')
        .select(['collectible_type.name as typeName', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
        .select(knex.raw("to_char(collection.created_at, 'YYYY-MM-DD') as created_at")) 
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at_database")) 
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
        .where('collector_id', userId )
        .andWhere('collection.has_quantity', '>', 0)
        .paginate({
            perPage: AmountPerPage,
            currentPage: page1
            });    


    const collectionsHasLength = await knex('collection')
        .select(['collectible_type.name as typeName', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
        .select(knex.raw("to_char(collection.created_at, 'YYYY-MM-DD') as created_at")) 
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at_database")) 
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
        .where('collector_id', userId )
        .andWhere('collection.has_quantity', '>', 0)


    // user's wants collectibles if has_quantity is greater than 0
    const collectionsWants = await knex('collection')
        .select(['collectible_type.name as typeName', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
        .select(knex.raw("to_char(collection.created_at, 'YYYY-MM-DD') as created_at")) 
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at_database")) 
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
        .where('collector_id', userId )
        .andWhere('collection.wants_quantity', '>', 0)
        .paginate({
            perPage: AmountPerPage,
            currentPage: page2
            });    


    const collectionsWantsLength = await knex('collection')
        .select(['collectible_type.name as typeName', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
        .select(knex.raw("to_char(collection.created_at, 'YYYY-MM-DD') as created_at")) 
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at_database")) 
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
        .where('collector_id', userId )
        .andWhere('collection.wants_quantity', '>', 0)
    
        // user's willing to trade collectibles if willing_to_trade_quantity is greater than 0
    const collectionsWillingToTrade = await knex('collection')
        .select(['collectible_type.name as typeName', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
        .select(knex.raw("to_char(collection.created_at, 'YYYY-MM-DD') as created_at")) 
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at_database")) 
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
        .where('collector_id', userId )
        .andWhere('collection.willing_to_trade_quantity', '>', 0)
        .paginate({
            perPage: AmountPerPage,
            currentPage: page3
            });    
    const collectionsWillingToTradeLength = await knex('collection')
        .select(['collectible_type.name as typeName', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
        .select(knex.raw("to_char(collection.created_at, 'YYYY-MM-DD') as created_at")) 
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at_database")) 
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
        .where('collector_id', userId )
        .andWhere('collection.willing_to_trade_quantity', '>', 0)


    const userWants = await knex('collection')
        .select(['collectible_id'])
        .where('collector_id', '=', userId)
        .andWhere('wants_quantity', '>', 0)

    const userWantsCollectibleIds = []
    userWants.forEach((row) => userWantsCollectibleIds.push(row.collectible_id))

    const matches = await knex('collection')
        .select(['collectible_type.name as typeName', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collection.collector_id', 'collector.username','collection.collectible_id', 'collectible.name', 'collection.willing_to_trade_quantity'])
        .join('collectible', 'collection.collectible_id', 'collectible.collectible_id')
        .join('collector', 'collection.collector_id', 'collector.collector_id')
        .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
        .where('collector.collector_id', '!=', userId)
        .andWhere('collector.trades_public', '=', 'true')
        .whereIn('collection.collectible_id', userWantsCollectibleIds)
        .andWhere('collection.willing_to_trade_quantity', '>', 0)

    var showHasButton = null;
    var showWantsButton = null;
    var showTradeButton = null;
    var noMatches = null;


    var pageCountHas = Math.ceil(collectionsHasLength.length/AmountPerPage);

    var pageCountWants = Math.ceil(collectionsWantsLength.length/AmountPerPage);

    var pageCountTrade = Math.ceil(collectionsWillingToTradeLength.length/AmountPerPage);


    console.log(pageCountHas);
    console.log(pageCountWants);
    console.log(pageCountTrade);

    // if results, render collectibles
    if (collectionsHas.data.length > 0) {
        showHasButton = 1;
    }

    // if results, render collectibles
    if (collectionsWants.data.length > 0) {
        showWantsButton = 1;
    }

    // if results, render collectibles
    if (collectionsWillingToTrade.data.length > 0) {
        showTradeButton = 1;
    }

    if (matches.length < 1) {
        noMatches = 1;
    }

    const collectiblesLength = await knex('collectible')
    .select('collectible.collectible_id');

    var hasTotal = collectionsHasLength.length;
    var collectiblesTotal = collectiblesLength.length;

    res.render('profilelist', { 
        title: "Squishmallows Trading | Profile",
        collector: collectorData,
        collector_id: req.signedCookies.user_id,
        collectionHas: collectionsHas.data,
        collectionWants: collectionsWants.data,
        collectionWillingToTrade: collectionsWillingToTrade.data,
        showHasButton,
        showWantsButton,
        showTradeButton,
        matches,
        noMatches,
        showHasPublic,
        showWantsPublic,
        showTradesPublic,
        zeroStar,
        halfStar,
        oneStar,
        oneHalfStar,
        twoStar,
        twoHalfStar,
        threeStar,
        threeHalfStar,
        fourStar,
        fourHalfStar,
        fiveStar,
        noRating,
        unread,
        unreadNumber,
        pageCountHas,
        pageCountWants,
        pageCountTrade,
        hasTotal,
        collectiblesTotal
    });
});

router.get(['/', '/:filter'], ensureLoggedIn, async (req, res, next) => {
    const userId = req.signedCookies.user_id
    const page1 = req.query.page1;
    const page2 = req.query.page2;
    const page3 = req.query.page3;
/*     let filterTypes = req.query.filter
    if (typeof filterTypes === 'string' || filterTypes instanceof String) {
        filterTypes = [filterTypes]
    }

 */
    // grab unread messages
    const unreadMessages = await knex('collector_messages')
    .select('collector_messages.read','collector_messages.created_at', 'collector_messages.message', 'collector_messages.from_user_id', 'collector.collector_id', 'collector.username')    
    .join('collector', 'collector.collector_id', 'collector_messages.from_user_id')
    .orderBy('collector.collector_id')
    .orderBy('collector_messages.created_at', 'desc')
    .distinctOn('collector.collector_id')
    .whereNot('collector.collector_id', userId)
    .where('from_user_id', '=', userId)
    .orWhere('to_user_id', '=', userId)
    .whereNull('collector_messages.read')

    var unreadNumber = unreadMessages.length;

    if (unreadMessages.length > 0) {
    var unread = 1;
        }    


    // get user's ratings by star count
    const rating1 = await knex('collector_ratings')
        .select('rating')
        .where('to_user_id', '=', userId)
        .andWhere('rating', '=', '1');
    const rating2 = await knex('collector_ratings')
        .select('rating')
        .where('to_user_id', '=', userId)
        .andWhere('rating', '=', '2');
    const rating3 = await knex('collector_ratings')
        .select('rating')
        .where('to_user_id', '=', userId)
        .andWhere('rating', '=', '3');
    const rating4 = await knex('collector_ratings')
        .select('rating')
        .where('to_user_id', '=', userId)
        .andWhere('rating', '=', '4');
    const rating5 = await knex('collector_ratings')
        .select('rating')
        .where('to_user_id', '=', userId)
        .andWhere('rating', '=', '5');

    var starCount = 0;
    var totalRatings = 0;
    var averageStars = 0;

    starCount = (1*rating1.length) + (2*rating2.length) + (3*rating3.length) + (4*rating4.length) + (5*rating5.length);
    totalRatings = rating1.length + rating2.length + rating3.length + rating4.length + rating5.length;
    averageStars = starCount/totalRatings;

    if (averageStars >= '0' && averageStars < '0.25') {
        var zeroStar = 1;
    }
    else if (averageStars >= '0.25' && averageStars < '0.75') {
        var halfStar = 1;
    }
    else if (averageStars >= '0.75' && averageStars < '1.25') {
        var oneStar = 1;
    }
    else if (averageStars >= '1.25' && averageStars < '1.75') {
        var oneHalfStar = 1;
    }
    else if (averageStars >= '1.75' && averageStars < '2.25') {
        var twoStar = 1;
    }
    else if (averageStars >= '2.25' && averageStars < '2.75') {
        var twoHalfStar = 1;
    }
    else if (averageStars >= '2.75' && averageStars < '3.25') {
        var threeStar = 1;
    }
    else if (averageStars >= '3.25' && averageStars < '3.75') {
        var threeHalfStar = 1;
    }
    else if (averageStars >= '3.75' && averageStars < '4.25') {
        var fourStar = 1;
    }
    else if (averageStars >= '4.25' && averageStars < '4.75') {
        var fourHalfStar = 1;
    }
    else if (averageStars >= '4.75' && averageStars <= '5') {
        var fiveStar = 1;
    }
    else {
        var noRating = 1;
    }

    // see if user wants to show their has/wants/trades
    const wantsPublic = await knex('collector')
        .select('wants_public')
        .where('wants_public', 'true')
        .where('collector_id', userId );

    const hasPublic = await knex('collector')
        .select('has_public')
        .where('has_public', 'true')
        .where('collector_id', userId );

    const tradesPublic = await knex('collector')
        .select('trades_public')
        .where('trades_public', 'true')
        .where('collector_id', userId );

    var showWantsPublic = null;
    var showHasPublic = null;
    var showTradesPublic = null;

    if (wantsPublic.length > 0) {
        showWantsPublic = 1;
    }

    if (hasPublic.length > 0) {
        showHasPublic = 1;
    }

    if (tradesPublic.length > 0) {
        showTradesPublic = 1;
    }

    const collectorData = await knex('collector')
        .select('username', 'email', 'collector_id', 'is_admin')
        .where('collector_id', userId );

    // user's has collectibles if has_quantity is greater than 0
    const collectionsHas = await knex('collection')
        .select(['collectible_type.name as typeName', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
        .select(knex.raw("to_char(collection.created_at, 'YYYY-MM-DD') as created_at")) 
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at_database")) 
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
        .where('collector_id', userId )
/*         .modify((builder) => {
            if (filterTypes && filterTypes.length) {
                builder.whereIn('collectible_type.name', filterTypes)
            }
        }) */
        .andWhere('collection.has_quantity', '>', 0)
        .paginate({
            perPage: AmountPerPage,
            currentPage: page1
            });  


    const collectionsHasLength = await knex('collection')
        .select(['collectible_type.name as typeName', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
        .select(knex.raw("to_char(collection.created_at, 'YYYY-MM-DD') as created_at")) 
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at_database")) 
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
        .where('collector_id', userId )
/*         .modify((builder) => {
            if (filterTypes && filterTypes.length) {
                builder.whereIn('collectible_type.name', filterTypes)
            }
        }) */
            .andWhere('collection.has_quantity', '>', 0)

    // user's wants collectibles if has_quantity is greater than 0
    const collectionsWants = await knex('collection')
        .select(['collectible_type.name as typeName', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
        .select(knex.raw("to_char(collection.created_at, 'YYYY-MM-DD') as created_at"))   
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at_database")) 
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
        .where('collector_id', userId )
/*         .modify((builder) => {
            if (filterTypes && filterTypes.length) {
                builder.whereIn('collectible_type.name', filterTypes)
            }
        }) */
        .andWhere('collection.wants_quantity', '>', 0)
        .paginate({
            perPage: AmountPerPage,
            currentPage: page2
            });  

                // user's wants collectibles if has_quantity is greater than 0
    const collectionsWantsLength = await knex('collection')
    .select(['collectible_type.name as typeName', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
    .select(knex.raw("to_char(collection.created_at, 'YYYY-MM-DD') as created_at"))   
    .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at_database")) 
    .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
    .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
    .where('collector_id', userId )
/*         .modify((builder) => {
        if (filterTypes && filterTypes.length) {
            builder.whereIn('collectible_type.name', filterTypes)
        }
    }) */
    .andWhere('collection.wants_quantity', '>', 0)

    // user's willing to trade collectibles if willing_to_trade_quantity is greater than 0
    const collectionsWillingToTrade = await knex('collection')
        .select(['collectible_type.name as typeName', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
        .select(knex.raw("to_char(collection.created_at, 'YYYY-MM-DD') as created_at")) 
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at_database")) 
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
        .where('collector_id', userId )
/*         .modify((builder) => {
            if (filterTypes && filterTypes.length) {
                builder.whereIn('collectible_type.name', filterTypes)
            }
        }) */
        .andWhere('collection.willing_to_trade_quantity', '>', 0)
        .paginate({
            perPage: AmountPerPage,
            currentPage: page3
            });  


                // user's willing to trade collectibles if willing_to_trade_quantity is greater than 0
    const collectionsWillingToTradeLength = await knex('collection')
    .select(['collectible_type.name as typeName', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
    .select(knex.raw("to_char(collection.created_at, 'YYYY-MM-DD') as created_at")) 
    .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at_database")) 
    .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
    .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
    .where('collector_id', userId )
/*         .modify((builder) => {
        if (filterTypes && filterTypes.length) {
            builder.whereIn('collectible_type.name', filterTypes)
        }
    }) */
    .andWhere('collection.willing_to_trade_quantity', '>', 0)

    const userWants = await knex('collection')
        .select(['collectible_id'])
        .where('collector_id', '=', userId)
        .andWhere('wants_quantity', '>', 0)

    const userWantsCollectibleIds = []
    userWants.forEach((row) => userWantsCollectibleIds.push(row.collectible_id))

    const matches = await knex('collection')
        .select(['collectible_type.name as typeName', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collection.collector_id', 'collector.username','collection.collectible_id', 'collectible.name', 'collection.willing_to_trade_quantity'])
        .join('collectible', 'collection.collectible_id', 'collectible.collectible_id')
        .join('collector', 'collection.collector_id', 'collector.collector_id')
        .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
        .where('collector.collector_id', '!=', userId)
        .andWhere('collector.trades_public', '=', 'true')
        .whereIn('collection.collectible_id', userWantsCollectibleIds)
/*         .modify((builder) => {
            if (filterTypes && filterTypes.length) {
                builder.whereIn('collectible_type.name', filterTypes)
            }
        }) */
        .andWhere('collection.willing_to_trade_quantity', '>', 0)

    var showHasButton = null;
    var showWantsButton = null;
    var showTradeButton = null;
    var noMatches = null;

    // if results, render collectibles
    if (collectionsHas.data.length > 0) {
        showHasButton = 1;
    }

    // if results, render collectibles
    if (collectionsWants.data.length > 0) {
        showWantsButton = 1;
    }

    // if results, render collectibles
    if (collectionsWillingToTrade.data.length > 0) {
        showTradeButton = 1;
    }

    if (matches.length < 1) {
        noMatches = 1;
    }


    var pageCountHas = Math.ceil(collectionsHasLength.length/AmountPerPage);

    var pageCountWants = Math.ceil(collectionsWantsLength.length/AmountPerPage);

    var pageCountTrade = Math.ceil(collectionsWillingToTradeLength.length/AmountPerPage);


    console.log(pageCountHas);
    console.log(pageCountWants);
    console.log(pageCountTrade);


    const collectiblesLength = await knex('collectible')
    .select('collectible.collectible_id');

    var hasTotal = collectionsHasLength.length;
    var collectiblesTotal = collectiblesLength.length;


    res.render('profile', { 
        title: "Squishmallows Trading | Profile",
        collector: collectorData,
        collector_id: req.signedCookies.user_id,
        collectionHas: collectionsHas.data,
        collectionWants: collectionsWants.data,
        collectionWillingToTrade: collectionsWillingToTrade.data,
        showHasButton,
        showWantsButton,
        showTradeButton,
        matches,
        noMatches,
        showHasPublic,
        showWantsPublic,
        showTradesPublic,
        zeroStar,
        halfStar,
        oneStar,
        oneHalfStar,
        twoStar,
        twoHalfStar,
        threeStar,
        threeHalfStar,
        fourStar,
        fourHalfStar,
        fiveStar,
        noRating,
        unread,
        unreadNumber,
        pageCountHas,
        pageCountWants,
        pageCountTrade,
        hasTotal,
        collectiblesTotal
    });
});


/* 
router.get(['/has1', '/has1/:filter'], ensureLoggedIn, async (req, res, next) => {
    const userId = req.signedCookies.user_id



    const page = req.query.page;
    const collectorData = await knex('collector')
        .select('username', 'email', 'collector_id', 'is_admin')
        .where('collector_id', userId );

    // user's has collectibles if has_quantity is greater than 0
    const collectionsHas = await knex('collection')
        .select(['collectible_type.name as typeName', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
        .select(knex.raw("to_char(collection.created_at, 'YYYY-MM-DD') as created_at")) 
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at_database")) 
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
        .where('collector_id', userId )
        .andWhere('collection.has_quantity', '>', 0)
        .paginate({
            perPage: 20,
            currentPage: page
            });

    
    res.render('has1', { 
        title: "Squishmallows Trading | Has",
        collector: collectorData,
        collector_id: req.signedCookies.user_id,
        collectionHas: collectionsHas,
    });

}); */

router.post('/publictoggle', async (req, res, next) => { 
    const userId = req.signedCookies.user_id;   
    const selectedHas = req.body.has_public;
    const selectedWants = req.body.wants_public;
    const selectedTrades = req.body.trades_public;
    await knex('collector')
        .where({ collector_id: userId })
        .update({ has_public: selectedHas })
        .update({ wants_public: selectedWants })
        .update({ trades_public: selectedTrades });

    res.redirect(`/profile`);
});

router.post('/publictogglelist', async (req, res, next) => { 
    const userId = req.signedCookies.user_id;   
    const selectedHas = req.body.has_public;
    const selectedWants = req.body.wants_public;
    const selectedTrades = req.body.trades_public;

    await knex('collector')
        .where({ collector_id: userId })
        .update({ has_public: selectedHas })
        .update({ wants_public: selectedWants })
        .update({ trades_public: selectedTrades });

    res.redirect(`/profile/list`);
});


router.post('/has', async (req, res, next) => { 
    const userId = req.signedCookies.user_id;   
    const q1 = req.body.has_quantity;
    const q2 = req.body.wants_quantity;
    const q3 = req.body.willing_to_trade_quantity;
    const collectible_id1 = req.body.collectible_id;
    const list = req.body.list;
    
    if (q1 != null) {
        var i;
        // for each collectible on the page
        for (i = 0; i < q1.length; i++) {

        const collectibles = await knex('collectible')
        .select('collectible.collectible_id')
        .where({ collectible_id: collectible_id1[i] });
    
        if (collectibles.length == 0) {
            res.redirect('/');
            return;
        }

         // select collectible and collector id pair if the old database value is the same as the new inputted database value
         const collectiblesCheck1 = await knex('collection')
         .select('collectible.collectible_id')
         .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
         .where({ collector_id: userId })
         .andWhere( 'collectible.collectible_id', collectible_id1[i] )
         .andWhere( 'has_quantity','=', q1[i] )
         .andWhere( 'wants_quantity','=', q2[i] )
         .andWhere( 'willing_to_trade_quantity','=', q3[i] );
 
  
        // if there is no collectible user_id pair with the values inputted, update that row with the new values
        if (collectiblesCheck1.length == 0) {

            // update row
            await knex('collection')
            .where({ collector_id: userId })
            .andWhere({ collectible_id: collectible_id1[i] })
            .update({ has_quantity: q1[i] })
            .update({ wants_quantity: q2[i] })
            .update({ willing_to_trade_quantity: q3[i] });

            // if has/wants/for trade quantity has been updated to zero, delete entry
            if (q1[i]  == 0 && q2[i]  == 0 && q3[i]  == 0) {
                await knex('collection')
                .where({ collector_id: userId })
                .andWhere( {collectible_id: collectible_id1[i] })
                .del();
                }
            }
        }
    }

if (list == '1') {
    res.redirect('/profile/list');   
}
else {
    res.redirect('/profile');
}
});

router.post('/wants', async (req, res, next) => { 
    const userId = req.signedCookies.user_id;   
    const q1 = req.body.has_quantity;
    const q2 = req.body.wants_quantity;
    const q3 = req.body.willing_to_trade_quantity;
    const collectible_id1 = req.body.collectible_id;
    const list = req.body.list;
    if (q1 != null) {
        var i;
        // for each collectible on the page
        for (i = 0; i < q1.length; i++) {

        const collectibles = await knex('collectible')
        .select('collectible.collectible_id')
        .where({ collectible_id: collectible_id1[i] });
    
        if (collectibles.length == 0) {
            res.redirect('/');
            return;
        }
 
        
        // select collectible and collector id pair if the old database value is the same as the new inputted database value
        const collectiblesCheck1 = await knex('collection')
        .select('collectible.collectible_id')
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .where({ collector_id: userId })
        .andWhere( 'collectible.collectible_id', collectible_id1[i] )
        .andWhere( 'has_quantity','=', q1[i] )
        .andWhere( 'wants_quantity','=', q2[i] )
        .andWhere( 'willing_to_trade_quantity','=', q3[i] );


        // if there is no collectible user_id pair with the values inputted, update that row with the new values
        if (collectiblesCheck1.length == 0) {
            // update row
            await knex('collection')
            .where({ collector_id: userId })
            .andWhere({ collectible_id: collectible_id1[i] })
            .update({ has_quantity: q1[i] })
            .update({ wants_quantity: q2[i] })
            .update({ willing_to_trade_quantity: q3[i] });

            // if has/wants/for trade quantity has been updated to zero, delete entry
            if (q1[i]  == 0 && q2[i]  == 0 && q3[i]  == 0) {
                await knex('collection')
                .where({ collector_id: userId })
                .andWhere( {collectible_id: collectible_id1[i] })
                .del();
                }
            }
        }
    }
    if (list == '1') {
        res.redirect('/profile/list');   
    }
    else {
        res.redirect('/profile');
    }
    });

router.post('/trades', async (req, res, next) => { 
    const userId = req.signedCookies.user_id;   
    const q1 = req.body.has_quantity;
    const q2 = req.body.wants_quantity;
    const q3 = req.body.willing_to_trade_quantity;
    const collectible_id1 = req.body.collectible_id;
    const list = req.body.list;
    
    if (q1 != null) {
        var i;
        // for each collectible on the page
        for (i = 0; i < q1.length; i++) {
        
            const collectibles = await knex('collectible')
            .select('collectible.collectible_id')
            .where({ collectible_id: collectible_id1[i] });
        
            if (collectibles.length == 0) {
                res.redirect('/');
                return;
            }

        // select collectible and collector id pair if the old database value is the same as the new inputted database value
         const collectiblesCheck1 = await knex('collection')
         .select('collectible.collectible_id')
         .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
         .where({ collector_id: userId })
         .andWhere( 'collectible.collectible_id', collectible_id1[i] )
         .andWhere( 'has_quantity','=', q1[i] )
         .andWhere( 'wants_quantity','=', q2[i] )
         .andWhere( 'willing_to_trade_quantity','=', q3[i] );
 
  
        // if there is no collectible user_id pair with the values inputted, update that row with the new values
        if (collectiblesCheck1.length == 0) {
            // update row
            await knex('collection')
            .where({ collector_id: userId })
            .andWhere({ collectible_id: collectible_id1[i] })
            .update({ has_quantity: q1[i] })
            .update({ wants_quantity: q2[i] })
            .update({ willing_to_trade_quantity: q3[i] });

            // if has/wants/for trade quantity has been updated to zero, delete entry
            if (q1[i]  == 0 && q2[i]  == 0 && q3[i]  == 0) {
                await knex('collection')
                .where({ collector_id: userId })
                .andWhere( {collectible_id: collectible_id1[i] })
                .del();
                }
            }
        }
    }

    if (list == '1') {
        res.redirect('/profile/list');   
    }
    else {
        res.redirect('/profile');
    }
    });

module.exports = router;
