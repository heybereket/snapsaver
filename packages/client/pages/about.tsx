import Image from "next/image";

const About = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="flex mt-[15px] md:mt-[35px] px-7 py-4">
        <Image
          src="/assets/founders-photo.png"
          className="rounded-3xl"
          width={600}
          height={300}
          alt="Founders"
        />
      </div>

      <div>
          <h1 className="text-center text-4xl md:text-6xl font-bold text-primary">
              About
          </h1>
      </div>
    </div>
  );
};

export default About;
