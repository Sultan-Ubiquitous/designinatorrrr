import Button from "@/components/Button";

export default function Home() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_60%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(0,0,0,0.6),transparent_60%)] pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 leading-tight">
          Build Beautifully.<br />
          Analyze. Synthesize. Generate.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-300 leading-relaxed">
          Transform your design tokens and component patterns into a living design system.
          Every pixel. Every detail. Perfectly consistent.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Button variant="primary" size="lg">
            Get Started →
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>

      {/* Decorative gradient blob */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-purple-600 to-pink-500 rounded-full blur-3xl opacity-40 -z-10"></div>
    </section>
  );
}
