"use client";

import { Download, Loader2, Printer } from "lucide-react";
import { useState } from "react";
import { generateNativePDF } from "@/lib/pdf-engine";

interface PrintButtonProps {
    data: any;
}

export function PrintButton({ data }: PrintButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        if (!data) {
            alert("No resume data found. Please try again.");
            return;
        }

        setIsGenerating(true);
        try {
            console.log("Generating Native Data-Driven PDF...");

            // Build the PDF directly from the structured data
            await generateNativePDF(data);

            console.log("PDF Saved successfully.");
        } catch (error) {
            console.error("NATIVE PDF GENERATION FAILED:", error);
            alert("An error occurred during PDF generation. Please try the standard 'Print' option.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                className="group relative inline-flex items-center space-x-2 bg-primary hover:bg-green-400 text-primary-foreground px-6 py-3 rounded-sm font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] overflow-hidden disabled:opacity-70"
                onClick={handleDownload}
                disabled={isGenerating}
                title="Download high-fidelity ATS-ready PDF"
            >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                {isGenerating ? (
                    <Loader2 size={18} className="relative z-10 animate-spin" />
                ) : (
                    <Download size={18} className="relative z-10" />
                )}
                <span className="hidden sm:inline relative z-10">
                    {isGenerating ? "Processing..." : "Save PDF"}
                </span>
            </button>

            <button
                onClick={() => window.print()}
                className="p-3 border border-border bg-card/50 text-muted-foreground hover:text-white hover:border-white/30 transition-all rounded-sm print:hidden"
                title="Open browser print dialog (Manual fallback)"
            >
                <Printer size={18} />
            </button>
        </div>
    );
}
