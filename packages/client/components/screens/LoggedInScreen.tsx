import type { NextPage } from "next";
import Image from "next/image";
import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL } from "../../lib/constants";
import { LandingContent } from "../LandingContent";
import { VideoEmbed } from "../VideoEmbed";

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

type MemoriesStatus = {
  total: number | null;
  success: number;
  failed: number;
  googleDriveFolderLink: string;
};

export const LoggedInScreen = () => {
  const [memoriesStatus, setMemoriesStatus] = useState<MemoriesStatus>({
    total: 0,
    googleDriveFolderLink: "",
    success: 0,
    failed: 0,
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeDownload, setActiveDownload] = useState(false);
  const [mediaType, setMediaType] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [moreOptions, setMoreOptions] = useState<boolean>(false);

  const JSONHandler = async (e: any) => {
    setUploadedFile(e.target.files?.[0]);
  };

  const ProcessJSONHandler = async () => {
    const form = new FormData();
    form.append("image", uploadedFile as unknown as string);
    form.append("startDate", startDate);
    form.append("endDate", endDate);
    form.append("type", mediaType);

    await axios
      .post(`${API_URL}/memories/start`, form, {
        withCredentials: true,
        headers: {
          "Content-Type": `multipart/form-data`,
        },
      })
      .catch((error) => {
        console.log(error.message);
      });

    checkMemoryStatus();
  };

  const DownloadHandler = async () => {
    return await axios
      .post(
        `${API_URL}/memories/download`,
        { type: mediaType, startDate, endDate },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .catch((error) => {
        console.log(error.message);
      });
  };

  const checkMemoryStatus = async () => {
    return await axios
      .get(`${API_URL}/memories/status`, {
        withCredentials: true,
      })
      .then((res) => {
        setMemoriesStatus(res.data);
        setActiveDownload(res.data.activeDownload);
      })
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
        <div className="flex items-center justify-center mb-3 text-xl">
          <span className="text-center">
            Upload your <Codeblock content="memories_history.json" />
          </span>
        </div>

        <div className={`rounded-lg mb-2 flex items-center justify-center`}>
          <input
            className="hidden w-[410px] px-5 py-3 text-secondary bg-navbar rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black display-none md:block"
            onChange={JSONHandler}
            id="file-input"
            type="file"
          />
          <label
            htmlFor="file-input"
            className="w-[410px] text-xl mb-2 text-center px-5 py-3 text-secondary bg-navbar rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black display-none md:block"
          >
            {uploadedFile ? uploadedFile.name : "Upload"}
          </label>
        </div>
        <div
          className={`rounded-lg text-xl mb-2 flex items-center justify-center`}
        >
          <button
            className={`w-[410px] text-xl px-5 py-3 text-secondary bg-navbar rounded-lg cursor-pointer transition ease-out display-none md:block ${
              !activeDownload
                ? "hover:bg-green-300 text-black bg-green-500"
                : "cursor-not-allowed opacity-50"
            }`}
            onClick={ProcessJSONHandler}
          >
            {!activeDownload ? "Start Download" : "Downloading..."}
          </button>
        </div>
        {memoriesStatus.total && (
          <div className="flex items-center justify-center mt-8 mb-5">
            <div className="text-xl text-center text-gray-400">
              {activeDownload ? "Download in progress for" : "Downloaded"} {memoriesStatus.total} memories 🤩 <br />
              <span className="text-green-500 font-bold">
                {memoriesStatus.success} succeeded
              </span>{" "}
              -{" "}
              <span className="text-red-500 font-bold">
                {memoriesStatus.failed} failed
              </span>
            </div>
          </div>
        )}
      </div>

      {memoriesStatus.googleDriveFolderLink && (
        <div className="rounded-lg mb-2 flex items-center justify-center">
          <a
            href={memoriesStatus.googleDriveFolderLink}
            target="_blank"
            rel="noreferrer"
            className="w-[410px] text-xl px-5 py-3 text-secondary bg-navbar rounded-lg cursor-pointer transition ease-out display-none md:block text-center hover:bg-primary hover:text-black"
          >
            Go to folder -&gt;
          </a>
        </div>
      )}

      <div className="flex items-center justify-center">
        <button
          onClick={() => {
            setMoreOptions(!moreOptions);
          }}
          className="w-[410px] mt-3 text-md font-semibold text-center px-5 py-3 text-secondary cursor-pointer transition ease-out display-none md:block"
        >
          + More Options
        </button>
      </div>

      {moreOptions && (
        <div className="flex items-center justify-center mt-5">
          <div className="bg-navbar rounded-lg w-[410px] px-10 py-8 mb-10">
            <h3 className="text-secondary text-2xl mt-2 font-bold">
              Date Range
            </h3>
            Default date is the entire range
            <div className="flex mt-2 mb-5 flex-wrap">
              <input
                className={`w-[150px] px-5 py-3 mr-3 text-secondary bg-dark rounded-lg display-none md:block ${
                  endDate && !startDate && "border-2 border-rose-500"
                }`}
                placeholder="Start Date"
                onChange={(e) => setStartDate(e.target.value)}
              />

              <input
                className={`w-[150px] px-5 py-3 mr-3 text-secondary bg-dark rounded-lg display-none md:block ${
                  startDate && !endDate && "border-2 border-rose-500"
                }`}
                placeholder="End Date"
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <h3 className="text-secondary text-2xl mt-2 font-bold">
              Media Type
            </h3>
            Default type is &quot;ALL&quot;
            <div className="flex mt-2 mb-5">
              <button
                className={`px-5 py-3 mr-3 text-secondary bg-dark rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black display-none md:block ${
                  mediaType === "ALL" && "bg-primary text-black"
                }`}
                onClick={() => setMediaType("ALL")}
              >
                ALL
              </button>
              <button
                className={`px-5 py-3 mr-3 text-secondary bg-dark rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black display-none md:block ${
                  mediaType === "PHOTO" && "bg-primary text-black"
                }`}
                onClick={() => setMediaType("PHOTO")}
              >
                PHOTO
              </button>
              <button
                className={`px-5 py-3 mr-3 text-secondary bg-dark rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black display-none md:block ${
                  mediaType === "VIDEO" && "bg-primary text-black"
                }`}
                onClick={() => setMediaType("VIDEO")}
              >
                VIDEO
              </button>
            </div>
          </div>
        </div>
      )}

      <LandingContent />
    </>
  );
};
