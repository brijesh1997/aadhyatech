import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import BrandMarquee from "@/components/home/BrandMarquee";
import WhoWeAre from "@/components/home/WhoWeAre";
import FeatureList from "@/components/home/FeatureList";
import Pricing from "@/components/home/Pricing";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Hero />
        <BrandMarquee />
        <WhoWeAre />
        <FeatureList />
        <Pricing />
      </div>
      <Footer />
    </main>
  );
}
