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

export const getPostById = async (id) => {
  return await db.query(`SELECT * FROM posts WHERE id = $1`, [id]);
};

export const readPostsRepo = async () => {
  return await db.query(`
    SELECT ${POST_ARGS}, to_json(u.*) user 
    FROM (SELECT p.*, COUNT(l) likes FROM posts p
    FULL JOIN likes l ON l."postId" = p.id
    GROUP BY p.id
    ORDER BY p."createdAt" DESC 
    LIMIT 20) p
    JOIN (SELECT ${USER_ARGS} FROM users u)u ON p."userId" = u.id;
  `);
};
export const readPostsByHashtagRepo = async (hashtag) => {
  return await db.query(`
    SELECT ${POST_ARGS}, to_json(u.*) user 
    FROM (SELECT p.*, COUNT(l) likes FROM posts p
    FULL JOIN likes l ON l."postId" = p.id
    JOIN hashtags h ON h."postId" = p.id
    WHERE h.tag = $1
    GROUP BY p.id
    ORDER BY p."createdAt" DESC
    LIMIT 20) p
    JOIN (SELECT ${USER_ARGS} FROM users u)u ON p."userId" = u.id;
  `, ['#' + hashtag]);
};

export const updateTextRepo = async (id, text) => {
  return await db.query(`UPDATE posts SET text = $2 WHERE id = $1`, [id, text]);
};

export const deletePostRepo = async (id, userId) => {
  return await db.query(`DELETE FROM posts WHERE id = $1 AND "userId" = $2`, [id, userId]);
};
