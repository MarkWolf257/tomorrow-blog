import dotenv from "dotenv";
dotenv.config();

import {initDB, pool} from "./database";
import express, { Request, Response } from 'express';
import {signup, login, logout} from './handlers/auth';
import { verifyAuthentication } from "./middlewares";
import {createArticle, renderArticle, renderArticles} from "./handlers/article";
import multer from 'multer';
import {renderProfile, updateProfile} from "./handlers/profile";


initDB().then(() => console.log('Database successfully initialized.'));

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ dest: 'userdata/' });


app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', express.static('public'));
app.use('/userdata', express.static('userdata'));
app.use('/modules/htmx', express.static('node_modules/htmx.org/dist'));
app.use('/modules/quill', express.static('node_modules/quill/dist'));

app.use(verifyAuthentication);


app.get('/', renderArticles);
app.get('/article/:id', renderArticle);
app.get('/profile', renderProfile);

app.get('/editor', (req: Request, res: Response) => {
    if (res.locals.authenticated)
        return res.render('editor');
    return res.redirect('/login');
});

app.get('/login', (req: Request, res: Response) => {
    if (res.locals.authenticated)
        return res.redirect('/');
    return res.render('login');
});

app.get('/signup', (req: Request, res: Response) => {
    if (res.locals.authenticated)
        return res.redirect('/');
    return res.render('signup');
});

app.post('/login', login);
app.post('/signup', signup);
app.post('/logout', logout);
app.post('/profile/update', upload.single('avatar'), updateProfile);
app.post('/article/create', upload.single('thumbnail'), createArticle);



app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});