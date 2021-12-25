import type { NextPage } from "next";
import Image from "next/image";

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

const Home: NextPage = () => {
  return (
    <Container className={`md:mt-4`}>
      <div className="px-4 py-2 bg-navbar mb-5 rounded-lg flex flex-col md:flex-row md:items-center md:justify-center">
        made by @addissemagn and @heybereket
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
          <h1 className="font-bold text-3xl text-secondary mb-4">
            Upload your JSON
          </h1>

          <div className="mb-3 w-96">
            <input
              className="px-5 py-3 text-secondary bg-navbar rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black"
              type="file"
            />
          </div>
        </div>
        <div
          className={`px-10 py-10 bg-dark-lighter rounded-lg flex flex-col mb-2 col-span-12 md:col-span-6 xl:col-span-7 2xl:col-span-6`}
        >
          <h1 className="font-bold text-3xl text-secondary mb-4">
            Easy. You&apos;re done.
          </h1>

          <div className="mb-3 w-96">
            <button
              className="px-5 py-3 text-secondary bg-navbar rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black"
            >Download -&gt;</button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Home;
