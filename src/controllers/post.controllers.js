import urlMetadata from "url-metadata";
import {
  createHashtagRepo, deleteHashtagByPostIdRepo, readHashtagsRepo
} from "../repositories/hashtag.repository.js";
import { likePost, removeLikePost, verifyLike } from "../repositories/likes.repository.js";
import {
  createComment,
  createPostRepo, createRespostRepo, deletePostRepo, getCommentsById, getPostById, readPostsByHashtagRepo, readPostsByUserIdRepo, readPostsRepo, updateTextRepo
} from "../repositories/post.repository.js";

const extractHashtags = (postId, text) => {
  const tags = text.match(/#[a-z0-9_]+/g);

  if(tags) return tags.map(tag => [postId, tag]);

  return null;
};

const extractMetadata = async (link) => {
  const cache = {};

  if (cache[link]) {
    return cache[link];
  }
  const metadata = await urlMetadata(link).then(
    (metadata) => {
      console.log(metadata);
      return {
        url: metadata['og:url'] || metadata['url'],
        title: metadata['og:title'] || metadata['title'],
        description: metadata['og:description'] || metadata['description'],
        image: metadata['og:image'] || metadata['image']
      }
    },
    (err) => {
      return link;
    });
  cache[link] = metadata;
  return metadata;
}

export const createPost = async (req, res) => {
  try {
    const { id } = res.locals.user;

    const { text, link } = req.body;

    const result = await createPostRepo(text, link, id);
    const postId = result.rows[0].id;

    if(text) {
      const hashtags = extractHashtags(postId, text)
      
      if(hashtags) await createHashtagRepo(hashtags);
    };

    return res.status(201).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send("Houve um erro ao publicar seu link");
  }
};

export const createRepost = async (req, res) => {
  try {
    const userId = res.locals.user.id;
    const { id } = req.params;

    await createRespostRepo(id, userId);

    return res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  };
};

export const getPosts = async (req, res) => {
  const user = res.locals.user;
  try {
    const { rows: posts, rowCount } = await readPostsRepo(user.id);
    if (rowCount === 0) return res.send([]);
    return res.send(posts);

    /*
    await Promise.all(posts.map(async (post) => {
      post.link = await extractMetadata(post.link);
    })); 
    */

    /*
    const {rows: userLikes} = await getLikes(user)
    const likesArray = userLikes.map(obj => obj.postId)  
    const postsObj = posts.map((post,index) =>(
      { ...post,
        isLiked:likesArray.includes(post.id),
      })) 
    return res.send(postsObj);
    */

  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
};

export const getPostsByHashtag = async (req, res) => {
  try {
    const { user, hashtag } = { ...res.locals, ...req.params };
    const { rows: posts, rowCount } = await readPostsByHashtagRepo(user.id, hashtag);
    if (rowCount === 0) return res.send([]);
    /*
    await Promise.all(posts.map(async (post) => {
      post.link = await extractMetadata(post.link);
      console.log('link', post.link);
    }));
    */

    return res.send(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
}

export const getPostsByUser = async (req, res) => {
  try {
    const { user, id } = { ...res.locals, ...req.params };
    const { rows: posts, rowCount } = await readPostsByUserIdRepo(user.id, id);
    if (rowCount === 0) return res.send([]);
    /*
    await Promise.all(posts.map(async (post) => {
      post.link = await extractMetadata(post.link);
      console.log('link', post.link);
    }));
    */

    return res.send(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
}


export const getTrending = async (req, res) => {
  try {
    const { rows: trending } = await readHashtagsRepo();
    return res.send(trending);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export const updateText = async (req, res) => {
  try {
    const userId = res.locals.user.id;
    const { id } = req.params;
    const { text } = req.body;

    const post = await getPostById(id);
    if(post.rowCount === 0) return res.sendStatus(404);
    if(post.rows[0].userId !== userId) return res.status(401).send("Apenas o autor do post pode editá-lo!");

    await deleteHashtagByPostIdRepo(post.rows[0].id);

    await updateTextRepo(id, text);

    if(text) {
      const hashtags = extractHashtags(id, text);
      
      if(hashtags) await createHashtagRepo(hashtags);
    };

    return res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  };
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

export async function switchLikePost(req, res){
  const user = res.locals.user.id
  const {post} = req.body
  try {
    const likeCheck = await verifyLike(user,post)
    if(likeCheck.rowCount === 0){
      const like = await likePost(user,post)
      return res.status(201).send("Liked")
    }
    const noLike = await removeLikePost(user,post)
    return res.sendStatus(204)
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function postComment(req,res){
  const user = res.locals.user.id
  const {comment , postId} = req.body
  try {
    const insertComment = await createComment(user,postId,comment)
    const {rows:updatedComments} = await getCommentsById(postId)
    res.status(201).send(updatedComments)
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function getComments(req,res){
  const {postId} = req.params
  try {
    const {rows:comments} = await getCommentsById(postId)
    res.status(200).send(comments)
  } catch (err) {
    res.status(500).send(err.message);
  }
}