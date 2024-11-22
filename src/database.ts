import { Pool } from 'pg';


export const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.DB_HOST,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: parseInt(process.env.DB_PORT as string, 10),
});


export const initDB = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            user_id UUID PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS user_credentials (
            user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash BYTEA NOT NULL,
            password_salt BYTEA NOT NULL,
            jwt_secret BYTEA NOT NULL
        );
    
        CREATE TABLE IF NOT EXISTS articles (
            article_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL
        );
    `;

    await pool.query(query);
}