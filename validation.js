//Validation
const Joi = require('@hapi/joi');

//Register Validation
const registerValidation = data => {
    const schema = Joi.object({
        name: Joi.string().min(1).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    });

    return schema.validate(data);
};

//Log-in Validation
const loginValidation = data => {
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    });

    return schema.validate(data);
};


//ProductID Validation
const productIDValidation = data => {
    const schema = Joi.object({
        productID: Joi.string().min(6).required(),
        cancelPage: Joi.string().min(1).required()
    });

    return schema.validate(data);
};


//Product Validation
const productValidation = data => {
    const schema = Joi.object({
        name: Joi.string().min(1).required(),
        cost: Joi.number().integer().min(1).required(),
        description: Joi.string().min(1).required()
    });

    return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.productIDValidation = productIDValidation;
module.exports.productValidation = productValidation;
