import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { postSchema } from "../schemas/posts.schema.js";
import { createPost, deletePostById, getPosts, updateText } from "../controllers/post.controllers.js";
import validateAuth from "../middlewares/validateAuth.middlewares.js";

const postsRouter = Router();
postsRouter.post('/posts', validateAuth, validateSchema(postSchema), createPost);
postsRouter.get('/posts', getPosts);
postsRouter.patch('/posts/:id', validateAuth, updateText);
postsRouter.delete('/posts/:id', validateAuth, deletePostById);

export default postsRouter;