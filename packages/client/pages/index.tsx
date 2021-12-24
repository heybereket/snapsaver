import type { NextPage } from "next";

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
    <Container className={`md:mt-4 flex-col`}>
      <div
        className={`px-7 py-8 bg-dark-lighter rounded-lg flex flex-col md:flex-row md:items-center md:justify-center`}
      >
        <div className="flex items-center justify-between h-24 text-white rounded-lg shadow-md">
          <img
            className="md:block hidden h-full py-2 pr-4 ml-8"
            src="/assets/snapsaver-logo.png"
          ></img>
          <div className="flex flex-col px-2">
            <p className="text-4xl md:text-6xl font-bold text-primary">Snapsaver</p>
            <span className="md:text-1xl text-secondary">
              Download your Snapchat memories
            </span>
          </div>
        </div>
      </div>

      <div className={`mt-3 grid grid-cols-12`}>
        <div
          className={`px-7 py-6 bg-dark-lighter rounded-lg flex flex-col mb-2 col-span-12 md:mr-4 md:col-span-6 xl:col-span-5 2xl:col-span-6`}
        >
          wip
        </div>
        <div
          className={`px-7 py-6 bg-dark-lighter rounded-lg flex flex-col mb-2 col-span-12 md:col-span-6 xl:col-span-7 2xl:col-span-6`}
        >
          wip
        </div>
      </div>
    </Container>
  );
};

export default Home;
