import HeroSection from "@/components/HomePage/HeroSection";
import BrandLogos from "@/components/HomePage/BrandLogos";
import LatestAds from "@/components/HomePage/LatestLeads";
import FeaturedAds from "@/components/HomePage/FeaturedAds";
import StatsSection from "@/components/HomePage/StatsSection";
import TestimonialsSection from "@/components/HomePage/Testimonials";
import BodyTypesSection from "@/components/HomePage/BodyTypesSection";
import SiteHeader from "../Headers/SiteHeader";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <HeroSection />
      <BrandLogos />
      <FeaturedAds />
      <LatestAds />
      <StatsSection />
      <TestimonialsSection />
      <BodyTypesSection />
    </div>
  );
};

export default Index;