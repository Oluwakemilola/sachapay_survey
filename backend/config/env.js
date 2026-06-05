import {config} from 'dotenv';
config({path: `.env.${process.env.NODE_ENV || "development" }`});

export const {
DB_URL,
PORT
} = process.env;