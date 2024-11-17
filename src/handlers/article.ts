import {Request, Response} from "express";
import {ArticleData} from "../interfaces";
import {pool} from "../database";
import sanitizeHtml from 'sanitize-html';
import {mkdirSync, renameSync} from "node:fs";

export const createArticle = async(req: Request<{}, {}, ArticleData>, res: Response) => {
    const userId = res.locals.userId;
    let { title, content } = req.body;
    content = sanitizeHtml(content);
    console.log(req.file);
    
    
    if (!req.file || !req.file.path)
        return res.status(500).send('Unable to upload file.');
    else if (req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png')
        return res.status(404).send('Only jpeg or png images are allowed.');


    try {
        const query = 'INSERT INTO articles (user_id, title, content) VALUES ($1, $2, $3) RETURNING article_id;';
        const result = await pool.query(query, [userId, title, content]);

        mkdirSync(process.env.STORAGE + 'thumbnails/', {recursive: true});
        renameSync(req.file.path, process.env.STORAGE + 'thumbnails/' + result.rows[0].article_id + '.' + req.file.mimetype.split('/')[1]);
    } catch (e) {
        console.error(e);
        return res.status(500).send('Server Error. Please try again later.');
    }

    return res.status(201).redirect('/');
}