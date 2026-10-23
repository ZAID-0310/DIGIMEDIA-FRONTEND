import { Hero } from "../components/page_components/Hero";
import Enlaces from "./components/Enlaces";
import WhatsAppButton from "../components/WhatsAppButton";
import MayaChatbot from "../components/Chatbot";

export default function Page() {
  return (
    <>
      <Hero
        backgroundImage="/blog/fondo.webp"
        title="BLOGS"
        position="center 40%"
      />

      {/* <Principal></Principal> */}
      <Enlaces></Enlaces>
      <WhatsAppButton />
      <MayaChatbot />
    </>
  );
}
