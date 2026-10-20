export const Hero = ({ backgroundImage, title, position = "center" }) => {
  return (
    <section
      className="relative flex h-[500px] w-full items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: position,
      }}
    >
      <div className="absolute inset-0 bg-[#12022b]/70" />
      <h1 className="relative z-10 text-center text-5xl font-bold tracking-wide text-white drop-shadow-lg md:text-7xl">
        {title}
      </h1>
    </section>
  );
};
