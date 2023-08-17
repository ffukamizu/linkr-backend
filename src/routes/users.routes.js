import { Router } from 'express';
import { validateSchema } from '../middlewares/validateSchema.middleware.js';
import { signupSchema } from '../schemas/signup.schema.js';
import { signinSchema } from '../schemas/signin.schema.js';
import { signIn, signUp } from '../controllers/users.controllers.js';

const usersRouter = Router();

usersRouter.post('/signup', validateSchema(signupSchema), signUp);
usersRouter.post('/signin', validateSchema(signinSchema), signIn);

export default usersRouter;
