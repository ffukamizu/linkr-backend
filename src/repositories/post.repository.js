import { db } from "../database/database.connection.js";

export const createPostRepo = async (text = '', link, userId) => {
  return await db.query(`
    INSERT INTO posts (text, link, "userId") VALUES ($1, $2, $3) RETURNING id;
  `, [text, link, userId]);
};