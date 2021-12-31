import { SES } from "./aws";

export const mailer = (
  to: string,
  subject: string,
  html: string
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    try {
      SES
        .sendEmail({
          Destination: {
            ToAddresses: [to],
          },
          Message: {
            Body: {
              Html: { Charset: "UTF-8", Data: html },
            },
            Subject: { Charset: "UTF-8", Data: subject },
          },
          Source: "Team Snapsaver <noreply@snapsaver.me>",
        })
        .promise();
      return resolve("Successfully emailed user!");
    } catch (err) {
      return reject("An error occurred while emailing user!");
    }
  });
};