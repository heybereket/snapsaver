import type { NextPage } from "next";
import Image from "next/image";
import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL } from "../lib/constants";
import { useUser } from "../hooks/useUser";

export const Container = (props: any) => {
  return (
    <div
      {...props}
      className={`p-4 md:px-6 lg:px-32 xl:px-48 2xl:px-72 3xl:px-128 ${props.className}`}
    >
      {props.children}
    </div>
  );
};

const Codeblock = (props: any) => {
  return <code className="font-monospace text-primary">{props.content}</code>;
};

const Title = (props: any) => {
  return (
    <h1 className="font-bold text-3xl text-secondary mb-4">
      <span className="text-gray-400">{props.number}.</span> {props.title}
    </h1>
  );
};

const Home: NextPage = () => {
  const [isDownloadReady, setIsDownloadReady] = useState(false);
  const [existingUpload, setExistingUpload] = useState(false);
  const { user } = useUser();

  const JSONHandler = async (e: any) => {
    const form = new FormData();
    form.append("image", e.target.files?.[0] as string);

    await axios
      .post(`${API_URL}/json/upload`, form, {
        withCredentials: true,
        headers: {
          "Content-Type": `multipart/form-data`,
        },
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const DownloadHandler = async () => {
    await axios
      .post(`${API_URL}/memories/download`, {
        withCredentials: true,
        data: {},
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const ZIPHandler = async () => {
    await axios
      .get(`${API_URL}/zip/link`, {
        withCredentials: true,
      })
      .then((res) => (window.location.href = res.data.link))
      .catch((error) => {
        console.log(error.message);
      });
  };

  const isZIPReady = async () => {
    return await axios
      .get(`${API_URL}/zip/status`, {
        withCredentials: true,
      })
      .then((res) => setIsDownloadReady(res.data.ready))
      .catch((error) => {
        console.log(error.message);
      });
  };

  const checkExistingUpload = async () => {
    return await axios
      .get(`${API_URL}/json/status`, {
        withCredentials: true,
      })
      .then((res) => setExistingUpload(res.data.ready))
      .catch((error) => {
        console.log(error.message);
      });
  };

  useEffect(() => {
    const fetch = async () => {
      await isZIPReady();
      await checkExistingUpload();
    };

    fetch();
  }, []);

  return (
    <div className="m-w-5 md:flex md:items-center md:justify-center md:h-screen">
      <Container className={`md:mt-4`}>
        <div className="px-4 py-2 bg-navbar mb-5 rounded-lg flex flex-col ">
          <a
            href={user ? undefined : `${API_URL}/auth/google`}
            className="text-center px-5 py-3 text-secondary bg-red-500 rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black"
          >
            <button>
              {user ? (
                <span>
                  👋 Hey, {user.emails?.values()?.next()?.value.value}
                </span>
              ) : (
                <span>Sign in with Google -&gt;</span>
              )}
            </button>
          </a>
        </div>

        <div
          className={`px-7 py-8 bg-dark-lighter rounded-lg flex flex-col md:flex-row md:items-center md:justify-center`}
        >
          <div className="flex items-center justify-between h-24 text-white rounded-lg">
            <div className="md:block hidden">
              <Image
                className="py-2 pr-4 ml-8"
                src="/assets/snapsaver-logo.png"
                alt="Snapsaver Logo"
                width={70}
                height={68}
              />
            </div>
            <div className="flex flex-col px-4">
              <p className="text-4xl md:text-6xl font-bold text-primary">
                Snapsaver
              </p>
              <span className="md:text-1xl text-secondary">
                Download your Snapchat memories
              </span>
            </div>
          </div>
        </div>

        <div className={`mt-3 grid grid-cols-12`}>
          <div
            className={`px-10 py-10 bg-dark-lighter rounded-lg flex flex-col mb-2 col-span-12 md:mr-4 md:col-span-6 xl:col-span-5 2xl:col-span-6`}
          >
            <Title number="1" title="Request your data" />

            <span className="ml-7">
              Go to{" "}
              <a
                href="https://accounts.snapchat.com/accounts/downloadmydata"
                target="_blank"
                className="text-primary hover:text-gray-500"
                rel="noreferrer"
              >
                Snapchat&apos;s Download My Data
              </a>{" "}
              and request your data. It could take a while, sit tight. After
              your data has finished processing and you have recieved it in your
              inbox - come back to Snapsaver to move on to the next step.
            </span>
          </div>
          <div
            className={`px-10 py-10 bg-dark-lighter rounded-lg flex flex-col mb-2 col-span-12 md:col-span-6 xl:col-span-7 2xl:col-span-6`}
          >
            <Title number="2" title="Upload your JSON" />

            <span className="ml-9 mb-3">
              Unzip the <Codeblock content="mydata-{bunch of numbers}.zip" />{" "}
              file, then open the <Codeblock content="json" /> folder. Select{" "}
              <Codeblock content="memories_history.json" /> and upload it below.
            </span>

            <div className="mb-3 mt-1 w-96 ml-9">
              <input
                className="px-5 py-3 text-secondary bg-navbar rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black"
                onChange={JSONHandler}
                type="file"
              />
            </div>

            {existingUpload && (
              <span className="ml-9 mb-3 text-secondary text-sm">
                Looks like you&apos;ve already uploaded a file. To replace it,
                upload another file.
              </span>
            )}
          </div>
        </div>

        <div className={`mt-1 grid grid-cols-12`}>
          <div
            className={`px-10 py-10 bg-dark-lighter rounded-lg flex flex-col mb-2 col-span-12 md:mr-4 md:col-span-6 xl:col-span-5 2xl:col-span-6`}
          >
            <Title number="3" title="Start the process" />

            <span className="ml-9 mb-3">
              Click <Codeblock content="start" /> to initiate processing your
              memories. We&apos;ll download your files on our end and send you
              an email when they&apos;re ready to be exported.
            </span>

            <div className="mb-3 ml-9">
              <button
                className="px-5 py-3 text-secondary bg-navbar rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black"
                onClick={DownloadHandler}
              >
                Start -&gt;
              </button>
            </div>
          </div>
          <div
            className={`px-10 py-10 bg-dark-lighter rounded-lg flex flex-col mb-2 col-span-12 md:col-span-6 xl:col-span-7 2xl:col-span-6`}
          >
            <Title
              number="4"
              title={
                isDownloadReady ? "Your files are ready" : "Downloading..."
              }
            />

            {isDownloadReady ? (
              <div className="mb-3 w-96 ml-9">
                <button
                  className="px-5 py-3 text-secondary bg-navbar rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black"
                  onClick={ZIPHandler}
                >
                  Export files -&gt;
                </button>
              </div>
            ) : (
              <span className="ml-9 mb-3">
                When your files are ready, they&apos;ll be here to get
                downloaded.
              </span>
            )}
          </div>
        </div>
        <div className="px-4 py-2 bg-navbar mb-5 rounded-lg flex flex-col md:flex-row items-center justify-center">
          made by @addissemagn and @heybereket
        </div>
      </Container>
    </div>
  );
};

export default Home;
