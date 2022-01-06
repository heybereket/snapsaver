import Queue from "bull";
import * as log from "../log";
import { jobQueueOptions } from "./config";
import { prisma } from "../connections/prisma";
import ss from "../snapsaver";
import memories from "../memories";

const SnapSaver = new ss();
const Memories = new memories();
const JOB_NAME = "DOWNLOAD";
export const downloadQueue = new Queue(JOB_NAME.toLowerCase(), jobQueueOptions);

export const downloadMemoriesJob = (data) => {
  return downloadQueue.add(data);
};

downloadQueue.process((job, done) => {
  log.event(`[${JOB_NAME}] job ${job.id} PROCESSING - ${job.data.email}`);

  // TODO: Handle errors, i.e. file expired, storage exceeded etc.
  SnapSaver.downloadMemoriesFromJson(
    job.data.email,
    job.data.startDate,
    job.data.endDate,
    job.data.type,
    job.data.googleAccessToken,
    done
  );
});

downloadQueue.on("completed", async (job, result) => {
  log.success(`[${JOB_NAME}] job ${job.id} COMPLETED - ${result.message}`);

  if (result.email) {
    await prisma.user.update({
      where: { email: result.email },
      data: { activeDownload: false },
    });
  }
});

downloadQueue.on("stalled", async (job) => {
  log.success(`[${JOB_NAME}] job ${job.id} STALLED`);
});

downloadQueue.on("paused", async (job) => {
  log.warn(`[${JOB_NAME}] job ${job.id} is PAUSED`);
});

downloadQueue.on("waiting", async (jobId) => {
  log.warn(`[${JOB_NAME}] job ${jobId} is WAITING`);
});

downloadQueue.on("lock-extension-failed", async (job) => {
  log.warn(`[${JOB_NAME}] job ${job.id} lock extension failed`);
});

downloadQueue.on("failed", async (job, err) => {
  log.error(`[${JOB_NAME}] job ${job.id} FAILED with error - ${err.message}`);
});
