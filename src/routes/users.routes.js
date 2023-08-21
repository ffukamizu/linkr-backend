import { Router } from 'express';
import { validateSchema } from '../middlewares/validateSchema.middleware.js';
import { signupSchema } from '../schemas/signup.schema.js';
import { signinSchema } from '../schemas/signin.schema.js';
import { getUserById, getUserByName, signIn, signUp } from '../controllers/users.controllers.js';
import validateAuth from '../middlewares/validateAuth.middlewares.js';

const usersRouter = Router();

usersRouter.post('/signup', validateSchema(signupSchema), signUp);
usersRouter.post('/signin', validateSchema(signinSchema), signIn);
usersRouter.get('/user/:id', validateAuth, getUserById)
usersRouter.get('/search/user/', validateAuth, getUserByName)

export default usersRouter;
