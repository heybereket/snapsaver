import Queue from "bull";
import ss from "../snapsaver";
import * as log from "../log";
import { jobQueueOptions } from "./config";

const SnapSaver = new ss();
const JOB_NAME = "UPLOAD";
const uploadQueue = new Queue(JOB_NAME.toLowerCase(), jobQueueOptions);

export const uploadMemoriesJob = (data) => {
  return uploadQueue.add(data);
};

uploadQueue.process((job, done) => {
  log.event(`[${JOB_NAME}] job ${job.id} processing - ${job.data.email}`);

  SnapSaver.processMemoriesJsonInParallel(
    job.data.email,
    job.data.memoriesJson,
    done
  );
});

uploadQueue.on("completed", (jobId, result) => {
  log.success(`[${JOB_NAME}] job ${jobId} succeeded - ${result.message}`);
});

uploadQueue.on("failed", (jobId, err) => {
  log.success(`[${JOB_NAME}] job ${jobId} failed with error - ${err.message}`);
});
