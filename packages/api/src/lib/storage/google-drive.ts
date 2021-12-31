import { google } from "googleapis";
import * as log from "../log";
import { API_URL } from "../constants";

class StorageGoogleDrive {
  public uploadMemoriesJson = async (accessToken: string, data: any) => {
    try {
      const drive = this.getGoogleDrive(accessToken);
      const folderId = await this.getOrCreateSnapsaverFolderId(drive);
      log.info("Target GDrive folder id: ", folderId);

      this.createFileInFolder(drive, folderId, "memories_history.json", data, "application/json");
    } catch (err) {
      log.error(`Error uploading memories JSON to GDrive`, err.errors.first().message);
    }
  };

  private getOrCreateSnapsaverFolderId = async (drive) => {
    const folderName = "Snapsaver";
    const existingFolders: any[] = (await this.listFiles(drive)) || [{}];
    const snapsaverFolders = existingFolders.filter(
      (f) => f.name === folderName
    );
    const folderId = snapsaverFolders.length
      ? snapsaverFolders[0].id
      : this.createFolder(drive, folderName);
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

          console.log(`Created folder ${name}. Id: ${file.data.id}`);
          resolve(file.data.id);
        }
      );
    });
  };

  private createFileInFolder = (drive, folderId, name, data, mimeType: "application/json" | "image/jpeg") => {
    const fileMetadata = {
      name: "memories_history.json",
      parents: [folderId],
    };

    const media = {
      mimeType: mimeType,
      body: data,
    };

    drive.files.create(
      {
        resource: fileMetadata,
        media: media,
        fields: "id",
      },
      (err, file) => {
        if (err) {
          log.error(`Error creating file ${name} to GDrive: `, err.errors[0].message);
        } else {
          log.success("Created file, id: ", file.data.id);
        }
      }
    );
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
