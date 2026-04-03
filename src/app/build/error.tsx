'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home, Terminal } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('CRITICAL CLIENT-SIDE EXCEPTION:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] opacity-20"></div>

      <div className="relative z-10 max-w-2xl w-full bg-card/40 border border-red-500/30 p-10 rounded-sm backdrop-blur-xl shadow-[0_0_50px_rgba(239,68,68,0.1)]">
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-red-500/10 rounded-sm border border-red-500/20">
                <AlertTriangle className="text-red-500 h-8 w-8" />
            </div>
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter text-white">System Exception Detected</h1>
                <p className="text-xs font-mono text-red-400 uppercase tracking-widest mt-1">Error Code: {error.digest || 'SIG_RUNTIME_CRASH'}</p>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-black/60 p-6 border border-white/5 rounded-sm">
                <div className="flex items-center gap-2 mb-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    <Terminal size={12} className="text-primary" /> Stack Trace Diagnostic
                </div>
                <p className="text-sm font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                    {error.message || 'An unexpected client-side exception occurred during the hydration cycle.'}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button
                    onClick={() => reset()}
                    className="flex items-center justify-center gap-3 bg-white text-black font-bold uppercase tracking-widest px-6 py-4 rounded-sm hover:bg-slate-200 transition-all shadow-lg active:scale-95"
                >
                    <RefreshCcw size={18} />
                    Reset Session
                </button>
                <Link
                    href="/"
                    className="flex items-center justify-center gap-3 border border-white/20 bg-white/5 text-white font-bold uppercase tracking-widest px-6 py-4 rounded-sm hover:bg-white/10 transition-all"
                >
                    <Home size={18} />
                    Return Home
                </Link>
            </div>
        </div>

        <p className="mt-10 text-center text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em]">
            AutoResume Neural Security Protocol V2.1
        </p>
      </div>
    </div>
  );
}
