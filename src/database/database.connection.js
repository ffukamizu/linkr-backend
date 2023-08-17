import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const configDatabase = {
    connectionString: process.env.DATABASE_URL,
    ssl: false,
};

if (process.env.NODE_ENV === 'production') configDatabase.ssl = true;

const db = new Pool(configDatabase);

try {
    await db.connect();
    
    console.log(`Database connected, environment: ${process.env.NODE_ENV}`);
} catch (err) {
    console.log('ERROR:', err);
}

export { db };
