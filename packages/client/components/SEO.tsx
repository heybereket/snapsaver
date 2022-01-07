import React from "react";
import Head from "next/head";

interface SEOProps {
  title: any;
}

export const SEO: React.FC<SEOProps> = ({ title }) => {
  const properTitle = title === "Snapsaver" ? title : `${title} - Snapsaver`;

  return (
    <Head>
      <title>{properTitle}</title>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, user-scalable=no, user-scalable=0"
      />
      <meta
        name="description"
        content="Export all your Snapchat memories to Google Drive"
      />
      <meta
        name="keywords"
        content="snapsaver,memories,backup,backup memories,download,memories to google drive,snapchat,save,export,snapchat memories"
      />
      <meta name="og:title" content={properTitle} />
      <meta
        name="og:description"
        content="Export all your Snapchat memories to Google Drive"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={properTitle} />
      <meta
        name="twitter:description"
        content="Export all your Snapchat memories to Google Drive"
      />
      <meta name="twitter:image" content="/assets/banner.png" />
      <meta name="theme-color" content="#FED8B1" />
      <link rel="shortcut icon" href="/assets/favicon.png" />
      <meta name="og:image" content="/assets/banner.png" />
    </Head>
  );
};
