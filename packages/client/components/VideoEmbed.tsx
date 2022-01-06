export const VideoEmbed = () => {
  const videoURL = "https://www.youtube.com/embed/1atgO0NfNxc?modestbranding=1";

  return (
    <div className="flex items-center justify-center mt-5 aspect-w-16 aspect-h-9">
      <iframe
        src={videoURL}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-lg"
      ></iframe>
    </div>
  );
};
