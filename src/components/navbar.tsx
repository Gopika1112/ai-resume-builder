"use client";

import Link from "next/link";
import { Terminal } from "lucide-react";

export function Navbar() {
    return (
        <nav className="w-full max-w-7xl px-6 md:px-12 py-6 flex justify-between items-center relative z-20 mx-auto">
            <Link href="/" className="text-xl font-black uppercase text-white tracking-widest flex items-center space-x-2">
                <Terminal size={20} className="text-primary" />
                <span>AutoResume</span>
            </Link>
            <div className="flex space-x-6 items-center font-mono text-sm uppercase tracking-wider">
                <div className="hidden sm:flex space-x-6">
                    <Link href="/dashboard" className="text-muted-foreground hover:text-white transition-colors">
                        Dashboard
                    </Link>
                    <Link href="/score" className="text-muted-foreground hover:text-white transition-colors">
                        ATS Score
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
    );
}
