import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import insertSessionRepo, { validateMailRepo, insertUserRepo, getUserRepo } from '../repositories/user.repository.js';

dotenv.config();

export async function signIn(req, res) {
    const { email, password } = req.body;

    try {
        const user = await getUserRepo(id, email); // working as intended, no id here!
        if (user.rowCount === 0) return res.status(401).send('User not found');

        const passwordValidation = bcrypt.compareSync(password, user.rows[0].password);
        if (!passwordValidation) return res.status(401).send('Invalid password');

        const token = jwt.sign(
            {
                id: user.rows[0].id,
                email: user.rows[0].email,
            },
            process.env.JWT_SECRET
        );

        await insertSessionRepo(user.rows[0].id, token);

        const session = {
            id: user.rows[0].id,
            token: token,
        };

        res.status(200).send(session);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function signUp(req, res) {
    const { name, email, password, photo } = req.body;
    try {
        const validateMail = await validateMailRepo(email);
        if (validateMail.rowCount !== 0) return res.status(409).send('Email já cadastrado');
        const cryptPassword = bcrypt.hashSync(password, 10);
        const insertUser = await insertUserRepo(name, email, cryptPassword, photo);
        res.status(201).send(insertUser);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function signOut(req, res) {}
