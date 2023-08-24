import { db } from '../database/database.connection.js';

const POST_ARGS = `p.id, p.text, p.link, p."createdAt", p.likes`;
const USER_ARGS = `u.id, u.name, u.photo, u."createdAt"`;

export const createPostRepo = async (text = '', link, userId) => {
  return await db.query(
    `
    INSERT INTO posts (text, link, "userId") VALUES ($1, $2, $3) RETURNING id;
  `,
    [text, link, userId]
  );
};

export const createRespostRepo = async (postId, userId) => {
  return await db.query(`INSERT INTO reposts ("postId", "userId") VALUES ($1, $2)`, [postId, userId]);
};

export const getPostById = async (id) => {
  return await db.query(`SELECT * FROM posts WHERE id = $1`, [id]);
};

export const readPostsRepo = async (userId) => {
  return await db.query(`
  SELECT p.id, p.text, p.link, p."createdAt", p.likes, to_json(u.*) "user", fliker.uname as mrliker, sliker.uname as srliker
  FROM (SELECT p.*, COUNT(l) likes FROM posts p
  FULL JOIN likes l ON l."postId" = p.id
  GROUP BY p.id
  LIMIT 10) p
  JOIN (SELECT u.id, u.name, u.photo, u."createdAt" FROM users u)u ON p."userId" = u.id
  LEFT JOIN(SELECT u.name as uname, u.id as userid, p.id as postid
  FROM (
      SELECT 
      "userId","postId", 
      ROW_NUMBER() OVER (
          PARTITION BY "postId" ORDER BY "createdAt" DESC) AS rn
      FROM likes WHERE "userId"<>$1
  ) AS ranked
  LEFT JOIN posts p ON ranked."postId"=p.id
  LEFT JOIN users u ON ranked."userId"=u.id
  WHERE rn = 1 
  ORDER BY p."createdAt"
  LIMIT 10) AS fliker ON fliker."postid"=p.id
  LEFT JOIN(SELECT u.name as uname, u.id as userid, p.id as postid
  FROM (
      SELECT 
      "userId","postId", 
      ROW_NUMBER() OVER (
          PARTITION BY "postId" ORDER BY "createdAt" DESC) AS rn
      FROM likes WHERE "userId"<>$1
  ) AS ranked
  LEFT JOIN posts p ON ranked."postId"=p.id
  LEFT JOIN users u ON ranked."userId"=u.id
  WHERE rn = 2 
  ORDER BY p."createdAt"
  LIMIT 10) AS sliker ON sliker."postid"=p.id
  ORDER BY p."createdAt" DESC;
  `,[userId]);
};
export const readPostsByHashtagRepo = async (hashtag) => {
  return await db.query(`
    SELECT ${POST_ARGS}, to_json(u.*) "user" 
    FROM (SELECT p.*, COUNT(l) likes FROM posts p
    FULL JOIN likes l ON l."postId" = p.id
    JOIN hashtags h ON h."postId" = p.id
    WHERE h.tag = $1
    GROUP BY p.id
    LIMIT 10) p
    JOIN (SELECT ${USER_ARGS} FROM users u)u ON p."userId" = u.id
    ORDER BY p."createdAt" DESC;
  `, ['#' + hashtag]);
};

export const readPostsByUserIdRepo = async (userId) => {
  return await db.query(`
    SELECT ${POST_ARGS}, to_json(u.*) "user" 
    FROM (SELECT p.*, COUNT(l) likes FROM posts p
    FULL JOIN likes l ON l."postId" = p.id
    WHERE p."userId" = $1
    GROUP BY p.id
    LIMIT 10) p
    JOIN (SELECT ${USER_ARGS} FROM users u)u ON p."userId" = u.id
    ORDER BY p."createdAt" DESC;
  `, [userId]);
};

export const updateTextRepo = async (id, text) => {
  return await db.query(`UPDATE posts SET text = $2 WHERE id = $1`, [id, text]);
};

export const deletePostRepo = async (id, userId) => {
  return await db.query(`DELETE FROM posts WHERE id = $1 AND "userId" = $2`, [id, userId]);
};
