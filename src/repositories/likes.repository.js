import { db } from "../database/database.connection.js";

export async function verifyLike(user,post){
    return db.query(
        `SELECT 
            *
        FROM
            likes 
        WHERE 
            "userId"=$1 
        AND 
            "postId"=$2
            `,
        [user,post]
    )
}

export async function likePost(user,post){
    return db.query(
        `INSERT INTO likes ("userId","postId") VALUES ($1,$2)`,[user,post]
    )
}

export async function removeLikePost(user,post){
    return db.query(
        `DELETE FROM likes WHERE "userId"=$1 AND "postId"=$2`,[user,post]
    )
}

export async function getLikes(user){
    return db.query(
        `SELECT "postId" FROM likes WHERE "userId"=$1`,[user]
    )
}