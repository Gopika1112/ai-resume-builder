import Link from "next/link";
import { Terminal, ArrowLeft, Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";
import { motion } from "framer-motion";

export const metadata = {
    title: "Resume Examples - AutoResume",
    description: "Explore ATS-optimized AI resume examples across different industries and chassis templates.",
};

// --- DATA DEFINITIONS ---

const softwareEngineerData = {
    personalInfo: {
        fullName: "Sarah Chen",
        email: "sarah.chen@example.com",
        phone: "(415) 555-0198",
        location: "San Francisco, CA",
        linkedin: "https://linkedin.com/in/sarahchen-dev",
        github: "https://github.com/schen",
        portfolio: "https://sarahchen.dev"
    },
    summary: "High-impact Senior Software Engineer with 7+ years of experience architecting distributed systems and scaling backend infrastructure. Proven track record of reducing latency by 40% and leading cross-functional teams to deliver enterprise-grade microservices. Passionate about clean code, robust CI/CD pipelines, and mentoring junior developers.",
    experience: [
        {
            jobTitle: "Senior Systems Engineer",
            company: "CloudScale Systems",
            startDate: "Mar 2021",
            endDate: "Present",
            bullets: [
                "Architected and deployed a highly available microservices infrastructure using Kubernetes and AWS EKS, reducing system downtime by 99.9%.",
                "Optimized core data processing pipelines in Go and Rust, decreasing query latency by 65% for over 2M daily active users.",
                "Mentored a team of 4 mid-level engineers, establishing stringent PR review standards and increasing deployment frequency by 3x."
            ]
        },
        {
            jobTitle: "Software Engineer II",
            company: "DataFin Tech",
            startDate: "Jun 2018",
            endDate: "Feb 2021",
            bullets: [
                "Developed scalable RESTful APIs using Node.js and Express, supporting a 300% increase in mobile app traffic over 6 months.",
                "Implemented Redis caching layer that reduced database load by 40% and saved $15k annually in AWS RDS costs.",
                "Collaborated with product and design teams to launch 3 major feature sets ahead of schedule."
            ]
        }
    ],
    education: [
        { degree: "M.S. Computer Science", institution: "Stanford University", completionYear: "2018" },
        { degree: "B.S. Software Engineering", institution: "UC Berkeley", completionYear: "2016" }
    ],
    skills: ["Go", "Rust", "TypeScript", "Node.js", "Kubernetes", "Docker", "AWS", "PostgreSQL", "Redis", "Kafka", "System Architecture", "CI/CD"],
    template: "terminal"
};

const creativeDirectorData = {
    personalInfo: {
        fullName: "Marcus Vance",
        email: "hello@marcusvance.design",
        phone: "(323) 555-0122",
        location: "Los Angeles, CA",
        portfolio: "https://marcusvance.design",
        linkedin: "https://linkedin.com/in/marcusvance"
    },
    summary: "Visionary Creative Director and Brand Strategist with over a decade of experience driving cultural relevance and engagement for global brands. Dedicated to synthesizing user research, market trends, and avant-garde aesthetic principles into cohesive, multi-channel campaigns that convert and inspire.",
    experience: [
        {
            jobTitle: "Creative Director",
            company: "Neon Agency",
            startDate: "Jan 2020",
            endDate: "Present",
            bullets: [
                "Led global rebranding initiative for a Fortune 500 tech company, resulting in a 35% increase in brand sentiment across target demographics.",
                "Directed a team of 15 designers, copywriters, and animators to produce an award-winning integrated ad campaign that generated $5M in attributed ARR.",
                "Overhauled internal design operations, implementing Figma-based design systems that improved asset delivery speed by 50%."
            ]
        },
        {
            jobTitle: "Senior Art Director",
            company: "Vogue Visuals",
            startDate: "May 2015",
            endDate: "Dec 2019",
            bullets: [
                "Conceptualized and executed over 40 high-profile editorial shoots and digital campaigns for luxury fashion brands.",
                "Managed vendor relationships and production budgets exceeding $2M annually, consistently delivering under budget.",
                "Pioneered a new interactive web format for storytelling that increased user time-on-page by 2 minutes on average."
            ]
        }
    ],
    education: [
        { degree: "B.F.A. Graphic Design", institution: "Rhode Island School of Design (RISD)", completionYear: "2015" }
    ],
    skills: ["Art Direction", "Brand Strategy", "UI/UX Design", "Figma", "Adobe Creative Suite", "Typography", "Motion Graphics", "Team Leadership", "Campaign Development"],
    template: "creative"
};

const executiveData = {
    personalInfo: {
        fullName: "Eleanor Sterling",
        email: "e.sterling@executive.com",
        phone: "(212) 555-9876",
        location: "New York, NY",
        linkedin: "https://linkedin.com/in/eleanorsterling"
    },
    summary: "Strategic and results-driven Chief Operating Officer with 15+ years of experience scaling operations, optimizing P&L, and guiding corporate turnarounds in the fintech sector. Expert at aligning operational capabilities with overall business strategy to drive enterprise value, margin expansion, and sustainable revenue growth.",
    experience: [
        {
            jobTitle: "Chief Operating Officer",
            company: "Global Payment Solutions",
            startDate: "Sep 2018",
            endDate: "Present",
            bullets: [
                "Directed international expansion into EMEA and APAC, establishing 4 new regional headquarters and driving a $150M increase in net new revenue.",
                "Spearheaded enterprise-wide operational restructuring that identified and eliminated $25M in annual operational inefficiencies.",
                "Negotiated strategic partnerships with Tier 1 banks, securing favorable processing rates and expanding market share by 18%."
            ]
        },
        {
            jobTitle: "VP of Operations",
            company: "Apex Financial Core",
            startDate: "Jul 2012",
            endDate: "Aug 2018",
            bullets: [
                "Managed a global operations team of 400+ employees across customer success, compliance, and product delivery functions.",
                "Led the operational integration following a $500M acquisition, retaining 95% of key talent and consolidating redundant systems within 6 months.",
                "Established robust KPI tracking methodologies that improved SLA compliance from 82% to 99.4%."
            ]
        }
    ],
    education: [
        { degree: "Master of Business Administration (MBA)", institution: "Harvard Business School", completionYear: "2012" },
        { degree: "B.A. Economics", institution: "University of Pennsylvania", completionYear: "2008" }
    ],
    skills: ["Executive Leadership", "P&L Management", "Strategic Planning", "Mergers & Acquisitions (M&A)", "International Expansion", "Change Management", "Risk Management", "Process Optimization"],
    template: "executive"
};

// --- RENDER COMPONENT ---

function ResumePreview({ data }: { data: any }) {
    const { personalInfo, summary, experience, education, skills, template: tmpl } = data;

    return (
        <div
            className={`mx-auto w-full max-w-[210mm] overflow-hidden drop-shadow-2xl print:drop-shadow-none print:bg-transparent ${tmpl === "terminal" ? "bg-black text-green-500 border border-green-500/30" :
                tmpl === "minimalist" ? "bg-white text-black" :
                    tmpl === "executive" ? "bg-[#fcfcfc] text-slate-800" :
                        tmpl === "creative" ? "bg-white text-slate-800" :
                            "bg-slate-50 text-slate-900"
                }`}
            style={{ height: "100%", minHeight: "297mm" }}
        >
            <div className={`p-10 sm:p-14 md:p-16 print:p-0 ${tmpl === "terminal" ? "font-mono" : tmpl === "executive" ? "font-sans" : "font-sans"}`}>
                {tmpl === "creative" && <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400"></div>}

                {/* HEADER */}
                <header className={`pb-6 mb-6 ${tmpl === "minimalist" ? "border-b-2 border-black" : tmpl === "terminal" ? "border-b border-green-500/50" : tmpl === "executive" ? "border-b-2 border-slate-300 text-center flex flex-col items-center" : tmpl === "creative" ? "border-b-4 border-indigo-100 mb-8" : "border-b-4 border-slate-800"}`}>
                    {tmpl === "terminal" && <div className="text-xs mb-4 opacity-70">root@sys:~# cat profile.txt</div>}

                    <h1 className={`font-black tracking-tight ${tmpl === "terminal" ? "uppercase text-4xl sm:text-5xl text-green-400" : tmpl === "minimalist" ? "uppercase text-4xl sm:text-5xl text-black" : tmpl === "executive" ? "capitalize text-4xl sm:text-5xl text-slate-900 font-serif tracking-normal" : tmpl === "creative" ? "capitalize text-5xl sm:text-6xl text-indigo-950" : "uppercase text-4xl sm:text-5xl text-slate-900"}`}>
                        {personalInfo.fullName}
                    </h1>

                    <div className={`flex flex-wrap items-center mt-3 gap-y-2 gap-x-4 ${tmpl === "terminal" ? "text-xs text-green-500/80" : tmpl === "executive" ? "text-sm text-slate-700 italic font-serif" : "text-sm text-slate-600"}`}>
                        {personalInfo.email && (
                            <div className="flex items-center space-x-1.5">
                                <Mail size={14} className={(tmpl === "modern" || tmpl === "creative") ? "text-slate-400" : ""} />
                                <span>{personalInfo.email}</span>
                            </div>
                        )}
                        {personalInfo.phone && (
                            <div className={`flex items-center space-x-1.5 border-l pl-4 border-current ${tmpl === "creative" ? "border-indigo-200" : ""}`}>
                                <Phone size={14} className={(tmpl === "modern" || tmpl === "creative") ? "text-slate-400" : ""} />
                                <span>{personalInfo.phone}</span>
                            </div>
                        )}
                        {personalInfo.location && (
                            <div className={`flex items-center space-x-1.5 border-l pl-4 border-current ${tmpl === "creative" ? "border-indigo-200" : ""}`}>
                                <MapPin size={14} className={(tmpl === "modern" || tmpl === "creative") ? "text-slate-400" : ""} />
                                <span>{personalInfo.location}</span>
                            </div>
                        )}
                    </div>
                    <div className={`flex flex-wrap items-center mt-2 gap-y-2 gap-x-4 ${tmpl === "terminal" ? "text-xs text-green-500/80" : tmpl === "executive" ? "text-sm text-slate-700 italic font-serif flex-wrap justify-center" : "text-sm text-slate-600"}`}>
                        {personalInfo.linkedin && (
                            <div className={`flex items-center space-x-1.5 ${tmpl === "executive" && personalInfo.email ? "border-l pl-4 border-slate-400" : ""}`}>
                                <Linkedin size={14} className={(tmpl === "modern" || tmpl === "creative") ? "text-slate-400" : ""} />
                                <span className={tmpl === "terminal" ? "" : "hover:underline cursor-pointer"}>{personalInfo.linkedin.replace("https://", "")}</span>
                            </div>
                        )}
                        {personalInfo.github && (
                            <div className={`flex items-center space-x-1.5 border-l pl-4 border-current ${tmpl === "creative" ? "border-indigo-200" : ""}`}>
                                <Github size={14} className={(tmpl === "modern" || tmpl === "creative") ? "text-slate-400" : ""} />
                                <span className={tmpl === "terminal" ? "" : "hover:underline cursor-pointer"}>{personalInfo.github.replace("https://", "")}</span>
                            </div>
                        )}
                        {personalInfo.portfolio && (
                            <div className={`flex items-center space-x-1.5 border-l pl-4 border-current ${tmpl === "creative" ? "border-indigo-200" : ""}`}>
                                <Globe size={14} className={(tmpl === "modern" || tmpl === "creative") ? "text-slate-400" : ""} />
                                <span className={tmpl === "terminal" ? "" : "hover:underline cursor-pointer"}>{personalInfo.portfolio.replace("https://", "")}</span>
                            </div>
                        )}
                    </div>
                </header>

                <main className="space-y-8">

                    {/* SUMMARY */}
                    {summary && (
                        <section>
                            {tmpl === "terminal" && <div className="text-xs mb-2 opacity-70">root@sys:~# ./summary --execute</div>}
                            <h2 className={`font-bold tracking-widest mb-3 ${tmpl === "terminal" ? "uppercase text-green-300 border-b border-green-500/30 inline-block" : tmpl === "minimalist" ? "uppercase text-lg border-b border-black" : tmpl === "executive" ? "capitalize text-2xl font-serif text-slate-800 border-b-2 border-slate-200 w-full pb-1" : tmpl === "creative" ? "capitalize text-2xl text-indigo-900 border-b-2 border-indigo-100" : "uppercase text-lg text-slate-900 bg-slate-200 px-3 py-1 inline-block"}`}>
                                Professional Summary
                            </h2>
                            <p className={`text-justify leading-relaxed ${tmpl === "terminal" ? "text-sm" : tmpl === "executive" ? "text-[15px] font-serif mt-2" : "text-base mt-2"}`}>
                                {tmpl === "terminal" ? `> ${summary}` : summary}
                            </p>
                        </section>
                    )}

                    {/* EXPERIENCE */}
                    {experience && experience.length > 0 && (
                        <section>
                            {tmpl === "terminal" && <div className="text-xs mb-2 mt-2 opacity-70">root@sys:~# ./history --verbose</div>}
                            <h2 className={`font-bold tracking-widest mb-4 mt-2 ${tmpl === "terminal" ? "uppercase text-green-300 border-b border-green-500/30 inline-block" : tmpl === "minimalist" ? "uppercase text-lg border-b border-black" : tmpl === "executive" ? "capitalize text-2xl font-serif text-slate-800 border-b-2 border-slate-200 w-full pb-1" : tmpl === "creative" ? "capitalize text-2xl text-indigo-900 border-b-2 border-indigo-100" : "uppercase text-lg text-slate-900 bg-slate-200 px-3 py-1 inline-block"}`}>
                                Experience
                            </h2>
                            <div className="space-y-6">
                                {experience.map((job: any, index: number) => (
                                    <div key={index} className="break-inside-avoid">
                                        <div className="flex flex-col sm:flex-row justify-between mb-1">
                                            <h3 className={`font-bold ${tmpl === "terminal" ? "text-green-400 text-base" : tmpl === "executive" ? "text-[19px] font-serif" : tmpl === "creative" ? "text-xl text-indigo-950" : "text-xl"}`}>
                                                {tmpl === "terminal" && "[RUN: "} {job.jobTitle} {tmpl === "terminal" && "]"}
                                            </h3>
                                            <span className={`font-medium sm:text-right shrink-0 mt-1 sm:mt-0 ${tmpl === "terminal" ? "text-green-600 text-xs" : tmpl === "minimalist" ? "text-sm text-black" : tmpl === "creative" ? "text-sm text-teal-600 font-semibold" : "text-sm text-slate-500"}`}>
                                                {job.startDate} &mdash; {job.endDate || "Present"}
                                            </span>
                                        </div>
                                        <div className={`font-medium mb-2 ${tmpl === "terminal" ? "text-green-500/80 text-sm" : tmpl === "executive" ? "text-md text-slate-600 font-serif italic" : tmpl === "creative" ? "text-md text-indigo-800 font-sans" : "text-md text-slate-700 font-sans italic"}`}>
                                            {tmpl === "terminal" ? `@${job.company}` : job.company}
                                        </div>
                                        <ul className={`list-outside ml-4 space-y-1.5 ${tmpl === "terminal" ? "text-sm text-green-500 list-none -ml-0" : tmpl === "executive" ? "text-[14.5px] list-disc text-slate-800 font-serif" : "text-base list-disc text-slate-700"}`}>
                                            {job.bullets?.map((bullet: string, i: number) => (
                                                <li key={i} className="leading-snug pl-1">
                                                    {tmpl === "terminal" ? <><span className="text-green-600 mr-2">{">"}</span>{bullet}</> : bullet}
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

// --- MAIN PAGE ---

export default function ExamplesPage() {
    return (
        <div className="min-h-screen bg-background text-foreground pb-20 font-sans relative">
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            <nav className="w-full max-w-7xl mx-auto px-6 md:px-12 py-6 flex justify-between items-center relative z-20">
                <Link href="/" className="text-xl font-black uppercase text-white tracking-widest flex items-center space-x-2">
                    <Terminal size={20} className="text-primary" />
                    <span>AutoResume</span>
                </Link>
                <Link href="/build" className="text-sm font-mono text-primary border border-primary/30 hover:bg-primary/10 px-4 py-2 uppercase tracking-widest rounded-sm transition-colors shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                    Build Now
                </Link>
            </nav>

            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 pt-10">
                <Link href="/" className="inline-flex items-center space-x-2 text-sm font-mono text-muted-foreground hover:text-white transition-colors uppercase tracking-widest mb-10">
                    <ArrowLeft size={16} />
                    <span>Back to Home</span>
                </Link>

                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase mb-4">Gallery of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Excellence</span></h1>
                    <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">Explore exactly what the AutoResume neural engine can produce. Observe how different data payloads interact with distinct chassis layouts.</p>
                </div>

                <div className="space-y-32">
                    {/* Software Engineering (Terminal) */}
                    <div>
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Software Engineer Profile</h2>
                                <p className="text-muted-foreground font-mono text-sm mt-1">Chassis: <span className="text-green-500">Terminal</span></p>
                            </div>
                        </div>
                        <ResumePreview data={softwareEngineerData} />
                    </div>

                    {/* Creative Director (Creative) */}
                    <div>
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Creative Director Profile</h2>
                                <p className="text-muted-foreground font-mono text-sm mt-1">Chassis: <span className="text-indigo-400">Creative</span></p>
                            </div>
                        </div>
                        <ResumePreview data={creativeDirectorData} />
                    </div>

                    {/* Executive (Executive) */}
                    <div>
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Chief Operating Officer Profile</h2>
                                <p className="text-muted-foreground font-mono text-sm mt-1">Chassis: <span className="text-slate-300">Executive</span></p>
                            </div>
                        </div>
                        <ResumePreview data={executiveData} />
                    </div>
                </div>

                <div className="mt-32 text-center pb-10 border-t border-border/50 pt-20">
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6">Ready to compile your career?</h2>
                    <Link
                        href="/build"
                        className="inline-flex items-center justify-center bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] rounded-sm font-mono uppercase tracking-wider"
                    >
                        Initialize Builder
                    </Link>
                </div>
            </div>
            {/* Global print styles specifically for this page so it doesn't leak but ensures backgrounds remain accurate */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav, a, button { display: none !important; }
        }
      `}} />
        </div>
    );
}
