import { Status, Type } from "@prisma/client";
import { prisma } from "./connections/prisma";
import * as log from "../lib/log";

class Memories {
  getManyWhere = async (query: object) => {
    try {
      return await prisma.memory.findMany({
        where: query,
      });
    } catch (err) {
      log.error(`Error in getManyWhere`, err);
    }
  };

  getAllMemories = async (email: string) => {
    return this.getManyWhere({ email });
  };

  getPendingMemories = async (email: string) => {
    return this.getManyWhere({ email, status: Status.PENDING });
  };

  createMemories = async (memories: any[]) => {
    try {
      console.log("memories", memories)
      return await prisma.memory.createMany({
        data: memories,
        skipDuplicates: true,
      })
    } catch (err) {
      log.error(err);
    }
  }

  addOrUpdateMemory = async (
    email: string,
    date: string,
    type: Type,
    snapchatLink: string,
    downloadLink: string
  ) => {
    // TODO: First check if [date, type] is a good unique constraint.
    // If so, add a multi-column unique constraint on [date, type],
    // and upsert new entries (aka update or create if not exists)
    try {
      const entry = {
        email,
        date: new Date(date),
        type,
        snapchatLink,
        downloadLink,
      };

      await prisma.memory.create({
        data: entry,
      });
    } catch (err) {
      log.error(err);
    }
  };

  updateMemoryStatusSuccess = async (id: number) => {
    try {
      await prisma.memory.update({
        where: { id },
        data: { status: Status.SUCCESS },
      });
    } catch (err) {
      log.error(err);
    }
  };
}

export default Memories;
