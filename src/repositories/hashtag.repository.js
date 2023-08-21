import format from 'pg-format';
import { db } from '../database/database.connection.js';

export const createHashtagRepo = async (tags) => {
  return await db.query(format(`INSERT INTO hashtags ("postId", tag) VALUES %L;`, tags));
};

export const readHashtagsRepo = async () => {
  return await db.query(`
    SELECT tag, COUNT(tag) quantity
    FROM hashtags
    GROUP BY tag
    ORDER BY quantity DESC
    LIMIT 10;
  `);
};

export const deleteHashtagByPostIdRepo = async (postId) => {
  return await db.query(`DELETE FROM hashtags WHERE "postId" = $1`, [postId]);
};
