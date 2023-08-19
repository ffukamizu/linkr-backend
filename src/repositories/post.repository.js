import { db } from "../database/database.connection.js";

export const createPostRepo = async (text = '', link, userId) => {
  return await db.query(`
    INSERT INTO posts (text, link, "userId") VALUES ($1, $2, $3) RETURNING id;
  `, [text, link, userId]);
};

export const getPostById = async (id) => {
  return await db.query(`SELECT * FROM posts WHERE id = $1`, [id]);
};

export const readPostRepo = async () => {
  return await db.query(`
    SELECT p.id, p.text, p.link, p."createdAt", to_json(u.*) user FROM posts p
    JOIN (SELECT u.id, u.name, u.photo, u."createdAt" FROM users u)u 
      ON p."userId" = u.id
    ORDER BY p."createdAt" DESC LIMIT 20;
  `);
};

export const deletePostRepo = async (id, userId) => {
  return await db.query(`DELETE FROM posts WHERE id = $1 AND "userId" = $2`, [id, userId]);
};