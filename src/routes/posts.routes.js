import { Router } from "express";
import { createPost, deletePostById, getPosts, getPostsByHashtag, getPostsByUser, getTrending, updateText } from "../controllers/posts.controllers.js";
import validateAuth from "../middlewares/validateAuth.middlewares.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { postSchema } from "../schemas/posts.schema.js";

const postsRouter = Router();
postsRouter.post('/posts', validateAuth, validateSchema(postSchema), createPost);
postsRouter.get('/posts', validateAuth, getPosts);
postsRouter.get('/posts/user/:id', validateAuth, getPostsByUser);
postsRouter.get('/posts/trending', validateAuth, getTrending);
postsRouter.get('/posts/hashtag/:hashtag', validateAuth, getPostsByHashtag);
postsRouter.patch('/posts/:id', validateAuth, updateText);
postsRouter.delete('/posts/:id', validateAuth, deletePostById);

export default postsRouter;