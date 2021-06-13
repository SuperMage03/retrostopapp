const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookies = require("cookie-parser");
const upload = require('express-fileupload');
const bodyParser = require('body-parser');

//Set View Engine
app.set('view engine', 'ejs');

//.env config
dotenv.config();

//Connect to DB
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () => console.log('Connected to DB!'));


//Middlewares
app.use(express.json());
app.use(cookies());
app.use(upload());
app.use(bodyParser());

//Import Routes
const authRoute = require('./routes/auth');
const apiRoute = require('./routes/api');
const paymentRoute = require('./routes/payment');

//Route Middlewares
app.use('/auth', authRoute);
app.use('/api', apiRoute);
app.use('/stripe', paymentRoute);
app.use('/public', express.static('./public'));
app.use('/views', express.static('./views'));

app.listen(80, () => console.log("Server Up and running"));
