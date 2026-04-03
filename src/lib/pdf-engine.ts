import jsPDF from "jspdf";

interface ResumeData {
    personalInfo: {
        fullName: string;
        email: string;
        phone: string;
        location: string;
    };
    summary: string;
    experience: Array<{
        jobTitle: string;
        company: string;
        startDate: string;
        endDate: string;
        bullets: string[];
    }>;
    education: Array<{
        degree: string;
        institution: string;
        completionYear: string;
    }>;
    skills: string[];
    template?: string;
}

export const generateNativePDF = (data: ResumeData) => {
    const tmpl = data.template || "modern";
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const margin = 20;
    const pageWidth = 210;
    const pageHeight = 297;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // --- THEME SETTINGS ---
    const isSerif = tmpl === "executive" || tmpl === "legacy";
    const isMono = tmpl === "terminal";
    const primaryFont = isSerif ? "times" : isMono ? "courier" : "helvetica";

    const colors = {
        primary: [0, 0, 0],
        text: [0, 0, 0],
        subtext: [51, 65, 85],
        bg: [255, 255, 255]
    };

    // Terminal Background
    if (tmpl === "terminal") {
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
    }

    // --- HELPERS ---
    const setHeadingFont = (size: number) => {
        doc.setFont(primaryFont, "bold");
        doc.setFontSize(size);
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    };

    const setBodyFont = (size: number, style: "normal" | "bold" | "italic" = "normal") => {
        doc.setFont(primaryFont, style);
        doc.setFontSize(size);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    };

    const setSubFont = (size: number, style: "normal" | "bold" | "italic" = "normal") => {
        doc.setFont(primaryFont, style);
        doc.setFontSize(size);
        doc.setTextColor(colors.subtext[0], colors.subtext[1], colors.subtext[2]);
    };

    const addWrappedText = (text: string, fontSize: number, style: "normal" | "bold" | "italic" = "normal", width = contentWidth, x = margin) => {
        doc.setFont(primaryFont, style);
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, width);
        doc.text(lines, x, y);
        y += (lines.length * (fontSize * 0.3528)) + 2;
    };

    const checkPageBreak = (needed: number) => {
        if (y + needed > 280) {
            doc.addPage();
            if (tmpl === "terminal") {
                doc.setFillColor(0, 0, 0);
                doc.rect(0, 0, pageWidth, pageHeight, "F");
            }
            y = margin;
        }
    };

    // --- MODERNIST SPLIT LAYOUT (SPECIAL CASE) ---
    if (tmpl === "modernist") {
        const sidebarWidth = 60;
        const mainWidth = contentWidth - sidebarWidth - 10;
        const mainX = margin + sidebarWidth + 10;

        // Header
        setHeadingFont(28);
        doc.text(data.personalInfo.fullName.toUpperCase(), margin, y);
        y += 12;

        // Left Sidebar: Contact & Skills
        let sidebarY = y;
        doc.setFontSize(10);
        doc.setTextColor(colors.subtext[0], colors.subtext[1], colors.subtext[2]);
        [data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location].forEach(info => {
            if (info) {
                doc.text(info, margin, sidebarY);
                sidebarY += 5;
            }
        });

        sidebarY += 10;
        doc.setFont(primaryFont, "bold");
        doc.text("COMPETENCIES", margin, sidebarY);
        sidebarY += 6;
        data.skills.forEach(skill => {
            doc.setFont(primaryFont, "normal");
            doc.text(skill, margin, sidebarY);
            sidebarY += 5;
        });

        // Main Column
        if (data.summary) {
            doc.setFont(primaryFont, "bold");
            doc.text("SYNOPSIS", mainX, y);
            y += 6;
            const summaryLines = doc.splitTextToSize(data.summary, mainWidth);
            doc.text(summaryLines, mainX, y);
            y += (summaryLines.length * 4) + 10;
        }

        if (data.experience) {
            doc.setFont(primaryFont, "bold");
            doc.text("EXPERIENCE", mainX, y);
            y += 8;
            data.experience.forEach(exp => {
                doc.setFont(primaryFont, "bold");
                doc.setFontSize(11);
                doc.text(exp.jobTitle.toUpperCase(), mainX, y);
                y += 5;
                doc.setFont(primaryFont, "bold");
                doc.setFontSize(9);
                doc.setTextColor(colors.subtext[0], colors.subtext[1], colors.subtext[2]);
                doc.text(exp.company, mainX, y);
                const date = `${exp.startDate} - ${exp.endDate || "Present"}`;
                doc.text(date, pageWidth - margin - doc.getTextWidth(date), y);
                y += 5;
                doc.setFont(primaryFont, "normal");
                doc.setFontSize(9);
                doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
                exp.bullets.forEach(b => {
                    const bLines = doc.splitTextToSize(b, mainWidth - 4);
                    doc.text("•", mainX, y);
                    doc.text(bLines, mainX + 4, y);
                    y += (bLines.length * 4) + 1;
                });
                y += 5;
            });
        }
    } else {
        // --- STANDARD LINEAR LAYOUTS ---

        // 1. Header
        if (tmpl === "legacy" || tmpl === "executive") {
            setHeadingFont(24);
            const nameWidth = doc.getTextWidth(data.personalInfo.fullName);
            doc.text(data.personalInfo.fullName, (pageWidth - nameWidth) / 2, y);
            y += 10;
            setSubFont(10);
            const contact = [data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location].filter(Boolean).join("  |  ");
            const contactWidth = doc.getTextWidth(contact);
            doc.text(contact, (pageWidth - contactWidth) / 2, y);
            y += 8;
        } else if (tmpl === "chrono") {
            doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
            doc.setLineWidth(2);
            doc.line(margin, y, margin, y + 20);
            setHeadingFont(28);
            doc.text(data.personalInfo.fullName.toUpperCase(), margin + 5, y + 10);
            y += 20;
            setSubFont(9);
            const contact = [data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location].filter(Boolean).join("  •  ");
            doc.text(contact, margin + 5, y);
            y += 15;
        } else {
            setHeadingFont(24);
            doc.text(data.personalInfo.fullName.toUpperCase(), margin, y);
            y += 10;
            setSubFont(10);
            const contact = [data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location].filter(Boolean).join("  |  ");
            doc.text(contact, margin, y);
            y += 10;
        }

        // Horizontal Line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        if (tmpl !== "chrono") doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        // 2. Summary
        if (data.summary) {
            setHeadingFont(12);
            doc.text("PROFESSIONAL SUMMARY", margin, y);
            y += 6;
            addWrappedText(data.summary, 10, tmpl === "legacy" ? "italic" : "normal");
            y += 5;
        }

        // 3. Experience
        if (data.experience && data.experience.length > 0) {
            setHeadingFont(12);
            doc.text("EXPERIENCE", margin, y);
            y += 10;

            data.experience.forEach((exp) => {
                checkPageBreak(30);
                setBodyFont(11, "bold");
                doc.text(exp.jobTitle, margin, y);
                const date = `${exp.startDate} - ${exp.endDate || "Present"}`;
                doc.text(date, pageWidth - margin - doc.getTextWidth(date), y);
                y += 5;
                setSubFont(10, "italic");
                doc.text(exp.company, margin, y);
                y += 6;

                setBodyFont(10);
                exp.bullets.forEach((b) => {
                    checkPageBreak(10);
                    doc.text("•", margin + 2, y);
                    const bLines = doc.splitTextToSize(b, contentWidth - 8);
                    doc.text(bLines, margin + 6, y);
                    y += (bLines.length * 4) + 2;
                });
                y += 4;
            });
        }

        // 4. Skills & Education
        if (tmpl === "chrono") {
            const colWidth = contentWidth / 2 - 5;
            let currentY = y;

            // Skills col
            setHeadingFont(11);
            doc.text("EXPERTISE", margin, y);
            y += 6;
            data.skills.forEach(s => {
                setBodyFont(9);
                doc.text("• " + s, margin, y);
                y += 5;
            });

            // Edu col
            y = currentY;
            setHeadingFont(11);
            doc.text("EDUCATION", margin + colWidth + 10, y);
            y += 6;
            data.education.forEach(edu => {
                setBodyFont(9, "bold");
                doc.text(edu.degree, margin + colWidth + 10, y);
                y += 4;
                setSubFont(8);
                doc.text(edu.institution, margin + colWidth + 10, y);
                y += 5;
            });
        } else {
            // Standard Education
            if (data.education) {
                setHeadingFont(12);
                doc.text("EDUCATION", margin, y);
                y += 8;
                data.education.forEach(edu => {
                    setBodyFont(10, "bold");
                    doc.text(edu.degree, margin, y);
                    doc.text(edu.completionYear, pageWidth - margin - doc.getTextWidth(edu.completionYear), y);
                    y += 4;
                    setSubFont(9);
                    doc.text(edu.institution, margin, y);
                    y += 8;
                });
            }

            // Standard Skills
            if (data.skills) {
                setHeadingFont(12);
                doc.text("SKILLS", margin, y);
                y += 6;
                addWrappedText(data.skills.join(" • "), 10);
            }
        }
    }

    doc.save(`${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
};
