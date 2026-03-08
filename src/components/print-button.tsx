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
            // Use html2canvas to capture the element as an image first for layout fidelity
            // But we will also attempt to add text layers or use a better PDF approach if hit 0 score again
            // For now, let's use the most reliable visual capture first, then refine for text
            const canvas = await html2canvas(element, {
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/jpeg", 1.0);
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // 1. Add the visual image
            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

            // 2. Add an invisible text layer for ATS and copying
            // We iterate through all text nodes in the element to place them in the PDF
            const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
            let node;
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(1); // Tiny font size for the "invisible" layer

            while (node = walk.nextNode()) {
                if (node.parentElement) {
                    const rect = node.parentElement.getBoundingClientRect();
                    const containerRect = element.getBoundingClientRect();

                    // Calculate relative position
                    const x = ((rect.left - containerRect.left) / containerRect.width) * pdfWidth;
                    const y = ((rect.top - containerRect.top) / containerRect.height) * pdfHeight;

                    const text = node.textContent?.trim();
                    if (text) {
                        // Place text exactly where it is on screen, but make it nearly invisible (white or transparent)
                        // Actually, many ATS systems prefer "real" text. Let's place it in black but very small.
                        // For a better "copy-paste" experience, we'll try to match the approximate line.
                        pdf.text(text, x, y, { renderingMode: "invisible" });
                    }
                }
            }

            pdf.save("resume.pdf");
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert("Failed to generate PDF. Please use Ctrl+P as a backup.");
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
