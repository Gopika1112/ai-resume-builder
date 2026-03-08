import React from 'react';
import { Mail, Phone, MapPin } from "lucide-react";

interface ResumePreviewProps {
    data: any;
    template: string;
}

export function ResumePreview({ data, template: tmpl }: ResumePreviewProps) {
    const { personalInfo, summary, experience, education, skills } = data;

    return (
        <div
            className={`w-[210mm] overflow-hidden ${tmpl === "terminal" ? "bg-black text-green-500 border border-green-500/30" :
                    tmpl === "minimalist" ? "bg-white text-black" :
                        tmpl === "executive" ? "bg-[#fcfcfc] text-slate-800" :
                            tmpl === "creative" ? "bg-white text-slate-800" :
                                tmpl === "chrono" ? "bg-white text-slate-900" :
                                    tmpl === "compact" ? "bg-white text-slate-900" :
                                        tmpl === "modernist" ? "bg-[#fafafa] text-slate-900" :
                                            tmpl === "legacy" ? "bg-[#fffdfa] text-black" :
                                                "bg-slate-50 text-slate-900"
                }`}
            style={{ minHeight: "297mm" }}
        >
            <div className={`p-16 ${tmpl === "terminal" ? "font-mono" :
                    tmpl === "legacy" ? "font-serif" :
                        tmpl === "executive" ? "font-sans" :
                            "font-sans"
                }`}>
                {tmpl === "creative" && <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400"></div>}

                {/* MODERNEST SPLIT LAYOUT WRAPPER */}
                {tmpl === "modernist" ? (
                    <div className="flex gap-10">
                        {/* LEFT SIDEBAR */}
                        <aside className="w-1/3 space-y-8">
                            <header className="mb-10">
                                <h1 className="text-4xl font-black text-slate-900 uppercase leading-none tracking-tighter">
                                    {personalInfo.fullName}
                                </h1>
                                <div className="mt-6 flex flex-col gap-3 text-xs font-mono uppercase tracking-widest text-slate-500">
                                    {personalInfo.email && <div className="flex items-center gap-2"><Mail size={12} /> {personalInfo.email}</div>}
                                    {personalInfo.phone && <div className="flex items-center gap-2"><Phone size={12} /> {personalInfo.phone}</div>}
                                    {personalInfo.location && <div className="flex items-center gap-2"><MapPin size={12} /> {personalInfo.location}</div>}
                                </div>
                            </header>

                            {skills && skills.length > 0 && (
                                <section>
                                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-4 border-b pb-2">Competencies</h2>
                                    <div className="flex flex-col gap-2">
                                        {skills.map((skill: string, i: number) => (
                                            <div key={i} className="text-xs font-bold uppercase tracking-wider text-slate-700">{skill}</div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </aside>

                        {/* RIGHT CONTENT */}
                        <div className="flex-1 space-y-10">
                            {summary && (
                                <section>
                                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Synopsis</h2>
                                    <p className="text-sm leading-relaxed text-slate-700">{summary}</p>
                                </section>
                            )}

                            {experience && experience.length > 0 && (
                                <section>
                                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Experience</h2>
                                    <div className="space-y-8">
                                        {experience.map((job: any, i: number) => (
                                            <div key={i} className="relative">
                                                <div className="flex justify-between items-baseline mb-2">
                                                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{job.jobTitle}</h3>
                                                    <span className="text-[10px] font-mono text-slate-400">{job.startDate} — {job.endDate || "Present"}</span>
                                                </div>
                                                <div className="text-sm font-bold text-slate-500 mb-3">{job.company}</div>
                                                <ul className="space-y-2">
                                                    {job.bullets?.map((bullet: string, j: number) => (
                                                        <li key={j} className="text-sm text-slate-600 leading-relaxed flex gap-2">
                                                            <span className="text-slate-300 mt-1">•</span>
                                                            {bullet}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {education && education.length > 0 && (
                                <section>
                                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Education</h2>
                                    <div className="space-y-4">
                                        {education.map((edu: any, i: number) => (
                                            <div key={i}>
                                                <h3 className="text-sm font-bold text-slate-900">{edu.degree}</h3>
                                                <div className="flex justify-between text-xs text-slate-500 font-mono mt-1">
                                                    <span>{edu.institution}</span>
                                                    <span>{edu.completionYear}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                ) : tmpl === "compact" ? (
                    <div className="text-[13px] leading-tight">
                        <header className="border-b-2 border-slate-900 pb-2 mb-4 flex justify-between items-end">
                            <h1 className="text-3xl font-black uppercase tracking-tighter">{personalInfo.fullName}</h1>
                            <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                <span>{personalInfo.email}</span>
                                <span>•</span>
                                <span>{personalInfo.phone}</span>
                                <span>•</span>
                                <span>{personalInfo.location}</span>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 gap-6">
                            {summary && <p className="text-slate-700 italic border-l-2 border-slate-200 pl-4 py-1">{summary}</p>}

                            {experience && experience.length > 0 && (
                                <section>
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] bg-slate-900 text-white px-2 py-0.5 mb-3 inline-block">Experience</h2>
                                    <div className="space-y-4">
                                        {experience.map((job: any, i: number) => (
                                            <div key={i}>
                                                <div className="flex justify-between font-bold text-slate-900 mb-0.5">
                                                    <span>{job.jobTitle} @ {job.company}</span>
                                                    <span className="text-[11px] font-mono">{job.startDate} — {job.endDate || "Present"}</span>
                                                </div>
                                                <ul className="list-disc ml-4 space-y-0.5 text-slate-600">
                                                    {job.bullets?.map((bullet: string, j: number) => (
                                                        <li key={j}>{bullet}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <div className="grid grid-cols-2 gap-8">
                                {education && education.length > 0 && (
                                    <section>
                                        <h2 className="text-xs font-black uppercase tracking-[0.2em] bg-slate-900 text-white px-2 py-0.5 mb-2 inline-block">Education</h2>
                                        <div className="space-y-2">
                                            {education.map((edu: any, i: number) => (
                                                <div key={i}>
                                                    <div className="font-bold text-slate-900">{edu.degree}</div>
                                                    <div className="text-[11px] text-slate-500">{edu.institution}, {edu.completionYear}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {skills && skills.length > 0 && (
                                    <section>
                                        <h2 className="text-xs font-black uppercase tracking-[0.2em] bg-slate-900 text-white px-2 py-0.5 mb-2 inline-block">Skills</h2>
                                        <p className="text-slate-700 font-bold tracking-tight">{skills.join(" • ")}</p>
                                    </section>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* STANDARD LINEAR LAYOUT (DEFAULT, MINIMALIST, TERMINAL, EXECUTIVE, CREATIVE, LEGACY, CHRONO) */}
                        <header className={`pb-6 mb-6 group ${tmpl === "minimalist" ? "border-b-2 border-black" :
                                tmpl === "terminal" ? "border-b border-green-500/50" :
                                    tmpl === "legacy" ? "border-b-2 border-black text-center" :
                                        tmpl === "chrono" ? "border-l-8 border-slate-900 pl-6 border-b-0 pb-0" :
                                            tmpl === "executive" ? "border-b-2 border-slate-300 text-center flex flex-col items-center" :
                                                tmpl === "creative" ? "border-b-4 border-indigo-100 mb-8" :
                                                    "border-b-4 border-slate-800"
                            }`}>
                            {tmpl === "terminal" && <div className="text-xs mb-4 opacity-70">root@sys:~# cat profile.txt</div>}

                            <h1 className={`font-black tracking-tight ${tmpl === "terminal" ? "uppercase text-4xl sm:text-5xl text-green-400" :
                                    tmpl === "minimalist" ? "uppercase text-4xl sm:text-5xl text-black" :
                                        tmpl === "legacy" ? "capitalize text-5xl font-serif text-black tracking-normal mb-2" :
                                            tmpl === "chrono" ? "uppercase text-6xl text-slate-900 leading-none" :
                                                tmpl === "executive" ? "capitalize text-4xl sm:text-5xl text-slate-900 font-serif tracking-normal text-center" :
                                                    tmpl === "creative" ? "capitalize text-5xl sm:text-6xl text-indigo-950" :
                                                        "uppercase text-4xl sm:text-5xl text-slate-900"
                                }`}>
                                {personalInfo.fullName}
                            </h1>

                            <div className={`flex flex-wrap justify-center sm:justify-start items-center mt-3 gap-y-2 gap-x-4 ${tmpl === "terminal" ? "text-xs text-green-500/80" :
                                    tmpl === "legacy" ? "justify-center text-sm font-serif" :
                                        tmpl === "chrono" ? "text-xs font-mono uppercase tracking-[0.2em] text-slate-500 mt-4" :
                                            tmpl === "executive" ? "text-sm text-slate-700 italic font-serif flex-wrap justify-center" :
                                                "text-sm text-slate-600"
                                }`}>
                                {personalInfo.email && (
                                    <div className="flex items-center space-x-1.5 relative">
                                        <Mail size={14} className={(tmpl === "modern" || tmpl === "creative") ? "text-slate-400" : ""} />
                                        <span>{personalInfo.email}</span>
                                    </div>
                                )}
                                {personalInfo.phone && (
                                    <div className={`flex items-center space-x-1.5 border-l pl-4 border-current relative ${tmpl === "creative" ? "border-indigo-200" : tmpl === "chrono" ? "border-slate-300" : ""}`}>
                                        <Phone size={14} className={(tmpl === "modern" || tmpl === "creative") ? "text-slate-400" : ""} />
                                        <span>{personalInfo.phone}</span>
                                    </div>
                                )}
                                {personalInfo.location && (
                                    <div className={`flex items-center space-x-1.5 border-l pl-4 border-current relative ${tmpl === "creative" ? "border-indigo-200" : tmpl === "chrono" ? "border-slate-300" : ""}`}>
                                        <MapPin size={14} className={(tmpl === "modern" || tmpl === "creative") ? "text-slate-400" : ""} />
                                        <span>{personalInfo.location}</span>
                                    </div>
                                )}
                            </div>
                        </header>

                        <main className="space-y-8">
                            {/* SUMMARY */}
                            {summary !== undefined && (
                                <section className="relative group/section">
                                    {tmpl === "terminal" && <div className="text-xs mb-2 opacity-70">root@sys:~# ./summary --execute</div>}
                                    <h2 className={`font-bold tracking-widest mb-3 ${tmpl === "terminal" ? "uppercase text-green-300 border-b border-green-500/30 inline-block" :
                                            tmpl === "minimalist" ? "uppercase text-lg border-b border-black" :
                                                tmpl === "legacy" ? "text-center text-xl font-serif italic border-y border-slate-200 py-1" :
                                                    tmpl === "chrono" ? "text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4" :
                                                        tmpl === "executive" ? "capitalize text-2xl font-serif text-slate-800 border-b-2 border-slate-200 w-full pb-1" :
                                                            tmpl === "creative" ? "capitalize text-2xl text-indigo-900 border-b-2 border-indigo-100" :
                                                                "uppercase text-lg text-slate-900 bg-slate-200 px-3 py-1 inline-block"
                                        }`}>
                                        Professional Summary
                                    </h2>
                                    <p className={`w-full bg-transparent whitespace-pre-wrap ${tmpl === "terminal" ? "text-sm" :
                                            tmpl === "legacy" ? "text-md font-serif text-center leading-relaxed" :
                                                tmpl === "chrono" ? "text-lg font-bold text-slate-800 leading-tight" :
                                                    tmpl === "executive" ? "text-[15px] font-serif mt-2" :
                                                        "text-base mt-2"
                                        }`}>
                                        {summary}
                                    </p>
                                </section>
                            )}

                            {/* EXPERIENCE */}
                            {experience && experience.length > 0 && (
                                <section>
                                    <h2 className={`font-bold tracking-widest mb-4 mt-2 ${tmpl === "terminal" ? "uppercase text-green-300 border-b border-green-500/30 inline-block" :
                                            tmpl === "minimalist" ? "uppercase text-lg border-b border-black" :
                                                tmpl === "legacy" ? "text-center text-xl font-serif uppercase tracking-widest mb-6 border-b-2 border-black pb-1" :
                                                    tmpl === "chrono" ? "text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8" :
                                                        tmpl === "executive" ? "capitalize text-2xl font-serif text-slate-800 border-b-2 border-slate-200 w-full pb-1" :
                                                            tmpl === "creative" ? "capitalize text-2xl text-indigo-900 border-b-2 border-indigo-100" :
                                                                "uppercase text-lg text-slate-900 bg-slate-200 px-3 py-1 inline-block"
                                        }`}>
                                        Experience
                                    </h2>
                                    <div className={`space-y-8 ${tmpl === "chrono" ? "border-l-2 border-slate-100 ml-1 pl-8" : ""}`}>
                                        {experience.map((job: any, expIndex: number) => (
                                            <div key={expIndex} className="break-inside-avoid relative group/job">
                                                {tmpl === "chrono" && <div className="absolute -left-[37px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-slate-900"></div>}

                                                <div className="flex flex-col sm:flex-row justify-between mb-1">
                                                    <div className={`font-bold ${tmpl === "terminal" ? "text-green-400 text-base w-[300px]" :
                                                            tmpl === "legacy" ? "text-xl font-serif w-full" :
                                                                tmpl === "executive" ? "text-[19px] font-serif w-[350px]" :
                                                                    tmpl === "creative" ? "text-xl text-indigo-950 w-[300px]" :
                                                                        "text-xl w-[300px]"
                                                        }`}>
                                                        {job.jobTitle}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className={`font-medium sm:text-right mt-1 sm:mt-0 ${tmpl === "terminal" ? "text-green-600 text-xs" :
                                                                tmpl === "legacy" ? "text-sm font-serif italic" :
                                                                    tmpl === "minimalist" ? "text-sm text-black" :
                                                                        tmpl === "creative" ? "text-sm text-teal-600 font-semibold" :
                                                                            "text-sm text-slate-500"
                                                            }`}>
                                                            {job.startDate}
                                                        </span>
                                                        <span className={`mt-1 sm:mt-0 ${tmpl === "terminal" ? "text-green-600 text-xs" :
                                                                tmpl === "minimalist" ? "text-sm text-black" :
                                                                    tmpl === "creative" ? "text-sm text-teal-600" :
                                                                        "text-sm text-slate-500"
                                                            }`}>&mdash;</span>
                                                        <span className={`font-medium mt-1 sm:mt-0 ${tmpl === "terminal" ? "text-green-600 text-xs" :
                                                                tmpl === "legacy" ? "text-sm font-serif italic" :
                                                                    tmpl === "minimalist" ? "text-sm text-black" :
                                                                        tmpl === "creative" ? "text-sm text-teal-600 font-semibold" :
                                                                            "text-sm text-slate-500"
                                                            }`}>
                                                            {job.endDate || "Present"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`font-medium mb-2 w-full ${tmpl === "terminal" ? "text-green-500/80 text-sm" :
                                                        tmpl === "legacy" ? "text-md font-serif font-bold italic text-slate-700" :
                                                            tmpl === "executive" ? "text-md text-slate-600 font-serif italic" :
                                                                tmpl === "creative" ? "text-md text-indigo-800 font-sans" :
                                                                    "text-md text-slate-700 font-sans italic"
                                                    }`}>
                                                    {job.company}
                                                </div>
                                                <ul className={`list-outside ml-4 space-y-1.5 ${tmpl === "terminal" ? "text-sm text-green-500 list-none -ml-0" :
                                                        tmpl === "legacy" ? "text-md font-serif list-disc text-black" :
                                                            tmpl === "executive" ? "text-[14.5px] list-disc text-slate-800 font-serif" :
                                                                "text-base list-disc text-slate-700"
                                                    }`}>
                                                    {job.bullets?.map((bullet: string, bIndex: number) => (
                                                        <li key={bIndex} className="leading-snug pl-1 relative group/bullet">
                                                            <div className="flex items-start">
                                                                {tmpl === "terminal" && <span className="text-green-600 mr-2 mt-0.5">{">"}</span>}
                                                                <span className="w-full block leading-relaxed">{bullet}</span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* EDUCATION/SKILLS IN TWO COLS FOR CHRONO */}
                            {tmpl === "chrono" ? (
                                <div className="grid grid-cols-2 gap-12">
                                    {/* CHRONO EDUCATION */}
                                    {education && education.length > 0 && (
                                        <section>
                                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">Education</h2>
                                            <div className="space-y-6">
                                                {education.map((edu: any, index: number) => (
                                                    <div key={index} className="break-inside-avoid">
                                                        <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none mb-1">{edu.degree}</h3>
                                                        <div className="text-xs font-mono uppercase text-slate-500 tracking-widest">{edu.institution}</div>
                                                        <div className="text-[10px] font-bold text-slate-900 mt-2">{edu.completionYear}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* CHRONO SKILLS */}
                                    {skills && skills.length > 0 && (
                                        <section>
                                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">Expertise</h2>
                                            <div className="flex flex-col gap-2">
                                                {skills.map((skill: string, index: number) => (
                                                    <div key={index} className="text-xs font-bold uppercase tracking-widest text-slate-700 border-l-2 border-slate-200 pl-3">
                                                        {skill}
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* EDUCATION (NON-CHRONO) */}
                                    {education && education.length > 0 && (
                                        <section>
                                            {tmpl === "terminal" && <div className="text-xs mb-2 mt-2 opacity-70">root@sys:~# ls -l /usr/local/education</div>}
                                            <h2 className={`font-bold tracking-widest mb-4 mt-2 ${tmpl === "terminal" ? "uppercase text-green-300 border-b border-green-500/30 inline-block" :
                                                    tmpl === "minimalist" ? "uppercase text-lg border-b border-black" :
                                                        tmpl === "legacy" ? "text-center text-xl font-serif uppercase tracking-widest mb-6 border-b-2 border-black pb-1" :
                                                            tmpl === "executive" ? "capitalize text-2xl font-serif text-slate-800 border-b-2 border-slate-200 w-full pb-1" :
                                                                tmpl === "creative" ? "capitalize text-2xl text-indigo-900 border-b-2 border-indigo-100" :
                                                                    "uppercase text-lg text-slate-900 bg-slate-200 px-3 py-1 inline-block"
                                                }`}>
                                                Education
                                            </h2>
                                            <div className="space-y-4">
                                                {education.map((edu: any, index: number) => (
                                                    <div key={index} className={`flex flex-col sm:flex-row justify-between break-inside-avoid ${tmpl === "legacy" ? "text-center sm:text-left" : ""}`}>
                                                        <div>
                                                            <h3 className={`font-bold ${tmpl === "terminal" ? "text-green-400 text-sm" :
                                                                    tmpl === "legacy" ? "text-lg font-serif" :
                                                                        tmpl === "executive" ? "text-[17px] font-serif text-slate-800" :
                                                                            tmpl === "creative" ? "text-lg font-sans text-indigo-950" :
                                                                                "text-lg font-sans"
                                                                }`}>
                                                                {edu.degree}
                                                            </h3>
                                                            <div className={`mt-0.5 ${tmpl === "terminal" ? "text-xs text-green-500/80" :
                                                                    tmpl === "legacy" ? "text-md font-serif italic" :
                                                                        tmpl === "executive" ? "text-[15px] font-serif text-slate-600 italic" :
                                                                            "text-md text-slate-600"
                                                                }`}>
                                                                {edu.institution}
                                                            </div>
                                                        </div>
                                                        <span className={`font-medium mt-1 sm:mt-0 ${tmpl === "terminal" ? "text-green-600 text-xs" :
                                                                tmpl === "minimalist" ? "text-sm text-black" :
                                                                    tmpl === "creative" ? "text-sm text-teal-600 font-semibold" :
                                                                        "text-sm text-slate-500"
                                                            }`}>
                                                            {edu.completionYear}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* SKILLS (NON-CHRONO) */}
                                    {skills && skills.length > 0 && (
                                        <section className="break-inside-avoid">
                                            {tmpl === "terminal" && <div className="text-xs mb-2 mt-2 opacity-70">root@sys:~# npm list --global</div>}
                                            <h2 className={`font-bold tracking-widest mb-4 mt-3 ${tmpl === "terminal" ? "uppercase text-green-300 border-b border-green-500/30 inline-block" :
                                                    tmpl === "minimalist" ? "uppercase text-lg border-b border-black" :
                                                        tmpl === "legacy" ? "text-center text-xl font-serif uppercase tracking-widest mb-6 border-b-2 border-black pb-1" :
                                                            tmpl === "executive" ? "capitalize text-2xl font-serif text-slate-800 border-b-2 border-slate-200 w-full pb-1" :
                                                                tmpl === "creative" ? "capitalize text-2xl text-indigo-900 border-b-2 border-indigo-100" :
                                                                    "uppercase text-lg text-slate-900 bg-slate-200 px-3 py-1 inline-block"
                                                }`}>
                                                Skills
                                            </h2>
                                            <div className={`flex flex-wrap gap-y-2 gap-x-2 justify-center sm:justify-start ${tmpl === "terminal" ? "text-sm" :
                                                    tmpl === "legacy" ? "font-serif justify-center" :
                                                        tmpl === "executive" ? "text-[14px] font-serif" :
                                                            "text-base"
                                                }`}>
                                                {skills.map((skill: string, index: number) => (
                                                    <div key={index} className="flex items-center">
                                                        <span className={`px-2 py-0.5 font-medium ${tmpl === "terminal" ? "before:content-['-'] text-green-500" :
                                                                tmpl === "modern" ? "bg-slate-200 rounded text-slate-800" :
                                                                    tmpl === "legacy" ? "border border-black px-3 py-1 text-sm italic" :
                                                                        tmpl === "creative" ? "bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-md shadow-sm" :
                                                                            tmpl === "executive" ? "border-b border-slate-300" :
                                                                                "border border-slate-300 px-2 py-1 flex items-center h-full"
                                                            }`}>
                                                            {tmpl === "terminal" ? ` ${skill}` : skill}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </>
                            )}
                        </main>
                    </>
                )}
            </div>
        </div>
    );
}
