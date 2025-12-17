
import React from 'react';
import { Course, ModuleData, Programme } from '../types';
import { ProgressBar } from './ProgressBar';
import { Layers, User, Calendar, CheckCircle, Clock, AlertCircle, Info, Monitor, FileVideo, Hash, Check, Edit2, Trash2, ArrowRight } from 'lucide-react';

interface VideoProgressProps {
  course: Course;
  program?: Programme;
}

const InteractiveTooltip: React.FC<{ content: React.ReactNode }> = ({ content }) => (
    <div className="group/tooltip relative inline-flex items-center ml-1.5">
        <Info size={14} className="text-gray-400 cursor-help hover:text-unikl-blue transition-colors" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs opacity-0 scale-90 translate-y-2 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 group-hover/tooltip:translate-y-0 transition-all duration-300 ease-out origin-bottom pointer-events-none z-[100]">
            <div className="bg-gray-800/95 backdrop-blur-sm text-white text-[10px] font-normal rounded-lg py-2.5 px-3.5 shadow-xl relative border border-gray-700 leading-tight">
                {content}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800/95"></div>
            </div>
        </div>
    </div>
);

const calculateDaysTaken = (start: string, end: string) => {
    if (!start || !end || start === '-' || end === '-') return '-';
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '-';
    
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays + 1; // Inclusive
};

export const VideoProgress: React.FC<VideoProgressProps> = ({ course, program }) => {
  const getCategoryStats = (category: ModuleData['category']) => {
      const relevantModules = course.modules.filter(m => m.category === category);
      const completed = relevantModules.filter(m => m.status === 'Done').length;
      const progress = relevantModules.length > 0 ? Math.round((completed / relevantModules.length) * 100) : 0;
      return { total: relevantModules.length, completed, progress };
  };

  const simStats = getCategoryStats('sim');
  const esimStats = getCategoryStats('esim');
  const introStats = getCategoryStats('intro_video');
  
  const categories = [
      { id: 'sim', label: 'SIM Integration Tasks', icon: Monitor, modules: course.modules.filter(m => m.category === 'sim') },
      { id: 'esim', label: 'E-Sim Development Tasks', icon: Layers, modules: course.modules.filter(m => m.category === 'esim') },
      { id: 'intro_video', label: 'Intro Video Production', icon: FileVideo, modules: course.modules.filter(m => m.category === 'intro_video') },
      { id: 'common', label: 'Other Tasks', icon: Hash, modules: course.modules.filter(m => m.category === 'common') }
  ].filter(cat => cat.modules.length > 0);

  // Calculate Aggregated Semester Progress (Average of SIM+ESIM+Intro for ALL courses in this semester)
  let semesterAverage = 0;
  let relevantCoursesCount = 0;

  if (program) {
      const relevantCourses = program.courses.filter(c => (c.semester || 1) === (course.semester || 1));
      relevantCoursesCount = relevantCourses.length;
      if (relevantCoursesCount > 0) {
          const totalProgress = relevantCourses.reduce((sum, c) => {
              const avg = (c.progress.sim + c.progress.esim + c.progress.introVideo) / 3;
              return sum + avg;
          }, 0);
          semesterAverage = Math.round(totalProgress / relevantCoursesCount);
      }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Header Card */}
      <div className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
           <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-red-500 dark:bg-red-600"></div>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                     <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        {course.code}
                        <span className="text-lg font-medium text-gray-500 dark:text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-3">
                            {course.name}
                        </span>
                     </h2>
                     <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-600">
                            <User size={14} className="text-unikl-blue dark:text-blue-400" />
                            <span className="font-semibold">{course.smeLead}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-800/50 text-red-700 dark:text-red-300">
                            <Layers size={14} />
                            <span className="font-bold">SEMESTER {course.semester || 1}</span>
                        </div>
                    </div>
                </div>
           </div>
      </div>

      {/* 2. Semester Context Banner (Specific Requirement) */}
      <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800 p-6 mb-8 flex flex-col md:flex-row items-center gap-6 shadow-inner">
           <div className="flex-1">
                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                    <Layers size={20}/> Semester {course.semester || 1} Performance Context
                </h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1 leading-relaxed">
                    You are viewing the DCMS data for a specific course in Semester {course.semester || 1}. 
                    The bar on the right represents the <span className="font-bold">average completion</span> (SIM + E-Sim + Intro) across 
                    all <span className="font-bold underline decoration-dotted">{relevantCoursesCount} courses</span> in this semester.
                </p>
           </div>
           <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-700/50">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                        Sem {course.semester || 1} Avg
                        <InteractiveTooltip content={`Calculated by averaging (SIM% + E-SIM% + Intro%) for all ${relevantCoursesCount} courses in Semester ${course.semester || 1}.`} />
                    </span>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-300">{semesterAverage}%</span>
                </div>
                 {/* Split Bar Style */}
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden flex">
                    <div className="h-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-1000" style={{ width: `${semesterAverage}%` }}></div>
                    <div className="h-full bg-indigo-200 dark:bg-indigo-800/50 flex-1"></div>
                </div>
           </div>
      </div>

      {/* 3. Detailed Course Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* SIM Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-lg">
                        <Monitor size={20} />
                    </div>
                    <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                        {simStats.completed}/{simStats.total} Tasks
                    </span>
                </div>
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">SIM Integration</h4>
                <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{simStats.progress}%</span>
                    <span className="text-xs text-gray-400 font-medium">Completed</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${simStats.progress}%` }}></div>
                </div>
            </div>

            {/* E-Sim Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg">
                        <Layers size={20} />
                    </div>
                    <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                        {esimStats.completed}/{esimStats.total} Tasks
                    </span>
                </div>
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">E-Sim Dev</h4>
                <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{esimStats.progress}%</span>
                    <span className="text-xs text-gray-400 font-medium">Completed</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${esimStats.progress}%` }}></div>
                </div>
            </div>

            {/* Intro Video Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 rounded-lg">
                        <FileVideo size={20} />
                    </div>
                    <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                        {introStats.completed}/{introStats.total} Tasks
                    </span>
                </div>
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Intro Video</h4>
                <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{introStats.progress}%</span>
                    <span className="text-xs text-gray-400 font-medium">Completed</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${introStats.progress}%` }}></div>
                </div>
            </div>
      </div>

      {/* 4. Task List Table - UPDATED: CSS Grid Layout (Card Style) */}
      <div className="space-y-4">
        {/* Header Row (Visible on Large Screens) */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider items-center border border-gray-200 dark:border-gray-700">
            <div className="col-span-1">No</div>
            <div className="col-span-3">Task</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-center">Timeline</div>
            <div className="col-span-1 text-center">Days</div>
            <div className="col-span-3">Remark</div>
        </div>

        {categories.map((cat) => (
            <React.Fragment key={cat.id}>
                {/* Category Separator */}
                <div className="flex items-center gap-2 px-2 py-3 mt-4 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <cat.icon size={14} className="text-unikl-blue dark:text-blue-400" />
                    {cat.label}
                </div>
                
                {cat.modules.map((module, idx) => {
                    const daysTaken = calculateDaysTaken(module.actual, module.finishDate);
                    const isDone = module.status === 'Done';
                    
                    // Visual Sequential Numbering: Resetting per category (index within current category list + 1)
                    const visualIndex = idx + 1;

                    return (
                        <div key={`${cat.id}-${idx}`} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group/row">
                            
                            {/* No */}
                            <div className="lg:col-span-1 flex lg:block items-center gap-2">
                                <span className="lg:hidden text-xs font-bold text-gray-400 uppercase w-20">No:</span>
                                <span className="text-sm font-mono text-gray-400">{visualIndex}</span>
                            </div>

                            {/* Task */}
                            <div className="lg:col-span-3 flex lg:block items-center gap-2">
                                <span className="lg:hidden text-xs font-bold text-gray-400 uppercase w-20">Task:</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{module.subject}</span>
                            </div>

                            {/* Status */}
                            <div className="lg:col-span-2 flex lg:justify-center items-center gap-2">
                                <span className="lg:hidden text-xs font-bold text-gray-400 uppercase w-20">Status:</span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${isDone ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'}`}>
                                    {isDone && <Check size={10} strokeWidth={4} />}
                                    {module.status}
                                </span>
                            </div>

                            {/* Timeline */}
                            <div className="lg:col-span-2 flex lg:justify-center items-center gap-2">
                                <span className="lg:hidden text-xs font-bold text-gray-400 uppercase w-20">Dates:</span>
                                <div className="flex items-center gap-2 text-xs font-mono bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded border border-gray-100 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-300">{module.actual || '-'}</span>
                                    <ArrowRight size={10} className="text-gray-300 dark:text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-300">{module.finishDate || '...'}</span>
                                </div>
                            </div>

                            {/* Days Taken */}
                            <div className="lg:col-span-1 flex lg:justify-center items-center gap-2">
                                <span className="lg:hidden text-xs font-bold text-gray-400 uppercase w-20">Duration:</span>
                                <span className={`inline-block font-mono text-xs font-bold px-2 py-0.5 rounded ${daysTaken !== '-' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : 'text-gray-300 dark:text-gray-600'}`}>
                                    {daysTaken !== '-' ? `${daysTaken}d` : '-'}
                                </span>
                            </div>

                            {/* Remark */}
                            <div className="lg:col-span-3 flex lg:block items-center gap-2">
                                <span className="lg:hidden text-xs font-bold text-gray-400 uppercase w-20 shrink-0">Remark:</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 italic truncate block">
                                    {module.remark || <span className="text-gray-300 dark:text-gray-600">-</span>}
                                </span>
                            </div>

                        </div>
                    );
                })}
            </React.Fragment>
        ))}

        {course.modules.length === 0 && (
             <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-400">
                <p>No tasks found for this course yet.</p>
             </div>
        )}
      </div>
    </div>
  );
};
