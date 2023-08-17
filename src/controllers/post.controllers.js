import { createHashtagRepo } from "../repositories/hashtag.repository.js";
import { createPostRepo } from "../repositories/post.repository.js";

export const createPost = async (req, res) => {
  try {
    const { id } = res.locals.user;

    const { text, link } = req.body;

    const result = await createPostRepo(text, link, id);
    const postId = result.rows[0].id;

    if(text) {
      const tags = text.match(/#[a-z0-9_]+/g);
      
      if(tags) {
        const tagsArr = tags.map(tag => [postId, tag]);
        await createHashtagRepo(tagsArr);
      };
    };

    return res.status(201).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send("Houve um erro ao publicar seu link");
  }
};