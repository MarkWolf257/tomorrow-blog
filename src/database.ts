import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.DB_HOST,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: parseInt(process.env.DB_PORT as string, 10),
});


export const initDB = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS user_credentials (
            user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash BYTEA NOT NULL,
            password_salt BYTEA NOT NULL,
            jwt_secret BYTEA NOT NULL
        );
    `;

    await pool.query(query);
}