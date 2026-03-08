"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, ChevronRight, CheckCircle2, AlertCircle, BarChart, ArrowLeft, Target, Award, Terminal, Database } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ScoreResult {
    atsScore: number;
    keywordMatch: number;
    impactAndMetrics: number;
    feedback: string[];
}

export default function ScorePage() {
    const [file, setFile] = useState<File | null>(null);
    const [savedResumes, setSavedResumes] = useState<any[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>("");
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ScoreResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchResumes = async () => {
            const { data, error } = await supabase
                .from('resumes')
                .select('id, content, created_at')
                .order('created_at', { ascending: false })
                .limit(10);

            if (!error && data) {
                setSavedResumes(data);
            }
        };
        fetchResumes();
    }, []);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "application/pdf") {
                setFile(droppedFile);
                setSelectedResumeId("");
                setError(null);
            } else {
                setError("Please upload a valid PDF file.");
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === "application/pdf") {
                setFile(selectedFile);
                setSelectedResumeId("");
                setError(null);
            } else {
                setError("Please upload a valid PDF file.");
            }
        }
    };

    const handleSubmit = async () => {
        if (!file && !selectedResumeId) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        if (selectedResumeId) {
            formData.append("resumeId", selectedResumeId);
        } else if (file) {
            formData.append("resume", file);
        }

        try {
            const response = await fetch("/api/tester", {
                method: "POST",
                body: formData,
            });

            const responseText = await response.text();

            if (!response.ok) {
                let errorMsg = `Server Error (${response.status})`;
                try {
                    const data = JSON.parse(responseText);
                    errorMsg = data.error || errorMsg;
                    if (data.details) errorMsg += ` (${data.details})`;
                } catch (e) {
                    errorMsg = `Server error (${response.status}): ${responseText.substring(0, 100) || response.statusText || 'External service failure'}`;
                }
                throw new Error(errorMsg);
            }

            try {
                const data = JSON.parse(responseText);
                setResult(data);
            } catch (e) {
                console.error("Malformed JSON response:", responseText);
                throw new Error("The server returned an invalid response format. Please try again.");
            }
        } catch (err: any) {
            console.error("Analysis error:", err);
            setError(err.message || "An unexpected error occurred. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-0 -z-10 h-full w-full">
                <div className="absolute bottom-auto left-auto right-10 top-20 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px]"></div>
                <div className="absolute bottom-10 left-10 right-auto top-auto h-[400px] w-[400px] rounded-full bg-cyan-900/20 blur-[100px]"></div>
            </div>

            <nav className="w-full px-6 md:px-12 py-6 relative z-10 flex justify-between items-center border-b border-border/50 bg-background/50 backdrop-blur-sm">
                <Link href="/" className="text-xl font-black uppercase text-white tracking-widest flex items-center space-x-2">
                    <Terminal size={20} className="text-cyan-400" />
                    <span>AutoResume</span>
                </Link>
                <Link href="/" className="flex items-center text-sm font-mono text-muted-foreground hover:text-white transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Back to Home
                </Link>
            </nav>

            <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 relative z-10 flex flex-col">

                <div className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
                        ATS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">Score Analyzer</span>
                    </h1>
                    <p className="text-muted-foreground font-mono max-w-2xl mx-auto">
                        Evaluate your resume for ATS compatibility. Upload a PDF or select a resume you've built here for 100% accurate internal analysis.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl mx-auto"
                        >
                            <div
                                className={`relative group border-2 border-dashed rounded-lg p-10 text-center transition-all duration-300 bg-card/30 backdrop-blur-sm
                  ${isDragging ? 'border-cyan-500 bg-cyan-500/10' : 'border-border hover:border-cyan-500/50 hover:bg-card/50'}
                  ${file ? 'border-green-500/50 bg-green-500/5' : ''}
                `}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => !file && fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                />

                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-green-400">
                                            <FileText size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1 font-mono">{file.name}</h3>
                                        <p className="text-sm text-muted-foreground font-mono mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                                className="px-4 py-2 border border-border text-muted-foreground hover:text-white rounded text-sm font-mono uppercase tracking-wider transition-colors"
                                            >
                                                Remove
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
                                                disabled={isUploading}
                                                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded text-sm font-bold font-mono uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 flex items-center"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                                        Analyzing...
                                                    </>
                                                ) : (
                                                    <>Analyze Resume <ChevronRight size={16} className="ml-1" /></>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center pointer-events-none">
                                        <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-6 transition-colors duration-300
                      ${isDragging ? 'bg-cyan-500/20 text-cyan-400' : 'bg-secondary text-muted-foreground group-hover:text-white'}
                    `}>
                                            <Upload size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 font-mono uppercase tracking-wider">Upload External PDF</h3>
                                        <p className="text-muted-foreground mb-6 font-mono text-sm max-w-sm">
                                            Best for resumes NOT built on AutoResume.
                                        </p>
                                        <div className="px-6 py-3 border border-border bg-background rounded text-sm font-bold font-mono uppercase tracking-wider text-muted-foreground group-hover:text-white group-hover:border-cyan-500/50 transition-all pointer-events-auto cursor-pointer">
                                            Select File
                                        </div>
                                    </div>
                                )}

                                {/* Saved Resumes Selection */}
                                {savedResumes.length > 0 && !file && (
                                    <div className="mt-10 pt-10 border-t border-border/30 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center mb-6">
                                            <div className="h-px bg-border/30 w-full"></div>
                                            <span className="px-4 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">OR SELECT FROM SAVED</span>
                                            <div className="h-px bg-border/30 w-full"></div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                            {savedResumes.map((resume) => (
                                                <button
                                                    key={resume.id}
                                                    onClick={() => {
                                                        setSelectedResumeId(resume.id);
                                                        setFile(null);
                                                        setError(null);
                                                    }}
                                                    className={`flex items-center p-4 rounded border transition-all text-left group
                                                        ${selectedResumeId === resume.id
                                                            ? 'border-cyan-500 bg-cyan-500/10'
                                                            : 'border-border/30 hover:border-cyan-500/30 hover:bg-card/50'}
                                                    `}
                                                >
                                                    <div className={`p-2 rounded-full mr-4 transition-colors
                                                        ${selectedResumeId === resume.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-secondary text-muted-foreground group-hover:text-white'}
                                                    `}>
                                                        <Database size={18} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-sm text-white font-mono uppercase tracking-tight">
                                                            {resume.content.personalInfo?.fullName || "Untitled Resume"}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground font-mono">
                                                            {new Date(resume.created_at).toLocaleDateString()} • {resume.content.experience?.[0]?.jobTitle || "No Title"}
                                                        </p>
                                                    </div>
                                                    {selectedResumeId === resume.id && (
                                                        <CheckCircle2 size={18} className="text-cyan-400" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {selectedResumeId && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-6 flex justify-center"
                                            >
                                                <button
                                                    onClick={handleSubmit}
                                                    disabled={isUploading}
                                                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded text-sm font-bold font-mono uppercase tracking-widest transition-all hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] disabled:opacity-50 flex items-center"
                                                >
                                                    {isUploading ? "Analyzing..." : "Analyze Saved Resume"}
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="mt-4 p-4 border border-red-500/30 bg-red-500/10 rounded flex items-start text-red-400 font-mono text-sm">
                                    <AlertCircle size={18} className="mr-3 shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full"
                        >
                            {result.feedback.some(f => f.startsWith("Warning:")) && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-8 p-5 border border-yellow-500/30 bg-yellow-500/5 rounded-sm flex items-start text-yellow-200/80 font-mono text-sm backdrop-blur-md"
                                >
                                    <AlertCircle size={20} className="mr-4 shrink-0 mt-1 text-yellow-500" />
                                    <div>
                                        <p className="font-bold mb-1 uppercase tracking-widest text-yellow-500">Extraction Fidelity Warning</p>
                                        <p className="leading-relaxed">
                                            Our neural engine detected low-fidelity text extraction from this PDF. This is usually caused by browser-defined Print processes that don't embed font metadata.
                                            We've applied a baseline score, but for 100% accurate ATS validation, we recommend building your resume directly in the <span className="text-white">AutoResume</span> builder.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {/* Score Card */}
                                <div className="col-span-1 md:col-span-1 border border-border bg-card/40 backdrop-blur-sm p-8 rounded-lg flex flex-col items-center justify-center text-center relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r 
                    ${result.atsScore >= 80 ? 'from-green-400 to-green-600' :
                                            result.atsScore >= 60 ? 'from-yellow-400 to-yellow-600' : 'from-red-400 to-red-600'}
                  `}></div>

                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 font-mono">Overall ATS Score</h3>

                                    <div className="relative flex items-center justify-center w-40 h-40">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="80" cy="80" r="70" className="stroke-secondary" strokeWidth="8" fill="none" />
                                            <motion.circle
                                                cx="80" cy="80" r="70"
                                                className={`stroke-current ${result.atsScore >= 80 ? 'text-green-500' :
                                                    result.atsScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                                                    }`}
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={439.8}
                                                initial={{ strokeDashoffset: 439.8 }}
                                                animate={{ strokeDashoffset: 439.8 - (439.8 * result.atsScore) / 100 }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center justify-center">
                                            <span className="text-5xl font-black text-white">{result.atsScore}</span>
                                            <span className="text-xs text-muted-foreground mt-1">/ 100</span>
                                        </div>
                                    </div>

                                    <p className="mt-6 text-sm font-mono text-muted-foreground">
                                        {result.atsScore >= 80 ? "Excellent formatting and robust content." :
                                            result.atsScore >= 60 ? "Good start, but missing key optimization." :
                                                "Needs significant improvement for ATS compliance."}
                                    </p>
                                </div>

                                {/* Metrics Breakdown */}
                                <div className="col-span-1 md:col-span-2 border border-border bg-card/40 backdrop-blur-sm p-8 rounded-lg flex flex-col justify-center">
                                    <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-8 font-mono flex items-center">
                                        <BarChart className="mr-3 text-cyan-400" /> Evaluation Breakdown
                                    </h3>

                                    <div className="space-y-8">
                                        <div>
                                            <div className="flex justify-between items-center mb-2 font-mono text-sm">
                                                <span className="text-slate-300 flex items-center"><Target size={16} className="mr-2 text-blue-400" /> Keyword Match Strategy</span>
                                                <span className="font-bold text-white">{result.keywordMatch}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-blue-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${result.keywordMatch}%` }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                ></motion.div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2 font-mono text-sm">
                                                <span className="text-slate-300 flex items-center"><Award size={16} className="mr-2 text-purple-400" /> Impact & Actionable Metrics</span>
                                                <span className="font-bold text-white">{result.impactAndMetrics}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-purple-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${result.impactAndMetrics}%` }}
                                                    transition={{ duration: 1, delay: 0.7 }}
                                                ></motion.div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feedback */}
                            <div className="border border-border bg-card/40 backdrop-blur-sm p-8 rounded-lg">
                                <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-6 font-mono flex items-center">
                                    <Terminal className="mr-3 text-green-400" /> AI Diagnostic Feedback
                                </h3>
                                <div className="space-y-4">
                                    {result.feedback.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 1 + (idx * 0.2) }}
                                            className="flex items-start p-4 bg-background/50 border border-border rounded-sm"
                                        >
                                            <CheckCircle2 className="text-green-400 mr-4 shrink-0 mt-0.5" size={20} />
                                            <p className="text-slate-300 font-mono text-sm leading-relaxed">{item}</p>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <button
                                        onClick={() => {
                                            setResult(null);
                                            setFile(null);
                                            setSelectedResumeId("");
                                        }}
                                        className="px-6 py-3 border border-border text-foreground hover:bg-secondary font-mono text-sm font-bold uppercase tracking-widest transition-colors rounded-sm w-full sm:w-auto"
                                    >
                                        Analyze Another
                                    </button>
                                    <Link
                                        href="/build"
                                        className="px-6 py-3 bg-primary hover:bg-green-400 text-primary-foreground font-mono text-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] rounded-sm w-full sm:w-auto text-center"
                                    >
                                        Build A Better Resume
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div >
    );
}
