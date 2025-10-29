import FooterSection from "@/components/homepage/footer";
import HeroSection from "@/components/homepage/hero-section";
import BeforeAfterGallery from "@/components/homepage/before-after-gallery";
import FeaturesSection from "@/components/homepage/features-section";

export default async function Home() {
  return (
    <>
      <HeroSection />
      <BeforeAfterGallery />
      <FeaturesSection />
      <FooterSection />
    </>
  );
}
