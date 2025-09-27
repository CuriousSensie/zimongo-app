import HeroSection from "@/components/HomePage/HeroSection";
import LatestAds from "@/components/HomePage/LatestLeads";
import FeaturedAds from "@/components/HomePage/FeaturedProfiles";
import StatsSection from "@/components/HomePage/StatsSection";
import TestimonialsSection from "@/components/HomePage/Testimonials";
import BodyTypesSection from "@/components/HomePage/BodyTypesSection";
import SiteHeader from "../common/Headers/SiteHeader";
import AboutSection from "./AboutSection";
import FeaturedProfiles from "@/components/HomePage/FeaturedProfiles";
import ManufacturingSection from "./ManufacturingSection";
import CTASection from "./CTASection";
import Footer from "../common/Footer/page";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <HeroSection />
      <AboutSection />
      <FeaturedProfiles />
      <ManufacturingSection />
      {/* <LatestAds /> */}
      {/* <StatsSection /> */}
      <TestimonialsSection />
      <CTASection />
      {/* <BodyTypesSection /> */}
      <Footer />
    </div>
  );
};

export default Index;