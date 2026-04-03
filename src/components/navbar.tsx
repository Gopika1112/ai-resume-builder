"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Terminal, LogOut, User as UserIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);

        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (!mounted) {
        return (
            <nav className="w-full max-w-7xl px-6 md:px-12 py-6 flex justify-between items-center relative z-20 mx-auto">
                <Link href="/" className="text-xl font-black uppercase text-white tracking-widest flex items-center space-x-2">
                    <Terminal size={20} className="text-green-400" />
                    <span>AutoResume</span>
                </Link>
            </nav>
        );
    }

    return (
        <nav className="w-full max-w-7xl px-6 md:px-12 py-6 flex justify-between items-center relative z-20 mx-auto">
            <Link href="/" className="text-xl font-black uppercase text-white tracking-widest flex items-center space-x-2">
                <Terminal size={20} className="text-green-400" />
                <span className="hidden sm:inline">AutoResume</span>
            </Link>

            {/* Authenticated Profile Pill (Centered) */}
            {user ? (
                <div className="flex-1 flex justify-center items-center space-x-4">
                    <div className="flex items-center space-x-3 bg-black/40 border border-border px-4 py-1.5 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                            <UserIcon size={14} />
                        </div>
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white truncate max-w-[150px]">
                            {user.email?.split('@')[0] || 'User'}
                        </span>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="p-2 text-muted-foreground hover:text-green-400 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            ) : null}

            <div className="flex space-x-6 items-center font-mono text-sm uppercase tracking-wider">
                <div className="hidden md:flex space-x-6">
                    <Link href="/" className="text-muted-foreground hover:text-white transition-colors">
                        Home
                    </Link>
                    {user && (
                        <Link href="/dashboard" className="text-muted-foreground hover:text-white transition-colors">
                            Dashboard
                        </Link>
                    )}
                    <Link href="/score" className="text-muted-foreground hover:text-white transition-colors">
                        ATS Score
                    </Link>
                </div>

                {!user ? (
                    <>
                        <Link href="/login" className="text-muted-foreground hover:text-white transition-colors hidden sm:block">
                            Log In
                        </Link>
                        <Link href="/signup" className="border border-green-500/50 text-green-400 hover:bg-green-500/10 px-4 py-2 rounded-sm transition-all shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                            Sign Up
                        </Link>
                    </>
                ) : null}
            </div>
        </nav>
    );
}

