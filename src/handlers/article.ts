import {Request, Response} from "express";
import {ArticleData} from "../interfaces";
import {pool} from "../database";
import sanitizeHtml from 'sanitize-html';
import {mkdirSync, renameSync} from "node:fs";

export const createArticle = async(req: Request<{}, {}, ArticleData>, res: Response) => {
    const userId = res.locals.userId;
    let { title, content } = req.body;
    content = sanitizeHtml(content.slice(1, -1));   // Slice to remove double quotes
    console.log(content);
    
    
    if (!req.file || !req.file.path)
        return res.status(500).send('Unable to upload file.');
    else if (req.file.mimetype !== 'image/png')
        return res.status(404).send('Only png images are allowed.');


    try {
        const query = 'INSERT INTO articles (user_id, title, content) VALUES ($1, $2, $3) RETURNING article_id;';
        const result = await pool.query(query, [userId, title, content]);

        mkdirSync('userdata/thumbnails/', {recursive: true});
        renameSync(req.file.path, 'userdata/thumbnails/' + result.rows[0].article_id + '.png');
    } catch (e) {
        console.error(e);
        return res.status(500).send('Server Error. Please try again later.');
    }

    return res.header('HX-Redirect', '/').status(201).send('Article posted successfully.');
}


export const renderArticles = async(req: Request, res: Response) => {
    if (!res.locals.authenticated)
        return res.redirect('/login');

    let users, articles;
    try {
        users = await pool.query('SELECT * FROM users;');
        articles = await pool.query('SELECT * FROM articles');

        if (!users || !articles)
            throw new Error();

        let userMap: { [key: string]: string } = {};
        for (let user of users.rows) {
            userMap[user.user_id] = user.name;
        }

        const data = articles.rows.map((obj) => { return {
            link: '/article/' + obj.article_id,
            thumbnail: '/userdata/thumbnails/' + obj.article_id + '.png',
            title: obj.title,
            avatar: '/userdata/avatars/' + obj.user_id + '.png',
            author: userMap[obj.user_id]
        }});
        return res.render('index', { articles: data });
    } catch (e) {
        console.log(e);
        return res.status(500).send('Server Error. Please try again later.');
    }
}


export const renderArticle = async(req: Request, res: Response) => {
    if (!res.locals.authenticated)
        return res.redirect('/login');

    try {
        const query = 'SELECT * FROM articles WHERE article_id = $1;';
        const result = await pool.query(query, [req.params.id]);
        const query2 = 'SELECT * FROM users WHERE user_id = $1;';
        const result2 = await pool.query(query2, [result.rows[0].user_id]);

        return res.render('article', {
            title: result.rows[0].title,
            content: result.rows[0].content,
            avatar: '/userdata/avatars/' + result.rows[0].user_id + '.png',
            author: result2.rows[0].name,
            description: result2.rows[0].description,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).send('Server Error. Please try again later.');
    }
}