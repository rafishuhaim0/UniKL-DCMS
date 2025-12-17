
import React from 'react';
import { Campus, Programme } from '../types';
import { ProgressBar } from './ProgressBar';
import { Eye, User, Building2, Info, ArrowRight, Layers } from 'lucide-react';

interface ProgramListProps {
  campus: Campus;
  mode: string;
  onNavigate: (view: 'course_list', params: { selectedProgramName: string }) => void;
}

// Custom Interactive Tooltip Component (Matching ModeBreakdown style)
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

export const ProgramList: React.FC<ProgramListProps> = ({ campus, mode, onNavigate }) => {
  const modeData = campus.modes[mode];
  const programmes = modeData?.programmes || [];

  // 1. Calculate Max Values for Relative Bars (Normalization across the list)
  const maxCourses = Math.max(...programmes.map(p => p.totalSubjectsCount !== undefined ? p.totalSubjectsCount : p.courses.length)) || 1;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Programmes in {mode.toUpperCase()} Mode</h2>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                Campus: <span className="font-bold text-unikl-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{campus.name}</span>
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {programmes.map((program, idx) => {
            // Data & Stat Calculations
            const courseCount = program.totalSubjectsCount !== undefined ? program.totalSubjectsCount : program.courses.length;
            
            // Calculate Completed Courses based on avg progress >= 100
            const completedCoursesCount = program.courses.reduce((acc, c) => {
                const avg = (c.progress.sim + c.progress.introVideo + c.progress.esim) / 3;
                return avg >= 99 ? acc + 1 : acc;
            }, 0);

            // Overall Progress (Average of all courses)
            let avgProgress = 0;
            if (program.courses.length > 0) {
                 const totalSum = program.courses.reduce((acc, course) => {
                      const courseAvg = (course.progress.sim + course.progress.introVideo + course.progress.esim) / 3;
                      return acc + courseAvg;
                  }, 0);
                  avgProgress = Math.round(totalSum / program.courses.length);
            }

            // Semester E-Sim Averages
            const coursesS1 = program.courses.filter(c => c.semester === 1);
            const coursesS2 = program.courses.filter(c => c.semester === 2);
            const coursesS3 = program.courses.filter(c => c.semester === 3);

            const calcAvgEsim = (courses: typeof program.courses) => {
                  if (courses.length === 0) return 0;
                  const sum = courses.reduce((acc, c) => acc + (c.progress.esim || 0), 0);
                  return Math.round(sum / courses.length);
            };

            const avgEsimS1 = calcAvgEsim(coursesS1);
            const avgEsimS2 = calcAvgEsim(coursesS2);
            const avgEsimS3 = calcAvgEsim(coursesS3);

            // Relative Bar Calculations
            const relativeCoursePct = Math.round((courseCount / maxCourses) * 100);
            const courseCompletedRatio = courseCount > 0 ? (completedCoursesCount / courseCount) * 100 : 0;

            return (
                <div key={idx} className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:z-10">
                    {/* Decorative side bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-blue-500 dark:bg-blue-600"></div>

                    <div className="p-6">
                        {/* Responsive Grid Layout - 12 Columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 gap-x-6 items-center">
                            
                            {/* COL 1: Programme Details (4/12) */}
                            <div className="lg:col-span-4 pr-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 leading-snug" title={program.name}>
                                    {program.name}
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg border border-gray-100 dark:border-gray-700 w-fit">
                                        <User size={14} className="text-blue-500 dark:text-blue-400 shrink-0"/>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{program.coordinator}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400 px-2">
                                        <Building2 size={14} className="text-gray-400 shrink-0"/>
                                        <span className="truncate">{program.campusSection}</span>
                                    </div>
                                </div>
                            </div>

                            {/* COL 2: E-Sim Readiness Breakdown (4/12) */}
                            <div className="lg:col-span-4 border-l-0 lg:border-l border-gray-100 dark:border-gray-700 lg:pl-6">
                                <div className="flex items-center mb-3">
                                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                                        <Layers size={12} className="mr-1.5"/> E-Sim Readiness
                                        <InteractiveTooltip content="Average E-Sim progress broken down by semester." />
                                    </span>
                                </div>
                                <div className="space-y-2.5">
                                    {/* S1 */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 w-4">S1</span>
                                        <div className="flex-1">
                                            <ProgressBar percentage={avgEsimS1} size="sm" showPercentage={false} />
                                        </div>
                                        <span className="text-[10px] font-bold w-6 text-right text-gray-700 dark:text-gray-300">{avgEsimS1}%</span>
                                    </div>
                                    {/* S2 */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 w-4">S2</span>
                                        <div className="flex-1">
                                            <ProgressBar percentage={avgEsimS2} size="sm" showPercentage={false} />
                                        </div>
                                        <span className="text-[10px] font-bold w-6 text-right text-gray-700 dark:text-gray-300">{avgEsimS2}%</span>
                                    </div>
                                    {/* S3 */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 w-4">S3</span>
                                        <div className="flex-1">
                                            <ProgressBar percentage={avgEsimS3} size="sm" showPercentage={false} />
                                        </div>
                                        <span className="text-[10px] font-bold w-6 text-right text-gray-700 dark:text-gray-300">{avgEsimS3}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* COL 3: Overall Stats & Completion (2/12) */}
                            <div className="lg:col-span-2 border-l-0 lg:border-l border-gray-100 dark:border-gray-700 lg:pl-6 flex flex-col justify-center gap-5">
                                
                                {/* Total Courses - Split Visual Bar */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                                            Courses <InteractiveTooltip content="Total number of courses in this programme." />
                                        </span>
                                        <span className="text-xs font-black text-gray-800 dark:text-white">{courseCount}</span>
                                    </div>
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

                                {/* Completion */}
                                <div>
                                     <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                                            Progress <InteractiveTooltip content="Overall completion percentage across all courses." />
                                        </span>
                                        <span className={`text-xs font-black ${avgProgress === 100 ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-white'}`}>{avgProgress}%</span>
                                    </div>
                                     <ProgressBar percentage={avgProgress} size="sm" showPercentage={false} />
                                </div>

                            </div>

                            {/* COL 4: Action Button (2/12) */}
                            <div className="lg:col-span-2 flex justify-end">
                                <button 
                                    onClick={() => onNavigate('course_list', { selectedProgramName: program.name })}
                                    className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700/50 border-2 border-unikl-orange text-unikl-orange dark:text-orange-400 text-xs font-bold rounded-xl hover:bg-unikl-orange hover:text-white dark:hover:bg-orange-500 dark:hover:text-white hover:border-unikl-orange transition-all shadow-sm hover:shadow-md group/btn uppercase tracking-wide"
                                >
                                    View Courses <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            );
        })}
        {programmes.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-400">
            <p>No programmes found for this mode.</p>
            </div>
        )}
      </div>
    </div>
  );
};
