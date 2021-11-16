const Joi = require('joi')

module.exports.registerSchema = Joi.object({
    password: Joi.string().required().label("password must be 6-16 characters long").pattern(new RegExp('^[a-zA-Z0-9]{6,16}$')),
    email: Joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
})