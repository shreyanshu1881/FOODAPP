const Joi = require('joi')

module.exports.registerSchema = Joi.object({
    password: Joi.string().required().label("password must be 6-16 characters long").pattern(new RegExp('^[a-zA-Z0-9]{6,16}$')),
    email: Joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    confirmationPassword: Joi.any().valid(Joi.ref('password')).label("password must match"),
    default_address: Joi.string().required().label("enter valid address"),
    first_name: Joi.string().required().label("enter valid first name"),
    last_name: Joi.string().required().label("enter valid last name"),
    phone_no: Joi.number().required().label("enter valid address").min(1000000000).max(9999999999)

}).with('password', 'confirmationPassword');