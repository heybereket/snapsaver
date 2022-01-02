import { API_URL } from "../lib/constants";
import { Google } from "./icons/Google";
import Image from "next/image";

export const Header = (props: {data: any}) => {
  return (
    <>
      <div className="absolute right-4 md:right-10 top-10 h-16 pb-5">
        <a
          href={props.data.user ? `${API_URL}/auth/google/logout`: `${API_URL}/auth/google`}
        >
          <button className="group bg-red-500 px-5 py-3 flex items-center text-sm w-auto rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black text-center text-secondary">
            <Google className="fill-secondary mr-2 group-hover:fill-black" />
            {props.data.user ? <span>Sign out</span> : <span>Sign in/up -&gt;</span>}
          </button>
        </a>
      </div>
   
      <div
        className={`px-7 py-8 rounded-lg flex flex-col md:flex-row items-center justify-center mb-5`}
      >
        <div className="mt-10 md:m-0">
          <Image
            className="py-2 pr-4 ml-8 mt-16"
            src="/assets/snapsaver-logo.png"
            alt="Snapsaver Logo"
            width={70}
            height={68}
          />
        </div>
        <div className="flex flex-col px-4">
          <p className="text-center text-4xl md:text-6xl font-bold text-primary">
            Snapsaver
          </p>
          <span className="text-center md:text-lg text-secondary">
            Backup your Snapchat memories
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center">
        {props.data.message && props.data.message.includes("beta") && (
          <span>{props.data.message}</span>
        )}
      </div>
    </>
  );
};
