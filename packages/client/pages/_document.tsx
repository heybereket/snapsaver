import React, { ReactElement } from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render(): ReactElement {
    return (
      <Html>
        <Head>
          <meta
            name="og:description"
            content="Backup your Snapchat Memories to Google Drive"
          />
          <meta
            name="twitter:description"
            content="Backup your Snapchat Memories to Google Drive"
          />
          <meta name="twitter:image" content="/assets/banner.png" />
          <meta name="theme-color" content="#FED8B1" />
          <link rel="shortcut icon" href="/assets/snapsaver-logo.png" />
          <meta name="og:image" content="/assets/banner.png" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
