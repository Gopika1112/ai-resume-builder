"use client";

import { Download } from "lucide-react";

export function PrintButton() {
    return (
        <button
            className="group relative inline-flex items-center space-x-2 bg-primary hover:bg-green-400 text-primary-foreground px-6 py-3 rounded-sm font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] overflow-hidden"
            onClick={() => window.print()}
        >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <Download size={18} className="relative z-10" />
            <span className="hidden sm:inline relative z-10">Export PDF (Ctrl+P)</span>
        </button>
    );
}
