"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export function PrintButton() {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        const element = document.getElementById("resume-print-container");
        if (!element) {
            alert("Resume container not found. Please try again.");
            return;
        }

        setIsGenerating(true);
        try {
            console.log("Starting PDF generation for:", element);
            const { width, height } = element.getBoundingClientRect();
            if (width === 0 || height === 0) {
                throw new Error("Resume container has no visible dimensions. Is it hidden?");
            }

            const canvas = await html2canvas(element, {
                scale: 1.5, // Reduced from 2 for better stability
                useCORS: true,
                logging: true,
                backgroundColor: "#ffffff",
            }).catch(err => {
                console.error("html2canvas capture failed:", err);
                throw new Error(`Visual capture failed: ${err.message || 'Unknown error'}`);
            });

            console.log("Canvas captured.");
            const imgData = canvas.toDataURL("image/jpeg", 1.0);
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // 1. Add visual image
            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

            // 2. Add text layer
            try {
                const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
                let node;
                pdf.setTextColor(0, 0, 0);
                pdf.setFontSize(1);
                const containerRect = element.getBoundingClientRect();

                while (node = walk.nextNode()) {
                    const text = node.textContent?.trim();
                    if (text && node.parentElement) {
                        const rect = node.parentElement.getBoundingClientRect();

                        // Relative positions
                        const x = ((rect.left - containerRect.left) / containerRect.width) * pdfWidth;
                        const y = ((rect.top - containerRect.top) / containerRect.height) * pdfHeight;

                        if (!isNaN(x) && !isNaN(y)) {
                            // Using string 'invisible' as required by types
                            pdf.text(text, x, y, { renderingMode: "invisible" });
                        }
                    }
                }
                console.log("Text layer added.");
            } catch (layerErr) {
                console.warn("Failed to add text layer, preserving visual only:", layerErr);
            }

            pdf.save("resume.pdf");
            console.log("PDF saved successfully.");
        } catch (error) {
            console.error("CRITICAL PDF ERROR:", error);
            alert(`Failed to generate PDF: ${error instanceof Error ? error.message : "Internal Error"}`);
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
                {isGenerating ? "Exporting..." : "Export PDF"}
            </span>
        </button>
    );
}
