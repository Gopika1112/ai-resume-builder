"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Terminal, UserSquare2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            setError(signInError.message);
            setIsLoading(false);
        } else {
            router.push("/build");
            router.refresh();
        }
    };

    const inputClasses = "w-full px-4 py-3 rounded-sm border border-border bg-card focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-mono text-sm";
    const labelClasses = "block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 mt-4";

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">

            {/* Background Matrix/Grid Effect */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="absolute top-0 -z-10 h-full w-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md relative z-10"
            >
                <Link href="/" className="inline-flex items-center space-x-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest mb-8">
                    <ArrowLeft size={16} />
                    <span>Return to Base</span>
                </Link>

                <div className="bg-card/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden border border-border p-8">

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 border border-primary/20 rounded-sm shadow-[0_0_15px_rgba(34,197,94,0.1)] mb-4">
                            <UserSquare2 size={28} className="text-primary" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-widest text-white">Login</h2>
                        <p className="text-sm font-mono text-muted-foreground mt-2">Enter your credentials to continue.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className={labelClasses}>Email</label>
                            <input
                                suppressHydrationWarning
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClasses}
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className={labelClasses}>Password</label>
                            <input
                                suppressHydrationWarning
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClasses}
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-950/40 text-red-400 border border-red-900 rounded-sm font-mono text-xs uppercase tracking-wider">
                                [SYS_ERR]: {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full group relative inline-flex items-center justify-center bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition-all hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] space-x-2 rounded-sm overflow-hidden disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed mt-4"
                        >
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                    <span className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></span>
                                </div>
                            )}
                            <span className="flex items-center space-x-2 relative z-10 font-mono uppercase tracking-widest">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin h-4 w-4" />
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Login</span>
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    <div className="mt-8 text-center text-xs font-mono text-muted-foreground">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-primary hover:text-green-300 transition-colors border-b border-primary/30 hover:border-green-300 pb-0.5">
                            Sign Up
                        </Link>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}
