import { db } from '../database/database.connection.js';


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
  ${WITH_POSTS}
    SELECT pp.*, to_json(u.*) "owner" FROM POSTS pp
    JOIN PUBLIC.POSTS p ON pp.id = p.id
    JOIN USERS u ON p."userId" = u.id
    WHERE p."userId" = $1 OR p."userId" IN (
      SELECT "followerId" FROM PUBLIC.FOLLOWERS f WHERE f."userId" = $1
    )
    ORDER BY pp."createdAt" DESC
  `,[userId]);
};
export const readPostsByHashtagRepo = async (userId, hashtag) => {
  return await db.query(`
  ${WITH_POSTS}
    SELECT pp.*, to_json(u.*) "owner" FROM POSTS pp
    JOIN PUBLIC.POSTS p ON pp.id = p.id
    JOIN USERS u ON p."userId" = u.id
    JOIN hashtags h ON h."postId" = pp.id
    WHERE h.tag = $2
    ORDER BY pp."createdAt" DESC  
  `, [userId, '#' + hashtag]);
};

export const readPostsByUserIdRepo = async (userId, ByUserId) => {
  return await db.query(`
  ${WITH_POSTS}
    SELECT u.id, u.name, u.photo, u."createdAt",
      (
        SELECT COALESCE(json_agg(p ORDER BY p."createdAt" DESC), '[]') "posts"
        FROM POSTS p
        JOIN PUBLIC.POSTS pp ON p.id = pp.id
        WHERE pp."userId" = u.id
      )
    FROM USERS u
    WHERE u.id = $2;
  `, [userId, ByUserId]);
};

export const updateTextRepo = async (id, text) => {
  return await db.query(`UPDATE posts SET text = $2 WHERE id = $1`, [id, text]);
};

export const deletePostRepo = async (id, userId) => {
  return await db.query(`DELETE FROM posts WHERE id = $1 AND "userId" = $2`, [id, userId]);
};

const WITH_POSTS = `
WITH "users" AS (
  SELECT u.id, u.name, u.photo, u."createdAt" FROM users u
), "ranked" AS (
  SELECT "userId","postId", 
  ROW_NUMBER() OVER (
      PARTITION BY "postId" ORDER BY "createdAt" DESC) AS rn
  FROM likes WHERE "userId"<>$1
), "posts" AS (
  SELECT p.id, p.text, p.link, p.likes, EXISTS (
    SELECT 1 FROM likes WHERE "postId" = p.id AND "userId" = $1
    ) AS "isLiked", fliker.uname mrliker, sliker.uname srliker, p."createdAt"
  FROM (SELECT p.*, COUNT(l) likes FROM posts p
  FULL JOIN likes l ON l."postId" = p.id
  GROUP BY p.id
  LIMIT 10) p
  LEFT JOIN(SELECT u.name as uname, u.id as userid, p.id as postid
  FROM "ranked"
  LEFT JOIN posts p ON ranked."postId"=p.id
  LEFT JOIN users u ON ranked."userId"=u.id
  WHERE rn = 1 
  ORDER BY p."createdAt"
  LIMIT 10) AS fliker ON fliker."postid"=p.id
  LEFT JOIN(SELECT u.name as uname, u.id as userid, p.id as postid
  FROM "ranked"
  LEFT JOIN posts p ON ranked."postId"=p.id
  LEFT JOIN users u ON ranked."userId"=u.id
  WHERE rn = 2 
  ORDER BY p."createdAt"
  LIMIT 10) AS sliker ON sliker."postid"=p.id
  ORDER BY p."createdAt" DESC
)
`
