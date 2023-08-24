import Joi from 'joi';

export const likeSchema = Joi.object({
    post: Joi.number().min(0).required()
});