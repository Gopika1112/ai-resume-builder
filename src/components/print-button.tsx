"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

export function PrintButton() {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        const element = document.getElementById("resume-print-container");
        if (!element) {
            alert("Resume container not found. Opening print dialog.");
            window.print();
            return;
        }

        setIsGenerating(true);
        try {
            console.log("Generating high-fidelity PDF...");

            // 1. Initialize jsPDF
            // Using points (pt) for better HTML mapping
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "pt",
                format: "a4",
            });

            const pdfWidth = 595.28; // A4 width in pt

            // 2. Use the NATIVE .html() method for real text selectability
            await pdf.html(element, {
                callback: function (doc) {
                    doc.save("AutoResume.pdf");
                    console.log("PDF Saved.");
                },
                x: 0,
                y: 0,
                width: pdfWidth,
                windowWidth: 800, // Match the typical resume container width
                autoPaging: 'text',
                html2canvas: {
                    scale: 0.75, // Scale down to fit A4
                    useCORS: true,
                    logging: false,
                    backgroundColor: "#ffffff",
                }
            });

        } catch (error) {
            console.error("PDF GENERATION ERROR:", error);
            if (confirm("Advanced 'Save' failed due to browser limitations. Use standard Print instead?")) {
                window.print();
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            className="group relative inline-flex items-center space-x-2 bg-primary hover:bg-green-400 text-primary-foreground px-6 py-3 rounded-sm font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] overflow-hidden disabled:opacity-70"
            onClick={handleDownload}
            disabled={isGenerating}
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
    );
}
