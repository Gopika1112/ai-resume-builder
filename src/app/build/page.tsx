"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ArrowRight, Loader2, User, Briefcase, GraduationCap, Code, LayoutTemplate, Terminal, Check, Sparkles, Database, Clock, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

import { ResumePreview } from "@/components/resume-preview";
import { Navbar } from "@/components/navbar";

const previewData = {
    personalInfo: {
        fullName: "Alexander Rossi",
        email: "alex.rossi@example.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA"
    },
    summary: "Strategic Senior Product Manager with 8+ years of experience leading cross-functional teams to build enterprise SaaS products. Proven track record of increasing user retention by 40% and generating $5M+ in new ARR. Passionate about AI-driven product capabilities and intuitive user experiences.",
    experience: [
        {
            jobTitle: "Group Product Manager",
            company: "TechFlow Solutions",
            startDate: "Jan 2021",
            endDate: "Present",
            bullets: [
                "Directed a team of 3 PMs and 20+ engineers to launch the flagship AI analytics suite.",
                "Increased enterprise customer adoption by 40% in the first two quarters.",
                "Streamlined agile development cycles, reducing time-to-market by 25% for core features."
            ]
        },
        {
            jobTitle: "Product Manager",
            company: "InnovateX",
            startDate: "Mar 2017",
            endDate: "Dec 2020",
            bullets: [
                "Owned the core mobile application product lifecycle from ideation to launch.",
                "Achieved a 4.8-star rating on the App Store with over 1M active daily users.",
                "Conducted extensive A/B testing leading to a 30% increase in checkout conversion rates."
            ]
        }
    ],
    education: [
        {
            degree: "Master of Business Administration (MBA)",
            institution: "Stanford University",
            completionYear: "2015"
        },
        {
            degree: "B.S. Computer Science",
            institution: "University of California, Berkeley",
            completionYear: "2011"
        }
    ],
    skills: ["Product Strategy", "Agile & Scrum", "Data Analytics", "Go-to-Market (GTM)", "UI/UX Design Principles", "A/B Testing", "SQL", "Python", "Jira", "Figma", "Stakeholder Management"]
};

const formSchema = z.object({
    personalInfo: z.object({
        fullName: z.string().min(2, "Full name is required"),
        email: z.string().email("Invalid email address"),
        phone: z.string().optional(),
        location: z.string().optional(),
        linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
        github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
        portfolio: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    }),
    summary: z.string().min(10, "Summary should be at least 10 characters").max(2000),
    experience: z.array(
        z.object({
            jobTitle: z.string().min(2, "Job title is required"),
            company: z.string().min(2, "Company is required"),
            startDate: z.string().min(2, "Start date is required"),
            endDate: z.string().optional(),
            description: z.string().min(10, "Provide some description of your role"),
        })
    ),
    education: z.array(
        z.object({
            degree: z.string().min(2, "Degree is required"),
            institution: z.string().min(2, "Institution is required"),
            completionYear: z.string().min(2, "Year is required"),
        })
    ),
    skills: z.string().min(2, "Enter at least one skill"),
    template: z.enum(["modern", "minimalist", "terminal", "creative", "executive", "chrono", "compact", "modernist", "legacy"]),
});

export type ResumeFormValues = z.infer<typeof formSchema>;

export default function BuildResumePage() {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recentResumes, setRecentResumes] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchHistory = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('resumes')
                .select('id, content, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (!error && data) {
                setRecentResumes(data);
            }
        };
        fetchHistory();
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Initializing Neural Link...</p>
            </div>
        );
    }

    const loadResume = (resume: any) => {
        const content = resume?.content || {};
        // Map saved content back to form values with robust defaults
        reset({
            personalInfo: content.personalInfo || { fullName: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "" },
            summary: content.summary || "",
            experience: content.experience || [{ jobTitle: "", company: "", startDate: "", endDate: "", description: "" }],
            education: content.education || [{ degree: "", institution: "", completionYear: "" }],
            skills: Array.isArray(content.skills) ? content.skills.join(", ") : content.skills || "",
            template: content.template || "modern",
        });
        setShowHistory(false);
    };

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<ResumeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            personalInfo: { fullName: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "" },
            summary: "",
            experience: [{ jobTitle: "", company: "", startDate: "", endDate: "", description: "" }],
            education: [{ degree: "", institution: "", completionYear: "" }],
            skills: "",
            template: "modern",
        },
    });

    const selectedTemplate = watch("template");

    const {
        fields: expFields,
        append: appendExp,
        remove: removeExp,
    } = useFieldArray({ control, name: "experience" });

    const {
        fields: eduFields,
        append: appendEdu,
        remove: removeEdu,
    } = useFieldArray({ control, name: "education" });

    const onSubmit = async (data: ResumeFormValues) => {
        setIsGenerating(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in to build a resume.");

            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, user_id: user.id }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to generate resume. Please check your data and try again.");
            }

            const result = await response.json();
            if (result.id) {
                router.push(`/resume/${result.id}`);
            } else {
                throw new Error(result.error || "Invalid response from server. Try again.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred.");
            setIsGenerating(false);
        }
    };

    const inputClasses = "w-full px-4 py-3 rounded-sm border border-border bg-card focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-mono text-sm";
    const labelClasses = "block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 mt-4";
    const sectionHeaderClasses = "flex items-center space-x-3 mb-6 border-b border-border pb-4";
    const sectionIconClasses = "p-2 bg-primary/10 rounded-sm text-primary border border-primary/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]";

    return (
        <div className="min-h-screen bg-background text-foreground pb-12 px-4 sm:px-6 lg:px-8 font-sans relative">
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px]"></div>

            <Navbar />

            {/* Sub-Nav for Builder Tools */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-end items-center relative z-20 gap-4 mb-4">
                {recentResumes.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center space-x-2 text-[10px] font-mono text-cyan-400 hover:text-white transition-colors px-3 py-1.5 border border-cyan-500/20 bg-cyan-500/5 rounded-sm uppercase tracking-widest"
                    >
                        <Clock size={12} />
                        <span>Load Recent</span>
                    </button>
                )}
                <Link href="/examples" className="text-[10px] font-mono text-muted-foreground hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2" target="_blank">
                    <LayoutTemplate size={12} />
                    View Examples
                </Link>
            </div>

            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="max-w-4xl mx-auto mb-8 bg-cyan-950/20 border border-cyan-500/20 rounded-sm overflow-hidden relative z-20"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Database size={14} /> Local System History
                                </h3>
                                <button onClick={() => setShowHistory(false)} className="text-muted-foreground hover:text-white transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {recentResumes.map((resume) => (
                                    <button
                                        key={resume.id}
                                        onClick={() => loadResume(resume)}
                                        className="flex flex-col p-4 bg-background/50 border border-border hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left group"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-mono text-muted-foreground group-hover:text-cyan-400 transition-colors">
                                                {resume.created_at ? new Date(resume.created_at).toLocaleDateString() : "Unknown Date"}
                                            </span>
                                            <ChevronRight size={12} className="text-muted-foreground group-hover:text-cyan-400" />
                                        </div>
                                        <p className="text-sm font-bold text-white uppercase truncate mb-1">
                                            {resume.content?.personalInfo?.fullName || "Untitled Resume"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                                            {resume.content?.template || "modern"} Chassis
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-12 mt-4">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black tracking-tighter sm:text-5xl mb-4 text-white uppercase"
                    >
                        Enter Your Details
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-muted-foreground font-mono"
                    >
                        Provide your raw information. The AI will professionally phrase and format it for you.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 flex justify-center"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setValue("personalInfo", {
                                    fullName: "Alex Rivera",
                                    email: "alex.rivera@example.com",
                                    phone: "(555) 987-6543",
                                    location: "San Francisco, CA",
                                    linkedin: "https://linkedin.com/in/alexrivera",
                                    github: "https://github.com/arivera",
                                    portfolio: "https://alexrivera.dev"
                                });
                                setValue("summary", "I am a Product Manager with 5 years of experience leading cross-functional teams to deliver scalable software solutions. I specialize in agile methodologies, user-centric design, and data-driven decision making. Have a strong technical background and a passion for creating products that solve real-world problems.");
                                setValue("experience", [
                                    {
                                        jobTitle: "Senior Product Manager",
                                        company: "TechNova Solutions",
                                        startDate: "Mar 2021",
                                        endDate: "Present",
                                        description: "Lead the development of the core enterprise SaaS platform. Managed a team of 12 engineers and 3 designers. Increased user retention by 25% and drove $2M in new ARR. Implemented new agile workflows that reduced time-to-market by a month."
                                    },
                                    {
                                        jobTitle: "Product Manager",
                                        company: "DataSphere Inc.",
                                        startDate: "Jun 2018",
                                        endDate: "Feb 2021",
                                        description: "Spearheaded the launch of a new analytics dashboard that was adopted by 80% of the customer base. Conducted over 50 user interviews to identify key pain points. Collaborated closely with the engineering team to prioritize technical debt alongside feature development."
                                    }
                                ]);
                                setValue("education", [
                                    {
                                        degree: "M.S. in Computer Science",
                                        institution: "Stanford University",
                                        completionYear: "2018"
                                    },
                                    {
                                        degree: "B.S. in Software Engineering",
                                        institution: "UC Berkeley",
                                        completionYear: "2016"
                                    }
                                ]);
                                setValue("skills", "Product Strategy, Agile/Scrum, User Research, Data Analysis (SQL, Python), Technical Architecture, UI/UX Principles, Jira, Roadmap Planning");
                                setValue("template", "creative");
                            }}
                            className="group flex items-center space-x-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-6 py-3 rounded-full hover:bg-indigo-600/30 hover:border-indigo-400 hover:text-indigo-300 transition-all shadow-[0_0_15px_rgba(79,70,229,0.15)]"
                        >
                            <Sparkles size={18} className="group-hover:animate-pulse" />
                            <span className="font-mono text-sm tracking-widest uppercase">Fill with AI Example</span>
                        </button>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card/80 backdrop-blur-xl shadow-2xl rounded-sm overflow-hidden border border-border shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                >
                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 sm:p-12 space-y-12">

                        {/* Personal Info */}
                        <section>
                            <div className={sectionHeaderClasses}>
                                <div className={sectionIconClasses}><User size={20} /></div>
                                <h2 className="text-2xl font-bold uppercase tracking-widest text-white mt-1">Personal Information</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Full Name</label>
                                    <input {...register("personalInfo.fullName")} className={inputClasses} suppressHydrationWarning placeholder="John Doe" />
                                    {errors.personalInfo?.fullName && <p className="text-red-500 text-xs font-mono mt-1">{errors.personalInfo.fullName.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Email</label>
                                    <input {...register("personalInfo.email")} className={inputClasses} suppressHydrationWarning placeholder="john@example.com" />
                                    {errors.personalInfo?.email && <p className="text-red-500 text-xs font-mono mt-1">{errors.personalInfo.email.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Phone</label>
                                    <input {...register("personalInfo.phone")} className={inputClasses} suppressHydrationWarning placeholder="(555) 123-4567" />
                                </div>
                                <div>
                                    <label className={labelClasses}>Location</label>
                                    <input {...register("personalInfo.location")} className={inputClasses} suppressHydrationWarning placeholder="New York, NY" />
                                </div>
                                <div>
                                    <label className={labelClasses}>LinkedIn URL</label>
                                    <input {...register("personalInfo.linkedin")} className={inputClasses} suppressHydrationWarning placeholder="https://linkedin.com/in/johndoe" />
                                    {errors.personalInfo?.linkedin && <p className="text-red-500 text-xs font-mono mt-1">{errors.personalInfo.linkedin.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Portfolio / GitHub URL</label>
                                    <input {...register("personalInfo.github")} className={inputClasses} suppressHydrationWarning placeholder="https://github.com/johndoe" />
                                    {errors.personalInfo?.github && <p className="text-red-500 text-xs font-mono mt-1">{errors.personalInfo.github.message}</p>}
                                </div>
                            </div>
                        </section>

                        {/* Summary */}
                        <section>
                            <div className={sectionHeaderClasses}>
                                <div className={sectionIconClasses}><Code size={20} /></div>
                                <h2 className="text-2xl font-bold uppercase tracking-widest text-white mt-1">Professional Summary</h2>
                            </div>
                            <div>
                                <textarea
                                    {...register("summary")}
                                    rows={4}
                                    className={`${inputClasses} resize-y`} suppressHydrationWarning
                                    placeholder="Provide a brief overview of your background. Don't worry about perfect wording, our AI will rewrite it professionally."
                                />
                                {errors.summary && <p className="text-red-500 text-xs font-mono mt-1">{errors.summary.message}</p>}
                            </div>
                        </section>

                        {/* Experience */}
                        <section>
                            <div className={sectionHeaderClasses}>
                                <div className={sectionIconClasses}><Briefcase size={20} /></div>
                                <h2 className="text-2xl font-bold uppercase tracking-widest text-white mt-1">Work Experience</h2>
                            </div>

                            <div className="space-y-6">
                                <AnimatePresence>
                                    {expFields.map((field, index) => (
                                        <motion.div
                                            key={field.id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-6 bg-background rounded-sm border border-border relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/50"></div>

                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeExp(index)}
                                                    className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 mt-2">
                                                <div>
                                                    <label className={labelClasses}>Job Title</label>
                                                    <input {...register(`experience.${index}.jobTitle` as const)} className={inputClasses} suppressHydrationWarning placeholder="Software Engineer" />
                                                    {errors?.experience?.[index]?.jobTitle && <p className="text-red-500 text-xs font-mono mt-1">{errors.experience[index]?.jobTitle?.message}</p>}
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Company</label>
                                                    <input {...register(`experience.${index}.company` as const)} className={inputClasses} suppressHydrationWarning placeholder="Tech Corp" />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Start Date</label>
                                                    <input {...register(`experience.${index}.startDate` as const)} className={inputClasses} suppressHydrationWarning placeholder="Jan 2021" />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>End Date</label>
                                                    <input {...register(`experience.${index}.endDate` as const)} className={inputClasses} suppressHydrationWarning placeholder="Present" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Description of Role</label>
                                                <textarea
                                                    {...register(`experience.${index}.description` as const)}
                                                    rows={3}
                                                    className={`${inputClasses} resize-y`} suppressHydrationWarning
                                                    placeholder="List what you did here. The AI will convert these into highly professional, action-oriented bullet points."
                                                />
                                                {errors?.experience?.[index]?.description && <p className="text-red-500 text-xs font-mono mt-1">{errors.experience[index]?.description?.message}</p>}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <button
                                    type="button"
                                    onClick={() => appendExp({ jobTitle: "", company: "", startDate: "", endDate: "", description: "" })}
                                    className="flex items-center space-x-2 text-xs font-mono text-primary hover:text-white transition-colors px-4 py-2 border border-primary/30 hover:bg-primary/20 rounded-sm"
                                >
                                    <Plus size={14} />
                                    <span className="uppercase tracking-widest">Add Another Position</span>
                                </button>
                            </div>
                        </section>

                        {/* Education */}
                        <section>
                            <div className={sectionHeaderClasses}>
                                <div className={sectionIconClasses}><GraduationCap size={20} /></div>
                                <h2 className="text-2xl font-bold uppercase tracking-widest text-white mt-1">Education</h2>
                            </div>

                            <div className="space-y-6">
                                <AnimatePresence>
                                    {eduFields.map((field, index) => (
                                        <motion.div
                                            key={field.id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-6 bg-background rounded-sm border border-border relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-700/50"></div>

                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeEdu(index)}
                                                    className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2 mt-2">
                                                <div>
                                                    <label className={labelClasses}>Degree</label>
                                                    <input {...register(`education.${index}.degree` as const)} className={inputClasses} suppressHydrationWarning placeholder="B.S. Computer Science" />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Institution</label>
                                                    <input {...register(`education.${index}.institution` as const)} className={inputClasses} suppressHydrationWarning placeholder="University Name" />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Graduation Year</label>
                                                    <input {...register(`education.${index}.completionYear` as const)} className={inputClasses} suppressHydrationWarning placeholder="2022" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <button
                                    type="button"
                                    onClick={() => appendEdu({ degree: "", institution: "", completionYear: "" })}
                                    className="flex items-center space-x-2 text-xs font-mono text-emerald-500 hover:text-white transition-colors px-4 py-2 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-sm"
                                >
                                    <Plus size={14} />
                                    <span className="uppercase tracking-widest">Add Another Degree</span>
                                </button>
                            </div>
                        </section>

                        {/* Skills */}
                        <section>
                            <div className={sectionHeaderClasses}>
                                <div className={sectionIconClasses}><Code size={20} /></div>
                                <h2 className="text-2xl font-bold uppercase tracking-widest text-white mt-1">Skills</h2>
                            </div>
                            <div>
                                <textarea
                                    {...register("skills")}
                                    rows={2}
                                    className={`${inputClasses} resize-y`} suppressHydrationWarning
                                    placeholder="e.g. React.js, Python, Project Management, Agile, Figma (Comma separated)"
                                />
                                {errors.skills && <p className="text-red-500 text-xs font-mono mt-1">{errors.skills.message}</p>}
                            </div>
                        </section>

                        {/* 
              TEMPLATE SELECTION 
              Made more prominent as requested
            */}
                        <section className="bg-background border-2 border-primary/50 p-8 rounded-sm relative overflow-hidden shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                            <div className="absolute top-0 right-0 p-1 px-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest">Final Step</div>
                            <div className={sectionHeaderClasses}>
                                <div className={sectionIconClasses}><LayoutTemplate size={24} /></div>
                                <div>
                                    <h2 className="text-2xl font-bold uppercase tracking-widest text-white mt-1">Select A Template</h2>
                                    <p className="text-xs font-mono text-muted-foreground mt-1">Choose the layout you want to use before compiling your resume.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">

                                {/* Corporate Template */}
                                <div
                                    className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 flex flex-col group ${selectedTemplate === 'modern' ? 'ring-4 ring-primary shadow-[0_0_30px_rgba(34,197,94,0.3)] scale-[1.02] z-10' : 'ring-1 ring-border hover:ring-primary/50 bg-card/50 hover:bg-card hover:-translate-y-1'}`}
                                    onClick={() => setValue("template", "modern")}
                                >
                                    <div className="h-64 sm:h-80 w-full bg-slate-900 overflow-hidden flex items-start justify-center pt-8 border-b border-border/50 relative">
                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none"></div>
                                        <div className="w-[210mm] origin-top transition-transform duration-500 group-hover:scale-[0.34]" style={{ transform: 'scale(0.32)' }}>
                                            <div className="bg-white shadow-2xl rounded-sm">
                                                <ResumePreview data={previewData} template="modern" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-background flex-1 flex flex-col">
                                        <h3 className={`font-black uppercase text-xl tracking-tight mb-2 ${selectedTemplate === 'modern' ? 'text-primary' : 'text-white'}`}>Corporate</h3>
                                        <p className="text-sm text-muted-foreground font-mono leading-relaxed mt-auto">Modern, green-accented layout designed primarily for tech companies and modern startups.</p>
                                    </div>
                                    {selectedTemplate === 'modern' && (
                                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-1.5 rounded-full z-20">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                {/* Minimalist Template */}
                                <div
                                    className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 flex flex-col group ${selectedTemplate === 'minimalist' ? 'ring-4 ring-primary shadow-[0_0_30px_rgba(34,197,94,0.3)] scale-[1.02] z-10' : 'ring-1 ring-border hover:ring-primary/50 bg-card/50 hover:bg-card hover:-translate-y-1'}`}
                                    onClick={() => setValue("template", "minimalist")}
                                >
                                    <div className="h-64 sm:h-80 w-full bg-slate-900 overflow-hidden flex items-start justify-center pt-8 border-b border-border/50 relative">
                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none"></div>
                                        <div className="w-[210mm] origin-top transition-transform duration-500 group-hover:scale-[0.34]" style={{ transform: 'scale(0.32)' }}>
                                            <div className="bg-white shadow-2xl rounded-sm">
                                                <ResumePreview data={previewData} template="minimalist" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-background flex-1 flex flex-col">
                                        <h3 className={`font-black uppercase text-xl tracking-tight mb-2 ${selectedTemplate === 'minimalist' ? 'text-primary' : 'text-white'}`}>Standard</h3>
                                        <p className="text-sm text-muted-foreground font-mono leading-relaxed mt-auto">Strict black & white formatting. Traditional structure ensuring 100% legacy ATS compatibility.</p>
                                    </div>
                                    {selectedTemplate === 'minimalist' && (
                                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-1.5 rounded-full z-20">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                {/* Terminal Template */}
                                <div
                                    className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 flex flex-col group ${selectedTemplate === 'terminal' ? 'ring-4 ring-primary shadow-[0_0_30px_rgba(34,197,94,0.3)] scale-[1.02] z-10' : 'ring-1 ring-border hover:ring-primary/50 bg-card/50 hover:bg-card hover:-translate-y-1'}`}
                                    onClick={() => setValue("template", "terminal")}
                                >
                                    <div className="h-64 sm:h-80 w-full bg-slate-900 overflow-hidden flex items-start justify-center pt-8 border-b border-border/50 relative">
                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none"></div>
                                        <div className="w-[210mm] origin-top transition-transform duration-500 group-hover:scale-[0.34]" style={{ transform: 'scale(0.32)' }}>
                                            <div className="bg-black shadow-[0_0_30px_rgba(34,197,94,0.15)] rounded-sm border border-green-500/20">
                                                <ResumePreview data={previewData} template="terminal" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-background flex-1 flex flex-col">
                                        <h3 className={`font-black uppercase text-xl tracking-tight mb-2 ${selectedTemplate === 'terminal' ? 'text-primary' : 'text-white'}`}>Terminal</h3>
                                        <p className="text-sm text-muted-foreground font-mono leading-relaxed mt-auto">Pure hacker aesthetic. High risk, high impact. Not for the faint of heart.</p>
                                    </div>
                                    {selectedTemplate === 'terminal' && (
                                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-1.5 rounded-full z-20">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                {/* Executive Template */}
                                <div
                                    className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 flex flex-col group ${selectedTemplate === 'executive' ? 'ring-4 ring-primary shadow-[0_0_30px_rgba(34,197,94,0.3)] scale-[1.02] z-10' : 'ring-1 ring-border hover:ring-primary/50 bg-card/50 hover:bg-card hover:-translate-y-1'}`}
                                    onClick={() => setValue("template", "executive")}
                                >
                                    <div className="h-64 sm:h-80 w-full bg-slate-900 overflow-hidden flex items-start justify-center pt-8 border-b border-border/50 relative">
                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none"></div>
                                        <div className="w-[210mm] origin-top transition-transform duration-500 group-hover:scale-[0.34]" style={{ transform: 'scale(0.32)' }}>
                                            <div className="bg-white shadow-2xl rounded-sm">
                                                <ResumePreview data={previewData} template="executive" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-background flex-1 flex flex-col">
                                        <h3 className={`font-black uppercase text-xl tracking-tight mb-2 ${selectedTemplate === 'executive' ? 'text-primary' : 'text-white'}`}>Executive</h3>
                                        <p className="text-sm text-muted-foreground font-mono leading-relaxed mt-auto">Classic serif styling with strict lines. Commands authority and respect.</p>
                                    </div>
                                    {selectedTemplate === 'executive' && (
                                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-1.5 rounded-full z-20">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                {/* Creative Template */}
                                <div
                                    className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 flex flex-col group ${selectedTemplate === 'creative' ? 'ring-4 ring-primary shadow-[0_0_30px_rgba(34,197,94,0.3)] scale-[1.02] z-10' : 'ring-1 ring-border hover:ring-primary/50 bg-card/50 hover:bg-card hover:-translate-y-1'}`}
                                    onClick={() => setValue("template", "creative")}
                                >
                                    <div className="h-64 sm:h-80 w-full bg-slate-900 overflow-hidden flex items-start justify-center pt-8 border-b border-border/50 relative">
                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none"></div>
                                        <div className="w-[210mm] origin-top transition-transform duration-500 group-hover:scale-[0.34]" style={{ transform: 'scale(0.32)' }}>
                                            <div className="bg-white shadow-2xl rounded-sm">
                                                <ResumePreview data={previewData} template="creative" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-background flex-1 flex flex-col">
                                        <h3 className={`font-black uppercase text-xl tracking-tight mb-2 ${selectedTemplate === 'creative' ? 'text-primary' : 'text-white'}`}>Creative</h3>
                                        <p className="text-sm text-muted-foreground font-mono leading-relaxed mt-auto">Vibrant accents and modern spacing. Ideal for design, media, and marketing roles.</p>
                                    </div>
                                    {selectedTemplate === 'creative' && (
                                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-1.5 rounded-full z-20">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                {/* Chrono Template */}
                                <div
                                    className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 flex flex-col group ${selectedTemplate === 'chrono' ? 'ring-4 ring-primary shadow-[0_0_30px_rgba(34,197,94,0.3)] scale-[1.02] z-10' : 'ring-1 ring-border hover:ring-primary/50 bg-card/50 hover:bg-card hover:-translate-y-1'}`}
                                    onClick={() => setValue("template", "chrono")}
                                >
                                    <div className="h-64 sm:h-80 w-full bg-slate-900 overflow-hidden flex items-start justify-center pt-8 border-b border-border/50 relative">
                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none"></div>
                                        <div className="w-[210mm] origin-top transition-transform duration-500 group-hover:scale-[0.34]" style={{ transform: 'scale(0.32)' }}>
                                            <div className="bg-white shadow-2xl rounded-sm">
                                                <ResumePreview data={previewData} template="chrono" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-background flex-1 flex flex-col">
                                        <h3 className={`font-black uppercase text-xl tracking-tight mb-2 ${selectedTemplate === 'chrono' ? 'text-primary' : 'text-white'}`}>Chrono</h3>
                                        <p className="text-sm text-muted-foreground font-mono leading-relaxed mt-auto">Timeline-focused layout with vertical markers. Excellent for showing progressive career growth.</p>
                                    </div>
                                    {selectedTemplate === 'chrono' && (
                                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-1.5 rounded-full z-20">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                {/* Compact Template */}
                                <div
                                    className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 flex flex-col group ${selectedTemplate === 'compact' ? 'ring-4 ring-primary shadow-[0_0_30px_rgba(34,197,94,0.3)] scale-[1.02] z-10' : 'ring-1 ring-border hover:ring-primary/50 bg-card/50 hover:bg-card hover:-translate-y-1'}`}
                                    onClick={() => setValue("template", "compact")}
                                >
                                    <div className="h-64 sm:h-80 w-full bg-slate-900 overflow-hidden flex items-start justify-center pt-8 border-b border-border/50 relative">
                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none"></div>
                                        <div className="w-[210mm] origin-top transition-transform duration-500 group-hover:scale-[0.34]" style={{ transform: 'scale(0.32)' }}>
                                            <div className="bg-white shadow-2xl rounded-sm">
                                                <ResumePreview data={previewData} template="compact" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-background flex-1 flex flex-col">
                                        <h3 className={`font-black uppercase text-xl tracking-tight mb-2 ${selectedTemplate === 'compact' ? 'text-primary' : 'text-white'}`}>Compact</h3>
                                        <p className="text-sm text-muted-foreground font-mono leading-relaxed mt-auto">Data-dense, grid-based layout. Optimized for fitment of extensive experience on a single page.</p>
                                    </div>
                                    {selectedTemplate === 'compact' && (
                                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-1.5 rounded-full z-20">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                {/* Modernist Template */}
                                <div
                                    className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 flex flex-col group ${selectedTemplate === 'modernist' ? 'ring-4 ring-primary shadow-[0_0_30px_rgba(34,197,94,0.3)] scale-[1.02] z-10' : 'ring-1 ring-border hover:ring-primary/50 bg-card/50 hover:bg-card hover:-translate-y-1'}`}
                                    onClick={() => setValue("template", "modernist")}
                                >
                                    <div className="h-64 sm:h-80 w-full bg-slate-900 overflow-hidden flex items-start justify-center pt-8 border-b border-border/50 relative">
                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none"></div>
                                        <div className="w-[210mm] origin-top transition-transform duration-500 group-hover:scale-[0.34]" style={{ transform: 'scale(0.32)' }}>
                                            <div className="bg-[#fafafa] shadow-2xl rounded-sm">
                                                <ResumePreview data={previewData} template="modernist" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-background flex-1 flex flex-col">
                                        <h3 className={`font-black uppercase text-xl tracking-tight mb-2 ${selectedTemplate === 'modernist' ? 'text-primary' : 'text-white'}`}>Modernist</h3>
                                        <p className="text-sm text-muted-foreground font-mono leading-relaxed mt-auto">Bold split-layout with an accent sidebar. Perfect for high-end professional identities.</p>
                                    </div>
                                    {selectedTemplate === 'modernist' && (
                                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-1.5 rounded-full z-20">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                {/* Legacy Template */}
                                <div
                                    className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 flex flex-col group ${selectedTemplate === 'legacy' ? 'ring-4 ring-primary shadow-[0_0_30px_rgba(34,197,94,0.3)] scale-[1.02] z-10' : 'ring-1 ring-border hover:ring-primary/50 bg-card/50 hover:bg-card hover:-translate-y-1'}`}
                                    onClick={() => setValue("template", "legacy")}
                                >
                                    <div className="h-64 sm:h-80 w-full bg-slate-900 overflow-hidden flex items-start justify-center pt-8 border-b border-border/50 relative">
                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none"></div>
                                        <div className="w-[210mm] origin-top transition-transform duration-500 group-hover:scale-[0.34]" style={{ transform: 'scale(0.32)' }}>
                                            <div className="bg-[#fffdfa] shadow-2xl rounded-sm">
                                                <ResumePreview data={previewData} template="legacy" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-background flex-1 flex flex-col">
                                        <h3 className={`font-black uppercase text-xl tracking-tight mb-2 ${selectedTemplate === 'legacy' ? 'text-primary' : 'text-white'}`}>Legacy</h3>
                                        <p className="text-sm text-muted-foreground font-mono leading-relaxed mt-auto">Traditional high-formality template with centered headers and elegant serif fonts.</p>
                                    </div>
                                    {selectedTemplate === 'legacy' && (
                                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-1.5 rounded-full z-20">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                            </div>

                            <input type="hidden" {...register("template")} />
                        </section>

                        {error && (
                            <div className="p-4 bg-red-950/40 text-red-400 border border-red-900 rounded-sm font-mono text-sm uppercase tracking-wider">
                                Error: {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={isGenerating}
                                suppressHydrationWarning
                                className="group relative inline-flex items-center justify-center bg-primary px-10 py-5 text-lg font-bold text-primary-foreground transition-all hover:bg-green-400 shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.7)] space-x-3 rounded-sm overflow-hidden disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed w-full sm:w-auto"
                            >
                                {isGenerating && (
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                        <span className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></span>
                                    </div>
                                )}
                                <span className="flex items-center space-x-3 relative z-10 font-mono uppercase tracking-widest">
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="animate-spin h-6 w-6" />
                                            <span>Writing Resume...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Generate Resume</span>
                                            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>

                    </form>
                </motion.div>
            </div>
        </div>
    );
}
