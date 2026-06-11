import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import BeforeAfter from "@/components/landing/BeforeAfter";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";

const Index = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Nav />
    <main>
      <Hero />
      <BeforeAfter />
      <Features />
    </main>
    <Footer />
  </div>
);

export default Index;
