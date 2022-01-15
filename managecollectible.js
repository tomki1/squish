const express = require('express');
const knex = require('../connection')
const router = express.Router();
const Collectible = require('../models/collectible');
const { ensureLoggedIn } = require('../auth/middleware')



router.get('/', ensureLoggedIn, async (req, res, next) => {
    const userId = req.signedCookies.user_id;

    const collectorData = await knex('collector')
    .select('is_admin')
    .where('collector_id', userId ).first();

    if (collectorData.is_admin == 6) {
        var showAllAttributes = 1;  

    //show the collectibles by id type
    const collectiblesUserCanDelete = await knex('collectible')
    .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
    .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.name', 'collectible.image', 'collectible.collectible_type_id')
    .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))
    .select(knex.raw("to_char(collectible.updated_at, 'YYYY-MM-DD') as updated_at"))
    res.render('managecollectible', { 
        title: "Squishmallows Trading | Manage Collectibles",
        collectibles: collectiblesUserCanDelete,
        showAllAttributes
     });

    }
    //based on admin show the specific collectible by type
    else if (collectorData.is_admin > 0 && collectorData.is_admin < 6) {
        if (collectorData.is_admin == 1) {
            var showLegoAttributes = 1;
        }
        else if (collectorData.is_admin == 2) {
            var showFunkoAttributes = 1;
    
    
        }
        else if (collectorData.is_admin == 3) {
            var showSquishmallowsAttributes = 1;
    
    
        }
        else if (collectorData.is_admin == 4) {
            var showPokemonAttributes = 1;
    
    
        }
        else if (collectorData.is_admin == 5) {
            var showHotWheelsAttributes = 1;
        }    

        const collectiblesUserCanDelete = await knex('collectible')
        .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
        .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.name', 'collectible.image', 'collectible.collectible_type_id')
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))
        .select(knex.raw("to_char(collectible.updated_at, 'YYYY-MM-DD') as updated_at"))
        .where({ 'collectible.collectible_type_id': collectorData.is_admin });

        res.render('managecollectible', { 
            title: "Squishmallows Trading | Manage Collectibles",
            collectibles: collectiblesUserCanDelete,
            showLegoAttributes,
            showFunkoAttributes,
            showSquishmallowsAttributes,
            showPokemonAttributes,
            showHotWheelsAttributes,
         });
    }
    else {

        res.render('managecollectible', { 
            title: "Squishmallows Trading | Manage Collectibles",
         });
    }


});

router.post('/', async (req, res, next) => {
    const collectible_id  = req.body.collectible_id;
    const userId = req.signedCookies.user_id;

    const collectibleData = await knex('collectible')    
    .select('collectible_type_id')
    .where({ collectible_id: collectible_id }).first();

    //if collectible not available
    if (collectibleData == undefined) {
        res.render('managecollectible', { 
            message: 'No collectible with that id exists. Click on the Manage Collectibles link in the nav bar to refresh the table.',
            messageClass: 'alert-danger',
            title: "Squishmallows Trading | Manage Collectibles",
            }   
            )
            return
    }


    const collectorData = await knex('collector')
    .select('is_admin')
    .where('collector_id', userId ).first();

    //if no admin privilege
    if (collectorData.is_admin != collectibleData.collectible_type_id && collectorData.is_admin != 6) {

        if (collectorData.is_admin == 6) {
            var showAllAttributes = 1;
            
            const collectiblesUserCanDelete = await knex('collectible')
            .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
            .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.name', 'collectible.image', 'collectible.collectible_type_id')
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))
            .select(knex.raw("to_char(collectible.updated_at, 'YYYY-MM-DD') as updated_at"))

            res.render('managecollectible', { 
            message: 'You do not have the admin privilege to delete this collectible',
            messageClass: 'alert-danger',
            title: "Squishmallows Trading | Manage Collectibles",
            collectibles: collectiblesUserCanDelete,
            showAllAttributes
            }   
            )
            return
        }

        else if (collectorData.is_admin > 0 && collectorData.is_admin < 6) {
            if (collectorData.is_admin == 1) {
                var showLegoAttributes = 1;
            }
            else if (collectorData.is_admin == 2) {
                var showFunkoAttributes = 1;
        
        
            }
            else if (collectorData.is_admin == 3) {
                var showSquishmallowsAttributes = 1;
        
        
            }
            else if (collectorData.is_admin == 4) {
                var showPokemonAttributes = 1;
        
        
            }
            else if (collectorData.is_admin == 5) {
                var showHotWheelsAttributes = 1;
            }
        
        
            const collectiblesUserCanDelete = await knex('collectible')
            .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
            .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.name', 'collectible.image', 'collectible.collectible_type_id')
            .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))
            .select(knex.raw("to_char(collectible.updated_at, 'YYYY-MM-DD') as updated_at"))
            .where({ 'collectible.collectible_type_id': collectorData.is_admin });

            res.render('managecollectible', { 
            message: 'You do not have the admin privilege to delete this collectible',
            messageClass: 'alert-danger',
            title: "Squishmallows Trading | Manage Collectibles",
            collectibles: collectiblesUserCanDelete,
            showLegoAttributes,
            showFunkoAttributes,
            showSquishmallowsAttributes,
            showPokemonAttributes,
            showHotWheelsAttributes,
            }   
            )
            return
        }
        else {

            res.render('managecollectible', { 
                message: 'You do not have the admin privilege to delete this collectible',
                messageClass: 'alert-danger',
                title: "Squishmallows Trading | Manage Collectibles",
             });
        }
    }

    // delete collectible
    await knex('collectible')
    .where({collectible_id: collectible_id})
    .delete();

    if (collectorData.is_admin == 6) {

        var showAllAttributes = 1;

        
        const collectiblesUserCanDelete = await knex('collectible')
        .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
        .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.name', 'collectible.image', 'collectible.collectible_type_id')
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))
        .select(knex.raw("to_char(collectible.updated_at, 'YYYY-MM-DD') as updated_at"))
        res.render('managecollectible', { 
            message: 'Collectible has been deleted',
            messageClass: 'alert-success',
            title: "Squishmallows Trading | Manage Collectibles",
            collectibles: collectiblesUserCanDelete,
            showAllAttributes
        });

    }

    else if (collectorData.is_admin > 0 && collectorData.is_admin < 6) {
        if (collectorData.is_admin == 1) {
            var showLegoAttributes = 1;
        }
        else if (collectorData.is_admin == 2) {
            var showFunkoAttributes = 1;
    
    
        }
        else if (collectorData.is_admin == 3) {
            var showSquishmallowsAttributes = 1;
    
    
        }
        else if (collectorData.is_admin == 4) {
            var showPokemonAttributes = 1;
    
    
        }
        else if (collectorData.is_admin == 5) {
            var showHotWheelsAttributes = 1;
        }
    
    
        const collectiblesUserCanDelete = await knex('collectible')
        .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
        .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.year_released', 'collectible.squad', 'collectible.sizes', 'collectible.collector_number', 'collectible.color', 'collectible.squishdate', 'collectible.description', 'collectible.name','collectible.image', 'collectible.collectible_type_id')
        .select(knex.raw("to_char(collectible.created_at, 'YYYY-MM-DD') as created_at"))
        .select(knex.raw("to_char(collectible.updated_at, 'YYYY-MM-DD') as updated_at"))
        .where({ 'collectible.collectible_type_id': collectorData.is_admin });

        res.render('managecollectible', { 
            message: 'Collectible has been deleted',
            messageClass: 'alert-success',
            title: "Squishmallows Trading | Manage Collectibles",
            collectibles: collectiblesUserCanDelete,
            showLegoAttributes,
            showFunkoAttributes,
            showSquishmallowsAttributes,
            showPokemonAttributes,
            showHotWheelsAttributes,
         });

    }

});

module.exports = router;