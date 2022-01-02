import { Link } from "./Link";

export const Footer = () => {
  return (
    <div className="px-4 py-2 mt-5 rounded-lg flex flex-col md:flex-row items-center justify-center text-center">
      <div>
        made by{" "}
        <Link url="https://twitter.com/heybereket" content="@heybereket" /> and{" "}
        <Link url="https://twitter.com/addissemagn" content="@addissemagn" />
        <br />
        <span>
          open source on{" "}
          <Link
            url="https://github.com/heybereket/snapsaver"
            content="github"
          />
        </span>
      </div>
    </div>
  );
};
