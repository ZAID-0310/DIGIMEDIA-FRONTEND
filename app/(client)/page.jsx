import dynamic from "next/dynamic";
import Banner from "./components/Home_Components/Banner";

const Servicios = dynamic(
  () => import("./components/Home_Components/Servicios"), 
  { loading: () => <div className="h-[600px] bg-transparent" /> }
);

const Testimonios = dynamic(
  () => import("./components/Home_Components/Testimonios"),
  { loading: () => <div className="h-[400px] bg-transparent" /> }
);

const TestimoniosClientes = dynamic(
  () => import("./components/Home_Components/TestimoniosClientes"),
  { loading: () => <div className="h-[600px] bg-transparent" /> }
);

const ClientSideComponents = dynamic(
  () => import("./components/ClientSideComponents")
);

export default function Home() {
  return (
    <div
      className="w-full relative min-h-screen text-white bg-gradient-to-br from-[#000118] via-[#410C89] to-[#000118]"
      style={{
        background: "linear-gradient(135deg, #000118 0%, #410C89 50%, #000118 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <Banner />
      <Servicios />
      <Testimonios />
      <TestimoniosClientes />
      <ClientSideComponents />
    </div>
  );
}