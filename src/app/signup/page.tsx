"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, UserPlus } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signUpError) {
            setError(signUpError.message);
            setIsLoading(false);
        } else {
            setSuccess("Profile registered. Check your comms (email) for verification link.");
            setIsLoading(false);
            // Optional: automatically route to login or build based on Supabase config (auto-confirm).
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        const { error: googleError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `http://127.0.0.1:3005/auth/callback`,
            },
        });

        if (googleError) {
            setError(googleError.message);
            setIsLoading(false);
        }
    };

    const inputClasses = "w-full px-4 py-3 rounded-sm border border-border bg-card focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-mono text-sm";
    const labelClasses = "block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 mt-4";

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">

            {/* Background Matrix/Grid Effect */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="absolute top-0 -z-10 h-full w-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-white/5 blur-[120px]"></div>
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
                        <div className="inline-flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.05)] mb-4">
                            <UserPlus size={28} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-widest text-white">Sign Up</h2>
                        <p className="text-sm font-mono text-muted-foreground mt-2">Create an account to build your resume.</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-6">
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
                                minLength={6}
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-950/40 text-red-400 border border-red-900 rounded-sm font-mono text-xs uppercase tracking-wider">
                                [SYS_ERR]: {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-primary/10 text-primary border border-primary/30 rounded-sm font-mono text-xs uppercase tracking-wider">
                                [SUCCESS]: {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !!success}
                            className="w-full group relative inline-flex items-center justify-center bg-white text-black px-8 py-4 text-sm font-bold transition-all hover:bg-slate-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] space-x-2 rounded-sm overflow-hidden disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed mt-4"
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
                                        <span>Allocating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign Up</span>
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </span>
                        </button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest font-mono">
                                <span className="bg-card px-4 text-muted-foreground">OR</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center border border-border bg-card/50 px-8 py-4 text-sm font-bold text-foreground transition-all hover:border-primary/50 hover:bg-secondary uppercase tracking-widest rounded-sm backdrop-blur-sm shadow-sm space-x-3 disabled:opacity-70"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span className="font-mono">Continue with Google</span>
                        </button>
                    </form>

                    <div className="mt-8 text-center text-xs font-mono text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:text-green-300 transition-colors border-b border-primary/30 hover:border-green-300 pb-0.5">
                            Login
                        </Link>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}
