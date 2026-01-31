"use client";

import { ArrowRight, BarChart2, Zap, Activity, Layers } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#050505] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200">

      {/* Background: Noise & Grid */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
        {/* Perspective Grid */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
          style={{ transform: 'perspective(1000px) rotateX(60deg) translateY(100px) scale(3)' }}>
        </div>
      </div>

      {/* Animated Gradient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="animate-blob absolute -top-[10%] left-[20%] h-[40vh] w-[40vh] rounded-full bg-cyan-500/20 mix-blend-screen blur-[100px] filter"></div>
        <div className="animate-blob [animation-delay:2000ms] absolute top-[10%] right-[20%] h-[40vh] w-[40vh] rounded-full bg-purple-500/10 mix-blend-screen blur-[100px] filter"></div>
        <div className="animate-blob [animation-delay:4000ms] absolute -bottom-[10%] left-[30%] h-[30vh] w-[30vh] rounded-full bg-blue-500/10 mix-blend-screen blur-[80px] filter"></div>
      </div>

      {/* Floating Mock Data Elements (Decorative) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Left Card */}
        <div className="absolute top-1/4 left-[5%] md:left-[10%] animate-fade-in-up [animation-delay:1500ms] opacity-0">
          <div className="w-48 p-3 rounded-xl border border-white/5 bg-white/5 backdrop-blur-md shadow-2xl skew-y-3 opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <div className="h-1.5 w-12 bg-white/10 rounded-full"></div>
            </div>
            <div className="space-y-1.5">
              <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500/50 to-transparent rounded-full"></div>
              <div className="h-1.5 w-2/3 bg-white/5 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Card */}
        <div className="absolute bottom-1/3 right-[5%] md:right-[10%] animate-fade-in-up [animation-delay:1800ms] opacity-0">
          <div className="w-56 p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-md shadow-2xl -skew-y-2 opacity-60">
            <div className="flex justify-between items-center mb-3">
              <div className="h-2 w-16 bg-white/10 rounded-full"></div>
              <Zap className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="flex gap-1 h-8 items-end">
              {[40, 70, 45, 90, 60, 80].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm bg-indigo-500/40" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-8 text-center max-w-5xl mx-auto">

          {/* Badge */}
          {/* Badge */}
          <div className="animate-fade-in-up opacity-0 [animation-delay:200ms] inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-950/30 px-4 py-1.5 text-sm text-cyan-300 backdrop-blur-md">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="tracking-wide text-xs font-bold uppercase">Coming Soon</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="animate-fade-in-up opacity-0 [animation-delay:400ms] text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-white">
              Deriverse <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600">Analytics</span>
            </h1>
            <p className="animate-fade-in-up opacity-0 [animation-delay:600ms] text-lg sm:text-2xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
              Unlock deep liquidity insights and real-time alpha for <span className="text-slate-200">Spot, Perpetuals, & Options</span> trading.
            </p>
          </div>

          {/* Separator */}
          <div className="animate-fade-in-up opacity-0 [animation-delay:800ms] flex items-center gap-4 text-slate-700/50 my-4">
            <div className="h-px w-12 bg-current"></div>
            <BarChart2 className="h-5 w-5 text-slate-600" />
            <div className="h-px w-12 bg-current"></div>
          </div>

          {/* CTA Section */}
          <div className="animate-fade-in-up opacity-0 [animation-delay:1000ms] w-full max-w-md">
            <form className="relative flex items-center group" onSubmit={(e) => e.preventDefault()}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <input
                type="email"
                placeholder="Enter work email for Access"
                className="relative w-full rounded-full border border-white/10 bg-black/40 px-6 py-4 pr-32 text-white placeholder-slate-500 backdrop-blur-xl transition-all focus:border-cyan-500/50 focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 rounded-full bg-slate-100 px-6 font-semibold text-black shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                Join
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-4 text-xs text-slate-500 font-mono">
              // INTELLIGENCE_LOADING...
            </p>
          </div>

        </div>

        {/* Footer info */}
        <footer className="animate-fade-in opacity-0 [animation-delay:1500ms] absolute bottom-8 w-full flex justify-between px-10 text-xs font-mono text-slate-700 uppercase tracking-widest">
          <div>v1.0-alpha</div>
          <div>[SECURE_CONNECTION]</div>
        </footer>
      </main>
    </div>
  );
}
