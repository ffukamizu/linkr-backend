import { Router } from 'express';
import { validateSchema } from '../middlewares/validateSchema.middleware.js';
import { signupSchema } from '../schemas/signup.schema.js';
import { signinSchema } from '../schemas/signin.schema.js';
import { followUser, unfollowUser, getUserById, getUserByName, signIn, signUp } from '../controllers/users.controllers.js';
import validateAuth from '../middlewares/validateAuth.middlewares.js';

const usersRouter = Router();

usersRouter.post('/signup', validateSchema(signupSchema), signUp);
usersRouter.post('/signin', validateSchema(signinSchema), signIn);
usersRouter.get('/user/:id', validateAuth, getUserById)
usersRouter.post('/search/user/', validateAuth, getUserByName)
usersRouter.post('/user/follow/:id', validateAuth, followUser);
usersRouter.delete('/user/follow/:id', validateAuth, unfollowUser);

export default usersRouter;
