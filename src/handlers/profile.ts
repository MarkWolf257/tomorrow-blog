import { Request, Response } from 'express';
import {pool} from "../database";
import {UserProfile} from "../interfaces";
import {mkdirSync, renameSync} from "node:fs";

export const updateProfile = async(req: Request<{}, {}, UserProfile>, res: Response) => {
    const { name, description } = req.body;

    if (req.file && req.file.mimetype !== 'image/png')
        return res.status(404).send('Only png images are allowed.');

    try {
        const query = 'UPDATE users SET name = $1, description = $2 WHERE user_id = $3;';
        await pool.query(query, [name, description, res.locals.userId]);

        if (req.file && req.file.path) {
            mkdirSync('userdata/avatars/', {recursive: true});
            renameSync(req.file.path, 'userdata/avatars/' + res.locals.userId + '.png');
        }
        return res.status(200).send('Profile updated successfully.');
    } catch (e) {
        console.log(e);
        return res.status(500).send('Server Error. Please try again later.');
    }
}


export const renderProfile = async(req: Request, res: Response) => {
    if (!res.locals.authenticated)
        return res.redirect('/login');

    const query = 'SELECT * FROM users WHERE user_id = $1;'
    const result = await pool.query(query, [res.locals.userId]);
    return res.render('profile', {
        avatar: '/userdata/avatars/' + result.rows[0].user_id + '.png',
        name: result.rows[0].name,
        description: result.rows[0].description,
    })
}