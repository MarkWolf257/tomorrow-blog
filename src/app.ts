import { initDB } from "./database";
import express, { Request, Response } from 'express';
import {signup, login, logout} from './handlers/auth';
import {checkIfAuthenticated} from "./middlewares";


initDB().then(() => console.log('Database successfully initialized.'));

const app = express();
const port = process.env.PORT || 3000;


app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', express.static('public'));
app.use('/modules/htmx', express.static('node_modules/htmx.org/dist'));
app.use('/modules/quill', express.static('node_modules/quill/dist'));


const routes = {
    authenticatedPages: [
        { path: '/', view: 'index' },
        { path: '/editor', view: 'editor' },
    ],
    notAuthenticatedPages: [
        { path: '/login', view: 'login' },
        { path: '/signup', view: 'signup' },
    ],
    postApis: [
        { path: '/login', handler: login },
        { path: '/signup', handler: signup },
        { path: '/logout', handler: logout },
    ],
}

app.use(checkIfAuthenticated);

for (let route of routes.authenticatedPages) {
    app.get(route.path, (req: Request, res: Response) => {
        if (res.locals.authenticated)
            return res.render(route.view);
        res.redirect('/login');
    });
}

for (let route of routes.notAuthenticatedPages) {
    app.get(route.path, (req: Request, res: Response) => {
        if (res.locals.authenticated)
            return res.redirect('/');
        res.render(route.view);
    });
}

for (let route of routes.postApis) {
    app.post(route.path, route.handler);
}


app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});