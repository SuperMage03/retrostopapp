const router = require('express').Router();
//Package
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');
//Middleware
const verify = require('./verifyToken');
const { productIDValidation, productValidation } = require('../validation');
//Model
const User = require('../model/User');
const Seller = require('../model/Seller');
const Product = require('../model/Product');

router.post('/onboard-seller', verify, async (req, res) => {
    const seller = await Seller.findOne({userID: req.user._id});
    if (seller) {
        return res.status(400).send("You already filled in your seller info!");
    }

    try {
        //Create Account
        var account = await stripe.accounts.create({
            type: 'express',
            business_type: 'individual'
        });

        //Create Account Link
        var accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: req.body.cancelPage,
            return_url: 'http://' + req.get('host') + '/stripe/add-seller?account=' + account.id.toString(),
            type: 'account_onboarding'
        });

    } catch (err) {
        console.log(err);
        return res.status(400).send(err);
    }

    return res.status(200).send(accountLink.url);
});

router.get('/add-seller', verify, async (req, res) => {
    const seller = new Seller({
        userID: req.user._id,
        onboardAccount: req.query.account
    });
    await seller.save();
    res.status(200).send("Seller Added!");
});


router.post('/add-product', verify, async (req, res) => {
    const seller = await Seller.findOne({userID: req.user._id});
    if (!seller) {
        return res.status(400).send("You are not a seller!");
    }

    const { error } = productValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }


    if (!req.files.rom || !req.files.img) {
        return res.status(400).send("Please Upload the Files!")
    }


    const product = new Product({
        name: req.body.name,
        cost: Math.ceil(req.body.cost * 100),
        description: req.body.description,
        onboardAccount: seller.onboardAccount
    });

    const rom = req.files.rom;
    const img = req.files.img;

    const romName = product._id + path.extname(rom.name);
    const imgName = product._id + path.extname(img.name);

    product.romName = romName;
    product.imgName = imgName;

    await rom.mv('public/rom/' + romName, (err) => {
        if (err) { return res.status(400).send(err); }
    });

    await img.mv('public/image/' + imgName, (err) => {
        if (err) { return res.status(400).send(err); }
    });

    await product.save();

    res.status(200).send("Product Added!");
});


router.post('/create-checkout-session', verify, async (req, res) => {
    const { error } = productIDValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    await User.findById(req.user._id, (err, foundUser) => {
        if (err) {
            return res.status(400).send("Please Login Again!")
        }
        else {
            if (foundUser.toJSON().ownedRom.includes(req.body.productID)) {
                return res.status(400).send("You already own this game!");
            }
        }
    });


    await Product.findById(req.body.productID, (err, foundProd) => {
        if (err) {
            return res.status(400).send("No Product Found with that ID!");
        }
        else {
            return foundProd.toJSON();
        }
    }).then(async (product) => {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                name: product.name,
                amount: product.cost,
                images: ['../public/image/' + product.imgName],
                currency: 'cad',
                quantity: 1
            }],

            payment_intent_data: {
                application_fee_amount: 0,
                transfer_data: {
                    destination: product.onboardAccount
                }
            },

            mode: 'payment',
            success_url: 'http://' + req.get('host') + '/stripe/add-game-to-user?id=' + req.body.productID.toString(),
            cancel_url: req.body.cancelPage
        });


        res.json({ id: session.id });
    });
});

router.get('/add-game-to-user', verify, async (req, res) => {
    await User.findById(req.user._id, (err, foundUser) => {
        if (err) {
            return res.status(400).send("No User Found with that ID!");
        }
        else {
            return foundUser.toJSON();
        }
    }).then(async (user) => {
        const romList = user.ownedRom;
        if(romList.includes(req.query.id)) {
            return res.status(400).send('You already own this game!');
        }

        romList.push(req.query.id);
        await User.findByIdAndUpdate(req.user._id, {ownedRom: romList}, (err) => {
            if (err) {
                return res.status(400).send('User ID not Found!');
            }
            return res.send("Game Added");
        });
    });
});

module.exports = router;