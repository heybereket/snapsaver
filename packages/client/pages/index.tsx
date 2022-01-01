import type { NextPage } from "next";
import { useUser } from "../hooks/useUser";
import { LoggedInScreen } from "../components/LoggedInScreen";
import { Header } from "../components/Header";
import { VideoEmbed } from "../components/VideoEmbed";

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
        </Container>
      </>
    );
  } else {
    return (
      <>
        <Container className={`md:mt-20`}>
          <Header />

          <VideoEmbed />

          {/* <div className="flex flex-col md:flex-row items-center justify-center">
          <ol className="list-decimal text-secondary">
            <li className="text-2xl">Request your data</li>
            <li className="text-2xl">Sign in with Google</li>
            <li className="text-2xl">Get memories</li>
          </ol>
        </div> */}

          <div className="px-4 py-2 mt-5 rounded-lg flex flex-col md:flex-row items-center justify-center">
            <div>
              made by{" "}
              <a
                className="text-primary"
                href="https://twitter.com/heybereket"
                target="_blank"
                rel="noreferrer"
              >
                @heybereket
              </a>{" "}
              and{" "}
              <a
                className="text-primary"
                href="https://twitter.com/addissemagn"
                target="_blank"
                rel="noreferrer"
              >
                @addissemagn
              </a>
            </div>
          </div>
        </Container>
      </>
    );
  }
};

export default Home;
