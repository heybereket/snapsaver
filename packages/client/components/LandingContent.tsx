import { Link } from "./Link";
import { VideoEmbed } from "./VideoEmbed";
import Image from "next/image";

export const LandingContent = () => {
  return (
    <div className="flex items-center justify-center mt-10">
      <div className="bg-navbar rounded-lg w-[1000px] px-10 py-8">
        <h1 className="text-secondary text-4xl font-bold text-center mb-10">
          How to use Snapsaver
        </h1>

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
            your email and <i>only</i> the files Snapsaver creates).
            <div className="mt-3">
              ✨ <b>Pro-tip:</b> Snapsaver is limited by the storage you have
              available; to make use of the entire free 15GB Google provides,
              create a new email.
            </div>
          </li>
          <li className="text-xl">
            Click <span className="text-primary font-bold">Upload</span> and add
            your{" "}
            <span className="text-primary font-bold">
              memories_history.json
            </span>{" "}
            file.
          </li>
          <li className="text-xl">
            Click <span className="text-primary font-bold">Process file</span>.
            Then, refresh to see the progress until it&apos;s complete.
          </li>
          <li className="text-xl">
            Click <span className="text-primary font-bold">Save to Drive</span>{" "}
            ✅ This will create a folder called “Snapsaver” on your Google Drive
            account and begin downloading your files! Go ahead and and refresh
            that folder to see your memories as they download.
          </li>
        </ol>
      </div>
    </div>
  );
};
