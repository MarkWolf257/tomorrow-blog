import crypto from 'crypto';
import { Request, Response } from 'express';
import pool from "../db";

interface UserData {
    email: string;
    password: string;
}

export const createBlogger = async(req: Request<{}, {}, UserData>, res: Response) => {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();

    if (!email || !password) {
        res.status(400).json({error: "Email and Password is required"});
    } else {
        const salt = crypto.randomBytes(16).toString("hex");
        const hash = crypto.scryptSync(password, salt, 64);
        const query = "INSERT INTO bloggers (email, password, salt) VALUES ($1, $2, $3);";

        try {
            const result = await pool.query(query, [email, hash, salt]);
            console.log(result);
        } catch (error: any) {
            if (error.code === '23505') {
                res.status(409).json({error: "Email already exists."});
            } else {
                res.status(500).json({error: error.message});
            }
        }

        res.status(201).json({success: true, message: "Blogger created successfully."});
    }
}

export const authenticateBlogger = async(req: Request<{}, {}, UserData>, res: Response) => {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();

    if (!email || !password) {
        res.status(400).json({error: "Email and Password is required"});
    } else {
        const query = "SELECT * FROM bloggers WHERE email = $1;";
        const result = await pool.query(query, [email]);
        if (result.rows.length > 0) {
            const hash = crypto.scryptSync(password, result.rows[0].salt, 64);
            if (hash.equals(result.rows[0].password)) {
                res.status(200).json({success: true, message: "Blogger authenticated successfully."});
            } else {
                res.status(401).json({error: "Incorrect Password."});
            }
        } else {
            res.status(404).json({error: "Email not found."});
        }
    }
}