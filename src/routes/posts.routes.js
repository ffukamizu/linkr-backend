import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { postSchema } from "../schemas/posts.schema.js";
import { createPost, getPosts } from "../controllers/post.controllers.js";
import validateAuth from "../middlewares/validateAuth.middlewares.js";

const postsRouter = Router();
postsRouter.post('/posts', validateAuth, validateSchema(postSchema), createPost);
postsRouter.get('/posts', getPosts);

export default postsRouter;