import Joi from "joi"

export const signupSchema = Joi.object({
    name: Joi.string().max(64).required(),
    email: Joi.string().email().max(128).required(),
    password: Joi.string().required(),
    photo: Joi.string().uri().max(256).required()
})