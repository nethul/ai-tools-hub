import Hero from "../components/Hero";
import ToolsGrid from "../components/ToolsGrid";
import Footer from "../components/Footer";

function SEOText() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-slate-300">
      <h2 className="text-3xl font-bold text-white mb-6">Explore the Ultimate Collection of Free AI Productivity Tools</h2>
      <div className="space-y-4 text-lg">
        <p>
          Welcome to <strong>AI Tool Verse</strong>, your premier destination for curated, high-performance artificial intelligence applications. In a rapidly evolving digital landscape, finding the right AI tools can be overwhelming. We have bridged the gap by assembling an elite suite of <em>free AI productivity tools</em> designed to automate your workflow, enhance your creativity, and streamline complex tasks.
        </p>
        <p>
          Whether you are looking for an advanced <strong>AI movie recommender</strong> like MovieMatch AI to end your scrolling paralysis, a reliable <strong>AI fact-checker</strong> to verify news in real-time, or a robust <strong>AI text summarizer</strong> to condense long articles into actionable insights, our platform offers a specialized tool for every need. By leveraging state-of-the-art natural language processing (NLP) and machine learning models, our web applications deliver enterprise-grade accuracy directly in your browser.
        </p>
        <p>
          Why choose AI Tool Verse? Unlike generic chatbots, our applications are purpose-built. From <em>image upscaling</em> and <em>background removal</em> to <em>automated CV generation</em> and <em>viral news curation</em>, each tool is fine-tuned to solve a specific problem efficiently. Boost your daily productivity and discover the true potential of AI-powered software today.
        </p>
      </div>
    </div>
  );
}

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
        <SEOText />
        <Footer />
      </div>
    </div>
  );
}
