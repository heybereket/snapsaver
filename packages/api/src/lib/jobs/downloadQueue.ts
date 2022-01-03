import Queue from "bee-queue";
import * as log from "../log";
import { jobQueueOptions } from "./config";
import { prisma } from "../connections/prisma";
import ss from "../snapsaver";
import memories from "../memories";

const SnapSaver = new ss();
const Memories = new memories();
const JOB_NAME = "DOWNLOAD";
const downloadQueue = new Queue(JOB_NAME.toLowerCase(), jobQueueOptions);

export const downloadMemoriesJob = (data) => {
  return downloadQueue.createJob(data).save();
};

downloadQueue.process((job, done) => {
  log.event(`[${JOB_NAME}] job ${job.id} processing - ${job.data.email}`);

  // TODO: Handle errors, i.e. file expired, storage exceeded etc.
  SnapSaver.downloadMemories(
    job.data.email,
    job.data.startDate,
    job.data.endDate,
    job.data.type,
    job.data.googleAccessToken,
    done
  );
});

downloadQueue.on("job succeeded", async (jobId, result) => {
  log.success(`[${JOB_NAME}] job ${jobId} succeeded - ${result.message}`);

  if (result.email) {
    await prisma.user.update({
      where: { email: result.email },
      data: { activeDownload: false },
    });

    await Memories.deleteManyByEmail(result.email);
  }
});

downloadQueue.on("job retrying", (jobId, err) => {
  log.error(
    `[${JOB_NAME}] job ${jobId} failed but is being retried, err - ${err.message}`
  );
  // TODO: Update DB
});

downloadQueue.on("job failed", (jobId, err) => {
  log.success(`[${JOB_NAME}] job ${jobId} failed with error - ${err.message}`);

  // TODO: Update DB
});
