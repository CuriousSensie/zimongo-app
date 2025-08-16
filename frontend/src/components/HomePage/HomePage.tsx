import HeroSection from "@/components/HeroSection/HeroSection";
import BrandLogos from "@/components/BrandLogos/BrandLogos";
import LatestAds from "@/components/LatestLeads/LatestLeads";
import FeaturedAds from "@/components/FeaturedAds/FeaturedAds";
import StatsSection from "@/components/StatsSection/StatsSection";
import TestimonialsSection from "@/components/Testimonials/Testimonials";
import BodyTypesSection from "@/components/BodyTypesSection/BodyTypesSection";
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