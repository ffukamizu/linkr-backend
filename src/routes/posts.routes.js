import { Router } from "express";
import { createPost, deletePostById, getPosts, getPostsByHashtag, getTreading, updateText } from "../controllers/post.controllers.js";
import validateAuth from "../middlewares/validateAuth.middlewares.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { postSchema } from "../schemas/posts.schema.js";

const postsRouter = Router();
postsRouter.post('/posts', validateAuth, validateSchema(postSchema), createPost);
postsRouter.get('/posts', getPosts);
postsRouter.get('/posts/treading', getTreading);
postsRouter.get('/posts/hashtag/:hashtag', getPostsByHashtag);
postsRouter.patch('/posts/:id', validateAuth, updateText);
postsRouter.delete('/posts/:id', validateAuth, deletePostById);

export default postsRouter;