import { API_URL } from "../lib/constants";
import { useUser } from "../hooks/useUser";
import { Google } from "./icons/Google";
import type { NextPage } from "next";
import Image from "next/image";
export const Header: NextPage = () => {
  const { user } = useUser();

  return (
    <>
      <div className="absolute right-10 top-10 h-16 pb-5">
        <a
          href={user ? `${API_URL}/auth/google/logout`: `${API_URL}/auth/google`}
        >
          <button className="group bg-red-500 px-5 py-3 flex items-center text-sm w-auto rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black text-center text-secondary">
            <Google className="fill-secondary mr-2 group-hover:fill-black" />
            {user ? <span>Sign out</span> : <span>Sign in/up -&gt;</span>}
          </button>
        </a>
      </div>
   
      <div
        className={`px-7 py-8 rounded-lg flex flex-col md:flex-row items-center justify-center`}
      >
        <div className="md:block hidden">
          <Image
            className="py-2 pr-4 ml-8"
            src="/assets/snapsaver-logo.png"
            alt="Snapsaver Logo"
            width={70}
            height={68}
          />
        </div>
        <div className="flex flex-col px-4 mt-16 md:mt-0">
          <p className="text-center text-4xl md:text-6xl font-bold text-primary">
            Snapsaver
          </p>
          <span className="text-center md:text-1xl text-secondary">
            Backup your Snapchat memories
          </span>
        </div>
      </div>
    </>
  );
};
