import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import { followUserRepo, getUserByNameRepo, getUserRepo, insertSessionRepo, insertUserRepo, unfollowUserRepo, validateMailRepo } from '../repositories/user.repository.js';

dotenv.config();

export async function signIn(req, res) {
    const { email, password } = req.body;

    try {
        const user = await getUserRepo(null, email); // working as intended, no id here!
        if (user.rowCount === 0) return res.status(401).send('User not found');

        const passwordValidation = bcrypt.compareSync(password, user.rows[0].password);
        if (!passwordValidation) return res.status(401).send('Invalid password');

        const token = jwt.sign(
            {
                id: user.rows[0].id,
                email: user.rows[0].email,
            },
            process.env.SECRET_KEY
        );

        await insertSessionRepo(user.rows[0].id, token);

        const session = {
            token: token,
            id: user.rows[0].id,
            name: user.rows[0].name,
            photo: user.rows[0].photo,
            email: user.rows[0].email,
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
        if (validateMail.rowCount !== 0) return res.status(409).send('Email registered already!');
        const cryptPassword = bcrypt.hashSync(password, 10);
        const insertUser = await insertUserRepo(name, email, cryptPassword, photo);
        res.status(201).send(insertUser);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function signOut(req, res) {}


export async function getUserById(req, res) {
    const { id } = req.params;
    try {
        const { rows: [user] } = await getUserRepo(id, null);
        return res.send(user.name);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function getUserByName(req, res) {
    const { name } = req.body;
    try {
        const { rows: user } = await getUserByNameRepo(name);
        return res.send(user);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export const followUser = async (req, res) => {
    try {
        const followerId = res.locals.user.id;
        const { id } = req.params;

        const result = await followUserRepo(followerId, id);
        if(result.rowCount === 0) return res.status(400).send("Não foi possível realizar esta operação!");

        return res.sendStatus(201);
    } catch (error) {
        console.log(error);
        if(error.constraint === 'followers_userId_fkey') return res.status(404).send("Usuário inexistente!");

        return res.status(500).send(error.message);
    };
};

export const unfollowUser = async (req, res) => {
    try {
        const followerId = res.locals.user.id;
        const { id } = req.params;

        const result = await unfollowUserRepo(followerId, id);
        if(result.rowCount === 0) return res.status(400).send("Não foi possível realizar esta operação!");

        return res.sendStatus(204);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error.message);
    };
};