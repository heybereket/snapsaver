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

downloadQueue.on("completed", async (job, result) => {
  log.success(`[${JOB_NAME}] job ${job.id} succeeded - ${result.message}`);

  if (result.email) {
    await prisma.user.update({
      where: { email: result.email },
      data: { activeDownload: false },
    });

    await Memories.deleteManyByEmail(result.email);
  }
});

downloadQueue.on("failed", (job, err) => {
  log.success(`[${JOB_NAME}] job ${job.id} failed with error - ${err.message}`);

  // TODO: Update DB
});
