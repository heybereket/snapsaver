import React from "react";
import Head from "next/head";

interface SEOProps {
  title: any;
  description?: string;
  metaTitle?: string;
  metaDesc?: string;
  metaImg?: string;
  keywords?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  metaDesc,
  metaImg,
  metaTitle,
  keywords,
}) => {
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
        content="Backup your Snapchat Memories to Google Drive"
      />
      <meta name="keywords" content={keywords} />
      {metaTitle ? (
        <meta name="og:title" content={metaTitle} />
      ) : (
        <meta name="og:title" content={properTitle} />
      )}
      <meta
        name="og:description"
        content="Backup your Snapchat Memories to Google Drive"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={properTitle} />
      <meta
        name="twitter:description"
        content="Backup your Snapchat Memories to Google Drive"
      />
      <meta name="twitter:image" content="/assets/banner.png" />
      <meta name="theme-color" content="#FED8B1" />
      <link rel="shortcut icon" href="/assets/favicon.png" />
      <meta name="og:image" content="/assets/banner.png" />
    </Head>
  );
};
