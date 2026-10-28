import MouseScroll from "./components/MouseScroll";

export default function Home() {
  return (
    <main className="relative bg-[#050505] text-[#ededed] selection:bg-white/20 selection:text-white">
      {/* Sleek Floating Glass Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-full bg-[#0a0a0a]/95 border border-white/[0.08] shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-white text-base font-semibold tracking-tighter">
              WSP
            </span>
            <span className="text-white/40 text-[9px] tracking-[0.25em] uppercase font-mono px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">
              STUDIO
            </span>
          </div>

          <div className="flex items-center gap-6 sm:gap-8">
            <a
              href="#specs"
              className="text-white/50 text-[11px] tracking-[0.2em] uppercase font-mono hover:text-white transition-colors duration-300 hidden md:inline"
            >
              Specifications
            </a>
            <a
              href="#engineering"
              className="text-white/50 text-[11px] tracking-[0.2em] uppercase font-mono hover:text-white transition-colors duration-300 hidden md:inline"
            >
              Engineering
            </a>
            <button
              className="px-4 py-1.5 rounded-full bg-white text-black text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300"
            >
              Pre-order
            </button>
          </div>
        </nav>
      </header>

      {/* Scrollytelling Section */}
      <MouseScroll />

      {/* Footer Section */}
      <footer id="specs" className="relative bg-[#050505] py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Divider */}
          <div className="w-full h-[1px] bg-white/[0.06] mb-16" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Brand */}
            <div>
              <h3 className="text-white/90 text-2xl font-semibold tracking-tighter mb-3">WSP</h3>
              <p className="text-white/30 text-sm font-light leading-relaxed max-w-xs">
                Precision engineering meets wireless freedom. Designed for those who demand 
                perfection.
              </p>
            </div>

            {/* Specs */}
            <div>
              <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase font-light mb-5">
                Specifications
              </p>
              <div className="space-y-3">
                {[
                  ["Weight", "58g"],
                  ["Sensor", "26,000 DPI"],
                  ["Polling Rate", "8,000 Hz"],
                  ["Battery", "80 hrs"],
                  ["Switches", "Optical"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-baseline">
                    <span className="text-white/40 text-xs font-light">{label}</span>
                    <span className="text-white/70 text-xs font-light tabular-nums">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase font-light mb-5">
                Company
              </p>
              <div className="space-y-3">
                {["About", "Careers", "Press", "Contact"].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-white/40 text-xs font-light hover:text-white/80 transition-colors duration-500"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/20 text-[10px] tracking-[0.15em] uppercase font-light">
              © 2026 WSP Technologies. All rights reserved.
            </p>
            <p className="text-white/20 text-[10px] tracking-[0.15em] uppercase font-light">
              Designed in Tokyo
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
