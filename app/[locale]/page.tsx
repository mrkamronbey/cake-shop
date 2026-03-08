import { getProducts } from "@/lib/products-store";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import MenuSection from "@/components/sections/MenuSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import PortfolioSection from "@/components/sections/PortfolioSection";
import CustomOrderSection from "@/components/sections/CustomOrderSection";
import ReviewsSection from "@/components/sections/ReviewsSection";
import DeliverySection from "@/components/sections/DeliverySection";
import PromoBanner from "@/components/sections/PromoBanner";
import FAQSection from "@/components/sections/FAQSection";
import InstagramSection from "@/components/sections/InstagramSection";
import AboutSection from "@/components/sections/AboutSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <Hero />
      <div className="bg-cream-50">
        <MenuSection products={products} />
        <Features />
        <HowItWorksSection />
        <PortfolioSection />
        <CustomOrderSection />
        <ReviewsSection />
        <DeliverySection />
        <PromoBanner />
        <FAQSection />
        <InstagramSection />
        <AboutSection />
      </div>
    </>
  );
}
