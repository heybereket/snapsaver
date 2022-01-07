import { Link } from "./Link";
import { VideoEmbed } from "./VideoEmbed";
import Image from "next/image";

export const Instructions = () => {
  const discordServerURL = "https://discord.gg/2n6gCTZ7sB";

  return (
    <div className="flex items-center justify-center mt-10">
      <div className="bg-navbar rounded-lg w-[800px] px-10 py-8">
        <h1 className="text-secondary text-4xl font-bold text-center mb-2">
          How to use Snapsaver
        </h1>
        <p className="text-center text-gray-400 mb-10">
          Have feedback or encountering issues? Join the{" "}
          <a href={discordServerURL} className="text-[#5865F2] hover:text-primary">
            Discord
          </a>.
        </p>

        <div className="mb-10">
          <VideoEmbed />
        </div>

        <h3 className="text-secondary text-2xl mt-2 font-semibold">
          <b>Step 1:</b> Get your data from Snapchat{" "}
        </h3>

        <ol className="list-decimal text-secondary px-6 py-3 space-y-4">
          <li className="text-xl">
            Go to{" "}
            <Link
              url="https://accounts.snapchat.com/accounts/downloadmydata"
              content="Snapchat's Download My Data"
            />{" "}
            &gt; Login &gt; Scroll to the bottom &gt; Click “Submit Request” to
            request your data.
          </li>
          <li className="text-xl">
            Once it&apos;s is ready, you&apos;ll receive an email from Snapchat
            titled “Your Snapchat data is ready for download”. Follow the steps
            to download a file that looks like{" "}
            <span className="text-primary font-bold">
              mydata~1640899538387.zip
            </span>
            .
          </li>
          <li className="text-xl">
            Uncompress the zip folder and you&apos;ll get something that looks
            like the below. You&apos;ll need{" "}
            <span className="text-primary font-bold">
              memories_history.json
            </span>{" "}
            for the next step ✅
            <div className="mt-4 mb-4">
              <Image
                src="/assets/folder_structure.jpg"
                height={300}
                width={900}
                className="rounded-lg"
                alt="Folder structure"
              />
            </div>
          </li>
        </ol>

        <h3 className="text-secondary text-2xl mt-2 font-semibold">
          <b>Step 2:</b> Snapsaver
        </h3>
        <ol className="list-decimal text-secondary px-6 py-3 space-y-4">
          <li className="text-xl">
            <span className="text-primary font-bold">Sign in with Google</span>{" "}
            (top right). Snapsaver requests the minimum credentials (access to
            your email and <i>only</i> the Google Drive files Snapsaver
            creates).
            <div className="mt-3">
              ✨ <b>Pro-tip:</b> Snapsaver is limited by the storage you have
              available; to make use of the entire free 15GB Google provides,
              create a new email!
            </div>
          </li>
          <li className="text-xl">
            <span className="text-primary font-bold">Upload</span> your
            memories_history.json file, then{" "}
            <span className="text-primary font-bold">Start Download</span> ✅
            Your memories will download to a folder called
            &quot;Snapsaver&quot;.
            <div className="mt-3">
              ⚡ Refresh this page to track the progress, or hit{" "}
              <span className="text-primary font-bold">go to folder</span> to
              start your trip down memory lane!
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
};
