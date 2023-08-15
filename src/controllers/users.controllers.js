import bcrypt from 'bcrypt';
import {db} from "../database/database.connection.js";

export async function signIn(req,res){
    res.send("Sign-in")
}

export async function signUp(req,res){
    const {name, email, password, photo} = req.body
    try {
        //const validateMail = await db.query(`SELECT * FROM users WHERE email=$1;`,[email])
        //if(validateMail.rowCount !== 0) return res.status(409).send("Email já cadastrado")
        const cryptPassword = bcrypt.hashSync(password, 10)
        //const insertUser = await db.query(`INSERT INTO users (name,email,password,photo) VALUES ($1,$2,$3);`,[name,email,cryptPassword,photo])
        res.status(201).send("Sign-up")
    } catch (err) {
        res.status(500).send(err.message)
    }
}