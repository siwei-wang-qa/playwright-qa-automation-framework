import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });


const baseURL = process.env.BASE_URL;
const apiBaseURL = process.env.API_BASE_URL;
const username = process.env.TEST_USERNAME;
const password = process.env.TEST_PASSWORD;
const bookerUiBaseURL = process.env.BOOKER_UI_BASE_URL;
const bookerApiBaseURL = process.env.BOOKER_API_BASE_URL;

if (!baseURL || !username || !password) {
    throw new Error('Missing required environment variables');
}

if (!apiBaseURL) {
    throw new Error('Missing API required environment variables');
}

export const env = {
    baseURL,
    username,
    password,
    apiBaseURL,
    bookerUiBaseURL,
    bookerApiBaseURL,
};