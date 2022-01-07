import Image from "next/image";

export const LoadingScreen = () => {
  return (
    <div
      className={`px-7 py-8 rounded-lg flex flex-col md:flex-row items-center justify-center mb-5 opacity-75`}
    >
      <div className="mt-10 md:m-0">
        <Image
          className="py-2 pr-4 ml-8 mt-16"
          src="/assets/snapsaver-logo.png"
          alt="Snapsaver Logo"
          priority={true}
          width={70}
          height={68}
        />
      </div>
      <div className="flex flex-col px-4">
        <p className="text-center text-4xl md:text-6xl font-bold text-primary">
          Snapsaver
        </p>
        <span className="text-center md:text-lg text-secondary">
          Export all your Snapchat memories
        </span>
      </div>
    </div>
  );
};
