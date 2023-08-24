import { Router } from "express";
import { createPost, createRepost, deletePostById, getPosts, getPostsByHashtag, getPostsByUser, getTrending, switchLikePost, updateText } from "../controllers/post.controllers.js";
import validateAuth from "../middlewares/validateAuth.middlewares.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { postSchema } from "../schemas/posts.schema.js";
import { likeSchema } from "../schemas/like.schema.js";

const postsRouter = Router();
postsRouter.post('/posts', validateAuth, validateSchema(postSchema), createPost);
postsRouter.post('/re-post/:id', validateAuth, createRepost);
postsRouter.get('/posts', validateAuth, getPosts);
postsRouter.get('/posts/user/:id', validateAuth, getPostsByUser);
postsRouter.get('/posts/trending', validateAuth, getTrending);
postsRouter.get('/posts/hashtag/:hashtag', validateAuth, getPostsByHashtag);
postsRouter.patch('/posts/:id', validateAuth, updateText);
postsRouter.delete('/posts/:id', validateAuth, deletePostById);
postsRouter.post('/likes',validateAuth,validateSchema(likeSchema), switchLikePost);

export default postsRouter;