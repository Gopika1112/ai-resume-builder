"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileText,
    Trash2,
    Eye,
    Edit3,
    Plus,
    Search,
    Clock,
    ArrowRight,
    AlertCircle,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";

export default function Dashboard() {
    const router = useRouter();
    const [resumes, setResumes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login?error=unauthorized");
                return;
            }
            fetchResumes(user.id);
        };
        checkAuth();
    }, []);

    async function fetchResumes(userId: string) {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("resumes")
                .select("id, content, created_at")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setResumes(data || []);
        } catch (err) {
            console.error("Error fetching resumes:", err);
        } finally {
            setLoading(false);
        }
    }

    if (!mounted) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Initializing Dashboard Vault...</p>
            </div>
        );
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resume? This action cannot be undone.")) return;

        try {
            console.log(`[SYS]: Initiating permanent delete protocol for ID: ${id}`);
            // Use .select() to verify the row was actually affected
            const { data, error } = await supabase
                .from("resumes")
                .delete()
                .eq("id", id)
                .select();

            if (error) {
                console.error("[SYS_ERR]: Delete failed:", error);
                throw error;
            }

            console.log("[SYS]: Delete response received. Affected records:", data?.length || 0);

            if (!data || data.length === 0) {
                throw new Error("Deletion failed: Permission denied by database security (RLS). Please ensure you've applied the updated SQL policy allowing orphan cleanup.");
            }

            setResumes(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error("Error deleting resume:", err);
            alert(err instanceof Error ? err.message : "Failed to delete resume. Ensure you've run the provided SQL in your Supabase Editor.");
        }
    };

    const filteredResumes = resumes.filter(resume => {
        const fullName = resume.content?.personalInfo?.fullName || "";
        return fullName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <FileText className="text-primary" />
                            Resume Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-2 font-mono text-sm uppercase tracking-wider">
                            Management interface for your neural career assets
                        </p>
                    </div>

                    <Link
                        href="/build"
                        className="bg-green-600 text-white font-bold uppercase tracking-widest px-6 py-3 rounded-sm flex items-center gap-2 hover:bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all w-fit"
                    >
                        <Plus size={18} />
                        Create New Alpha
                    </Link>
                </div>

                {/* Search & Stats Bar */}
                <div className="bg-card/30 backdrop-blur-md border border-border p-4 rounded-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search by candidate name..."
                            className="w-full bg-background/50 border border-border pl-10 pr-4 py-2 rounded-sm font-mono text-sm focus:outline-none focus:border-green-500/50 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            Records Found: <span className="text-white font-bold">{filteredResumes.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            Status: <span className="text-white font-bold tracking-[0.2em]">ACTIVE / SECURE</span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="w-12 h-12 text-green-400 animate-spin" />
                        <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Accessing Supabase Cluster...</p>
                    </div>
                ) : filteredResumes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResumes.map((resume) => (
                            <div
                                key={resume.id}
                                className="bg-card/40 border border-border p-6 rounded-sm group hover:border-primary/30 transition-all hover:bg-card/60 relative overflow-hidden"
                            >
                                {/* Tech Accents */}
                                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 -mr-8 -mt-8 rotate-45 group-hover:bg-primary/10 transition-colors"></div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-background border border-border rounded-sm text-primary">
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-background/80 px-2 py-1 border border-border rounded-sm">
                                        <Clock size={12} className="text-muted-foreground" />
                                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                                            {new Date(resume.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-tight group-hover:text-primary transition-colors">
                                    {resume.content?.personalInfo?.fullName || "Untitled Asset"}
                                </h3>
                                <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-6">
                                    Chassis: {resume.content?.template || "modern"}
                                </p>

                                <div className="grid grid-cols-2 gap-3 mt-auto">
                                    <Link
                                        href={`/resume/${resume.id}`}
                                        className="flex items-center justify-center gap-2 py-2 bg-background border border-border text-[10px] font-bold uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all"
                                    >
                                        <Eye size={14} />
                                        View
                                    </Link>
                                    <Link
                                        href={`/build?id=${resume.id}`}
                                        className="flex items-center justify-center gap-2 py-2 bg-background border border-border text-[10px] font-bold uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all"
                                    >
                                        <Edit3 size={14} />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(resume.id)}
                                        className="col-span-2 flex items-center justify-center gap-2 py-2 bg-red-500/5 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/40 transition-all mt-1"
                                    >
                                        <Trash2 size={14} />
                                        Delete Permanent
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (searchOrNone())}
            </main>

            {/* Grid Pattern Background */}
            <div className="fixed inset-0 z-[-1] opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
            </div>
        </div>
    );

    function searchOrNone() {
        return (
            <div className="bg-card/20 border border-dashed border-border rounded-sm py-24 flex flex-col items-center justify-center text-center px-6">
                <AlertCircle size={48} className="text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-2 font-mono">
                    {searchQuery ? "No Matches Found" : "Vault Empty"}
                </h3>
                <p className="text-muted-foreground text-sm font-mono max-w-md">
                    {searchQuery
                        ? `No records matching "${searchQuery}" were detected in the database cluster.`
                        : "No saved resumes were found in your Supabase cloud storage. Start by creating a new asset."}
                </p>
                {!searchQuery && (
                    <Link
                        href="/build"
                        className="mt-8 text-primary font-mono text-xs uppercase tracking-[0.2em] border-b border-primary/30 hover:border-primary transition-all pb-1 flex items-center gap-2"
                    >
                        Initiate Build Sequence <ArrowRight size={14} />
                    </Link>
                )}
            </div>
        );
    }
}
