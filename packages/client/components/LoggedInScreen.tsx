import type { NextPage } from "next";
import Image from "next/image";
import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL } from "../lib/constants";
import { useUser } from "../hooks/useUser";
import { VideoEmbed } from "./VideoEmbed";

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

export const LoggedInScreen = () => {
  const [memoriesStatus, setMemoriesStatus] = useState({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingDone, setProcessingDone] = useState(false);

  const JSONHandler = async (e: any) => {
    setUploadedFile(e.target.files?.[0]);
  };

  const ProcessJSONHandler = async () => {
    const form = new FormData();
    form.append("image", uploadedFile as unknown as string);

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
      .post(
        `${API_URL}/memories/download`,
        {},
        {
          withCredentials: true,
        }
      )
      .catch((error) => {
        console.log(error.message);
      });
  };

  const checkMemoryStatus = async () => {
    return await axios
      .get(`${API_URL}/json/status`, {
        withCredentials: true,
      })
      .then((res) => setMemoriesStatus(res.data))
      .catch((error) => {
        console.log(error.message);
      });
  };

  useEffect(() => {
    const fetch = async () => {
      await checkMemoryStatus();
    };

    fetch();
  }, []);

  return (
    <>
      <div>
        <div className={`rounded-lg mb-2 flex items-center justify-center`}>
          <input
            className="hidden w-[410px] px-5 py-3 text-secondary bg-navbar rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black display-none md:block"
            onChange={JSONHandler}
            id="file-input"
            type="file"
          />
          <label
            htmlFor="file-input"
            className="w-[410px] text-center px-5 py-3 text-secondary bg-navbar rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black display-none md:block"
          >
            {uploadedFile ? uploadedFile.name : "Upload memories_history.json"}
          </label>
        </div>
        <div className={`rounded-lg mb-2 flex items-center justify-center`}>
          <button
            className="w-[200px] px-5 py-3 mr-2 text-secondary bg-navbar rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black display-none md:block"
            onClick={ProcessJSONHandler}
          >
            Process memories
          </button>

          <button
            className={`w-[200px] px-5 py-3 text-secondary bg-navbar rounded-lg cursor-pointer transition ease-out display-none md:block ${processingDone ? "hover:bg-primary hover:text-black" : "cursor-not-allowed opacity-50"}`}
            onClick={DownloadHandler}
          >
            Save to Drive
          </button>
        </div>
      </div>
      <VideoEmbed />
    </>
  );
};
