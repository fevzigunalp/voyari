// Short revalidate → HTML shell rarely stales >60s, new deploys take effect
// quickly so browsers don't cling to dead chunk-hash references (MIME mismatch).
export const revalidate = 60;

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
