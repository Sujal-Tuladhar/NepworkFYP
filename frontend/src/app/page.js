import ContentPart from "./components/ContentPart/ContentPart.jsx";
import Featured from "./components/featured/Featured.jsx";
import TrustedBy from "./components/trustedBy/TrustedBy.jsx";
import Faq from "./components/faq/Faq.jsx";
import ContactUs from "./components/ContactUs/ContactUs.jsx";
import Footer from "./components/footer/Footer.jsx";
export default function Home() {
  return (
    <div>
      <Featured />
      <TrustedBy />
      <ContentPart />
      <Faq />
      <ContactUs />
      <Footer />
    </div>
  );
}
