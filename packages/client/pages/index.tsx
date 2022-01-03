import type { NextPage } from "next";
import { LoggedInScreen } from "../components/LoggedInScreen";
import { Header } from "../components/Header";
import { VideoEmbed } from "../components/VideoEmbed";
import { Footer } from "../components/Footer";
import { LandingContent } from "../components/LandingContent";
import { useUser } from "../lib/fetcher";
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
  const { data, isLoading, isError } = useUser();

  if (isLoading || isError)
    return (
      <>
        <Container className={`m-w-5 md:flex md:items-center md:justify-center md:h-screen`}>
        <div
        className={`px-7 py-8 rounded-lg flex flex-col md:flex-row items-center justify-center mb-5 opacity-25`}
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
        </Container>
      </>
    );

  if (data.user && data.success) {
    return (
      <>
        <Container className={`md:mt-20`}>
          <Header data={data} />
          <LoggedInScreen />
          <Footer />
        </Container>
      </>
    );
  } else {
    return (
      <>
        <Container className={`md:mt-20`}>
          <Header data={data} />
          <LandingContent />
          <Footer />
        </Container>
      </>
    );
  }
};

export default Home;
