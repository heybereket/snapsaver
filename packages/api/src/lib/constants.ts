export const MEGABYTE = 1000000;

// Enviornment Variables
export const PORT = process.env.PORT ?? 8080;
export const IS_PRODUCTION = process.env.NODE_ENV !== "development";
export const API_URL = process.env.API_URL
  ? `${process.env.API_URL}/v1`
  : "http://localhost:8080/v1";
export const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:3000";
export const S3_BUCKET = process.env.AWS_BUCKET_NAME as string;