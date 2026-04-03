"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Save, Loader2, Sparkles, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface EditableResumeProps {
    id: string;
    initialData: any;
    template: string;
}

export function EditableResume({ id, initialData, template: tmpl }: EditableResumeProps) {
    const [data, setData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // AI Suggestion State
    const [activeSuggestion, setActiveSuggestion] = useState<{ field: string, index?: number, suggestion: string } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const { error } = await supabase
                .from("resumes")
                .update({ content: { ...initialData, ...data } }) // Merge updated data back into content
                .eq("id", id);

            if (error) throw error;
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error("Failed to save resume:", err);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = (path: string[], value: any) => {
        setData((prev: any) => {
            const newData = { ...prev };
            let current = newData;
            for (let i = 0; i < path.length - 1; i++) {
                current[path[i]] = { ...current[path[i]] }; // ensure deep copy
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
            return newData;
        });
    };

    const updateArrayField = (arrayName: string, index: number, field: string, value: any) => {
        setData((prev: any) => {
            const newData = { ...prev };
            const newArray = [...newData[arrayName]];
            newArray[index] = { ...newArray[index], [field]: value };
            newData[arrayName] = newArray;
            return newData;
        });
    };

    const updateBullet = (arrayName: string, expIndex: number, bulletIndex: number, value: string) => {
        setData((prev: any) => {
            const newData = { ...prev };
            const newArray = [...newData[arrayName]];
            const newBullets = [...newArray[expIndex].bullets];
            newBullets[bulletIndex] = value;
            newArray[expIndex] = { ...newArray[expIndex], bullets: newBullets };
            newData[arrayName] = newArray;
            return newData;
        });
    };

    const updateSkill = (index: number, value: string) => {
        setData((prev: any) => {
            const newData = { ...prev };
            const newSkills = [...newData.skills];
            newSkills[index] = value;
            newData.skills = newSkills;
            return newData;
        });
    };

    // Simulated AI Improvement
    const handleImprovement = async (field: string, currentText: string, index?: number) => {
        setIsGenerating(true);
        setActiveSuggestion(null);

        // In a real app, hit an API route. Here we simulate for the demo based on the plan.
        await new Promise(r => setTimeout(r, 1500));

        let suggestion = "";
        if (field === 'summary') {
            suggestion = "Dynamic professional leveraging cross-functional expertise to drive strategic initiatives and optimize operational workflows. Demonstrated success in accelerating project lifecycles and exceeding performance matrices.";
        } else if (field === 'bullet') {
            suggestion = `Spearheaded initiatives resulting in a 25% efficiency gain over 6 months by implementing robust, scalable solutions.`;
        }

        setActiveSuggestion({ field, index, suggestion });
        setIsGenerating(false);
    };

    const applySuggestion = () => {
        if (!activeSuggestion) return;

        if (activeSuggestion.field === 'summary') {
            updateField(['summary'], activeSuggestion.suggestion);
        } else if (activeSuggestion.field === 'bullet' && activeSuggestion.index !== undefined) {
            // activeSuggestion.index here holds a combined index for this simple demo, 
            // but ideally we'd pass expIndex and bulletIndex. 
            // For safety in this extracted chunk, we just replace the text if they edit it manually.
            // We'll hook up the actual application logic to the UI below.
        }

        setActiveSuggestion(null);
    };


    const { personalInfo, summary, experience, education, skills } = data;

    return (
        <div className="relative">
            {/* FLOATING ACTION BAR */}
            <div className="fixed bottom-8 right-8 z-50 flex gap-4 print:hidden">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-primary hover:bg-green-500 text-primary-foreground px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : saveSuccess ? <Check size={18} /> : <Save size={18} />}
                    {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
                </button>
            </div>

            <div
                id="resume-print-container"
                className={`mx-auto w-full max-w-[210mm] overflow-hidden drop-shadow-2xl print:drop-shadow-none print:!bg-white print:!text-slate-900 print:!border-none ${tmpl === "terminal" ? "bg-black text-green-500 border border-green-500/30" :
                    tmpl === "minimalist" ? "bg-white text-black" :
                        tmpl === "executive" ? "bg-[#fcfcfc] text-slate-800" :
                            tmpl === "creative" ? "bg-white text-slate-800" :
                                "bg-slate-50 text-slate-900"
                    }`}
                style={{ minHeight: "297mm" }}
            >
                <div className={`p-10 sm:p-14 md:p-16 print:px-12 print:py-12 ${tmpl === "terminal" ? "font-mono" : tmpl === "executive" ? "font-sans" : "font-sans"}`}>
                    {tmpl === "creative" && <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 print:hidden"></div>}

                    {/* HEADER */}
                    <header className={`pb-6 mb-6 group ${tmpl === "minimalist" ? "border-b-2 border-black" : tmpl === "terminal" ? "border-b border-green-500/50" : tmpl === "executive" ? "border-b-2 border-slate-300 text-center flex flex-col items-center" : tmpl === "creative" ? "border-b-4 border-indigo-100 mb-8" : "border-b-4 border-slate-800"}`}>
                        {tmpl === "terminal" && <div className="text-xs mb-4 opacity-70">root@sys:~# cat profile.txt</div>}

                        <h1 className={`font-black tracking-tight print:!text-slate-900 ${tmpl === "terminal" ? "uppercase text-4xl sm:text-5xl text-green-400" : tmpl === "minimalist" ? "uppercase text-4xl sm:text-5xl text-black" : tmpl === "executive" ? "capitalize text-4xl sm:text-5xl text-slate-900 font-serif tracking-normal text-center" : tmpl === "creative" ? "capitalize text-5xl sm:text-6xl text-indigo-950" : "uppercase text-4xl sm:text-5xl text-slate-900"}`}>
                            <input
                                value={personalInfo.fullName}
                                onChange={(e) => updateField(['personalInfo', 'fullName'], e.target.value)}
                                className="w-full bg-transparent outline-none focus:ring-1 focus:ring-primary/50 rounded-sm text-inherit text-center sm:text-left print:hidden"
                            />
                            <span className="hidden print:inline whitespace-pre-wrap">{personalInfo.fullName}</span>
                        </h1>

                        <div className={`flex flex-wrap justify-center sm:justify-start items-center mt-3 gap-y-2 gap-x-4 print:!text-slate-700 ${tmpl === "terminal" ? "text-xs text-green-500/80" : tmpl === "executive" ? "text-sm text-slate-700 italic font-serif flex-wrap justify-center" : "text-sm text-slate-600"}`}>
                            {personalInfo.email && (
                                <div className="flex items-center space-x-1.5 focus-within:ring-1 focus-within:ring-primary/50 relative">
                                    <Mail size={14} className={(tmpl === "modern" || tmpl === "creative") ? "text-slate-400" : ""} />
                                    <input
                                        value={personalInfo.email}
                                        onChange={(e) => updateField(['personalInfo', 'email'], e.target.value)}
                                        className="bg-transparent outline-none w-32 print:hidden"
                                    />
                                    <span className="hidden print:inline">{personalInfo.email}</span>
                                </div>
                            )}
                            {personalInfo.phone && (
                                <div className={`flex items-center space-x-1.5 border-l pl-4 border-current focus-within:ring-1 focus-within:ring-primary/50 relative ${tmpl === "creative" ? "border-indigo-200" : ""}`}>
                                    <Phone size={14} className={(tmpl === "modern" || tmpl === "creative") ? "text-slate-400" : ""} />
                                    <input
                                        value={personalInfo.phone}
                                        onChange={(e) => updateField(['personalInfo', 'phone'], e.target.value)}
                                        className="bg-transparent outline-none w-28 print:hidden"
                                    />
                                    <span className="hidden print:inline">{personalInfo.phone}</span>
                                </div>
                            )}
                            {personalInfo.location && (
                                <div className={`flex items-center space-x-1.5 border-l pl-4 border-current focus-within:ring-1 focus-within:ring-primary/50 relative ${tmpl === "creative" ? "border-indigo-200" : ""}`}>
                                    <MapPin size={14} className={(tmpl === "modern" || tmpl === "creative") ? "text-slate-400" : ""} />
                                    <input
                                        value={personalInfo.location}
                                        onChange={(e) => updateField(['personalInfo', 'location'], e.target.value)}
                                        className="bg-transparent outline-none w-32 print:hidden"
                                    />
                                    <span className="hidden print:inline">{personalInfo.location}</span>
                                </div>
                            )}
                        </div>
                    </header>

                    <main className="space-y-8">

                        {/* SUMMARY */}
                        {summary !== undefined && (
                            <section className="relative group/section print:!text-slate-900">
                                {tmpl === "terminal" && <div className="text-xs mb-2 opacity-70 print:hidden">root@sys:~# ./summary --execute</div>}
                                <div className="flex justify-between items-center mb-3">
                                    <h2 className={`font-bold tracking-widest print:!text-slate-900 print:!border-slate-800 ${tmpl === "terminal" ? "uppercase text-green-300 border-b border-green-500/30 inline-block" : tmpl === "minimalist" ? "uppercase text-lg border-b border-black" : tmpl === "executive" ? "capitalize text-2xl font-serif text-slate-800 border-b-2 border-slate-200 w-full pb-1" : tmpl === "creative" ? "capitalize text-2xl text-indigo-900 border-b-2 border-indigo-100" : "uppercase text-lg text-slate-900 bg-slate-200 px-3 py-1 inline-block"}`}>
                                        Professional Summary
                                    </h2>
                                    {/* AI Suggestion Trigger */}
                                    <button
                                        onClick={() => handleImprovement('summary', summary)}
                                        className="opacity-0 group-hover/section:opacity-100 transition-opacity flex items-center gap-1 text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded-sm border border-primary/20 print:hidden"
                                    >
                                        <Sparkles size={12} /> Improve with AI
                                    </button>
                                </div>
                                <textarea
                                    value={summary}
                                    onChange={(e) => updateField(['summary'], e.target.value)}
                                    className={`w-full bg-transparent outline-none focus:ring-1 focus:ring-primary/50 rounded-sm resize-none overflow-hidden print:hidden ${tmpl === "terminal" ? "text-sm" : tmpl === "executive" ? "text-[15px] font-serif mt-2" : "text-base mt-2"}`}
                                    rows={4}
                                />
                                <div className={`hidden print:block w-full whitespace-pre-wrap ${tmpl === "terminal" ? "text-sm" : tmpl === "executive" ? "text-[15px] font-serif mt-2" : "text-base mt-2"}`}>
                                    {summary}
                                </div>

                                {/* AI Suggestion Popover */}
                                <AnimatePresence>
                                    {(isGenerating || (activeSuggestion?.field === 'summary')) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="absolute top-12 right-0 bg-card border border-primary/50 p-4 rounded-sm shadow-2xl w-[400px] z-50 print:hidden"
                                        >
                                            <div className="flex gap-2 items-center text-primary font-bold text-xs uppercase mb-2">
                                                <Sparkles size={14} /> AI Engine Suggestion
                                            </div>
                                            {isGenerating ? (
                                                <div className="text-sm font-mono text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin" size={14} /> Analyzing linguistic patterns...</div>
                                            ) : (
                                                <>
                                                    <p className="text-sm font-mono text-white mb-4 bg-background p-2 border border-border">{activeSuggestion?.suggestion}</p>
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => setActiveSuggestion(null)} className="text-xs text-muted-foreground hover:text-white px-3 py-1">Dismiss</button>
                                                        <button onClick={() => { updateField(['summary'], activeSuggestion?.suggestion); setActiveSuggestion(null); }} className="text-xs bg-primary text-primary-foreground px-3 py-1 font-bold rounded-sm">Apply Changes</button>
                                                    </div>
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </section>
                        )}

                        {/* EXPERIENCE */}
                        {experience && experience.length > 0 && (
                            <section className="print:!text-slate-900">
                                <h2 className={`font-bold tracking-widest mb-4 mt-2 print:!text-slate-900 print:!border-slate-800 ${tmpl === "terminal" ? "uppercase text-green-300 border-b border-green-500/30 inline-block" : tmpl === "minimalist" ? "uppercase text-lg border-b border-black" : tmpl === "executive" ? "capitalize text-2xl font-serif text-slate-800 border-b-2 border-slate-200 w-full pb-1" : tmpl === "creative" ? "capitalize text-2xl text-indigo-900 border-b-2 border-indigo-100" : "uppercase text-lg text-slate-900 bg-slate-200 px-3 py-1 inline-block"}`}>
                                    Experience
                                </h2>
                                <div className="space-y-8">
                                    {experience.map((job: any, expIndex: number) => (
                                        <div key={expIndex} className="break-inside-avoid relative group/job">
                                            <div className="flex flex-col sm:flex-row justify-between mb-1">
                                                <input
                                                    value={job.jobTitle}
                                                    onChange={(e) => updateArrayField('experience', expIndex, 'jobTitle', e.target.value)}
                                                    className={`bg-transparent outline-none focus:ring-1 focus:ring-primary/50 font-bold print:hidden ${tmpl === "terminal" ? "text-green-400 text-base w-[300px]" : tmpl === "executive" ? "text-[19px] font-serif w-[350px]" : tmpl === "creative" ? "text-xl text-indigo-950 w-[300px]" : "text-xl w-[300px]"}`}
                                                />
                                                <span className={`hidden print:inline font-bold print:!text-slate-900 ${tmpl === "terminal" ? "text-green-400 text-base w-[300px]" : tmpl === "executive" ? "text-[19px] font-serif w-[350px]" : tmpl === "creative" ? "text-xl text-indigo-950 w-[300px]" : "text-xl w-[300px]"}`}>
                                                    {job.jobTitle}
                                                </span>
                                                <div className="flex gap-2 print:!text-slate-600">
                                                    <input
                                                        value={job.startDate}
                                                        onChange={(e) => updateArrayField('experience', expIndex, 'startDate', e.target.value)}
                                                        className={`bg-transparent outline-none focus:ring-1 focus:ring-primary/50 font-medium sm:text-right w-20 shrink-0 mt-1 sm:mt-0 print:hidden ${tmpl === "terminal" ? "text-green-600 text-xs" : tmpl === "minimalist" ? "text-sm text-black" : tmpl === "creative" ? "text-sm text-teal-600 font-semibold" : "text-sm text-slate-500"}`}
                                                    />
                                                    <span className={`hidden print:inline font-medium sm:text-right shrink-0 mt-1 sm:mt-0 print:!text-inherit ${tmpl === "terminal" ? "text-green-600 text-xs" : tmpl === "minimalist" ? "text-sm text-black" : tmpl === "creative" ? "text-sm text-teal-600 font-semibold" : "text-sm text-slate-500"}`}>
                                                        {job.startDate}
                                                    </span>
                                                    <span className={`mt-1 sm:mt-0 print:!text-inherit ${tmpl === "terminal" ? "text-green-600 text-xs" : tmpl === "minimalist" ? "text-sm text-black" : tmpl === "creative" ? "text-sm text-teal-600" : "text-sm text-slate-500"}`}>&mdash;</span>
                                                    <input
                                                        value={job.endDate || "Present"}
                                                        onChange={(e) => updateArrayField('experience', expIndex, 'endDate', e.target.value)}
                                                        className={`bg-transparent outline-none focus:ring-1 focus:ring-primary/50 font-medium w-20 shrink-0 mt-1 sm:mt-0 print:hidden ${tmpl === "terminal" ? "text-green-600 text-xs" : tmpl === "minimalist" ? "text-sm text-black" : tmpl === "creative" ? "text-sm text-teal-600 font-semibold" : "text-sm text-slate-500"}`}
                                                    />
                                                    <span className={`hidden print:inline font-medium shrink-0 mt-1 sm:mt-0 print:!text-inherit ${tmpl === "terminal" ? "text-green-600 text-xs" : tmpl === "minimalist" ? "text-sm text-black" : tmpl === "creative" ? "text-sm text-teal-600 font-semibold" : "text-sm text-slate-500"}`}>
                                                        {job.endDate || "Present"}
                                                    </span>
                                                </div>
                                            </div>
                                            <input
                                                value={job.company}
                                                onChange={(e) => updateArrayField('experience', expIndex, 'company', e.target.value)}
                                                className={`bg-transparent outline-none focus:ring-1 focus:ring-primary/50 font-medium mb-2 w-full print:hidden ${tmpl === "terminal" ? "text-green-500/80 text-sm" : tmpl === "executive" ? "text-md text-slate-600 font-serif italic" : tmpl === "creative" ? "text-md text-indigo-800 font-sans" : "text-md text-slate-700 font-sans italic"}`}
                                            />
                                            <div className={`hidden print:block font-medium mb-2 w-full print:!text-slate-700 ${tmpl === "terminal" ? "text-green-500/80 text-sm" : tmpl === "executive" ? "text-md text-slate-600 font-serif italic" : tmpl === "creative" ? "text-md text-indigo-800 font-sans" : "text-md text-slate-700 font-sans italic"}`}>
                                                {job.company}
                                            </div>
                                            <ul className={`list-outside ml-4 space-y-1.5 print:!text-slate-800 ${tmpl === "terminal" ? "text-sm text-green-500 list-none -ml-0" : tmpl === "executive" ? "text-[14.5px] list-disc text-slate-800 font-serif" : "text-base list-disc text-slate-700"}`}>
                                                {job.bullets?.map((bullet: string, bIndex: number) => (
                                                    <li key={bIndex} className="leading-snug pl-1 relative group/bullet">
                                                        <div className="flex items-start">
                                                            {tmpl === "terminal" && <span className="text-green-600 mr-2 mt-0.5 print:hidden">{">"}</span>}
                                                            <textarea
                                                                value={bullet}
                                                                onChange={(e) => updateBullet('experience', expIndex, bIndex, e.target.value)}
                                                                onInput={(e: any) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                                                className="bg-transparent outline-none focus:ring-1 focus:ring-primary/50 w-full resize-none overflow-hidden block print:hidden"
                                                                rows={2}
                                                            />
                                                            <div className="hidden print:block w-full leading-relaxed print:!text-slate-800 whitespace-pre-wrap">{bullet}</div>
                                                        </div>
                                                        {/* Inline AI for bullet */}
                                                        <button
                                                            onClick={() => handleImprovement('bullet', bullet, Number(`${expIndex}${bIndex}`))}
                                                            className="absolute -right-8 top-0 opacity-0 group-hover/bullet:opacity-100 transition-opacity text-primary p-1 bg-primary/10 rounded-sm border border-primary/20 hover:bg-primary/20 print:hidden"
                                                            title="Rewrite bullet with AI"
                                                        >
                                                            <Sparkles size={14} />
                                                        </button>

                                                        {/* AI Popover for specific bullet */}
                                                        <AnimatePresence>
                                                            {(isGenerating || (activeSuggestion?.field === 'bullet' && activeSuggestion.index === Number(`${expIndex}${bIndex}`))) && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                                    className="absolute top-8 right-0 bg-card border border-primary/50 p-4 rounded-sm shadow-2xl w-[400px] z-[60] print:hidden"
                                                                >
                                                                    <div className="flex gap-2 items-center text-primary font-bold text-xs uppercase mb-2">
                                                                        <Sparkles size={14} /> Neural Overwrite
                                                                    </div>
                                                                    {isGenerating ? (
                                                                        <div className="text-sm font-mono text-muted-foreground"><Loader2 className="animate-spin" size={14} /> Processing action verbs...</div>
                                                                    ) : (
                                                                        <>
                                                                            <p className="text-sm font-mono text-white mb-4 bg-background p-2 border border-border">{activeSuggestion?.suggestion}</p>
                                                                            <div className="flex justify-end gap-2">
                                                                                <button onClick={() => setActiveSuggestion(null)} className="text-xs text-muted-foreground hover:text-white px-3 py-1">Dismiss</button>
                                                                                <button onClick={() => { updateBullet('experience', expIndex, bIndex, activeSuggestion?.suggestion || ""); setActiveSuggestion(null); }} className="text-xs bg-primary text-primary-foreground px-3 py-1 font-bold rounded-sm">Apply</button>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* EDUCATION */}
                        {education && education.length > 0 && (
                            <section className="print:!text-slate-900">
                                {tmpl === "terminal" && <div className="text-xs mb-2 mt-2 opacity-70 print:hidden">root@sys:~# ls -l /usr/local/education</div>}
                                <h2 className={`font-bold tracking-widest mb-4 mt-2 print:!text-slate-900 print:!border-slate-800 ${tmpl === "terminal" ? "uppercase text-green-300 border-b border-green-500/30 inline-block" : tmpl === "minimalist" ? "uppercase text-lg border-b border-black" : tmpl === "executive" ? "capitalize text-2xl font-serif text-slate-800 border-b-2 border-slate-200 w-full pb-1" : tmpl === "creative" ? "capitalize text-2xl text-indigo-900 border-b-2 border-indigo-100" : "uppercase text-lg text-slate-900 bg-slate-200 px-3 py-1 inline-block"}`}>
                                    Education
                                </h2>
                                <div className="space-y-4">
                                    {education.map((edu: any, index: number) => (
                                        <div key={index} className="flex flex-col sm:flex-row justify-between break-inside-avoid">
                                            <div className="flex-1 mr-4">
                                                <input
                                                    value={edu.degree}
                                                    onChange={(e) => updateArrayField('education', index, 'degree', e.target.value)}
                                                    className={`bg-transparent outline-none focus:ring-1 focus:ring-primary/50 font-bold w-full print:hidden ${tmpl === "terminal" ? "text-green-400 text-sm" : tmpl === "executive" ? "text-[17px] font-serif text-slate-800" : tmpl === "creative" ? "text-lg font-sans text-indigo-950" : "text-lg font-sans"}`}
                                                />
                                                <span className={`hidden print:block font-bold w-full print:!text-slate-900 ${tmpl === "terminal" ? "text-green-400 text-sm" : tmpl === "executive" ? "text-[17px] font-serif text-slate-800" : tmpl === "creative" ? "text-lg font-sans text-indigo-950" : "text-lg font-sans"}`}>
                                                    {edu.degree}
                                                </span>
                                                <input
                                                    value={edu.institution}
                                                    onChange={(e) => updateArrayField('education', index, 'institution', e.target.value)}
                                                    className={`bg-transparent outline-none focus:ring-1 focus:ring-primary/50 w-full mt-0.5 print:hidden ${tmpl === "terminal" ? "text-xs text-green-500/80" : tmpl === "executive" ? "text-[15px] font-serif text-slate-600 italic" : "text-md text-slate-600"}`}
                                                />
                                                <span className={`hidden print:block w-full mt-0.5 print:!text-slate-700 ${tmpl === "terminal" ? "text-xs text-green-500/80" : tmpl === "executive" ? "text-[15px] font-serif text-slate-600 italic" : "text-md text-slate-600"}`}>
                                                    {edu.institution}
                                                </span>
                                            </div>
                                            <input
                                                value={edu.completionYear}
                                                onChange={(e) => updateArrayField('education', index, 'completionYear', e.target.value)}
                                                className={`bg-transparent outline-none focus:ring-1 focus:ring-primary/50 font-medium sm:text-right w-24 shrink-0 mt-1 sm:mt-0 print:hidden ${tmpl === "terminal" ? "text-green-600 text-xs" : tmpl === "minimalist" ? "text-sm text-black" : tmpl === "creative" ? "text-sm text-teal-600 font-semibold" : "text-sm text-slate-500"}`}
                                            />
                                            <span className={`hidden print:inline font-medium sm:text-right shrink-0 mt-1 sm:mt-0 print:!text-slate-600 ${tmpl === "terminal" ? "text-green-600 text-xs" : tmpl === "minimalist" ? "text-sm text-black" : tmpl === "creative" ? "text-sm text-teal-600 font-semibold" : "text-sm text-slate-500"}`}>
                                                {edu.completionYear}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* SKILLS */}
                        {skills && skills.length > 0 && (
                            <section className="break-inside-avoid print:!text-slate-900">
                                {tmpl === "terminal" && <div className="text-xs mb-2 mt-2 opacity-70 print:hidden">root@sys:~# npm list --global</div>}
                                <h2 className={`font-bold tracking-widest mb-4 mt-3 print:!text-slate-900 print:!border-slate-800 ${tmpl === "terminal" ? "uppercase text-green-300 border-b border-green-500/30 inline-block" : tmpl === "minimalist" ? "uppercase text-lg border-b border-black" : tmpl === "executive" ? "capitalize text-2xl font-serif text-slate-800 border-b-2 border-slate-200 w-full pb-1" : tmpl === "creative" ? "capitalize text-2xl text-indigo-900 border-b-2 border-indigo-100" : "uppercase text-lg text-slate-900 bg-slate-200 px-3 py-1 inline-block"}`}>
                                    Skills
                                </h2>
                                <div className={`flex flex-wrap gap-y-2 gap-x-2 ${tmpl === "terminal" ? "text-sm" : tmpl === "executive" ? "text-[14px] font-serif" : "text-base"}`}>
                                    {skills.map((skill: string, index: number) => (
                                        <div key={index} className="flex items-center">
                                            <div className={`font-medium focus-within:ring-1 focus-within:ring-primary/50 print:!text-slate-800 print:!bg-white print:!border-slate-300 print:border ${tmpl === "terminal" ? "text-green-500" :
                                                tmpl === "modern" ? "bg-slate-200 rounded text-slate-800" :
                                                    tmpl === "creative" ? "bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-md shadow-sm" :
                                                        tmpl === "executive" ? "border-b border-slate-300" :
                                                            "border border-slate-300 px-2 flex items-center h-full"
                                                }`}>
                                                {tmpl === "terminal" && <span className="mr-1 print:hidden">-</span>}
                                                <input
                                                    value={skill}
                                                    onChange={(e) => updateSkill(index, e.target.value)}
                                                    className={`bg-transparent text-center outline-none print:hidden ${tmpl === "terminal" ? "w-[auto]" : "py-0.5 px-1 w-[auto]"}`}
                                                    size={Math.max(2, skill.length)}
                                                />
                                                <span className={`hidden print:inline whitespace-nowrap print:!text-inherit ${tmpl === "terminal" ? "" : "py-0.5 px-1"}`}>
                                                    {skill}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
