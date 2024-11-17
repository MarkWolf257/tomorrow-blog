import {Request, Response, NextFunction} from "express";
import {MyPayload} from "./interfaces";
import jwt from "jsonwebtoken";
import {pool} from "./database";

const getToken = (req: Request) =>
    req.headers.cookie
        ?.split('; ')
        .map((cookie: string) => cookie.split('='))
        .find((cookie) => cookie[0] === 'access_token');

const verifyToken = async(token: string) : Promise<string | null> => {
    const { id } = <MyPayload>jwt.decode(token);
    const query = 'SELECT jwt_secret FROM user_credentials WHERE user_id = $1';
    const result = await pool.query(query, [id]);
    const secret = result.rows[0].jwt_secret;

    try {
        jwt.verify(token, secret);
        return id;
    } catch (e) {
        console.log(e);
        return null;
    }
}

export const verifyAuthentication = (req: Request, res: Response, next: NextFunction) => {
    const token = getToken(req);

    if (token) {
        verifyToken(token[1]).then((id) => {
            if (id) {
                res.locals.authenticated = true;
                res.locals.userId = id;
            } else {
                res.locals.authenticated = false;
            }

            next();
        });
    } else {
        res.locals.authenticated = false;
        next();
    }
}