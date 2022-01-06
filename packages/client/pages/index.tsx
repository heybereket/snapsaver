import type { NextPage } from "next";
import { LoggedInScreen } from "../components/screens/LoggedInScreen";
import { Container } from "../components/Container";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Instructions } from "../components/Instructions";
import { useUser } from "../lib/fetcher";
import { LoadingScreen } from "../components/screens/LoadingScreen";
import { SEO } from "../components/SEO";

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
        <SEO title="Home" />
        <Container className={`md:mt-20`}>
          <Header data={data} />
          <LoggedInScreen data={data} />
          <Instructions />
          <Footer />
        </Container>
      </>
    );
  } else {
    return (
      <>
        <Container className={`md:mt-20`}>
          <Header data={data} />
          <Instructions />
          <Footer />
        </Container>
      </>
    );
  }
};

export default Home;
