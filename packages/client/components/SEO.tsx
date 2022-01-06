import React from 'react';
import Head from 'next/head';

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
  return (
    <Head>
      <title>{title} - Snapsaver</title>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, user-scalable=no, user-scalable=0"
      />
      <meta name="description" content="Backup your Snapchat Memories to Google Drive" />
      <meta name="keywords" content={keywords} />
      {metaTitle ? (
        <meta name="og:title" content={metaTitle} />
      ) : (
        <meta name="og:title" content={title} />
      )}
      <meta name="og:description" content="Backup your Snapchat Memories to Google Drive" />
      <meta name="og:image" content="../assets/banner.png" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content="Backup your Snapchat Memories to Google Drive" />
      <meta name="twitter:image" content="../assets/banner.png" />
      <meta name="theme-color" content="#FED8B1" />
    </Head>
  );
};