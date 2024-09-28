import express, { Request, Response } from "express";
import {authenticateBlogger, createBlogger} from "./handlers/auth";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// app.get('/test', async (req: Request, res: Response) => {
//     const result = await pool.query("SELECT * FROM blogger_table;");
//     res.send(result);
// });

app.post("/create-blogger", createBlogger);
app.post("/authenticate-blogger", authenticateBlogger);

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});