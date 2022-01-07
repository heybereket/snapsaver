import Image from "next/image";
import { Container } from "../components/Container";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { LoadingScreen } from "../components/screens/LoadingScreen";
import { Tooltip } from "../components/Tooltip";
import { SEO } from "../components/SEO";
import { useUser } from "../lib/fetcher";
import { Link } from "../components/Link";

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
          <div className="px-7 py-5">
            <p className="text-center text-4xl font-bold text-primary">About</p>

            <p className="text-lg text-gray-400 md:w-[700px] mt-5 mb-5">
              <div className="mb-3">
                <span className="text-italic">
                  Downloading your Snapchat memories should be a breeze.
                  That&apos;s why we made Snapsaver.
                </span>{" "}
              </div>
              <div className="mb-3">
                <span>
                  Though Snapchat is legally required to provide you with all
                  the data it&apos;s collected on you, they sure make it hard to
                  work with. Snapchat has no way to export all of your memory media
                  files at once. Instead, your memories are given as a list of
                  links in a file called memories_history.json. On top of that -
                  technical jargon aside - these links lead to another link,
                  which is the actual link to download your file. For context,
                  ours had 5,600, and yours may have many more.
                </span>
              </div>
              <div className="mb-3">
                <span>
                  Snapsaver is simple yet effective. Whether you want to have a
                  safe copy of your memories, access them outside of your phone,
                  or delete the app entirely, you don&apos;t have to download them a
                  few at a time or worry about your phone&apos;s storage.
                </span>
              </div>
              <span>
                If you have any feedback, we&apos;d love to{" "}
                <Link
                  url="https://discord.gg/2n6gCTZ7sB"
                  content="hear from you"
                />
                . ✨ Happy saving ;) ✨
              </span>
            </p>
          </div>

          <div className="px-7 py-5 text-center">
            <p className="text-center text-4xl font-bold text-primary">FAQ</p>

            <div className="text-lg text-gray-400 md:w-[700px] mt-5 mb-5">
              <div className="mb-3">
                <ol className="list-decimal space-y-4 text-left">
                  <li>
                    <p className="mb-2 text-secondary ">
                      What are Snapchat memories?
                    </p>
                    Memories are Snaps and Stories that you took on Snapchat and
                    decided to save.
                  </li>
                  <li>
                    <p className="mb-2 text-secondary ">
                      Can Snapsaver recover Snapchat memories from a deleted
                      account?
                    </p>
                    Unfortunately, Snapsaver can only export data that Snapchat
                    still has. According to{" "}
                    <Link
                      url="https://support.snapchat.com/en-US/a/delete-my-account1"
                      content="Snapchat's Delete My Account"
                    />
                    , after deleteing your account, they hold on to your data
                    for 30 days before deleteing it permanently. If it&apos;
                    been less than 30 days for you, their instructions to
                    recover your data.
                  </li>
                  <li>
                    <p className="mb-2 text-secondary ">
                      What about media saved in my private chats?
                    </p>
                    Snapchat doesn&apos;t provide links to media saved in
                    private chats, so Snapsaver can&apos;t back it up for you.
                  </li>
                  <li>
                    <p className="mb-2 text-secondary ">
                      Can Snapsaver save my memories to a cloud storage provider
                      other than Google Drive?
                    </p>
                    If there&apos;s a service you&apos;d like to see, let us
                    know.
                  </li>
                  <li>
                    <p className="mb-2 text-secondary ">Can I see the code?</p>
                    Of course, Snapsaver is open source and{" "}
                    <Link
                      url="https://github.com/heybereket/snapsaver"
                      content="available on Github"
                    />
                    .
                  </li>
                </ol>
              </div>
            </div>
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
