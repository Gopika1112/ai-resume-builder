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
                            "bg-slate-50 text-slate-900"
                }`}
            style={{ minHeight: "297mm" }}
        >
            <div className={`p-16 ${tmpl === "terminal" ? "font-mono" : tmpl === "executive" ? "font-sans" : "font-sans"}`}>
                {tmpl === "creative" && <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400"></div>}

                {/* HEADER */}
                <header className={`pb-6 mb-6 group ${tmpl === "minimalist" ? "border-b-2 border-black" : tmpl === "terminal" ? "border-b border-green-500/50" : tmpl === "executive" ? "border-b-2 border-slate-300 text-center flex flex-col items-center" : tmpl === "creative" ? "border-b-4 border-indigo-100 mb-8" : "border-b-4 border-slate-800"}`}>
                    {tmpl === "terminal" && <div className="text-xs mb-4 opacity-70">root@sys:~# cat profile.txt</div>}

                    <h1 className={`font-black tracking-tight ${tmpl === "terminal" ? "uppercase text-4xl sm:text-5xl text-green-400" : tmpl === "minimalist" ? "uppercase text-4xl sm:text-5xl text-black" : tmpl === "executive" ? "capitalize text-4xl sm:text-5xl text-slate-900 font-serif tracking-normal text-center" : tmpl === "creative" ? "capitalize text-5xl sm:text-6xl text-indigo-950" : "uppercase text-4xl sm:text-5xl text-slate-900"}`}>
                        {personalInfo.fullName}
                    </h1>

                    <div className={`flex flex-wrap justify-center sm:justify-start items-center mt-3 gap-y-2 gap-x-4 ${tmpl === "terminal" ? "text-xs text-green-500/80" : tmpl === "executive" ? "text-sm text-slate-700 italic font-serif flex-wrap justify-center" : "text-sm text-slate-600"}`}>
                        {personalInfo.email && (
                            <div className="flex items-center space-x-1.5 relative">
                                <Mail size={14} className={(tmpl === "modern" || tmpl === "creative") ? "text-slate-400" : ""} />
                                <span>{personalInfo.email}</span>
                            </div>
                        )}
                        {personalInfo.phone && (
                            <div className={`flex items-center space-x-1.5 border-l pl-4 border-current relative ${tmpl === "creative" ? "border-indigo-200" : ""}`}>
                                <Phone size={14} className={(tmpl === "modern" || tmpl === "creative") ? "text-slate-400" : ""} />
                                <span>{personalInfo.phone}</span>
                            </div>
                        )}
                        {personalInfo.location && (
                            <div className={`flex items-center space-x-1.5 border-l pl-4 border-current relative ${tmpl === "creative" ? "border-indigo-200" : ""}`}>
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
                            <h2 className={`font-bold tracking-widest mb-3 ${tmpl === "terminal" ? "uppercase text-green-300 border-b border-green-500/30 inline-block" : tmpl === "minimalist" ? "uppercase text-lg border-b border-black" : tmpl === "executive" ? "capitalize text-2xl font-serif text-slate-800 border-b-2 border-slate-200 w-full pb-1" : tmpl === "creative" ? "capitalize text-2xl text-indigo-900 border-b-2 border-indigo-100" : "uppercase text-lg text-slate-900 bg-slate-200 px-3 py-1 inline-block"}`}>
                                Professional Summary
                            </h2>
                            <p className={`w-full bg-transparent whitespace-pre-wrap ${tmpl === "terminal" ? "text-sm" : tmpl === "executive" ? "text-[15px] font-serif mt-2" : "text-base mt-2"}`}>
                                {summary}
                            </p>
                        </section>
                    )}

                    {/* EXPERIENCE */}
                    {experience && experience.length > 0 && (
                        <section>
                            <h2 className={`font-bold tracking-widest mb-4 mt-2 ${tmpl === "terminal" ? "uppercase text-green-300 border-b border-green-500/30 inline-block" : tmpl === "minimalist" ? "uppercase text-lg border-b border-black" : tmpl === "executive" ? "capitalize text-2xl font-serif text-slate-800 border-b-2 border-slate-200 w-full pb-1" : tmpl === "creative" ? "capitalize text-2xl text-indigo-900 border-b-2 border-indigo-100" : "uppercase text-lg text-slate-900 bg-slate-200 px-3 py-1 inline-block"}`}>
                                Experience
                            </h2>
                            <div className="space-y-8">
                                {experience.map((job: any, expIndex: number) => (
                                    <div key={expIndex} className="break-inside-avoid relative group/job">
                                        <div className="flex flex-col sm:flex-row justify-between mb-1">
                                            <div className={`font-bold ${tmpl === "terminal" ? "text-green-400 text-base w-[300px]" : tmpl === "executive" ? "text-[19px] font-serif w-[350px]" : tmpl === "creative" ? "text-xl text-indigo-950 w-[300px]" : "text-xl w-[300px]"}`}>
                                                {job.jobTitle}
                                            </div>
                                            <div className="flex gap-2">
                                                <span className={`font-medium sm:text-right mt-1 sm:mt-0 ${tmpl === "terminal" ? "text-green-600 text-xs" : tmpl === "minimalist" ? "text-sm text-black" : tmpl === "creative" ? "text-sm text-teal-600 font-semibold" : "text-sm text-slate-500"}`}>
                                                    {job.startDate}
                                                </span>
                                                <span className={`mt-1 sm:mt-0 ${tmpl === "terminal" ? "text-green-600 text-xs" : tmpl === "minimalist" ? "text-sm text-black" : tmpl === "creative" ? "text-sm text-teal-600" : "text-sm text-slate-500"}`}>&mdash;</span>
                                                <span className={`font-medium mt-1 sm:mt-0 ${tmpl === "terminal" ? "text-green-600 text-xs" : tmpl === "minimalist" ? "text-sm text-black" : tmpl === "creative" ? "text-sm text-teal-600 font-semibold" : "text-sm text-slate-500"}`}>
                                                    {job.endDate || "Present"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`font-medium mb-2 w-full ${tmpl === "terminal" ? "text-green-500/80 text-sm" : tmpl === "executive" ? "text-md text-slate-600 font-serif italic" : tmpl === "creative" ? "text-md text-indigo-800 font-sans" : "text-md text-slate-700 font-sans italic"}`}>
                                            {job.company}
                                        </div>
                                        <ul className={`list-outside ml-4 space-y-1.5 ${tmpl === "terminal" ? "text-sm text-green-500 list-none -ml-0" : tmpl === "executive" ? "text-[14.5px] list-disc text-slate-800 font-serif" : "text-base list-disc text-slate-700"}`}>
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

                    {/* EDUCATION */}
                    {education && education.length > 0 && (
                        <section>
                            {tmpl === "terminal" && <div className="text-xs mb-2 mt-2 opacity-70">root@sys:~# ls -l /usr/local/education</div>}
                            <h2 className={`font-bold tracking-widest mb-4 mt-2 ${tmpl === "terminal" ? "uppercase text-green-300 border-b border-green-500/30 inline-block" : tmpl === "minimalist" ? "uppercase text-lg border-b border-black" : tmpl === "executive" ? "capitalize text-2xl font-serif text-slate-800 border-b-2 border-slate-200 w-full pb-1" : tmpl === "creative" ? "capitalize text-2xl text-indigo-900 border-b-2 border-indigo-100" : "uppercase text-lg text-slate-900 bg-slate-200 px-3 py-1 inline-block"}`}>
                                Education
                            </h2>
                            <div className="space-y-4">
                                {education.map((edu: any, index: number) => (
                                    <div key={index} className="flex flex-col sm:flex-row justify-between break-inside-avoid">
                                        <div>
                                            <h3 className={`font-bold ${tmpl === "terminal" ? "text-green-400 text-sm" : tmpl === "executive" ? "text-[17px] font-serif text-slate-800" : tmpl === "creative" ? "text-lg font-sans text-indigo-950" : "text-lg font-sans"}`}>
                                                {edu.degree}
                                            </h3>
                                            <div className={`mt-0.5 ${tmpl === "terminal" ? "text-xs text-green-500/80" : tmpl === "executive" ? "text-[15px] font-serif text-slate-600 italic" : "text-md text-slate-600"}`}>
                                                {edu.institution}
                                            </div>
                                        </div>
                                        <span className={`font-medium mt-1 sm:mt-0 ${tmpl === "terminal" ? "text-green-600 text-xs" : tmpl === "minimalist" ? "text-sm text-black" : tmpl === "creative" ? "text-sm text-teal-600 font-semibold" : "text-sm text-slate-500"}`}>
                                            {edu.completionYear}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* SKILLS */}
                    {skills && skills.length > 0 && (
                        <section className="break-inside-avoid">
                            {tmpl === "terminal" && <div className="text-xs mb-2 mt-2 opacity-70">root@sys:~# npm list --global</div>}
                            <h2 className={`font-bold tracking-widest mb-4 mt-3 ${tmpl === "terminal" ? "uppercase text-green-300 border-b border-green-500/30 inline-block" : tmpl === "minimalist" ? "uppercase text-lg border-b border-black" : tmpl === "executive" ? "capitalize text-2xl font-serif text-slate-800 border-b-2 border-slate-200 w-full pb-1" : tmpl === "creative" ? "capitalize text-2xl text-indigo-900 border-b-2 border-indigo-100" : "uppercase text-lg text-slate-900 bg-slate-200 px-3 py-1 inline-block"}`}>
                                Skills
                            </h2>
                            <div className={`flex flex-wrap gap-y-2 gap-x-2 ${tmpl === "terminal" ? "text-sm" : tmpl === "executive" ? "text-[14px] font-serif" : "text-base"}`}>
                                {skills.map((skill: string, index: number) => (
                                    <div key={index} className="flex items-center">
                                        <span className={`px-2 py-0.5 font-medium ${tmpl === "terminal" ? "before:content-['-'] text-green-500" :
                                            tmpl === "modern" ? "bg-slate-200 rounded text-slate-800" :
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
                </main>
            </div>
        </div>
    );
}
