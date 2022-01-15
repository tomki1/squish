const express = require('express');
const knex = require('../connection')
const router = express.Router();
const Collectible = require('../models/collectible');
const FileType = require('file-type');
const { types } = require('pg');
const { ensureLoggedIn } = require('../auth/middleware')


router.get('/', ensureLoggedIn, (req, res, next) => {
    res.render('editcollectible', { title: "Squishmallows Trading | Edit Collectible" });
});

router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    const id = req.params.id;

    const collectibleData = await knex('collectible')    
    .select('collectible_type_id', 'name', 'year_released', 'squad', 'sizes', 'collector_number', 'color', 'squishdate', 'description', 'collectible_id')
    .where({ collectible_id: id }).first();
 
    if (collectibleData.collectible_type_id == 1) {
        var selectPlush = 1;
    }

    if (collectibleData.collectible_type_id == 2) {
        var selectPin = 1;
    }
    if (collectibleData.collectible_type_id == 3) {
        var selectFigure = 1;
    }

    if (collectibleData.collectible_type_id == 4) {
        var selectAccessory = 1;
    }
    else if  (collectibleData.collectible_type_id == 5) {
        var selectOther = 1;
    }

    res.render('editcollectible', { 
        title: "Squishmallows Trading | Edit Collectible", 
        id,
        selectPlush,
        selectPin,
        selectFigure,
        selectAccessory,
        selectOther,
        thisCollectible: collectibleData
    });
});

router.post('/', async (req, res, next) => {
    const { collectible_id, name } = req.body;
    const id = collectible_id;
   
    const typeSelected = req.body.collectible_type;
    const userId = req.signedCookies.user_id;

    const collectorData = await knex('collector')    
    .select('is_admin')
    .where({ collector_id: userId }).first();

    const userAdminType = collectorData.is_admin;
    // Check if existing collectible_id
    if (!(await Collectible.getById(collectible_id))) {
        res.render('editcollectible', { 
        title: "Squishmallows Trading | Edit Collectible", 
        id,
        selectPlush,
        selectPin,
        selectFigure,
        selectAccessory,
        selectOther,
        message: 'That collectible id does not exist',
        messageClass: 'alert-danger'
        }
        )
        return
    }
    const collectibleData = await knex('collectible')    
    .select('collectible_type_id', 'name', 'year_released', 'squad', 'sizes', 'collector_number', 'color', 'squishdate', 'description', 'collectible_id')
    .where({ collectible_id: collectible_id }).first();

    if (collectibleData.collectible_type_id == 1) {
        var selectPlush = 1;
    }

    if (collectibleData.collectible_type_id == 2) {
        var selectPin = 1;
    }
    if (collectibleData.collectible_type_id == 3) {
        var selectFigure = 1;
    }

    if (collectibleData.collectible_type_id == 4) {
        var selectAccessory = 1;
    }
    else if  (collectibleData.collectible_type_id == 5) {
        var selectOther = 1;
    }

    // Check if existing collectible name
    const thisIdcollectibleType = collectibleData.collectible_type_id;

    if (thisIdcollectibleType != userAdminType && userAdminType !='6')
    {
        res.render('editcollectible', { 
        title: "Squishmallows Trading | Edit Collectible", 
        id,
        message: 'You do not have the admin privilege to edit this collectible',
        messageClass: 'alert-danger'
        }
    )
    return
    }

    const nameOfCollectible = await knex('collectible')    
    .select('name')
    .where({ collectible_id: id }).first();

    // if there that name already in the database and it is not the current collectible, render error
    if (await Collectible.getByName(name) && (nameOfCollectible.name != name)) {
        res.render('editcollectible', { 
        title: "Squishmallows Trading | Edit Collectible", 
        id,
        selectPlush,
        selectPin,
        selectFigure,
        selectAccessory,
        selectOther,
        thisCollectible: collectibleData,
        message: 'That collectible name already exists in the database. Unique names only',
        messageClass: 'alert-danger'
        }
        )
        return
    }

    if (typeSelected == "0") {
        if (!name && !req.files) {
            res.render('editcollectible', { 
            title: "Squishmallows Trading | Edit Collectible", 
            id,
            selectPlush,
            selectPin,
            selectFigure,
            selectAccessory,
            selectOther,
            thisCollectible: collectibleData,
            message: 'Please do one of the following to update the collectible: enter a name, upload an image, or enter all the attribute fields',
            messageClass: 'alert-danger'
            }
            )
            return
        }
        
         if (name) {
             // update name
             await knex('collectible').where({collectible_id: collectible_id}).update({name: name});
         }
         if (req.files) {
             const {data} = req.files.pic;
             if (data) {
            // update image
            await knex('collectible').where({collectible_id: collectible_id}).update({image: data});
             }
         }
        // update updated_at time
        await knex('collectible').where({collectible_id: collectible_id}).update({updated_at: knex.fn.now()});
        res.redirect(`/collectible/${collectible_id}`);
        return;
    }

    else if (typeSelected > '0' && typeSelected < '6') {
    
        if (userAdminType !='6'){
            res.render('editcollectible', { 
            title: "Squishmallows Trading | Edit Collectible", 
            id,
            selectPlush,
            selectPin,
            selectFigure,
            selectAccessory,
            selectOther,
            thisCollectible: collectibleData,
            message: 'You do not have the admin privilege to edit to this collectible type',
            messageClass: 'alert-danger'
            }
        )
        return
        }

        if (thisIdcollectibleType != typeSelected && userAdminType == 6) {
            if (!req.body.year_released) {
                res.render('editcollectible', { 
                title: "Squishmallows Trading | Edit Collectible", 
                id,
                selectPlush,
                selectPin,
                selectFigure,
                selectAccessory,
                selectOther,
                thisCollectible: collectibleData,
                message: 'Please add year released. You must enter all type attribute fields if you are changing the collectible\'s type',
                messageClass: 'alert-danger'
                }
                )
                return
            }


            if (!req.body.squad) {
                res.render('editcollectible', { 
                title: "Squishmallows Trading | Edit Collectible", 
                id,
                selectPlush,
                selectPin,
                selectFigure,
                selectAccessory,
                selectOther,
                thisCollectible: collectibleData,
                message: 'Please add squad. You must enter all type attribute fields if you are changing the collectible\'s type',
                messageClass: 'alert-danger'
                }
                )
                return
            }

            if (!req.body.sizes) {
                res.render('editcollectible', { 
                title: "Squishmallows Trading | Edit Collectible", 
                id,
                selectPlush,
                selectPin,
                selectFigure,
                selectAccessory,
                selectOther,
                thisCollectible: collectibleData,
                message: 'Please add sizes. You must enter all type attribute fields if you are changing the collectible\'s type',
                messageClass: 'alert-danger'
                }
                )
                return
            }



        }

        else if (!req.body.year_released && !req.body.set_number && !req.body.squad && !req.body.sizes) {
            if (!name && !req.files) {
                res.render('editcollectible', { 
                title: "Squishmallows Trading | Edit Collectible", 
                id,
                selectPlush,
                selectPin,
                selectFigure,
                selectAccessory,
                selectOther,
                thisCollectible: collectibleData,
                message: 'Please do one of the following to update the collectible: enter a name, upload an image, or enter all the attribute fields',
                messageClass: 'alert-danger'
                }
                )
                return
            }

            if (name) {
                // update name
                await knex('collectible').where({collectible_id: collectible_id}).update({name: name});
            }
        
            if (req.files) {
                const {data} = req.files.pic;
                if (data) {
                // update image
                await knex('collectible').where({collectible_id: collectible_id}).update({image: data});
                }
            }

            await knex('collectible')
            .where({collectible_id: collectible_id})
            .update({collectible_type_id: typeSelected})
            .update({updated_at: knex.fn.now()});
            
            res.redirect(`/collectible/${collectible_id}`);
            return

        }
        
        else {
            if (!req.body.year_released) {
                res.render('editcollectible', { 
                title: "Squishmallows Trading | Edit Collectible", 
                id,
                selectPlush,
                selectPin,
                selectFigure,
                selectAccessory,
                selectOther,
                thisCollectible: collectibleData,
                message: 'Please add year released',
                messageClass: 'alert-danger'
                }
                )
                return
            }


            if (!req.body.squad) {
                res.render('editcollectible', { 
                title: "Squishmallows Trading | Edit Collectible", 
                id,
                selectPlush,
                selectPin,
                selectFigure,
                selectAccessory,
                selectOther,
                thisCollectible: collectibleData,
                message: 'Please add squad',
                messageClass: 'alert-danger'
                }
                )
                return
            }

            if (!req.body.sizes) {
                res.render('editcollectible', { 
                title: "Squishmallows Trading | Edit Collectible", 
                id,
                selectPlush,
                selectPin,
                selectFigure,
                selectAccessory,
                selectOther,
                thisCollectible: collectibleData,
                message: 'Please add sizes',
                messageClass: 'alert-danger'
                }
                )
                return
            }
        }

        if (name) {
            // update name
            await knex('collectible').where({collectible_id: collectible_id}).update({name: name});
        }

        if (req.files) {
            const {data} = req.files.pic;
            if (data) {
            // update image
            await knex('collectible').where({collectible_id: collectible_id}).update({image: data});
            }
        }

        await knex('collectible')
        .where({collectible_id: collectible_id})
        .update({collectible_type_id: typeSelected})
        .update({year_released: req.body.year_released})
        .update({ squad: req.body.squad})        
        .update({sizes: req.body.sizes})
        .update({collector_number: req.body.collector_number})
        .update({color: req.body.color})
        .update({squishdate: req.body.squishdate})
        .update({description: req.body.description})
        .update({updated_at: knex.fn.now()});

        res.redirect(`/collectible/${collectible_id}`);
        return;
    }

    
    else {
        res.render('editcollectible', { 
            message: 'that collectible type does not exist',
            messageClass: 'alert-danger'
            }   
        )
        return
    }
});

module.exports = router;