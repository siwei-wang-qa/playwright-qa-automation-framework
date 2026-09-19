import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });


const baseURL = process.env.BASE_URL;
const username = process.env.TEST_USERNAME;
const password = process.env.TEST_PASSWORD;

if (!baseURL || !username || !password) {
    throw new Error('Missing required environment variables');
}

export const env = {
    baseURL,
    username,
    password,
};