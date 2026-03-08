"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Terminal, Cpu, Target, FileCode2, X } from "lucide-react";

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features = [
    {
      id: "ai-assistant",
      icon: <Cpu className="h-6 w-6 text-primary" />,
      title: "AI Writing Assistant",
      shortDesc: "Leverage advanced AI to rewrite, structure, and optimize your experience.",
      fullColor: "from-green-500 to-emerald-700",
      content: (
        <div className="space-y-4 text-left">
          <p className="text-slate-300 font-mono">
            Don't worry about finding the perfect action verb. Our neural pipeline uses Groq's Llama-3.3-70B model to instantly translate your rough bullet points into highly professional, achievement-focused language.
          </p>
          <div className="bg-black/50 p-4 rounded-sm border border-border mt-4">
            <div className="text-red-400 text-xs mb-2">- Before (Your Input)</div>
            <div className="text-sm font-mono text-muted-foreground mb-4">"I helped make the app faster and fixed bugs."</div>

            <div className="text-green-400 text-xs mb-2">+ After (AI Output)</div>
            <div className="text-sm font-mono text-white">"Spearheaded performance optimizations, reducing application latency by 40% while resolving critical system bugs to improve uptime."</div>
          </div>
        </div>
      )
    },
    {
      id: "ats-score",
      icon: <Target className="h-6 w-6 text-primary" />,
      title: "ATS Score Checker",
      shortDesc: "Receive a precise score and actionable feedback indicating how well your resume will perform.",
      fullColor: "from-blue-500 to-cyan-600",
      content: (
        <div className="space-y-4 text-left">
          <p className="text-slate-300 font-mono">
            Applicant Tracking Systems (ATS) reject 75% of resumes before a human ever sees them. Our built-in scoring engine evaluates your generated resume against these exact algorithms.
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4 text-sm text-slate-400 font-mono">
            <li><strong className="text-white">Keyword Parsing:</strong> Ensures your skills and titles map correctly.</li>
            <li><strong className="text-white">Quantitative Impact:</strong> Checks if you are using enough metrics and numbers.</li>
            <li><strong className="text-white">Actionable Feedback:</strong> The AI tells you exactly what to type to raise your score.</li>
          </ul>
        </div>
      )
    },
    {
      id: "premium-templates",
      icon: <FileCode2 className="h-6 w-6 text-primary" />,
      title: "Premium Templates",
      shortDesc: "Choose from a selection of modern, beautifully designed templates before downloading your finished PDF.",
      fullColor: "from-purple-500 to-pink-600",
      content: (
        <div className="space-y-4 text-left">
          <p className="text-slate-300 font-mono">
            A resume should look as good as it reads. Once the AI has compiled your data, you can seamlessly switch between three high-impact chassis layouts:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-card/50 p-3 border border-border rounded-sm text-center">
              <span className="text-primary font-bold uppercase text-xs">Corporate</span>
              <p className="text-[10px] text-muted-foreground mt-1 font-mono">Modern, with tech-focused accents.</p>
            </div>
            <div className="bg-white p-3 border border-border rounded-sm text-center">
              <span className="text-black font-bold uppercase text-xs">Standard</span>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">100% legacy ATS compatibility.</p>
            </div>
            <div className="bg-black p-3 border border-primary/50 rounded-sm text-center">
              <span className="text-green-500 font-bold uppercase text-xs">Terminal</span>
              <p className="text-[10px] text-green-500/70 mt-1 font-mono">Pure hacker monospace vibe.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center overflow-hidden font-sans">

      {/* Top Navigation Bar with Authentication Links */}
      <nav className="w-full max-w-7xl px-6 md:px-12 py-6 flex justify-between items-center relative z-20">
        <div className="text-xl font-black uppercase text-white tracking-widest flex items-center space-x-2">
          <Terminal size={20} className="text-primary" />
          <span>AutoResume</span>
        </div>
        <div className="flex space-x-6 items-center font-mono text-sm uppercase tracking-wider">
          <div className="hidden sm:flex space-x-6">
            <Link href="/score" className="text-muted-foreground hover:text-white transition-colors">
              Check ATS Score
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-white transition-colors">
              Log In
            </Link>
          </div>
          <Link href="/signup" className="border border-primary/50 text-primary hover:bg-primary/10 px-4 py-2 rounded-sm transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)]">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Background Matrix/Grid Effect */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Ambient Green Glows */}
      <div className="absolute top-0 -z-10 h-full w-full">
        <div className="absolute bottom-auto left-auto right-10 top-20 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]"></div>
        <div className="absolute bottom-10 left-10 right-auto top-auto h-[400px] w-[400px] rounded-full bg-emerald-900/20 blur-[100px]"></div>
      </div>

      <main className="relative z-10 flex-1 w-full max-w-7xl px-6 md:px-12 py-16 flex flex-col items-center text-center">



        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-8xl font-black tracking-tighter text-foreground max-w-5xl uppercase"
        >
          Build A{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">
            Professional Resume
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-xl text-muted-foreground max-w-2xl leading-relaxed font-mono"
        >
          Use advanced AI to transform your initial ideas and work history into an optimized, ATS-compliant resume that gets results.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 flex flex-col sm:flex-row gap-6 font-mono"
        >
          <Link
            href="/build"
            className="group relative inline-flex items-center justify-center bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] space-x-2 rounded-sm overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="relative z-10 uppercase tracking-wider">Build Your Resume</span>
            <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/score"
            className="inline-flex items-center justify-center border border-primary/50 bg-primary/10 px-8 py-4 text-base font-bold text-primary transition-all hover:bg-primary/20 uppercase tracking-wider rounded-sm backdrop-blur-sm shadow-[0_0_15px_rgba(34,197,94,0.1)]"
          >
            Check ATS Score
          </Link>
          <a
            href="#features-section"
            className="inline-flex items-center justify-center border border-border bg-card/50 px-8 py-4 text-base font-bold text-foreground transition-all hover:border-primary/50 hover:bg-secondary uppercase tracking-wider rounded-sm backdrop-blur-sm shadow-sm"
          >
            Explore Features
          </a>
        </motion.div>

        {/* Interactive Feature Highlights Grid */}
        <div id="features-section" className="mt-32 w-full pt-10">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-10 font-mono">Click A Feature To Expand</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full relative">
            {features.map((feature, i) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 + (i * 0.1) }}
                onClick={() => setActiveFeature(feature.id)}
                className="group cursor-pointer flex flex-col items-start p-8 rounded-sm bg-card/60 border border-border backdrop-blur-md hover:border-primary/50 transition-colors duration-300 shadow-xl overflow-hidden relative"
              >
                {feature.id === "ats-score" && (
                  <div className="absolute top-0 right-0 p-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest z-10">New</div>
                )}

                {/* Hover Reveal Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="h-12 w-12 rounded-sm bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(34,197,94,0.1)] relative z-10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 font-mono uppercase tracking-wide text-white relative z-10">{feature.title}</h3>
                <p className="text-muted-foreground text-left text-sm leading-relaxed relative z-10">
                  {feature.shortDesc}
                </p>

                <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
                  Interact <ArrowRight size={14} className="ml-2" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </main>

      {/* Expanded Feature Modal/Overlay */}
      <AnimatePresence>
        {activeFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setActiveFeature(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border w-full max-w-2xl rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative"
            >
              {/* Top Bar */}
              <div className="flex justify-between items-center p-4 border-b border-border bg-background/50">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Terminal size={14} className="text-primary" /> System Database Entry
                </span>
                <button onClick={() => setActiveFeature(null)} className="text-muted-foreground hover:text-white transition-colors p-1">
                  <X size={20} />
                </button>
              </div>

              {/* Content Area */}
              {features.filter(f => f.id === activeFeature).map(feature => (
                <div key={feature.id} className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-4 rounded-sm bg-gradient-to-br ${feature.fullColor} text-white shadow-lg`}>
                      {feature.icon}
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">{feature.title}</h2>
                  </div>
                  {feature.content}

                  <div className="mt-10 pt-6 border-t border-border flex justify-end">
                    <Link href="/build" onClick={() => setActiveFeature(null)} className="px-6 py-3 bg-primary text-primary-foreground font-bold font-mono text-sm uppercase tracking-widest hover:bg-green-400 transition-colors rounded-sm shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                      Test It Out
                    </Link>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
