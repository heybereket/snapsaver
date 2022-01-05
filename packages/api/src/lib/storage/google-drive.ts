import { google } from "googleapis";
import * as log from "../log";
import { API_URL } from "../constants";
import memories from "../memories";
import dayjs from "dayjs";
import { Status } from "@prisma/client";

class StorageGoogleDrive {
  Memories: any;

  constructor() {
    this.Memories = new memories();
  }

  public uploadMemoriesJson = async (accessToken: string, email: string, data: any) => {
    try {
      const drive = this.getGoogleDrive(accessToken);
      const folderId = await this.getOrCreateSnapsaverFolderId(drive);
      return await this.createFileInFolder(
        drive,
        email,
        folderId,
        "memories_history.json",
        data,
        "application/json"
      )
        .then((fileId) => [fileId, folderId])
        .catch((err) => {
          throw Error(err);
        });
    } catch (err) {
      throw Error(err);
    }
  };

  public uploadMediaFile = async (
    accessToken: string,
    email,
    folderId: string,
    fileName: string,
    stream: any
  ) => {
    try {
      const drive = this.getGoogleDrive(accessToken);
      const fileExtension = fileName.split(".").pop();
      const mimeType = fileExtension == "mp4" ? "video/mp4" : "image/jpeg";
      await this.createFileInFolder(
        drive,
        email,
        folderId,
        fileName,
        stream,
        mimeType
      );
    } catch (err) {
      log.error(err);
    }
  };

  public getTargetFolderId = async (accessToken) => {
    const drive = this.getGoogleDrive(accessToken);
    const folderId = await this.getOrCreateSnapsaverFolderId(drive);
    return folderId;
  };

  public getFileById = async (accessToken, fileId) => {
    const drive = this.getGoogleDrive(accessToken);
    var request = await drive.files.get({
      'fileId': fileId,
      'alt': 'media'
    });
    return request.data;
  }

  public getFolderById = async (accessToken, folderId) => {
    const drive = this.getGoogleDrive(accessToken);
    var request = await drive.files.get({
      'fileId': folderId,
    });
    return request.data;
  }

  private getOrCreateSnapsaverFolderId = async (drive: any) => {
    const currentDateFormatted = dayjs().format("YYYY/MM/DD h:mma");
    const folderName = `Snapsaver ${currentDateFormatted}`;
    const existingFolders: any[] = await this.listFiles(drive);
    const snapsaverFolders = existingFolders.filter(
      (f) => f.name === folderName
    );
    const folderId =
      snapsaverFolders.length > 0
        ? snapsaverFolders[0].id
        : await this.createFolder(drive, folderName);
    return folderId;
  };

  /**
   * Lists the names and IDs of up to 10 files.
   */
  private listFiles = (drive): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      drive.files.list(
        {
          pageSize: 10,
          fields: "nextPageToken, files(id, name)",
        },
        (err, res) => {
          if (err) reject(err);

          const files = res.data.files;
          const folders = files.map((file) => {
            return { name: file.name, id: file.id };
          });
          resolve(folders);
        }
      );
    });
  };

  private createFolder = async (drive, name: string) => {
    var fileMetadata = {
      name,
      mimeType: "application/vnd.google-apps.folder",
    };

    return new Promise((resolve, reject) => {
      drive.files.create(
        {
          resource: fileMetadata,
          fields: "id",
        },
        (err, file) => {
          if (err) {
            reject(err);
          }

          log.success(`Created folder ${name}. Id: ${file.data.id}`);
          resolve(file.data.id);
        }
      );
    });
  };

  private createFileInFolder = (
    drive,
    email,
    folderId,
    name,
    data,
    mimeType: "application/json" | "image/jpeg" | "video/mp4"
  ) => {
    const fileMetadata = {
      name,
      parents: [folderId],
    };

    const media = {
      mimeType: mimeType,
      body: data,
    };

    return new Promise((resolve, reject) => {
      drive.files
        .create({
          resource: fileMetadata,
          media: media,
          fields: "id",
        })
        .then(async (file) => {
          // TODO: Mark as success on DB
          log.success(`Created file ${name} - ${email}`);

          if (mimeType == "image/jpeg" || mimeType == "video/mp4") {
            await this.Memories.incrementMemoryStatusOnUser(email, Status.SUCCESS);
          }

          resolve(file.data.id);
        })
        .catch(async (err) => {
          log.error(
            `Error creating file ${name} to GDrive: `,
            err.errors[0].message
          );

          if (mimeType == "image/jpeg" || mimeType == "video/mp4") {
            await this.Memories.incrementMemoryStatusOnUser(email, Status.FAILED);
          }

          reject(err.errors[0].message);
        });
    });
  };

  private getGoogleDrive = (accessToken: string) => {
    const oAuth2Client = this.getOAuthClient(accessToken);
    return google.drive({ version: "v3", auth: oAuth2Client });
  };

  private getOAuthClient = (accessToken: string) => {
    try {
      const redirect_uri = API_URL;
      const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_AUTH,
        redirect_uri
      );

      oAuth2Client.setCredentials({ access_token: accessToken });
      return oAuth2Client;
    } catch (err) {
      console.log(err);
    }
  };
}

export default StorageGoogleDrive;
