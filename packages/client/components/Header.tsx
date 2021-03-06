import { Google } from "./icons/Google";
import Image from "next/image";
import Link from "next/link";
import { API_URL } from "../lib/constants";

export const Header = (props: { data: any }) => {
  return (
    <>
      <div className="flex absolute right-4 md:right-10 top-10 h-16 pb-5">
        <div className="mt-2 px-3 pr-3 md:pr-6 space-x-3 md:space-x-6">
          <Link href="/">
            <a className="hover:text-gray-400">home</a>
          </Link>
          <Link href="/about">
            <a className="hover:text-gray-400">about</a>
          </Link>
          <Link href="/privacy">
            <a className="hover:text-gray-400">privacy</a>
          </Link>
        </div>
        <a
          href="https://buymeacoffee.com/snapsaver"
          target="_blank"
          rel="noreferrer"
        >
          <button className="font-semibold bg-navbar hover:bg-primary px-5 py-3 mr-2 md:mr-3 flex items-center text-sm w-auto rounded-lg cursor-pointer transition ease-out text-white hover:text-black text-center text-secondary">
            tip jar
          </button>
        </a>
        <a
          href={
            props.data.user
              ? `${API_URL}/auth/google/logout`
              : `${API_URL}/auth/google`
          }
        >
          <button className="group bg-red-500 px-5 py-3 flex items-center text-sm w-auto rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black text-center text-secondary">
            <Google className="hidden md:block fill-secondary mr-2 group-hover:fill-black" />
            {props.data.user ? <span>sign out</span> : <span>sign in/up</span>}
          </button>
        </a>
      </div>

      <div
        className={`px-7 py-8 rounded-lg flex flex-col md:flex-row items-center justify-center mb-5`}
      >
        <div className="mt-20 md:m-0">
          <Image
            className="py-2 pr-4 ml-8 mt-16"
            src="/assets/snapsaver-logo.png"
            alt="Snapsaver Logo"
            width={100}
            height={100}
            priority={true}
          />
        </div>
        <div className="flex flex-col px-4">
          <div className="mb-3">
            <p className="text-center text-5xl md:text-7xl font-bold text-primary">
              Snapsaver
            </p>
            <span className="text-left md:text-xl text-secondary">
              Export all your Snapchat memories
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
