import jwt from 'jsonwebtoken';
import { getUserRepo } from '../repositories/user.repository.js';

export default async function validateAuth(req, res, next) {
    const { authorization } = req.headers;

    const token = authorization?.replace('Bearer ', '');

    if (!token) return res.status(401).send('Please, sign-in again');

    try {
        const { id, email } = jwt.verify(token, process.env.SECRET_KEY);

        const user = await getUserRepo(id, email);

        if (user.rowCount === 0) return res.status(401).send('Token is invalid');

        delete user.rows[0].email;
        delete user.rows[0].password;

        res.locals.user = user.rows[0];
    } catch (error) {
        if (error.name === 'JsonWebTokenError') return res.status(401).send('Authentication error');

        return res.status(500).send(error.message);
    }

    next();
}
