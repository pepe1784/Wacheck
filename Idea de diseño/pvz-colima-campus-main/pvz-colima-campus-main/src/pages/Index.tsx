import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import FeaturesSection from "@/components/FeaturesSection";
import BachilleratoSection from "@/components/BachilleratoSection";
import WaterCalculator from "@/components/WaterCalculator";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <BachilleratoSection />
      <WaterCalculator />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
