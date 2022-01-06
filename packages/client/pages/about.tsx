import Image from "next/image";
import { Container } from "../components/Container";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { LoadingScreen } from "../components/screens/LoadingScreen";
import { Tooltip } from "../components/Tooltip";
import { SEO } from "../components/SEO";
import { useUser } from "../lib/fetcher";

const About = () => {
  const { data, isLoading, isError } = useUser();

  if (isLoading || isError)
    return (
        <>
        <SEO title="About" />
        <div className="loading-logo">
          <Container
            className={`m-w-5 md:flex md:items-center md:justify-center md:h-screen`}
          >
            <LoadingScreen />
          </Container>
        </div>
      </>
    );

  return (
    <>
      <SEO title="About" />

      <Container className={`md:mt-20`}>
        <Header data={data} />
        <div className="flex flex-col items-center justify-center">
          <div className="px-7 py-5 rounded-lg">
            <p className="text-center text-4xl font-bold text-primary">About</p>

            <p className="text-lg text-gray-400 md:w-[700px] mt-5 mb-5">
              <div className="mb-3">
                <span className="font-bold">
                  Getting your Snapchat memories should be a breeze, that&apos;s
                  why we made Snapsaver.
                </span>{" "}
              </div>
              <div className="mb-3">
                <span>
                  Though Snapchat is legally required to provide you with all
                  the data it&apos;s collected on you, they sure make it hard to
                  work with. Your memories are one of them, but Snapchat has no
                  way to export all your memory media files at once. Instead,
                  your memories are given as a a list of links in a file called
                  memories_history.json. On top of that - technical jargon aside
                  - these links lead to another link, which is the actual link
                  to download your file. For context, ours had 5,600 links, and
                  you may have many more.
                </span>
              </div>
              <div className="mb-3">
                <span>
                  Snapsaver is simple yet effective. No need to download a few
                  photos at a time on your phone, or worry about how much
                  storage you have. Whether you just want to backup your
                  memories, or get off the app, Snapsaver downloads your
                  memories right onto your Google Drive.
                </span>
              </div>
              <span>
                If you have any feedback, we&apos;d love to hear from you. ✨
                Happy saving ;) ✨
              </span>
            </p>
          </div>

          <p className="text-3xl md:text-4xl font-bold text-primary">Team</p>

          <div
            className={`px-7 py-8 rounded-lg flex flex-row items-center justify-center space-x-6`}
          >
            <div className="md:m-0">
              <Tooltip title="Bereket Semagn" position="top">
                <Image
                  className="rounded-lg"
                  src="/assets/bereket.png"
                  alt="Snapsaver Logo"
                  width={125}
                  height={125}
                  priority={true}
                />
              </Tooltip>
            </div>
            <div className="md:m-0">
              <Tooltip title="Addis Semagn" position="top">
                <Image
                  className="rounded-lg"
                  src="/assets/addis.png"
                  alt="Snapsaver Logo"
                  width={125}
                  height={125}
                  priority={true}
                />
              </Tooltip>
            </div>
          </div>

          <div className="px-7">
            <p className="text-center text-lg text-gray-400 md:w-[700px]">
              Snapsaver was built by this sibling duo from Canada 😎
            </p>
          </div>
        </div>

        <Footer />
      </Container>
    </>
  );
};

export default About;
