import Queue from "bee-queue";
import ss from "../snapsaver";
import * as log from "../log";
import { jobQueueOptions } from "./config";

const SnapSaver = new ss();
const JOB_NAME = "UPLOAD";
const uploadQueue = new Queue(JOB_NAME.toLowerCase(), jobQueueOptions);

export const uploadMemoriesJob = (data) => {
  return uploadQueue.createJob(data).save();
};

uploadQueue.process((job, done) => {
  log.event(`[${JOB_NAME}] job ${job.id} processing - ${job.data.email}`);

  SnapSaver.processMemoriesJsonInParallel(
    job.data.email,
    job.data.memoriesJson,
    done
  );
});

uploadQueue.on("job succeeded", (jobId, result) => {
  log.success(`[${JOB_NAME}] job ${jobId} succeeded - ${result.message}`);
});

uploadQueue.on("job retrying", (jobId, err) => {
  log.error(
    `[${JOB_NAME}] job ${jobId} failed but is being retried, err - ${err.message}`
  );
});

uploadQueue.on("job failed", (jobId, err) => {
  log.success(`[${JOB_NAME}] job ${jobId} failed with error - ${err.message}`);
});
