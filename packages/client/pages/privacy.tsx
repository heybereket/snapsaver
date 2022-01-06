import { Key } from "react";
import { Container } from "../components/Container";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { LoadingScreen } from "../components/screens/LoadingScreen";
import { SEO } from "../components/SEO";
import { useUser } from "../lib/fetcher";

export const paragraphs = [
  {
    title: "Privacy Policy",
    type: "h1",
    sentences: [
      "This privacy policy sets out how Snapsaver uses and protects any information that you give Snapsaver when you use this website.",
      "Your memories are extremely sensitive data. Snapsaver was designed with this as the top priority.",
      "Snapsaver stores your data directly into your own Google Drive, so you have control over it - as it should be.",
    ],
  },
  {
    title: "TL;DR",
    sentences: [
      "1. Snapsaver stores your data only on your Google Drive.",
      "2. When you sign in with Google, Snapsaver gets the minimal credentials it needs - your email address and access to <i><b>only the files Snapsaver creates</b></i> for the duration you are signed in, so that it can upload your memories.",
    ],
  },
  {
    title: "Does Snapsaver make money?",
    sentences: [
      "No. We just want to make it easier for you to get your memories off the app.",
      "But we do accept tips 😊",
    ],
  },
  {
    title: "What can Snapsaver access on your Google account?",
    sentences: [
      "When you sign in, Snapsaver asks for the minimum credentials needed to get the job done:",
      "1. Your email address",
      "2. Access to <b><i>only the files that Snapsaver creates</i></b> in your Google Drive",
      "After you've signed in, Google provides an access token. When Snapsaver makes requests to Google to save a file to your Drive, it needs to include this access token. If you sign out, this token becomes invalid and Snapsaver cannot do anything with your Google account. To get a new access token, you need to sign in again. This is a security measure to prevent someone from stealing your data. ",
      "🔑 Your <b><i>files are as as secure as your Google account</i></b>, so ensure you <b><i>use one that is strongly protected</i></b> and is <b><i>only accessible by you and people you trust</i></b> to see your memories.",
    ],
  },
  {
    title: "What personal information do we collect?",
    sentences: [
      "Snapsaver collects the email address you login with and the total number of links in your memories_history.JSON. This is so that we can show you the progress of your download.",
    ],
  },
  {
    title: "Where do we store your data?",
    sentences: [
      "Snapsaver stores your data only on your own Google Drive.",
      "When you upload your memories_history.json, Snapsaver creates a folder on your Google Drive called something like “Snapsaver - 2022/01/05 5:45pm” and saves your JSON file into it. If that works (i.e. you have enough storage), your download request is queued!",
      "Once your download is being processed, Snapsaver reads directly from that file to process each link and save your media into that same folder on your Google Drive. This is a one-time process, and it's done automatically. If you're not satisfied with the results, you can always delete the folder and re-upload your JSON file.",
      "Outside of your Google Drive, <b><i>Snapsaver doesn't store any information about the contents of your memories_history.json</i></b>.",
    ],
  },
];

const PrivacyPage = () => {
  const { data, isLoading, isError } = useUser();

  if (isLoading || isError)
    return (
      <div className="loading-logo">
        <Container
          className={`m-w-5 md:flex md:items-center md:justify-center md:h-screen`}
        >
          <LoadingScreen />
        </Container>
      </div>
    );

  return (
    <>
      <SEO title="Privacy" />
      <Container className={`md:mt-20`}>
        <Header data={data} />
        <div className="flex items-center justify-center mt-10 px-7 md:px-12">
          <div className="w-[700px] space-y-4">
            {paragraphs.map((paragraph: any, i: Key) => {
              return (
                <div className="flex flex-col space-y-2" key={i}>
                  <div>
                    <h2
                      className={`font-bold ${
                        paragraph.type === "h1"
                          ? "text-primary text-4xl text-center mb-3"
                          : "text-3xl"
                      }`}
                    >
                      {paragraph.title}
                    </h2>
                  </div>
                  {paragraph.sentences.map((sentence: string, i: Key) => {
                    return (
                      <p
                        className="text-lg text-gray-400"
                        key={i}
                        dangerouslySetInnerHTML={{ __html: sentence }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <Footer />
      </Container>
    </>
  );
};

export default PrivacyPage;
