// TODO: Re-eval config settings to improve memory usage
export const jobQueueOptions = {
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 10 // Keep last 10 failed jobs
  },
  settings: {
    stalledInterval: 0, // Don't check for stalled jobs (adding b/c our jobs can take >30 min)
  }
};
