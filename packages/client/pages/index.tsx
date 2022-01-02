import type { NextPage } from "next";
import { useUser } from "../hooks/useUser";
import { LoggedInScreen } from "../components/LoggedInScreen";
import { Header } from "../components/Header";
import { VideoEmbed } from "../components/VideoEmbed";
import { Footer } from "../components/Footer";

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
  const { user } = useUser();

  if (user) {
    return (
      <>
        <Container className={`md:mt-20`}>
          <Header />
          <LoggedInScreen />
          <Footer />
        </Container>
      </>
    );
  } else {
    return (
      <>
        <Container className={`md:mt-20`}>
          <Header />
          <VideoEmbed />
          <Footer />
        </Container>
      </>
    );
  }
};

export default Home;
