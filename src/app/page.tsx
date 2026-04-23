import { HeroSection } from "@/components/ui/HeroSection";
import { FeaturesSection } from "@/components/ui/FeaturesSection";
import { PropertiesSection } from "@/components/ui/PropertiesSection";
import { CTASection } from "@/components/ui/CTASection";
import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f1e8] text-zinc-950">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PropertiesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
