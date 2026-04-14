import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  HeroSection,
  FeatureGrid,
  TestimonialSlider,
} from "@/components/landing";
import { InspireTeaser } from "@/components/discovery/InspireTeaser";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeatureGrid />
        <InspireTeaser />
        <TestimonialSlider />
      </main>
      <Footer />
    </>
  );
}
