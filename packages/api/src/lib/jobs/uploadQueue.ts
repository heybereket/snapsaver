import Queue from "bull";
import ss from "../snapsaver";
import * as log from "../log";
import { jobQueueOptions } from "./config";
import { downloadQueue } from "./downloadQueue";

const SnapSaver = new ss();
const JOB_NAME = "UPLOAD";
const uploadQueue = new Queue(JOB_NAME.toLowerCase(), jobQueueOptions);

export const uploadMemoriesJob = (data) => {
  return uploadQueue.add(data);
};

uploadQueue.process((job, done) => {
  log.event(
    `[${JOB_NAME}] job ${job.id} processing - ${job.data.email} - start ${job.data.startDate}, end ${job.data.endDate}, type ${job.data.type}`
  );

  SnapSaver.processMemoriesJsonInParallel(
    job.data.email,
    job.data.startDate,
    job.data.endDate,
    job.data.type,
    job.data.googleAccessToken,
    done
  );
});

uploadQueue.on("completed", (job, result) => {
  log.success(`[${JOB_NAME}] job ${job.id} succeeded - ${result.message}`);

  downloadQueue.add({
    email: result.email,
    startDate: result.startDate as string,
    endDate: result.endDate as string,
    type: result.type as string,
    googleAccessToken: result.googleAccessToken,
  });
});

uploadQueue.on("failed", (job, err) => {
  log.success(`[${JOB_NAME}] job ${job.id} failed with error - ${err.message}`);
});
