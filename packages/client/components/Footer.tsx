export const Footer = () => {
  return (
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
  );
};
