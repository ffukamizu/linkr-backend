import bcrypt from 'bcrypt';
import { validateMailRepo, insertUserRepo } from '../repositories/user.repository.js';

export async function signIn(req,res){
    res.send("Sign-in")
}

export async function signUp(req,res){
    const {name, email, password, photo} = req.body
    try {
        const validateMail = await validateMailRepo(email)
        if(validateMail.rowCount !== 0) return res.status(409).send("Email já cadastrado")
        const cryptPassword = bcrypt.hashSync(password, 10)
        const insertUser = await insertUserRepo(name, email, cryptPassword, photo)
        res.status(201).send(insertUser)
    } catch (err) {
        res.status(500).send(err.message)
    }
}