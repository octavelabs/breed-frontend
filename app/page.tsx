import Community from "./components/landingPage/Community";
import Footer from "./components/landingPage/Footer";
import GetBreedApp from "./components/landingPage/GetBreedApp";
import GrowInGrace from "./components/landingPage/GrowInGrace";
import Hero from "./components/landingPage/Hero";
import Navbar from "./components/landingPage/Navbar";
import TheGreatCommission from "./components/landingPage/TheGreatCommision";


export default function Home() {
  return (
    <>
    <Navbar />
    <div className="min-h-screen overflow-hidden bg-[#F7EDFE] px-6">
      <Hero />
      <TheGreatCommission />
      <GrowInGrace />
      <Community />
      <GetBreedApp />
    </div>
    <Footer />
    </>
  );
}
