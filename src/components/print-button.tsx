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
            alert("Resume container not found. Contact support.");
            return;
        }

        setIsGenerating(true);
        try {
            console.log("Saving PDF... container check:", element.offsetWidth, "x", element.offsetHeight);

            // Re-render element to ensure it's not hidden
            element.style.display = 'block';

            const canvas = await html2canvas(element, {
                scale: 1.5,
                useCORS: true,
                logging: true,
                backgroundColor: "#ffffff",
                scrollX: -window.scrollX,
                scrollY: -window.scrollY,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
            }).catch(err => {
                console.error("Visual capture error:", err);
                throw new Error(`Visual capture failed: ${err.message || 'Check browser permissions'}`);
            });

            const imgData = canvas.toDataURL("image/jpeg", 0.95);
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // 1. Visual Layer
            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

            // 2. Text Layer (Hidden but copyable)
            try {
                const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
                let node;
                pdf.setFontSize(1);
                const containerRect = element.getBoundingClientRect();

                while (node = walk.nextNode()) {
                    const text = node.textContent?.trim();
                    if (text && node.parentElement) {
                        const rect = node.parentElement.getBoundingClientRect();

                        // Scale factors
                        const x = ((rect.left - containerRect.left) / containerRect.width) * pdfWidth;
                        const y = ((rect.top - containerRect.top) / containerRect.height) * pdfHeight;

                        if (!isNaN(x) && !isNaN(y)) {
                            pdf.text(text, x, y, { renderingMode: "invisible" });
                        }
                    }
                }
            } catch (layerErr) {
                console.warn("Text layer skipped:", layerErr);
            }

            pdf.save("AutoResume.pdf");
        } catch (error) {
            console.error("SAVE ERROR:", error);
            alert(`Save Failed: ${error instanceof Error ? error.message : "Internal Engine Error"}`);
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
                {isGenerating ? "Saving..." : "Save PDF"}
            </span>
        </button>
    );
}
