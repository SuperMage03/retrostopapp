const router = require('express').Router();
const verify = require('./verifyToken');
const User = require('../model/User');
const Product = require('../model/Product');

//Sends a list of games you have as JSON file
router.get('/my-games', verify, async (req, res) => {
    let myGames = [];

    await User.findById(req.user._id, (err, foundUser) => {
        if (err) {
            return res.status(400).send("Please Re-Login!");
        }
        return foundUser.toJSON();

    }).then(async (user) => {
        await Product.find({} , (err, products) => {
            products.map(product => {
                const prodJSON = product.toJSON()
                if (user.ownedRom.includes(prodJSON._id)) {
                    myGames.push({
                        _id: prodJSON._id,
                        name: prodJSON.name,
                        cost: prodJSON.cost,
                        description: prodJSON.description,
                        imgDir: 'http://' + req.get('host') + '/public/image/' + prodJSON.imgName
                    });
                }
            });
        }).then(async () => {
            res.status(200).send(JSON.stringify(myGames));
        });
    });
});


//Sends a list of dictionary per game as JSON file
router.get('/all-games', async (req, res) => {
    let allGames = [];
    await Product.find({} , (err, products) => {
        products.map(product => {
            let prodJSON = product.toJSON()
            allGames.push({
                _id: prodJSON._id,
                name: prodJSON.name,
                cost: prodJSON.cost,
                description: prodJSON.description,
                imgDir: 'http://' + req.get('host') + '/public/image/' + prodJSON.imgName
            });
        });
    }).then(async () => {
        res.send(JSON.stringify(allGames));
    });
});



module.exports = router;
