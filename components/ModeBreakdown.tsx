
import React from 'react';
import { Campus, ModeData } from '../types';
import { ProgressBar } from './ProgressBar';
import { BookOpen, GraduationCap, ArrowRight, Info } from 'lucide-react';

interface ModeBreakdownProps {
  campus: Campus;
  onNavigate: (view: 'program_list', params: { selectedMode: string }) => void;
}

const MODE_STYLES: Record<string, { bg: string, text: string, border: string, icon: string }> = {
    odl: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800', icon: 'ODL' },
    mc: { bg: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800', icon: 'MC' },
    mooc: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800', icon: 'MOOC' },
    bridging: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', icon: 'Bridging' },
    huffaz: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', icon: 'Huffaz' },
    other: { bg: 'bg-slate-50 dark:bg-slate-900/20', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-800', icon: 'Other' }
};

// Custom Interactive Tooltip Component
const InteractiveTooltip: React.FC<{ content: string }> = ({ content }) => (
    <div className="group/tooltip relative inline-flex items-center ml-1.5">
        <Info size={14} className="text-gray-400 cursor-help hover:text-unikl-blue transition-colors" />
        {/* Tooltip Container - Uses group-hover/tooltip to specific trigger */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 opacity-0 scale-90 translate-y-2 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 group-hover/tooltip:translate-y-0 transition-all duration-300 ease-out origin-bottom pointer-events-none z-[100]">
            <div className="bg-gray-800/95 backdrop-blur-sm text-white text-[10px] font-normal rounded-lg py-2 px-3 shadow-xl text-center relative border border-gray-700 leading-tight">
                {content}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800/95"></div>
            </div>
        </div>
    </div>
);

export const ModeBreakdown: React.FC<ModeBreakdownProps> = ({ campus, onNavigate }) => {
  
  // 1. Calculate Max Values for Relative Bars (Normalization)
  const modesArray = Object.values(campus.modes) as ModeData[];
  const maxProgrammes = Math.max(...modesArray.map(m => m.programmes?.length || 0)) || 1; 
  const maxCourses = Math.max(...modesArray.map(m => m.count || 0)) || 1;

  return (
    // Fixed height container calculated to fill space between header/breadcrumb and footer
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-16rem)] flex flex-col">
      
      {/* Sticky Header Section */}
      <div className="flex-none mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 bg-[#f7f9fb] dark:bg-gray-950 z-10">
        <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Digital Courses by Mode</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                Performance breakdown for <span className="font-bold text-unikl-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{campus.name}</span>
            </p>
        </div>
      </div>

      {/* Scrollable Grid Section */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-3 pb-4 space-y-6">
        {Object.entries(campus.modes).map(([modeKey, val]) => {
            const modeData = val as ModeData;
            // Filter out empty modes
            if (modeData.count === 0 && !modeData.programmes?.length) return null;

            // Stats Calculations
            const progCount = modeData.programmes?.length || 0;
            const courseCount = modeData.count;
            const completedCount = modeData.completed;
            const progressPct = courseCount > 0 ? Math.round((completedCount / courseCount) * 100) : 0;
            
            // Relative Percentages for Visual Bars
            const relativeProgPct = Math.round((progCount / maxProgrammes) * 100);
            const relativeCoursePct = Math.round((courseCount / maxCourses) * 100);

            // Ratio for inner bar split (Courses)
            const courseCompletedRatio = courseCount > 0 ? (completedCount / courseCount) * 100 : 0;

            const hasDetails = progCount > 0;
            const style = MODE_STYLES[modeKey.toLowerCase()] || MODE_STYLES.other;

            return (
                <div key={modeKey} className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:z-10 shrink-0">
                    {/* Decorative side bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${style.bg.replace('50', '500').replace('/20', '')}`}></div>
                    
                    <div className="p-6">
                        {/* Responsive Grid Layout - 12 Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-8 gap-x-6 items-center">
                            
                            {/* COL 1: Mode Identity (3/12) */}
                            <div className="lg:col-span-3 flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xs font-black uppercase tracking-tighter shadow-inner flex-shrink-0 ${style.bg} ${style.text} border ${style.border}`}>
                                    {style.icon.substring(0, 3)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                                        {modeKey}
                                    </h3>
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Programme Mode</span>
                                </div>
                            </div>

                            {/* COL 2: Total Programmes (2/12) */}
                            <div className="lg:col-span-2 flex flex-col justify-center border-l-0 md:border-l lg:border-l-0 border-gray-100 dark:border-gray-700 md:pl-6 lg:pl-0">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                                        <GraduationCap size={12} className="mr-1.5"/> Programmes
                                        <InteractiveTooltip content="Total number of academic programmes registered under this mode." />
                                    </span>
                                    <span className="text-sm font-black text-gray-800 dark:text-white">{progCount}</span>
                                </div>
                                {/* Visual Relative Bar - Solid Blue (No completion data for progs usually) */}
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-400 dark:bg-blue-500 rounded-full transition-all duration-1000 ease-out" 
                                        style={{ width: `${relativeProgPct || 5}%` }} 
                                    ></div>
                                </div>
                            </div>

                            {/* COL 3: Total Courses (2/12) */}
                            <div className="lg:col-span-2 flex flex-col justify-center border-l-0 lg:border-l border-gray-100 dark:border-gray-700 lg:pl-6">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                                        <BookOpen size={12} className="mr-1.5"/> Courses
                                        <InteractiveTooltip content="Total individual subjects/courses tracked in this mode." />
                                    </span>
                                    <span className="text-sm font-black text-gray-800 dark:text-white">{courseCount}</span>
                                </div>
                                {/* Visual Relative Bar - Split into Completed vs Remaining */}
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className="h-full flex rounded-full overflow-hidden transition-all duration-1000 ease-out" 
                                        style={{ width: `${relativeCoursePct || 5}%` }}
                                    >
                                        {/* Completed Portion - Solid */}
                                        <div 
                                            className="h-full bg-indigo-400 dark:bg-indigo-500 transition-all duration-500" 
                                            style={{ width: `${courseCompletedRatio}%` }}
                                        ></div>
                                        {/* Remaining Portion - Lower Opacity */}
                                        <div 
                                            className="h-full bg-indigo-400 dark:bg-indigo-500 opacity-30" 
                                            style={{ flex: 1 }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* COL 4: Completion Progress (3/12) */}
                            <div className="lg:col-span-3 flex flex-col justify-center border-l-0 lg:border-l border-gray-100 dark:border-gray-700 lg:pl-6">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completion Progress</span>
                                    <span className={`text-sm font-bold ${progressPct === 100 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>{progressPct}%</span>
                                </div>
                                <ProgressBar percentage={progressPct} size="md" showPercentage={false} />
                                <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-1.5">
                                    <span className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${progressPct === 100 ? 'bg-green-500' : 'bg-amber-500'}`}></div> 
                                        {completedCount} Completed
                                    </span>
                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                    <span>{courseCount - completedCount} Remaining</span>
                                </div>
                            </div>

                            {/* COL 5: Action Button (2/12) */}
                            <div className="lg:col-span-2 flex justify-end items-center">
                                 {hasDetails ? (
                                    <button 
                                        onClick={() => onNavigate('program_list', { selectedMode: modeKey })}
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700/50 border-2 border-unikl-orange text-unikl-orange dark:text-orange-400 text-xs font-bold rounded-xl hover:bg-unikl-orange hover:text-white dark:hover:bg-orange-500 dark:hover:text-white hover:border-unikl-orange transition-all shadow-sm hover:shadow-md group/btn uppercase tracking-wide"
                                    >
                                        View Details <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <button disabled className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 text-xs font-bold rounded-xl cursor-not-allowed border border-gray-100 dark:border-gray-700 uppercase tracking-wide">
                                        Empty
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            );
        })}
        
        {Object.keys(campus.modes).every(k => (campus.modes[k] as ModeData).count === 0) && (
             <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-400">
                <p>No digital course data found for this campus.</p>
             </div>
        )}
      </div>
    </div>
  );
};
