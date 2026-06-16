import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import SeeItInAction from "@/components/landing/SeeItInAction";
import BeforeAfter from "@/components/landing/BeforeAfter";
import Footer from "@/components/landing/Footer";

const Index = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Nav />
    <main>
      <Hero />
      <SeeItInAction />
      <BeforeAfter />
    </main>
    <Footer />
  </div>
);

export default Index;
