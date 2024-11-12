import {Request, Response, NextFunction} from "express";
import {MyPayload} from "./interfaces";
import jwt from "jsonwebtoken";
import {pool} from "./database";

const getToken = (req: Request) =>
    req.headers.cookie
        ?.split('; ')
        .map((cookie: string) => cookie.split('='))
        .find((cookie) => cookie[0] === 'access_token');

const verifyToken = async(token: string) : Promise<boolean> => {
    const { id } = <MyPayload>jwt.decode(token);
    const query = 'SELECT jwt_secret FROM user_credentials WHERE user_id = $1';
    const result = await pool.query(query, [id]);
    const secret = result.rows[0].jwt_secret;

    try {
        jwt.verify(token, secret);
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

export const checkIfAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const token = getToken(req);

    if (token) {
        verifyToken(token[1]).then((auth) => {
            res.locals.authenticated = auth;
            next();
        });
    } else {
        res.locals.authenticated = false;
        next();
    }
}

export const redirectIfNotAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    const token = getToken(req);

    if (token) {
        verifyToken(token[1]).then((auth) => {
            if (auth) next();
            else res.redirect('/login');
        });
    } else {
        return res.redirect('/login');
    }
}

export const redirectIfAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    const token = getToken(req);

    if (token) {
        verifyToken(token[1]).then((auth) => {
            if (auth) res.redirect('/');
            else next();
        });
    } else {
        next();
    }
}