import { Router } from "express";
import usersRouter from "./users.routes.js";
import postsRouter from "./posts.routes.js";

const router = Router();

router.use(usersRouter);
router.use(postsRouter);

export default router;
