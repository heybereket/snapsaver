export const PORT = 8080;

// Times in seconds
export const SIX_HOURS = 3600 * 6;
export const HOUR = 3600;
export const DAY = HOUR * 24;
export const WEEK = DAY * 7;

// Environment Variables
export const IS_PRODUCTION = process.env.NODE_ENV !== 'development';
export const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:3000';
export const API_URL = process.env.API_URL ?? 'http://localhost:8080';
export const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? '';