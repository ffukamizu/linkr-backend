import { db } from "../database/database.connection.js";
import format from "pg-format";

export const createHashtagRepo = async (tags) => {
  return await db.query(format(`INSERT INTO hashtags ("postId", tag) VALUES %L;`, tags));
};

export const deleteHashtagByPostIdRepo = async (postId) => {
  return await db.query(`DELETE FROM hashtags WHERE "postId" = $1`, [postId]);
};