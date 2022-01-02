export const Link = (props: any) => {
    return (
      <a
        className="text-primary hover:text-gray-500 font-bold underline decoration-dotted"
        href={props.url}
        target="_blank"
        rel="noreferrer"
      >
        {props.content}
      </a>
    );
  };