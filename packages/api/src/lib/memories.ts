import { Memory, Status, Type, User } from "@prisma/client";
import { prisma } from "./connections/prisma";
import * as log from "../lib/log";

interface Memories {
  getManyWhere: (query: object) => Promise<Memory[] | undefined>;
  getAllMemories: (email: string) => Promise<Memory[] | undefined>;
  getPendingMemories: (email: string) => Promise<Memory[] | undefined>;
  getSuccessfulMemories: (email: string) => Promise<Memory[] | undefined>;
  updateMemoryStatusSuccess: (id: number) => Promise<void>;
  createMemories: (memories: any[]) => Promise<void>;
  addOrUpdateMemory: (
    email: string,
    date: string,
    type: Type,
    snapchatLink: string,
    downloadLink: string
  ) => Promise<void>;
  deleteManyByEmail: (email: string) => Promise<void>;
}

class Memories implements Memories {
  getManyWhere = async (query: object): Promise<Memory[] | undefined> => {
    try {
      return await prisma.memory.findMany({
        where: query,
      });
    } catch (err) {
      log.error(`Error in getManyWhere`, err);
    }
  };

  getAllMemories = async (email: string): Promise<Memory[] | undefined> => {
    return await this.getManyWhere({ email });
  };

  getMemories = async (
    email: string,
    status: Status
  ): Promise<Memory[] | undefined> => {
    return this.getManyWhere({ email, status });
  };

  deleteManyByEmail = async (email: string): Promise<void> => {
    try {
      const res = await prisma.memory.deleteMany({
        where: {
          email: {
            contains: email,
          },
        },
      });
      log.info(`Deleted ${res.count} memories for ${email}`);
    } catch (err) {
      log.error(err);
    }
  };

  createMemories = async (memories: any[]): Promise<void> => {
    try {
      await prisma.memory.createMany({
        data: memories,
        skipDuplicates: true,
      });
    } catch (err) {
      log.error(err);
    }
  };

  addOrUpdateMemory = async (
    email: string,
    date: string,
    type: Type,
    snapchatLink: string,
    downloadLink: string
  ): Promise<void> => {
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

  updateMemoryStatusSuccess = async (id: number): Promise<void> => {
    try {
      await prisma.memory.update({
        where: { id },
        data: { status: Status.SUCCESS },
      });
    } catch (err) {
      log.error(err);
    }
  };

  createOrUpdateUser = async (
    email: string,
    numMemories: number
  ): Promise<void> => {
    try {
      const entry = {
        email,
        numMemories,
      };

      await prisma.user.upsert({
        where: { email },
        update: entry,
        create: entry,
      });
    } catch (err) {
      log.error(err);
    }
  };

  getUser = async (email: string): Promise<User | undefined | null> => {
    try {
      return await prisma.user.findUnique({
        where: {
          email
        },
      });
    } catch (err) {
      log.error(err);
    }
  };
}

export default Memories;
