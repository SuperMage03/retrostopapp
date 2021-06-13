const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verify = require('./verifyToken');

const { registerValidation, loginValidation } = require('../validation')


router.post('/register', async (req, res) => {
    //VALIDATE BEFORE USER CREATION
    const { error } = registerValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    //Check if user already exist
    const emailExist = await User.findOne({email: req.body.email});
    if (emailExist) {
        return res.status(400).send('E-Mail already exists!');
    }

    //Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //Create User
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    try {
        await user.save();
        res.send({user: user._id});
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post('/login', async (req, res) => {
    //VALIDATE BEFORE LOG-IN ATTEMPT
    const { error } = loginValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    //Check if user exists
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return res.status(400).send('Wrong E-Mail!');
    }

    //Check Password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).send('Wrong Password!');
    }

    const maxAgeSec = 3 * 24 * 60 * 60;
    //Create and assign a token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET, {expiresIn: maxAgeSec});
    //res.header('token', token);
    res.cookie('token', token, {httpOnly: false, maxAge: maxAgeSec * 1000});

    res.status(200).send("Logged in!");
});


//Log Out
router.get('/logout', verify, (req, res) => {
    res.cookie('token', '', {maxAge: 1})
    res.status(200).send("Logged out!");
});

module.exports = router;