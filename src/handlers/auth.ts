import crypto from 'crypto';
import { Request, Response } from 'express';
import { pool } from "../database";
import jwt from "jsonwebtoken";
import { UserData } from "../interfaces";



export const signup = async(req: Request<{}, {}, UserData>, res: Response) => {
    console.log(req.body);
    let { name, email, password } = req.body;
    email = email.trim().toLowerCase();

    if (!email || !password) {
        res.status(400).send('Email and Password is required.');
    }


    const secret = crypto.randomBytes(32);
    const salt = crypto.randomBytes(16);
    const hash = crypto.scryptSync(password, salt, 64);

    try {
        const query = "INSERT INTO user_credentials (email, password_hash, password_salt, jwt_secret) VALUES ($1, $2, $3, $4) RETURNING user_id;";
        const result = await pool.query(query, [email, hash, salt, secret]);
        console.log(result);

        const query2 = 'INSERT INTO users (user_id, name, description) VALUES ($1, $2, $3);';
        const result2 = await pool.query(query2, [result.rows[0].user_id, name, 'New user.']);
        console.log(result2);

        return res.header('HX-Redirect', '/login').status(201).send('Signed up successfully.');
    } catch (e: any) {
        console.log(e);
        if (e.code === '23505') {
            return res.status(409).send('Email already exists.');
        } else {
            return res.status(500).send('Server Error. Please try again later.');
        }
    }
}



export const login = async(req: Request<{}, {}, UserData>, res: Response) => {
    console.log(req.body);
    let { email, password, remember } = req.body;
    email = email.trim().toLowerCase();

    if (!email || !password) {
        return res.status(400).send('Email and Password is required.');
    }


    let result;
    try {
        const query = "SELECT * FROM user_credentials WHERE email = $1;";
        result = await pool.query(query, [email]);
    } catch (e) {
        console.log(e);
        return res.status(500).send('Server Error. Please try again later.');
    }

    if (result.rows.length === 0) {
        return res.status(404).send('Email not found.');
    }


    const hash = crypto.scryptSync(password, result.rows[0].password_salt, 64);
    const id = result.rows[0].user_id;
    const secret = result.rows[0].jwt_secret;

    if (!hash.equals(result.rows[0].password_hash)) {
        return res.status(403).send('Incorrect password.');
    }


    const token = jwt.sign({ id, email }, secret);

    res.cookie('access_token', token, {
        httpOnly: true,
        maxAge: remember ? 7 * 24 * 60 * 60 * 1000 : undefined,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
    });

    res.header('HX-Redirect', '/').status(200).send('Logged in successfully.');
}



export const logout = (req: Request<{}, {}, UserData>, res: Response) => {
    res.set('HX-Redirect', '/login')
        .clearCookie('access_token')
        .status(200)
        .send('Logged out successfully.');
}