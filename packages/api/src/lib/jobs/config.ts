// TODO: Re-eval config settings to improve memory usage
export const jobQueueOptions = {
  removeOnSuccess: true,
  redis: {
    host: process.env.REDIS_DB_HOST,
    port: process.env.REDIS_DB_PORT,
    password: process.env.REDIS_DB_PASS,
  },
};
