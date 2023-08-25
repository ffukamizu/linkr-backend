import Joi from 'joi';

export const signinSchema = Joi.object({
    email: Joi.string().email().max(128).trim().required(),
    password: Joi.string().required(),
});
