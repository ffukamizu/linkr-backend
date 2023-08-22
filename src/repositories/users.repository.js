import { db } from '../database/database.connection.js';

export async function getUserRepo(id, email) {
    return db.query(
        `SELECT 
            * 
        FROM 
            users 
        WHERE 
            users.id= $1 
        OR
            users.email= $2;
            `,
        [id, email]
    );
}

export async function getUserByNameRepo(name) {
    return db.query(`SELECT id, name, photo FROM users WHERE name ILIKE $1 || '%';`, [name]);
}

export async function insertUserRepo(name, email, cryptPassword, photo) {
    return db.query(
        `INSERT INTO 
            users (name, email, password, photo) 
        VALUES 
            ($1, $2, $3, $4);
        `,
        [name, email, cryptPassword, photo]
    );
}

export async function insertSessionRepo(id, token) {
    return db.query(
        `INSERT INTO 
            sessions ("userId", "token")
        VALUES
            ($1, $2);
        `,
        [id, token]
    );
}

export async function validateMailRepo(email) {
    return db.query(
        `SELECT 
            * 
        FROM 
            users 
        WHERE 
            email=$1;
        `,
        [email]
    );
}
