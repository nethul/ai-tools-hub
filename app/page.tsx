import Hero from "../components/Hero";
import ToolsGrid from "../components/ToolsGrid";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Global Background for Landing Page */}
      <div className="fixed inset-0 z-0">
        <img
          src="/hero-bg.png"
          alt="Background"
          className="w-full h-full object-cover opacity-50"
        />
        {/* Global overlay to ensure text readability */}
        <div className="absolute inset-0 bg-slate-900/80"></div>
      </div>

      <div className="relative z-10">
        <Hero />
        <ToolsGrid />
        <Footer />
      </div>
    </div>
  );
}
