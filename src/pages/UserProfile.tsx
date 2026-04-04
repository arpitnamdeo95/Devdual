import React from 'react';
import { AppNavbar, AppSidebar } from '../components/AppLayout';

export default function UserProfile() {
    const [isExporting, setIsExporting] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            alert("Data exported successfully!");
        }, 1500);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setTimeout(() => {
            setIsEditing(false);
            alert("Profile preferences saved!");
        }, 1000);
    };

    return (
        <div className="h-screen flex flex-col bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
            <AppNavbar />
            <div className="flex flex-1 flex-row pt-16 w-full h-full overflow-hidden">
                <AppSidebar />
                <main className="flex-1 bg-surface-container-lowest p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <header className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tighter text-on-surface uppercase">OPERATOR PROFILE</h1>
                                <p className="text-on-surface-variant font-mono text-sm mt-1">/ SYSTEM_ID: B-742</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleExport} disabled={isExporting} className="bg-surface-container hover:bg-surface-container-high transition-colors px-4 py-2 flex items-center gap-2 border border-outline-variant/30 text-on-surface disabled:opacity-50">
                                    <span className="material-symbols-outlined text-sm text-secondary">{isExporting ? 'hourglass_empty' : 'share'}</span>
                                    <span className="font-mono text-xs font-bold tracking-widest uppercase">{isExporting ? 'EXPORTING...' : 'EXPORT_DATA'}</span>
                                </button>
                                <button onClick={handleEdit} disabled={isEditing} className="bg-primary hover:bg-primary-container transition-colors px-6 py-2 flex items-center gap-2 text-on-primary shadow-[0_0_15px_rgba(199,153,255,0.2)] disabled:opacity-50">
                                    <span className="material-symbols-outlined text-sm">{isEditing ? 'sync' : 'settings'}</span>
                                    <span className="font-mono text-xs font-bold tracking-widest uppercase">{isEditing ? 'SAVING...' : 'EDIT_PROFILE'}</span>
                                </button>
                            </div>
                        </header>

                        {/* Top Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-surface-container border border-outline-variant/10 p-6 flex flex-col justify-between">
                                <div className="text-on-surface-variant font-mono text-xs uppercase tracking-widest mb-4">Current Rating</div>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-headline font-black text-secondary">2,842</span>
                                    <span className="text-secondary text-sm font-bold mb-1">+142 pts</span>
                                </div>
                            </div>
                            <div className="bg-surface-container border border-outline-variant/10 p-6 flex flex-col justify-between">
                                <div className="text-on-surface-variant font-mono text-xs uppercase tracking-widest mb-4">Win Rate</div>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-headline font-black text-on-surface">68.4%</span>
                                </div>
                            </div>
                            <div className="bg-surface-container border border-outline-variant/10 p-6 flex flex-col justify-between md:col-span-2 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>
                                <div className="text-primary font-mono text-xs uppercase tracking-widest mb-4 relative z-10">Global Rank</div>
                                <div className="flex items-end gap-4 relative z-10">
                                    <span className="text-4xl font-headline font-black text-primary">#1,042</span>
                                    <span className="text-on-surface-variant text-sm mb-1">Top 2.1% Worldwide</span>
                                </div>
                                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-primary/5 group-hover:text-primary/10 transition-colors">public</span>
                            </div>
                        </div>

                        {/* Secondary Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Skill Distribution */}
                            <div className="col-span-1 bg-surface-container border border-outline-variant/10 p-6">
                                <h3 className="font-mono text-xs text-on-surface-variant tracking-widest uppercase mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span> Skill_Distribution
                                </h3>
                                <div className="space-y-5">
                                    {[{label: 'Data Structures', pct: 94}, {label: 'Algorithms', pct: 82}, {label: 'System Design', pct: 65}, {label: 'Concurrency', pct: 48}].map(skill => (
                                        <div key={skill.label}>
                                            <div className="flex justify-between items-center mb-1 font-mono text-xs">
                                                <span className="text-on-surface">{skill.label}</span>
                                                <span className="text-secondary">{skill.pct}%</span>
                                            </div>
                                            <div className="h-1 bg-surface-container-highest overflow-hidden">
                                                <div className="h-full bg-secondary" style={{ width: skill.pct + '%' }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Preferred Stack */}
                            <div className="col-span-2 bg-surface-container border border-outline-variant/10 p-6">
                                <h3 className="font-mono text-xs text-on-surface-variant tracking-widest uppercase mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Preferred_Stack
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-surface-container-lowest border border-outline-variant/20 p-4 flex flex-col items-center justify-center gap-3">
                                        <div className="w-10 h-10 rounded bg-[#e3592a]/10 flex items-center justify-center border border-[#e3592a]/20">
                                            <span className="font-headline font-bold text-[#e3592a]">Rs</span>
                                        </div>
                                        <span className="font-mono text-xs text-on-surface">Rust</span>
                                    </div>
                                    <div className="bg-surface-container-lowest border border-outline-variant/20 p-4 flex flex-col items-center justify-center gap-3">
                                        <div className="w-10 h-10 rounded bg-[#3178c6]/10 flex items-center justify-center border border-[#3178c6]/20">
                                            <span className="font-headline font-bold text-[#3178c6]">Ts</span>
                                        </div>
                                        <span className="font-mono text-xs text-on-surface">TypeScript</span>
                                    </div>
                                    <div className="bg-surface-container-lowest border border-outline-variant/20 p-4 flex flex-col items-center justify-center gap-3">
                                        <div className="w-10 h-10 rounded bg-[#3776ab]/10 flex items-center justify-center border border-[#3776ab]/20">
                                            <span className="font-headline font-bold text-[#3776ab]">Py</span>
                                        </div>
                                        <span className="font-mono text-xs text-on-surface">Python</span>
                                    </div>
                                    <div className="bg-surface-container-lowest border border-outline-variant/20 p-4 flex flex-col items-center justify-center gap-3">
                                        <div className="w-10 h-10 rounded bg-[#00add8]/10 flex items-center justify-center border border-[#00add8]/20">
                                            <span className="font-headline font-bold text-[#00add8]">Go</span>
                                        </div>
                                        <span className="font-mono text-xs text-on-surface">Go</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
