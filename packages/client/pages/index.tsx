import type { NextPage } from "next";
import { LoggedInScreen } from "../components/screens/LoggedInScreen";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { LandingContent } from "../components/LandingContent";
import { useUser } from "../lib/fetcher";
import { LoadingScreen } from "../components/screens/LoadingScreen";

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
      <div className="loading-logo">
        <Container
          className={`m-w-5 md:flex md:items-center md:justify-center md:h-screen`}
        >
          <LoadingScreen />
        </Container>
      </div>
    );

  if (data.user && data.success) {
    return (
      <>
        <Container className={`md:mt-20`}>
          <Header data={data} />
          <LoggedInScreen data={data} />
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
