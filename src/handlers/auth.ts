import crypto from 'crypto';
import { Request, Response } from 'express';
import { pool } from "../database";
import jwt from "jsonwebtoken";
import { UserData } from "../interfaces";



export const signup = async(req: Request<{}, {}, UserData>, res: Response) => {
    console.log(req.body);
    let { email, password } = req.body;
    email = email.trim().toLowerCase();

    if (!email || !password) {
        res.status(400).json({error: "Email and Password is required."});
    }


    const secret = crypto.randomBytes(32);
    const salt = crypto.randomBytes(16);
    const hash = crypto.scryptSync(password, salt, 64);
    const query = "INSERT INTO user_credentials (email, password_hash, password_salt, jwt_secret) VALUES ($1, $2, $3, $4);";

    try {
        const result = await pool.query(query, [email, hash, salt, secret]);
        console.log(result);
        res.status(201).json({success: true, message: "Account created successfully."});
    } catch (e: any) {
        console.log(e);
        if (e.code === '23505') {
            res.status(409).render('partials/toast', { icon:'/icons/circle-exclamation-solid.svg', message:'Email already exists.' });
        } else {
            res.status(500).render('partials/toast', { icon:'/icons/circle-exclamation-solid.svg', message:'Server Error. Please try again later.' });
        }
    }
}



export const login = async(req: Request<{}, {}, UserData>, res: Response) => {
    console.log(req.body);
    let { email, password, remember } = req.body;
    email = email.trim().toLowerCase();

    if (!email || !password) {
        return res.status(400).json({error: "Email and Password is required."});
    }


    let result;
    try {
        const query = "SELECT * FROM user_credentials WHERE email = $1;";
        result = await pool.query(query, [email]);
    } catch (e) {
        console.log(e);
        return res.status(500).render('partials/toast', { icon:'/icons/circle-exclamation-solid.svg', message:'Server Error. Please try again later.' });
    }

    if (result.rows.length === 0) {
        return res.status(404).render('partials/toast', {
            icon:'/icons/circle-exclamation-solid.svg',
            message:'Email not found.'
        });
    }


    const hash = crypto.scryptSync(password, result.rows[0].password_salt, 64);
    const id = result.rows[0].user_id;
    const secret = result.rows[0].jwt_secret;

    if (!hash.equals(result.rows[0].password_hash)) {
        return res.status(403).render('partials/toast', {
            icon: '/icons/circle-exclamation-solid.svg',
            message: 'Incorrect password.'
        });
    }


    const token = jwt.sign({ id, email }, secret);

    res.set('HX-Redirect', '/');
    res.status(200).cookie('access_token', token, {
        httpOnly: true,
        maxAge: remember ? 7 * 24 * 60 * 60 * 1000 : undefined,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
    }).end();
}



export const logout = (req: Request<{}, {}, UserData>, res: Response) => {
    res.set('HX-Redirect', '/login')
        .clearCookie('access_token')
        .status(200)
        .end();
}