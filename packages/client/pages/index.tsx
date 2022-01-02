import type { NextPage } from "next";
import { LoggedInScreen } from "../components/LoggedInScreen";
import { Header } from "../components/Header";
import { VideoEmbed } from "../components/VideoEmbed";
import { Footer } from "../components/Footer";
import { LandingContent } from "../components/LandingContent";
import { fetcher, useUser } from "../lib/fetcher";
import useSWR from "swr";
import { API_URL } from "../lib/constants";

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
  const { user, isLoading, isError } = useUser();

  if (isLoading || isError) return (<>
  <Container className={`md:mt-20`}>
  </Container>
</>)

  if (user) {
    return (
      <>
        <Container className={`md:mt-20`}>
          <Header user={user}/>
          <LoggedInScreen />
          <Footer />
        </Container>
      </>
    );
  } else {
    return (
      <>
        <Container className={`md:mt-20`}>
          <Header user={user}/>
          <LandingContent />
          <Footer />
        </Container>
      </>
    );
  }
};

export default Home;
