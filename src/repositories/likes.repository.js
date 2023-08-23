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

export async function getRecentPostLikes(userId){
    return db.query(`
    SELECT u.name, u.id as userid, p.id as postid
    FROM (
        SELECT 
        "userId","postId", 
        ROW_NUMBER() OVER (
            PARTITION BY "postId" ORDER BY "createdAt" DESC) AS rn
        FROM likes WHERE "userId"<>$1
    ) AS ranked
    LEFT JOIN posts p ON ranked."postId"=p.id
    LEFT JOIN users u ON ranked."userId"=u.id
    WHERE rn <= 2
    ORDER BY p."createdAt"
    LIMIT 20;`,[userId])
}