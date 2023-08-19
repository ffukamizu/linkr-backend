import urlMetadata from "url-metadata";
import { createHashtagRepo } from "../repositories/hashtag.repository.js";
import { createPostRepo, deletePostRepo, getPostById, readPostRepo } from "../repositories/post.repository.js";
import { deleteHashtagByPostIdRepo } from "../repositories/hashtag.repository.js";

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

export const getPosts = async (req, res) => {
  try {
    const { rows: posts, rowCount } = await readPostRepo();
    if (rowCount === 0) return res.send([]);
    for (const post of posts) {
      await urlMetadata(post.link).then(
        (metadata) => {
          post.link = {
            url: metadata['og:url'],
            title: metadata['og:title'],
            description: metadata['og:description'],
            image: metadata['og:image']
          }
        },
        (err) => {})
    };
    return res.send(posts);

  } catch (err) {
    return res.status(500).send(err.message);
  }
};

export const deletePostById = async (req, res) => {
  try {
    const userId = res.locals.user.id;
    const { id } = req.params;

    const post = await getPostById(id);
    if(post.rowCount === 0) return res.status(404);
    if(post.rows[0].userId !== userId) return res.status(401).send("Apenas o autor do post pode excluí-lo!");

    await deleteHashtagByPostIdRepo(post.rows[0].id);

    const result = await deletePostRepo(id, userId);
    if(result.rowCount === 0) return res.status(401).send("Ocorreu um erro ao excluir seu link!");

    return res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  };
};