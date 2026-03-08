import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Mail, Phone, MapPin, Linkedin, Github, Globe, CheckCircle2, AlertTriangle, Target, Terminal, Sparkles } from "lucide-react";

import { PrintButton } from "@/components/print-button";
import { EditableResume } from "@/components/editable-resume";

export const revalidate = 0;

interface ResumePageProps {
    params: Promise<{ id: string }>;
}

export default async function ResumePage({ params }: ResumePageProps) {
    const { id } = await params;

    if (!id) {
        notFound();
    }

    // Fetch from Supabase
    const { data, error } = await supabase
        .from("resumes")
        .select("content")
        .eq("id", id)
        .single();

    if (error || !data) {
        console.error("Failed to fetch resume:", error);
        notFound();
    }

    const { personalInfo, summary, experience, education, skills, atsScore, atsFeedback, template } = data.content;

    // Render logic based on template
    const tmpl = template || "modern";

    // Score Color Logic
    let scoreColor = "text-green-500";
    let scoreBorder = "border-green-500";
    if (atsScore < 60) {
        scoreColor = "text-red-500";
        scoreBorder = "border-red-500";
    } else if (atsScore < 80) {
        scoreColor = "text-yellow-500";
        scoreBorder = "border-yellow-500";
    }

    return (
        <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8 font-sans">

            {/* Dashboard Top Bar (Non-printable) */}
            <div className="max-w-6xl mx-auto mb-10 print:hidden space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link
                        href="/build"
                        className="inline-flex items-center space-x-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} />
                        <span>Abort / Rebuild</span>
                    </Link>
                    <PrintButton />
                </div>

                {/* ATS Score Panel */}
                {atsScore !== undefined && (
                    <div className="bg-card/80 backdrop-blur-md border border-border p-6 rounded-sm shadow-xl flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
                        {/* Tech Grid Background */}
                        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:10px_10px]"></div>

                        <div className="flex flex-col items-center relative z-10">
                            <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                <Target size={14} className="text-primary" />
                                ATS Compatibility Index
                            </h2>
                            <div className={`relative flex items-center justify-center w-32 h-32 rounded-full border-[6px] ${scoreBorder} bg-background/50 backdrop-blur-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
                                <span className={`text-4xl font-black ${scoreColor} font-mono tracking-tighter`}>{atsScore}</span>
                                <span className={`absolute bottom-3 text-xs font-bold ${scoreColor}`}>/ 100</span>
                                {/* Minor glowing rings */}
                                <div className={`absolute -inset-2 rounded-full border border-current opacity-20 ${scoreColor}`}></div>
                                <div className={`absolute -inset-4 rounded-full border border-current opacity-10 ${scoreColor}`}></div>
                            </div>
                        </div>

                        <div className="flex-1 relative z-10">
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2 font-mono flex items-center gap-2">
                                <Terminal size={18} className="text-primary" /> System Diagnostics
                            </h3>
                            {atsFeedback && atsFeedback.length > 0 ? (
                                <ul className="space-y-3 mt-4">
                                    {atsFeedback.map((fb: string, i: number) => (
                                        <li key={i} className="flex space-x-3 items-start bg-background/50 p-3 border border-border/50 rounded-sm">
                                            {atsScore >= 80 ? (
                                                <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
                                            ) : (
                                                <AlertTriangle size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                                            )}
                                            <span className="text-sm font-mono text-slate-300 leading-relaxed">{fb}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground font-mono text-sm mb-4">Waiting for neural evaluation...</p>
                            )}

                            <div className="mt-6 flex items-start gap-3 bg-primary/10 border border-primary/20 p-4 rounded-sm">
                                <Sparkles size={18} className="text-primary shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1 font-mono">Interactive Canvas Active</h4>
                                    <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                                        The document below is now fully editable. Click any text surface to modify it directly. Hover over sections like your Summary or Experience to reveal the AI enhancer to deploy context-aware improvements. Don't forget to push changes to the server when finished.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Template Badge */}
                        <div className="absolute top-0 right-0 p-1 px-3 bg-secondary text-primary text-[10px] font-bold uppercase tracking-widest border-l border-b border-background z-10">
                            Chassis: {tmpl}
                        </div>

                    </div>
                )}
            </div>

            {/* Interactive Resume Document */}
            <EditableResume id={id} initialData={data.content} template={tmpl} />

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          body { 
            background: white !important; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
          #resume-print-container, #resume-print-container * {
            font-family: Arial, Helvetica, sans-serif !important;
            text-shadow: none !important;
            filter: none !important;
          }
          /* Ensure specific style variants map to safe system fonts */
          #resume-print-container .font-serif {
            font-family: "Times New Roman", Times, serif !important;
          }
          #resume-print-container .font-mono {
            font-family: Consolas, monaco, monospace !important;
          }
          /* Always hide the dark background of the app outside the resume container */
          /* Note: The resume container itself controls its own colors via tailwind utilities above */
        }
      `}} />
        </div>
    );
}
