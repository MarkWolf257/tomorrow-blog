import express, { Request, Response } from 'express';
import {authenticateBlogger, createBlogger} from './handlers/auth';

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.json());
app.use('/', express.static('public'));

app.get('/', (req: Request, res: Response) => {
    res.redirect('/login');
});

app.get('/login', (req: Request, res: Response) => {
    res.render('login');
})

app.post('/create-blogger', createBlogger);
app.post('/authenticate-blogger', authenticateBlogger);

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});