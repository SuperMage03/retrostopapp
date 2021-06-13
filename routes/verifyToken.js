const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
    //const token = req.header('token');
    const token = req.cookies.token;
    if (!token) {return res.status(401).send('Access Denied!');}

    try {
        req.user = jwt.verify(token, process.env.TOKEN_SECRET);
        next();
    } catch (err) {
        res.status(400).send('Invalid Token!');
    }
}

