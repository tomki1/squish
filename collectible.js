const express = require('express');
const FileType = require('file-type');
const knex = require('../connection');
const Collection = require('../models/collection')
const router = express.Router();


const AmountPerPage = 50;

/** 
// search for collectible
router.get('/search', async (req, res, next) => {
    const userId = req.signedCookies.user_id;
    const { name } = req.query;
    var isLoggedIn;
    var search = 1;

 

    const page = req.query.page;




    const collectibles = await knex('collectible')
        .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
        .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))       
        .where('collectible.name', 'ilike', `%${name}%`)



    // if results, render collectibles
    if (collectibles.length > 0) { 
        // if user is not logged in, render all collectibles in database
        if (userId == null) {


            const collectibles1 = await knex('collectible')
            .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
            .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))       
            .where('collectible.name', 'ilike', `%${name}%`)
            .paginate({
                perPage: AmountPerPage,
                currentPage: page
                }); 

            
            var pages = Math.ceil(collectibles.length/AmountPerPage);

            console.log(pages);
            res.render('collectible', {
                title: "Squishmallows Trading | Search Results",
                collectible: collectibles1.data,
                collector_id: req.signedCookies.user_id,
                isLoggedIn,
                search,
                name,
                pages
            });       
        }

        // else if user is logged in render collectibles with update collection functionality
        // collectible table is rendered in two categories, collectibles where there is a collectible_id and collector_id row,
      //  and collectibles where there is no row because we need to render user's quantity counts for rows that exist, and 0's
      //  where rows don't exist 
    
        else {
            isLoggedIn = 1;
            // rows that have collectible_id and userId as foreign keys
            const collectiblesRow = await knex('collection')
            .select(['collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))            
            .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
            .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
            .where('collector_id', userId )
            .andWhere('collection.has_quantity', '>=', 0)
            .andWhere('collectible.name', 'ilike', `%${name}%`)
            .paginate({
                perPage: AmountPerPage,
                currentPage: page
                });   
                
            // rows that have collectible_id and userId as foreign keys
            const collectiblesRow2 = await knex('collection')
            .select(['collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))            
            .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
            .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
            .where('collector_id', userId )
            .andWhere('collection.has_quantity', '>=', 0)
            .andWhere('collectible.name', 'ilike', `%${name}%`)

            // push collectible_ids that have collectible_id and userId as foreign keys to array
            const userCollectionRowExists = []
            collectiblesRow2.forEach((row) => userCollectionRowExists.push(row.collectible_id))

            // collectibles that don't have collectible_id and userId as foreign keys
            const collectiblesNoRow = await knex('collectible')
            .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
            .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description','collectible.image', 'collectible.collectible_type_id')
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))           
            .whereNotIn('collectible_id', userCollectionRowExists)
            .andWhere('collectible.name', 'ilike', `%${name}%`)
            .paginate({
                perPage: AmountPerPage,
                currentPage: page
                });   

                const collectiblesNoRowLength = await knex('collectible')
                .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
                .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
                .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))           
                .whereNotIn('collectible_id', userCollectionRowExists)
                .andWhere('collectible.name', 'ilike', `%${name}%`)



            var pages = Math.ceil(Math.max((collectiblesRow2.length/AmountPerPage),(collectiblesNoRowLength.length/AmountPerPage)))
            


            res.render('collectible', {
                title: "Squishmallows Trading | Search Results",
                collector_id: req.signedCookies.user_id,
                collectibleRow: collectiblesRow.data,
                collectibleNoRow: collectiblesNoRow.data,
                isLoggedIn,
                search,
                name,
                pages
            });
        }       
    }
    // if no results, inform user
    else { 
        res.render('collectible', { 
                title: "Squishmallows Trading | Search Results",
                message: `No results matching your search term "${name}"`,
                messageClass: 'alert-info',
                search,
                name
            }
        )
        return;
    }   
});


// search for collectible
router.get('/search-year', async (req, res, next) => {
    const userId = req.signedCookies.user_id;
    const { name } = req.query;
    var isLoggedIn;
    var search = 1;

    const page = req.query.page;


    const collectibles = await knex('collectible')
        .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
        .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))       
        .where('collectible.year_released', 'ilike', `%${name}%`);

    // if results, render collectibles
    if (collectibles.length > 0) { 
        // if user is not logged in, render all collectibles in database
        if (userId == null) {
            const collectibles1 = await knex('collectible')
            .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
            .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))       
            .where('collectible.year_released', 'ilike', `%${name}%`)
            .paginate({
                perPage: AmountPerPage,
                currentPage: page
                });


            var pages = Math.ceil(collectibles.length/AmountPerPage);

            res.render('collectible', {
                title: "Squishmallows Trading | Search Results",
                collectible: collectibles1.data,
                collector_id: req.signedCookies.user_id,
                isLoggedIn,
                search,
                name,
                pages
            });       
        }

        // else if user is logged in render collectibles with update collection functionality
        // collectible table is rendered in two categories, collectibles where there is a collectible_id and collector_id row,
     //   and collectibles where there is no row because we need to render user's quantity counts for rows that exist, and 0's
     //   where rows don't exist 
  
        else {
            isLoggedIn = 1;
            // rows that have collectible_id and userId as foreign keys
            const collectiblesRow = await knex('collection')
            .select(['collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))            
            .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
            .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
            .where('collector_id', userId )
            .andWhere('collection.has_quantity', '>=', 0)
            .andWhere('collectible.year_released', 'ilike', `%${name}%`)
            .paginate({
                perPage: AmountPerPage,
                currentPage: page
                });

            // rows that have collectible_id and userId as foreign keys
            const collectiblesRow2 = await knex('collection')
            .select(['collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))            
            .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
            .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
            .where('collector_id', userId )
            .andWhere('collection.has_quantity', '>=', 0)
            .andWhere('collectible.year_released', 'ilike', `%${name}%`);


            // push collectible_ids that have collectible_id and userId as foreign keys to array
            const userCollectionRowExists = []
            collectiblesRow2.forEach((row) => userCollectionRowExists.push(row.collectible_id))

            // collectibles that don't have collectible_id and userId as foreign keys
            const collectiblesNoRow = await knex('collectible')
            .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
            .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))           
            .whereNotIn('collectible_id', userCollectionRowExists)
            .andWhere('collectible.year_released', 'ilike', `%${name}%`)
            .paginate({
                perPage: AmountPerPage,
                currentPage: page
                });

            const collectiblesNoRowLength = await knex('collectible')
            .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
            .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))           
            .whereNotIn('collectible_id', userCollectionRowExists)
            .andWhere('collectible.year_released', 'ilike', `%${name}%`)

            var pages = Math.ceil(Math.max((collectiblesRow2.length/AmountPerPage),(collectiblesNoRowLength.length/AmountPerPage)))


            res.render('collectible', {
                title: "Squishmallows Trading | Search Results",
                collector_id: req.signedCookies.user_id,
                collectibleRow: collectiblesRow.data,
                collectibleNoRow: collectiblesNoRow.data,
                isLoggedIn,
                search,
                name,
                pages
            });
        }       
    }
    // if no results, inform user
    else { 
        res.render('collectible', { 
                title: "Squishmallows Trading | Search Results",
                message: `No results matching your search term "${name}"`,
                messageClass: 'alert-info',
                search,
                name
            }
        )
        return;
    }   
});

// search for collectible
router.get('/search-squad', async (req, res, next) => {
    const userId = req.signedCookies.user_id;
    const { name } = req.query;
    var isLoggedIn;
    var search = 1;

    const page = req.query.page;

    const collectibles = await knex('collectible')
        .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
        .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))       
        .where('collectible.squad', 'ilike', `%${name}%`);

    // if results, render collectibles
    if (collectibles.length > 0) { 
        // if user is not logged in, render all collectibles in database
        if (userId == null) {

            const collectibles1 = await knex('collectible')
            .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
            .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))       
            .where('collectible.squad', 'ilike', `%${name}%`)
            .paginate({
                perPage: AmountPerPage,
                currentPage: page
                });

            var pages = Math.ceil(collectibles.length/AmountPerPage);


            res.render('collectible', {
                title: "Squishmallows Trading | Search Results",
                collectible: collectibles1.data,
                collector_id: req.signedCookies.user_id,
                isLoggedIn,
                search,
                name,
                pages
            });       
        }

        // else if user is logged in render collectibles with update collection functionality
        // collectible table is rendered in two categories, collectibles where there is a collectible_id and collector_id row,
   //     and collectibles where there is no row because we need to render user's quantity counts for rows that exist, and 0's
   //     where rows don't exist 
   
        else {
            isLoggedIn = 1;
            // rows that have collectible_id and userId as foreign keys
            const collectiblesRow = await knex('collection')
            .select(['collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))            
            .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
            .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
            .where('collector_id', userId )
            .andWhere('collection.has_quantity', '>=', 0)
            .andWhere('collectible.squad', 'ilike', `%${name}%`)
            .paginate({
                perPage: AmountPerPage,
                currentPage: page
                });

            const collectiblesRow2 = await knex('collection')
            .select(['collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))            
            .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
            .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
            .where('collector_id', userId )
            .andWhere('collection.has_quantity', '>=', 0)
            .andWhere('collectible.squad', 'ilike', `%${name}%`);

            // push collectible_ids that have collectible_id and userId as foreign keys to array
            const userCollectionRowExists = []
            collectiblesRow2.forEach((row) => userCollectionRowExists.push(row.collectible_id))

            // collectibles that don't have collectible_id and userId as foreign keys
            const collectiblesNoRow = await knex('collectible')
            .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
            .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))           
            .whereNotIn('collectible_id', userCollectionRowExists)
            .andWhere('collectible.squad', 'ilike', `%${name}%`)
            .paginate({
                perPage: AmountPerPage,
                currentPage: page
                });

            const collectiblesNoRowLength = await knex('collectible')
            .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
            .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))           
            .whereNotIn('collectible_id', userCollectionRowExists)
            .andWhere('collectible.squad', 'ilike', `%${name}%`)

            var pages = Math.ceil(Math.max((collectiblesRow2.length/AmountPerPage),(collectiblesNoRowLength.length/AmountPerPage)))

            res.render('collectible', {
                title: "Squishmallows Trading | Search Results",
                collector_id: req.signedCookies.user_id,
                collectibleRow: collectiblesRow.data,
                collectibleNoRow: collectiblesNoRow.data,
                isLoggedIn,
                search,
                name,
                pages
            });
        }       
    }
    // if no results, inform user
    else { 
        res.render('collectible', { 
                title: "Squishmallows Trading | Search Results",
                message: `No results matching your search term "${name}"`,
                messageClass: 'alert-info',
                search,
                name
            }
        )
        return;
    }   
});


// search for collectible
router.get('/search-size', async (req, res, next) => {
    const userId = req.signedCookies.user_id;
    const { name } = req.query;
    var isLoggedIn;
    var search = 1;

    const page = req.query.page;

    const collectibles = await knex('collectible')
        .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
        .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))       
        .where('collectible.sizes', 'ilike', `%${name}%`);

    // if results, render collectibles
    if (collectibles.length > 0) { 
        // if user is not logged in, render all collectibles in database
        if (userId == null) {
            const collectibles1 = await knex('collectible')
            .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
            .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))       
            .where('collectible.sizes', 'ilike', `%${name}%`)
            .paginate({
                perPage: AmountPerPage,
                currentPage: page
                });


            var pages = Math.ceil(collectibles.length/AmountPerPage);

            res.render('collectible', {
                title: "Squishmallows Trading | Search Results",
                collectible: collectibles1.data,
                collector_id: req.signedCookies.user_id,
                isLoggedIn,
                search,
                name,
                pages
            });       
        }

        // else if user is logged in render collectibles with update collection functionality
        // collectible table is rendered in two categories, collectibles where there is a collectible_id and collector_id row,
  //      and collectibles where there is no row because we need to render user's quantity counts for rows that exist, and 0's
  //      where rows don't exist 
   
        else {
            isLoggedIn = 1;
            // rows that have collectible_id and userId as foreign keys
            const collectiblesRow = await knex('collection')
            .select(['collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))            
            .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
            .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
            .where('collector_id', userId )
            .andWhere('collection.has_quantity', '>=', 0)
            .andWhere('collectible.sizes', 'ilike', `%${name}%`)
            .paginate({
                perPage: AmountPerPage,
                currentPage: page
                });

            // rows that have collectible_id and userId as foreign keys
            const collectiblesRow2 = await knex('collection')
            .select(['collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))            
            .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
            .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
            .where('collector_id', userId )
            .andWhere('collection.has_quantity', '>=', 0)
            .andWhere('collectible.sizes', 'ilike', `%${name}%`);


            // push collectible_ids that have collectible_id and userId as foreign keys to array
            const userCollectionRowExists = []
            collectiblesRow2.forEach((row) => userCollectionRowExists.push(row.collectible_id))

            // collectibles that don't have collectible_id and userId as foreign keys
            const collectiblesNoRow = await knex('collectible')
            .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
            .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))           
            .whereNotIn('collectible_id', userCollectionRowExists)
            .andWhere('collectible.sizes', 'ilike', `%${name}%`)
            .paginate({
                perPage: AmountPerPage,
                currentPage: page
                });

            const collectiblesNoRowLength = await knex('collectible')
            .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
            .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))           
            .whereNotIn('collectible_id', userCollectionRowExists)
            .andWhere('collectible.sizes', 'ilike', `%${name}%`)
            
            var pages = Math.ceil(Math.max((collectiblesRow2.length/AmountPerPage),(collectiblesNoRowLength.length/AmountPerPage)))

            res.render('collectible', {
                title: "Squishmallows Trading | Search Results",
                collector_id: req.signedCookies.user_id,
                collectibleRow: collectiblesRow.data,
                collectibleNoRow: collectiblesNoRow.data,
                isLoggedIn,
                search,
                name,
                pages
            });
        }       
    }
    // if no results, inform user
    else { 
        res.render('collectible', { 
                title: "Squishmallows Trading | Search Results",
                message: `No results matching your search term "${name}"`,
                messageClass: 'alert-info',
                search,
                name
            }
        )
        return;
    }   
});

**/


// individual collectible's page
router.get('/:id', async (req, res, next) => { 
    const { id } = req.params;
    const userId = req.signedCookies.user_id; 
    
    const collectibles = await knex('collectible')
        .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
        .select('collectible.created_at', 'collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
        .where({ collectible_id: id });

    if (collectibles.length == 0) {
        res.redirect('/');
        return;
    }
    
    var signInToViewTrades = 1;

    // if user is signed in 
    if (userId) {
        // user's has collectibles for any value zero or greater
        const collectionsHas = await knex('collection')
            .select(['collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
            .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
            .where('collector_id', userId )
            .where('collection.collectible_id', id )
            .andWhere('collection.has_quantity', '>=', 0);

        // user's wants collectibles if has_quantity for any value zero or greater
        const collectionsWants = await knex('collection')
            .select(['collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
            .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
            .where('collector_id', userId )
            .where('collection.collectible_id', id )
            .andWhere('collection.wants_quantity', '>=', 0);

        // user's willing to trade collectibles if willing_to_trade_quantity for any value zero or greater
        const collectionsWillingToTrade = await knex('collection')
            .select(['collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
            .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
            .where('collector_id', userId )
            .where('collection.collectible_id', id )
            .andWhere('collection.willing_to_trade_quantity', '>=', 0);

        // see if there's already a collector_id and collectible_id pair in the table
        const collectionExists = await knex('collection')
            .select(['collectible_id'])
            .where('collector_id', userId)
            .where('collectible_id', id);
        
        // users with collectible for trade
        const usersWithCollectible = await knex('collection')
            .select(['collector.collector_id', 'collector.username'])
            .join('collector', 'collector.collector_id', 'collection.collector_id')
            .where('collectible_id', '=', id)
            .andWhere('trades_public', '=', 'true')
            .andWhere('willing_to_trade_quantity', '>', 0)

        
        // users who want collectible
        const usersWantCollectible = await knex('collection')
            .select(['collector.collector_id', 'collector.username'])
            .join('collector', 'collector.collector_id', 'collection.collector_id')
            .where('collectible_id', '=', id)
            .andWhere('wants_public', '=', 'true')
            .andWhere('wants_quantity', '>', 0)



        var  existsUserWithCollectible = null;

        var existsUserWantCollectible = null;

        if (usersWithCollectible.length > 0) {
            existsUserWithCollectible = 1;
        }

        if (usersWantCollectible.length > 0) {
            existsUserWantCollectible = 1;
        }

        // if results, render users collectibles to the form
        if (collectionExists.length > 0) {
            const somethingInCollection = 1;

            res.render('collectiblepage', {
                title: `Squishmallows Trading | ${id}`,
                collector_id: userId,
                collectible: collectibles,
                collectionHas: collectionsHas,
                collectionWants: collectionsWants,
                collectionWillingToTrade: collectionsWillingToTrade,
                somethingInCollection,
                usersWithCollectible,
                existsUserWithCollectible,
                usersWantCollectible,
                id
            });
            return;
        }
        
        // if no results, render form with 0 in each quantity
        else {
            const nothingInCollection = 1;
            res.render('collectiblepage', {
                title: `Squishmallows Trading | ${id}`,
                collector_id: userId,
                collectible: collectibles,
                nothingInCollection,
                usersWithCollectible,
                existsUserWithCollectible,
                id
            });
            return;
        }    
    }

    // else user isn't signed in so don't show collection update form
    else {
        res.render('collectiblepage', {
            title: `Squishmallows Trading | ${id}`,
            collector_id: userId,
            collectible: collectibles,
            signInToViewTrades
        })
    }
});

router.get(['/', '/:filter'], async (req, res, next) => { 
    const userId = req.signedCookies.user_id;
    var isLoggedIn;
    const page = req.query.page;

    let filterTypes = req.query.filter
    if (typeof filterTypes === 'string' || filterTypes instanceof String) {
        filterTypes = [filterTypes]
    }

    // if user is not logged in, render all collectibles in database
    if (userId == null) {
        
        const collectiblesLength = await knex('collectible')
        .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
        .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))
        .orderBy('collectible.collectible_id')

        // get all collectibles
        const collectibles = await knex('collectible')
        .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
        .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id')
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))
        .orderBy('collectible.collectible_id')
        .modify((builder) => {
            if (filterTypes && filterTypes.length) {
                builder.whereIn('collectible_type.name', filterTypes)
            }
        })
        .paginate({
            perPage: AmountPerPage,
            currentPage: page
          }).then(results => {
            
                     
        var pages = Math.ceil(collectiblesLength.length/AmountPerPage);

                    
        res.render('collectible', {
            title: "Squishmallows Trading | Collectibles",
            collectible: results.data,
            collector_id: req.signedCookies.user_id,
            isLoggedIn,
            pages
        });  

                return;
            
    
          })
          
     
    }

    // else if user is logged in render collectibles with update collection functionality
    /* collectible table is rendered in two categories, collectibles where there is a collectible_id and collector_id row,
    and collectibles where there is no row because we need to render user's quantity counts for rows that exist, and 0's
    where rows don't exist 
    */    
    else {
        isLoggedIn = 1;
        // rows that have collectible_id and userId as foreign keys
        const collectiblesRow = await knex('collection')
        .select(['collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
        .where('collector_id', userId )
        .andWhere('collection.has_quantity', '>=', 0)
        .modify((builder) => {
            if (filterTypes && filterTypes.length) {
                builder.whereIn('collectible_type.name', filterTypes)
            }
        })   
        .paginate({
            perPage: AmountPerPage,
            currentPage: page
            });     


            const collectiblesRow2 = await knex('collection')
            .select(['collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.image', 'collectible.collectible_type_id', 'collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))
            .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
            .join('collectible_type', 'collectible_type.collectible_type_id', 'collectible.collectible_type_id')
            .where('collector_id', userId )
            .andWhere('collection.has_quantity', '>=', 0)
            .modify((builder) => {
                if (filterTypes && filterTypes.length) {
                    builder.whereIn('collectible_type.name', filterTypes)
                }
            })   
   // push collectible_ids that have collectible_id and userId as foreign keys to array
        const userCollectionRowExists = []
        collectiblesRow2.forEach((row) => userCollectionRowExists.push(row.collectible_id))

        // collectibles that don't have collectible_id and userId as foreign keys
        const collectiblesNoRow = await knex('collectible')
        .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
        .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description','collectible.image', 'collectible.collectible_type_id')
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))
         .whereNotIn('collectible_id', userCollectionRowExists) 
        .modify((builder) => {
            if (filterTypes && filterTypes.length) {
                builder.whereIn('collectible_type.name', filterTypes)
            }
        })
        .paginate({
        perPage: AmountPerPage,
        currentPage: page
        });


        // collectibles that don't have collectible_id and userId as foreign keys
        const collectiblesNoRowLength = await knex('collectible')
        .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
        .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description','collectible.image', 'collectible.collectible_type_id')
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))
            .whereNotIn('collectible_id', userCollectionRowExists) 
            
        var pages = Math.ceil(Math.max((collectiblesRow2.length/AmountPerPage),(collectiblesNoRowLength.length/AmountPerPage)))

        res.render('collectible', {
            title: "Squishmallows Trading | Collectibles",
            collector_id: req.signedCookies.user_id,
            collectibleRow: collectiblesRow.data,
            collectibleNoRow: collectiblesNoRow.data,
            isLoggedIn,
            pages
        });
    }  
});

router.post('/update', async (req, res, next) => { 
    const userId = req.signedCookies.user_id;   
    const q1 = req.body.has_quantity;
    const q2 = req.body.wants_quantity;
    const q3 = req.body.willing_to_trade_quantity;
    const collectible_id1 = req.body.collectible_id;

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
        // update existing row
                await knex('collection')
                .where({ collector_id: userId })
                .andWhere({ collectible_id: collectible_id1[i] })
                .update({ has_quantity: q1[i] })
                .update({ wants_quantity: q2[i] })
                .update({ willing_to_trade_quantity: q3[i] });

                // if has/wants/for trade quantity has been updated to zero, delete row
                if (q1[i]  == 0 && q2[i]  == 0 && q3[i]  == 0) {
                    await knex('collection')
                    .where({ collector_id: userId })
                    .andWhere( {collectible_id: collectible_id1[i] })
                    .del();
                }
        }
    }
    }

    const qa = req.body.has_quantity2;
    const qb = req.body.wants_quantity2;
    const qc = req.body.willing_to_trade_quantity2;
    const collectible_id2 = req.body.collectible_id2;

    if (qa != null) {

        var c;
        for (c = 0; c < qa.length; c++) {

            const collectibles = await knex('collectible')
            .select('collectible.collectible_id')
            .where({ collectible_id: collectible_id2[c] });
        
            if (collectibles.length == 0) {
                res.redirect('/');
                return;
            }

            // if user input a number in at least one of the quantities, insert new row
            if (qa[c] != 0 || qb[c] != 0 || qc[c] != 0) {
            // if no row exists for this collecible_id and userId, create new row
                await Collection.create(userId, collectible_id2[c], qa[c], qb[c], qc[c]);
            }
        }
    }

    res.redirect(req.get('referer'));
});


// post request to change user's collection quantities
router.post('/:id', async (req, res, next) => {   
    const userId = req.signedCookies.user_id;
    const collectible_id = req.body.collectible_id;
    
    const collectibles = await knex('collectible')
        .select('collectible.collectible_id')
        .where({ collectible_id: collectible_id });

    if (collectibles.length == 0) {
        res.redirect('/');
        return;
    }

    // see if there's already a collector_id and collectible_id pair in the table
    const collectionExists = await knex('collection')
        .select(['collectible_id'])
        .where('collector_id', userId)
        .where('collectible_id', collectible_id);

    // if there's a collector_id and collectible_id pair in the table, perform update
    if (collectionExists.length > 0) {
        const q1 = req.body.has_quantity;
        const q2 = req.body.wants_quantity;
        const q3 = req.body.willing_to_trade_quantity;

        await knex('collection')
            .where({collector_id: userId})
            .andWhere({collectible_id: collectible_id})
            .update({has_quantity: q1})
            .update({wants_quantity: q2})
            .update({willing_to_trade_quantity: q3 });

        // if has/wants/for trade quantity has been updated to zero, delete entry
        if (q1 == 0 && q2 == 0 && q3 == 0) {
            await knex('collection')
            .where({ collector_id: userId })
            .andWhere({collectible_id: collectible_id})
            .del();
        }
        res.redirect(`/collectible/${collectible_id}`);
        return;
    }

    // else perform insert
    else {
        const qa = req.body.has_quantity;
        const qb = req.body.wants_quantity;
        const qc = req.body.willing_to_trade_quantity;

        await Collection.create(userId, collectible_id, qa, qb, qc);

        res.redirect(`/collectible/${collectible_id}`);
        return;
    }
});

// url a collectible's image
router.get('/image/:id', async (req, res, next) => { 
    const id = req.params.id;
 
    const collectible = await knex('collectible').where({ collectible_id: id }).first();
    
    if (collectible) {
        const contentType = await FileType.
        fromBuffer(collectible.image);
        res.type(contentType.mime);
        res.end(collectible.image);
    } else {
        res.end('No image with that id!');
    }
});


module.exports = router;