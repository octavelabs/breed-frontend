import Community from "./components/Community";
import GetBreedApp from "./components/GetBreedApp";
import GrowInGrace from "./components/GrowInGrace";
import Hero from "./components/Hero";
import TheGreatCommission from "./components/TheGreatCommision";


export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#F7EDFE]">
      <Hero />
      <TheGreatCommission />
      <GrowInGrace />
      <Community />
      <GetBreedApp />
    </div>
  );
}
