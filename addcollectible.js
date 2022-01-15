const Collectible = require('../models/collectible');
const FileType = require('file-type');
const express = require('express');
const router = express.Router();
const knex = require('../connection')
const { ensureLoggedIn } = require('../auth/middleware')

//determines valid collectible based on name
function validCollectible(collectible) {
    const validName = typeof collectible.name == 'string' && collectible.name.trim() != '';
    return validName;
}

router.get('/', ensureLoggedIn, async (req, res, next) => {
    const userId = req.signedCookies.user_id;
    const collectorData = await knex('collector')    
    .select('is_admin')
    .where({ collector_id: userId }).first();

    res.render('addcollectible', {
        title: "Squishmallows Trading | Add Collectible"
    });
});

router.post('/', async (req, res, next) => {
    const { data } = req.files.pic;
    const typeSelected = req.body.collectible_type;
    const userId = req.signedCookies.user_id;
    const collectorData = await knex('collector')    
    .select('is_admin')
    .where({ collector_id: userId }).first();

       
    const userAdminType = collectorData.is_admin;

    theName = req.body.name;
    theYearReleased = req.body.year_released;
    theSquad = req.body.squad;
    theSizes = req.body.sizes;
    theCollectorNumber = req.body.collector_number;
    theColor = req.body.color;
    theSquishdate = req.body.squishdate;
    theDescription = req.body.description;

    if(validCollectible(req.body)) {
        if(userAdminType !=typeSelected && userAdminType != "6") { //if user admin is not the collectible type or if not all admin
            res.render('addcollectible', { 
                theName,
                message: 'You do not have the admin privilege to add this collectible type.',
                messageClass: 'alert-danger'
                }   
            )
            return
        }
        if (await Collectible.getByName(req.body.name)) { //name already exists

            res.render('addcollectible', { 
                    theYearReleased,
                    theSquad,
                    theSizes,
                    theCollectorNumber,
                    theColor,
                    theSquishdate,
                    theDescription,
                    message: 'That collectible name already exists in the database. Unique names only.',
                    messageClass: 'alert-danger'
                }
            )
            return
        }

        if (!req.files) {
            res.render('addcollectible', {  //need to upload image
                    theName,
                    theYearReleased,
                    theSquad,
                    theSizes,
                    theCollectorNumber,
                    theColor,
                    theSquishdate,
                    theDescription,
                    message: 'Please choose a jpeg image to upload',
                    messageClass: 'alert-danger'
                }
            )
            return
            
        }
        Collectible
        .getByName(req.body.name)
        .then(async (collectible) => {
            if (!collectible) {
                if (typeSelected > 0 && typeSelected < 6) {
                    if (typeSelected == 1) {
                        var selectPlush = 1;
                    }
                
                    if (typeSelected == 2) {
                        var selectPin = 1;
                    }
                    if (typeSelected == 3) {
                        var selectFigure = 1;
                    }
                
                    if (typeSelected == 4) {
                        var selectAccessory = 1;
                    }
                    else if  (typeSelected == 5) {
                        var selectOther = 1;
                    }



                    if (!req.body.year_released) {
                        res.render('addcollectible', { 
                                selectPlush,
                                selectPin,
                                selectFigure,
                                selectAccessory,
                                selectOther,
                                theName,
                                theYearReleased,
                                theSquad,
                                theSizes,
                                theCollectorNumber,
                                theColor,
                                theSquishdate,
                                theDescription,
                                message: 'Please add year released',
                                messageClass: 'alert-danger'
                            }
                        )
                        return
                    }
                    if (!req.body.squad) {
                        res.render('addcollectible', { 
                                selectPlush,
                                selectPin,
                                selectFigure,
                                selectAccessory,
                                selectOther,
                                theName,
                                theYearReleased,
                                theSquad,
                                theSizes,
                                theCollectorNumber,
                                theColor,
                                theSquishdate,
                                theDescription,
                                message: 'Please add squad',
                                messageClass: 'alert-danger'
                            }
                        )
                        return
                    }

                    if (!req.body.sizes) {
                        res.render('addcollectible', { 
                                selectPlush,
                                selectPin,
                                selectFigure,
                                selectAccessory,
                                selectOther,
                                theName,
                                theYearReleased,
                                theSquad,
                                theSizes,
                                theCollectorNumber,
                                theColor,
                                theSquishdate,
                                theDescription,
                                message: 'Please add sizes',
                                messageClass: 'alert-danger'
                            }
                        )
                        return
                    }

                    const collectible = {
                        name: req.body.name,
                        collectible_type_id: typeSelected,
                        image: data,
                        year_released: req.body.year_released, 
                        squad:  req.body.squad, 
                        sizes: req.body.sizes,
                        collector_number: req.body.collector_number,
                        color: req.body.color,
                        squishdate: req.body.squishdate,
                        description: req.body.description
                    };
                    const collectibleID = await Collectible.create(collectible); //creates collectible
                    res.redirect(`/collectible/${collectibleID}`);
                    return;
                }

                else {
                    res.render('addcollectible', { 
                        message: 'That collectible type does not exist',
                        messageClass: 'alert-danger'
                        }   
                    )
                    return
                }
            }
            // Collectible with that name already exists
            else {
                next(Error("Collectible with that name is already in the database"));
            }
        });
    }
    // else name is not valid
    else {
        res.render('addcollectible', { 
            message: 'Invalid name',
            messageClass: 'alert-danger'
            }   
        )
        return
    }
});


module.exports = router;
