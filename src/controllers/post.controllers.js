import urlMetadata from "url-metadata";
import {
  createHashtagRepo, deleteHashtagByPostIdRepo, readHashtagsRepo
} from "../repositories/hashtag.repository.js";
import {
  createPostRepo, deletePostRepo, getPostById, readPostsByHashtagRepo, readPostsByUserIdRepo, readPostsRepo, updateTextRepo
} from "../repositories/post.repository.js";
import { getLikes, getRecentPostLikes, likePost, removeLikePost, verifyLike } from "../repositories/likes.repository.js";

const extractHashtags = (postId, text) => {
  const tags = text.match(/#[a-z0-9_]+/g);

  if(tags) return tags.map(tag => [postId, tag]);

  return null;
};

const extractMetadata = async (link) => (
  await urlMetadata(link).then(
    (metadata) => {
      return {
        url: metadata['og:url'],
        title: metadata['og:title'],
        description: metadata['og:description'],
        image: metadata['og:image']
      }
    },
    (err) => {
      return link;
    })
)

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

export const getPosts = async (req, res) => {
  const user = res.locals.user.id
  try {
    const { rows: posts, rowCount } = await readPostsRepo();
    if (rowCount === 0) return res.send([]);
    /*
    for (const post of posts) {
      post.link = await extractMetadata(post.link);
    }; 
    */
    const {rows: userLikes} = await getLikes(user)
    const {rows: postLikers} = await getRecentPostLikes(user)
    const likesArray = userLikes.map(obj => obj.postId)  
    const postsObj = posts.map((post,index) =>(
      { ...post,
        isLiked:likesArray.includes(post.id),
        liker1: postLikers[index*2].name,
        liker2: postLikers[index*2+1].name  
      }))
    console.log(postLikers)
    return res.send(postsObj);

  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
};

export const getPostsByHashtag = async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { rows: posts, rowCount } = await readPostsByHashtagRepo(hashtag);
    if (rowCount === 0) return res.send([]);
    /*
    for (const post of posts) {
      post.link = await extractMetadata(post.link);
    };
    */
    return res.send(posts);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export const getPostsByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: posts, rowCount } = await readPostsByUserIdRepo(id);
    if (rowCount === 0) return res.send([]);
    /*
    for (const post of posts) {
      post.link = await extractMetadata(post.link);
    };
    */
    return res.send(posts);
  } catch (err) {
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
  const likeCheck = await verifyLike(user,post)
  if(likeCheck.rowCount === 0){
    const like = await likePost(user,post)
    return res.status(201).send("Liked")
  }
  const noLike = await removeLikePost(user,post)
  return res.sendStatus(204)
}