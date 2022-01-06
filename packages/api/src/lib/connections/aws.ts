import { SES as ses } from "aws-sdk";

export const SES = new ses({
  region: "ca-central-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});