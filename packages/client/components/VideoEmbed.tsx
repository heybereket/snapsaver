export const VideoEmbed = () => {
  const videoURL = "https://www.youtube.com/embed/EdHGU22uMOI";

  return (
    <div className="flex items-center justify-center mt-5">
      <iframe
        src={videoURL}
        title="Snapsaver Demo"
        className="h-[400px] w-[700px] rounded-2xl"
      ></iframe>
    </div>
  );
};
