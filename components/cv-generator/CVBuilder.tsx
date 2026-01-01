'use client';

import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Plus, Trash2, Wand2, Download, Briefcase, GraduationCap, User, FileText, Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { polishText } from '@/app/actions/cvActions';

// --- Types ---
interface Education {
    id: string;
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
    description: string;
}

interface Experience {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
}

interface PersonalInfo {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
    photo: string | null;
}

interface CVData {
    personal: PersonalInfo;
    education: Education[];
    experience: Experience[];
    skills: string[];
}

// --- Components ---

const CVBuilder = () => {
    const [cvData, setCvData] = useState<CVData>({
        personal: {
            fullName: 'John Doe',
            title: 'Software Engineer',
            email: 'john@example.com',
            phone: '+1 234 567 890',
            location: 'New York, USA',
            website: 'johndoe.dev',
            summary: 'Passionate software engineer with 5+ years of experience in building scalable web applications. Skilled in React, Node.js, and Cloud Architecture.',
            photo: null,
        },
        education: [
            {
                id: '1',
                school: 'University of Technology',
                degree: 'Bachelor of Science in Computer Science',
                startDate: '2015',
                endDate: '2019',
                description: 'Graduated with Honors. Member of the Coding Club.',
            }
        ],
        experience: [
            {
                id: '1',
                company: 'Tech Solutions Inc.',
                position: 'Senior Developer',
                startDate: '2021',
                endDate: 'Present',
                description: 'Lead a team of 5 developers. Architected the new payment system reducing latency by 40%.',
            }
        ],
        skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'AWS'],
    });

    const [activeSection, setActiveSection] = useState<'personal' | 'experience' | 'education' | 'skills'>('personal');
    const [isPolishing, setIsPolishing] = useState<string | null>(null); // keeping track of which field is being polished
    const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    const templates = [
        {
            id: 'modern',
            name: 'Modern',
            render: (data: CVData) => (
                <div className="p-[10mm] h-full flex flex-col gap-6 font-sans text-slate-900">
                    {/* Header */}
                    <div className="border-b-2 border-slate-900 pb-8 flex justify-between items-start gap-8 pr-4">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold uppercase tracking-wide leading-tight">{data.personal.fullName}</h1>
                            <p className="text-xl text-emerald-700 font-medium mt-2">{data.personal.title}</p>

                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-sm text-slate-600">
                                {data.personal.email && <span>{data.personal.email}</span>}
                                {data.personal.phone && <span>• {data.personal.phone}</span>}
                                {data.personal.location && <span>• {data.personal.location}</span>}
                                {data.personal.website && <span>• {data.personal.website}</span>}
                            </div>
                        </div>
                        <div className="flex-shrink-0 pt-2">
                            {data.personal.photo ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={data.personal.photo}
                                    alt={data.personal.fullName}
                                    className="w-28 h-28 rounded-full object-cover border-2 border-slate-200 shadow-sm print:shadow-none"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-full border-2 border-slate-200 border-dashed flex items-center justify-center bg-slate-50 text-slate-300">
                                    <User className="w-10 h-10 opacity-50" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    {data.personal.summary && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Professional Summary</h2>
                            <p className="text-sm leading-relaxed text-slate-800">{data.personal.summary}</p>
                        </section>
                    )}

                    {/* Experience */}
                    {data.experience.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 pb-1">Experience</h2>
                            <div className="flex flex-col gap-4">
                                {data.experience.map(exp => (
                                    <div key={exp.id}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-slate-900">{exp.position}</h3>
                                            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                                        </div>
                                        <div className="text-emerald-700 font-medium text-sm mb-2">{exp.company}</div>
                                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Education */}
                    {data.education.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 pb-1">Education</h2>
                            <div className="flex flex-col gap-4">
                                {data.education.map(edu => (
                                    <div key={edu.id}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-slate-900">{edu.school}</h3>
                                            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{edu.startDate} - {edu.endDate}</span>
                                        </div>
                                        <div className="text-sm text-slate-700">{edu.degree}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills */}
                    {data.skills.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 pb-1">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {data.skills.length > 0 && data.skills[0] !== '' && data.skills.map((skill, i) => (
                                    <span key={i} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded text-sm font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )
        },
        {
            id: 'classic',
            name: 'Classic',
            render: (data: CVData) => (
                <div className="p-[10mm] h-full flex flex-col gap-6 font-serif text-slate-900">
                    {/* Header */}
                    <div className="text-center border-b border-slate-300 pb-6">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">{data.personal.fullName}</h1>
                        <p className="text-lg italic text-slate-700 mb-3">{data.personal.title}</p>
                        <div className="flex justify-center flex-wrap gap-4 text-sm text-slate-600 mb-6">
                            {data.personal.email && <span>{data.personal.email}</span>}
                            {data.personal.phone && <span>| {data.personal.phone}</span>}
                            {data.personal.location && <span>| {data.personal.location}</span>}
                            {data.personal.website && <span>| {data.personal.website}</span>}
                        </div>
                        {data.personal.photo && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={data.personal.photo}
                                alt={data.personal.fullName}
                                className="w-32 h-32 rounded-full object-cover border border-slate-200 mx-auto shadow-sm"
                            />
                        )}
                    </div>

                    {/* Summary */}
                    {data.personal.summary && (
                        <section>
                            <h2 className="text-xl font-bold border-b border-slate-800 pb-1 mb-3">Professional Profile</h2>
                            <p className="text-sm leading-relaxed text-slate-800 text-justify">{data.personal.summary}</p>
                        </section>
                    )}

                    {/* Experience */}
                    {data.experience.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold border-b border-slate-800 pb-1 mb-4">Work History</h2>
                            <div className="flex flex-col gap-6">
                                {data.experience.map(exp => (
                                    <div key={exp.id}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-lg">{exp.company}</h3>
                                            <span className="text-sm italic">{exp.startDate} – {exp.endDate}</span>
                                        </div>
                                        <div className="text-slate-700 font-medium mb-2">{exp.position}</div>
                                        <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Education */}
                    {data.education.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold border-b border-slate-800 pb-1 mb-4">Education</h2>
                            <div className="flex flex-col gap-4">
                                {data.education.map(edu => (
                                    <div key={edu.id} className="flex justify-between items-baseline">
                                        <div>
                                            <h3 className="font-bold">{edu.school}</h3>
                                            <div className="text-sm text-slate-700">{edu.degree}</div>
                                        </div>
                                        <span className="text-sm italic whitespace-nowrap">{edu.startDate} – {edu.endDate}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills */}
                    {data.skills.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold border-b border-slate-800 pb-1 mb-4">Skills</h2>
                            <p className="text-sm leading-relaxed">
                                {data.skills.join(' • ')}
                            </p>
                        </section>
                    )}

                </div>
            )
        }
    ];

    const toggleTemplate = (direction: 'next' | 'prev') => {
        if (direction === 'next') {
            setCurrentTemplateIndex((prev) => (prev + 1) % templates.length);
        } else {
            setCurrentTemplateIndex((prev) => (prev - 1 + templates.length) % templates.length);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: contentRef,
        documentTitle: `${cvData.personal.fullName}_CV`,
    });

    // --- State Updaters ---

    const updatePersonal = (field: keyof PersonalInfo, value: string) => {
        setCvData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
    };

    const addExperience = () => {
        const newExp: Experience = {
            id: Date.now().toString(),
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            description: '',
        };
        setCvData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
    };

    const updateExperience = (id: string, field: keyof Experience, value: string) => {
        setCvData(prev => ({
            ...prev,
            experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
        }));
    };

    const removeExperience = (id: string) => {
        setCvData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
    };


    const addEducation = () => {
        const newEdu: Education = {
            id: Date.now().toString(),
            school: '',
            degree: '',
            startDate: '',
            endDate: '',
            description: '',
        };
        setCvData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
    };

    const updateEducation = (id: string, field: keyof Education, value: string) => {
        setCvData(prev => ({
            ...prev,
            education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
        }));
    };

    const removeEducation = (id: string) => {
        setCvData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
    };

    const updateSkills = (value: string) => {
        setCvData(prev => ({ ...prev, skills: value.split(',').map(s => s.trim()) }));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updatePersonal('photo', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        updatePersonal('photo', '');
    };


    // --- AI Actions ---

    const handlePolish = async (text: string, id: string, type: 'summary' | 'experience') => {
        if (!text) return;
        setIsPolishing(id);
        try {
            const polished = await polishText(text, type);
            if (type === 'summary') {
                updatePersonal('summary', polished);
            } else {
                // Optimization: This assumes we are passing the ID of the experience item
                updateExperience(id, 'description', polished);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to polish text via AI.");
        } finally {
            setIsPolishing(null);
        }
    };


    // --- Renderers ---

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

            {/* --- EDITOR PANEL --- */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6 h-fit">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {[
                            { id: 'personal', icon: User, label: 'Personal' },
                            { id: 'experience', icon: Briefcase, label: 'Experience' },
                            { id: 'education', icon: GraduationCap, label: 'Education' },
                            { id: 'skills', icon: FileText, label: 'Skills' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSection(tab.id as typeof activeSection)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeSection === tab.id
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Forms */}
                    <div className="space-y-4">
                        {activeSection === 'personal' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" placeholder="Full Name" value={cvData.personal.fullName} onChange={e => updatePersonal('fullName', e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:border-emerald-500 outline-none w-full" />
                                    <input type="text" placeholder="Job Title" value={cvData.personal.title} onChange={e => updatePersonal('title', e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:border-emerald-500 outline-none w-full" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="email" placeholder="Email" value={cvData.personal.email} onChange={e => updatePersonal('email', e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:border-emerald-500 outline-none w-full" />
                                    <input type="text" placeholder="Phone" value={cvData.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:border-emerald-500 outline-none w-full" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" placeholder="Location" value={cvData.personal.location} onChange={e => updatePersonal('location', e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:border-emerald-500 outline-none w-full" />
                                    <input type="text" placeholder="Website / LinkedIn" value={cvData.personal.website} onChange={e => updatePersonal('website', e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:border-emerald-500 outline-none w-full" />
                                </div>

                                {/* Photo Upload */}
                                <div className="flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-lg">
                                    {cvData.personal.photo ? (
                                        <div className="flex items-center gap-4 w-full">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={cvData.personal.photo} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-slate-700" />
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-300 font-medium truncate">Profile Photo Uploaded</p>
                                                <button onClick={removePhoto} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mt-1">
                                                    <X className="w-3 h-3" /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-800 border-dashed rounded-lg cursor-pointer hover:bg-slate-900 hover:border-emerald-500/50 transition-all group">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-6 h-6 text-slate-500 group-hover:text-emerald-500 mb-2" />
                                                    <p className="text-xs text-slate-500 group-hover:text-slate-400">Upload Profile Photo</p>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <textarea
                                        placeholder="Professional Summary"
                                        value={cvData.personal.summary}
                                        onChange={e => updatePersonal('summary', e.target.value)}
                                        rows={4}
                                        className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:border-emerald-500 outline-none w-full resize-none"
                                    />
                                    <button
                                        onClick={() => handlePolish(cvData.personal.summary, 'summary', 'summary')}
                                        disabled={!cvData.personal.summary || !!isPolishing}
                                        className="absolute bottom-3 right-3 p-1.5 bg-emerald-500/10 text-emerald-400 rounded-md hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                        title="Polish with AI"
                                    >
                                        <Wand2 className={`w-4 h-4 ${isPolishing === 'summary' ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'experience' && (
                            <div className="space-y-6 animate-fade-in">
                                {cvData.experience.map((exp) => (
                                    <div key={exp.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 relative group">
                                        <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <input type="text" placeholder="Company" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} className="bg-transparent border-b border-slate-800 focus:border-emerald-500 outline-none text-slate-200 py-1" />
                                            <input type="text" placeholder="Position" value={exp.position} onChange={e => updateExperience(exp.id, 'position', e.target.value)} className="bg-transparent border-b border-slate-800 focus:border-emerald-500 outline-none text-slate-200 py-1" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <input type="text" placeholder="Start Date" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} className="bg-transparent border-b border-slate-800 focus:border-emerald-500 outline-none text-slate-200 py-1 text-sm" />
                                            <input type="text" placeholder="End Date" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} className="bg-transparent border-b border-slate-800 focus:border-emerald-500 outline-none text-slate-200 py-1 text-sm" />
                                        </div>
                                        <div className="relative">
                                            <textarea
                                                placeholder="Description (Key achievements...)"
                                                value={exp.description}
                                                onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                                                rows={3}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 focus:border-emerald-500 outline-none resize-none"
                                            />
                                            <button
                                                onClick={() => handlePolish(exp.description, exp.id, 'experience')}
                                                disabled={!exp.description || !!isPolishing}
                                                className="absolute bottom-3 right-3 p-1.5 bg-emerald-500/10 text-emerald-400 rounded-md hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                                title="Polish with AI"
                                            >
                                                <Wand2 className={`w-3 h-3 ${isPolishing === exp.id ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addExperience} className="w-full py-2 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center justify-center gap-2 text-sm font-medium">
                                    <Plus className="w-4 h-4" /> Add Experience
                                </button>
                            </div>
                        )}

                        {activeSection === 'education' && (
                            <div className="space-y-6 animate-fade-in">
                                {cvData.education.map((edu) => (
                                    <div key={edu.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 relative group">
                                        <button onClick={() => removeEducation(edu.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="grid grid-cols-1 mb-4 gap-4">
                                            <input type="text" placeholder="School / University" value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} className="bg-transparent border-b border-slate-800 focus:border-emerald-500 outline-none text-slate-200 py-1" />
                                            <input type="text" placeholder="Degree / Certificate" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} className="bg-transparent border-b border-slate-800 focus:border-emerald-500 outline-none text-slate-200 py-1" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <input type="text" placeholder="Start Date" value={edu.startDate} onChange={e => updateEducation(edu.id, 'startDate', e.target.value)} className="bg-transparent border-b border-slate-800 focus:border-emerald-500 outline-none text-slate-200 py-1 text-sm" />
                                            <input type="text" placeholder="End Date" value={edu.endDate} onChange={e => updateEducation(edu.id, 'endDate', e.target.value)} className="bg-transparent border-b border-slate-800 focus:border-emerald-500 outline-none text-slate-200 py-1 text-sm" />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addEducation} className="w-full py-2 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center justify-center gap-2 text-sm font-medium">
                                    <Plus className="w-4 h-4" /> Add Education
                                </button>
                            </div>
                        )}

                        {activeSection === 'skills' && (
                            <div className="animate-fade-in">
                                <label className="block text-sm text-slate-500 mb-2">Comma separated skills</label>
                                <textarea
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-200 focus:border-emerald-500 outline-none h-40"
                                    value={cvData.skills.join(', ')}
                                    onChange={(e) => updateSkills(e.target.value)}
                                    placeholder="React, Node.js, Leadership, Communication..."
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex items-center justify-between">
                    <div>
                        <h3 className="text-slate-200 font-medium">Export Resume</h3>
                        <p className="text-slate-500 text-sm">Download as PDF</p>
                    </div>
                    <button
                        onClick={() => handlePrint && handlePrint()}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                </div>
            </div>

            {/* --- PREVIEW PANEL --- */}
            <div className="w-full lg:w-1/2 flex flex-col items-center">
                {/* Template Navigation */}
                <div className="flex items-center gap-4 mb-6 bg-slate-900 p-2 rounded-full border border-slate-800 shadow-xl z-10">
                    <button onClick={() => toggleTemplate('prev')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-slate-200 w-24 text-center select-none">
                        {templates[currentTemplateIndex].name}
                    </span>
                    <button onClick={() => toggleTemplate('next')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="bg-white rounded shadow-2xl min-h-[800px] text-slate-900 mx-auto transform origin-top lg:scale-[0.80] lg:translate-x-0" style={{ width: '210mm', minHeight: '297mm' }}>
                    {/* The Printable Area */}
                    <div ref={contentRef} id="cv-print-area" className="h-full">
                        {templates[currentTemplateIndex].render(cvData)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CVBuilder;
