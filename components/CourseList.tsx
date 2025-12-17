
import React from 'react';
import { Programme, Course } from '../types';
import { ProgressBar } from './ProgressBar';
import { Layers, User, BookOpen, Info, ArrowRight, Video, Monitor, FileVideo } from 'lucide-react';

interface CourseListProps {
  program: Programme;
  onNavigate: (view: 'video_progress', params: { selectedCourseCode: string }) => void;
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

// Helper to calculate semester progress
const calculateSemesterProgress = (courses: Course[]) => {
    if (!courses.length) return { sim: 0, esim: 0, intro: 0, overall: 0 };
    
    let tSim = 0, tEsim = 0, tIntro = 0;
    courses.forEach(c => {
        tSim += c.progress.sim;
        tEsim += c.progress.esim;
        tIntro += c.progress.introVideo;
    });
    
    const count = courses.length;
    return {
        sim: Math.round(tSim / count),
        esim: Math.round(tEsim / count),
        intro: Math.round(tIntro / count),
        overall: Math.round((tSim + tEsim + tIntro) / (3 * count))
    };
};

export const CourseList: React.FC<CourseListProps> = ({ program, onNavigate }) => {
  // Group courses by semester
  const coursesBySemester = program.courses.reduce((acc, course) => {
      const sem = course.semester || 1;
      if (!acc[sem]) acc[sem] = [];
      acc[sem].push(course);
      return acc;
  }, {} as Record<number, Course[]>);

  const semesters = Object.keys(coursesBySemester).map(Number).sort((a, b) => a - b);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{program.name}</h2>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                    <User size={14} className="text-unikl-blue dark:text-blue-400" />
                    <span className="font-semibold">{program.coordinator}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                    <BookOpen size={14} className="text-unikl-blue dark:text-blue-400" />
                    <span>{program.courses.length} Courses Total</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                    <Layers size={14} className="text-unikl-blue dark:text-blue-400" />
                    <span>{program.campusSection}</span>
                </div>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {semesters.map(sem => {
            const courses = coursesBySemester[sem];
            const stats = calculateSemesterProgress(courses);
            
            return (
                <div key={sem} className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
                    {/* Decorative Side Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-indigo-500 dark:bg-indigo-600"></div>

                    <div className="p-6">
                        {/* Semester Header Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 pb-6 border-b border-gray-100 dark:border-gray-700/50">
                            {/* Title & Count (4/12) */}
                            <div className="lg:col-span-4 flex flex-col justify-center pl-2">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                    Semester {sem}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                    <Layers size={14}/> {courses.length} Subject{courses.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {/* Semester Stats Visualization (8/12) */}
                            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {/* SIM Stats */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <Monitor size={10} /> SIM Avg
                                            <InteractiveTooltip content={`Average SIM Integration progress for ${courses.length} courses in Semester ${sem}.`} />
                                        </span>
                                        <span className="text-xs font-black text-gray-800 dark:text-white">{stats.sim}%</span>
                                    </div>
                                    <ProgressBar percentage={stats.sim} size="sm" showPercentage={false} />
                                </div>
                                {/* E-Sim Stats */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <Layers size={10} /> E-Sim Avg
                                            <InteractiveTooltip content={`Average E-Sim progress for ${courses.length} courses in Semester ${sem}.`} />
                                        </span>
                                        <span className="text-xs font-black text-gray-800 dark:text-white">{stats.esim}%</span>
                                    </div>
                                    <ProgressBar percentage={stats.esim} size="sm" showPercentage={false} />
                                </div>
                                {/* Intro Stats */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <FileVideo size={10} /> Intro Avg
                                            <InteractiveTooltip content={`Average Intro Video progress for ${courses.length} courses in Semester ${sem}.`} />
                                        </span>
                                        <span className="text-xs font-black text-gray-800 dark:text-white">{stats.intro}%</span>
                                    </div>
                                    <ProgressBar percentage={stats.intro} size="sm" showPercentage={false} />
                                </div>
                            </div>
                        </div>

                        {/* Courses List - Custom Table-like Layout */}
                        <div className="space-y-3">
                            {/* Header Row for Large Screens */}
                            <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-900/30 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <div className="col-span-1">No</div>
                                <div className="col-span-2">Code</div>
                                <div className="col-span-3">Course Name</div>
                                <div className="col-span-2">SME Lead</div>
                                <div className="col-span-3 text-center">Progress Breakdown</div>
                                <div className="col-span-1 text-right">Action</div>
                            </div>

                            {/* Rows */}
                            {courses.map((course, idx) => {
                                return (
                                    <div key={course.code} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-750 hover:shadow-md transition-all duration-200 group/row">
                                        
                                        {/* No */}
                                        <div className="lg:col-span-1 flex lg:block items-center gap-2">
                                            <span className="lg:hidden text-xs font-bold text-gray-400 uppercase">No:</span>
                                            <span className="text-xs font-mono text-gray-400">{idx + 1}</span>
                                        </div>

                                        {/* Code */}
                                        <div className="lg:col-span-2 flex lg:block items-center gap-2">
                                             <span className="lg:hidden text-xs font-bold text-gray-400 uppercase w-20">Code:</span>
                                            <span className="text-sm font-black text-gray-900 dark:text-white">{course.code}</span>
                                        </div>

                                        {/* Name */}
                                        <div className="lg:col-span-3 flex lg:block items-center gap-2">
                                            <span className="lg:hidden text-xs font-bold text-gray-400 uppercase w-20">Name:</span>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">{course.name}</span>
                                        </div>

                                        {/* SME */}
                                        <div className="lg:col-span-2 flex lg:block items-center gap-2">
                                            <span className="lg:hidden text-xs font-bold text-gray-400 uppercase w-20">SME:</span>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                <User size={12} className="shrink-0" />
                                                {course.smeLead}
                                            </span>
                                        </div>

                                        {/* Progress Breakdown (Replaces Columns) */}
                                        <div className="lg:col-span-3 flex flex-col gap-2">
                                            {/* Mobile Label */}
                                            <span className="lg:hidden text-xs font-bold text-gray-400 uppercase mb-1">Progress:</span>
                                            
                                            {/* Stacked Compact Bars */}
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="flex flex-col gap-0.5" title={`SIM Integration: ${course.progress.sim}%`}>
                                                    <div className="flex justify-between text-[8px] text-gray-400 font-bold uppercase"><span>SIM</span><span>{course.progress.sim}%</span></div>
                                                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-purple-500 rounded-full" style={{width: `${course.progress.sim}%`}}></div>
                                                    </div>
                                                </div>
                                                 <div className="flex flex-col gap-0.5" title={`E-SIM: ${course.progress.esim}%`}>
                                                    <div className="flex justify-between text-[8px] text-gray-400 font-bold uppercase"><span>E-SIM</span><span>{course.progress.esim}%</span></div>
                                                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 rounded-full" style={{width: `${course.progress.esim}%`}}></div>
                                                    </div>
                                                </div>
                                                 <div className="flex flex-col gap-0.5" title={`Intro Video: ${course.progress.introVideo}%`}>
                                                    <div className="flex justify-between text-[8px] text-gray-400 font-bold uppercase"><span>Intro</span><span>{course.progress.introVideo}%</span></div>
                                                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-amber-500 rounded-full" style={{width: `${course.progress.introVideo}%`}}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <div className="lg:col-span-1 flex justify-end mt-2 lg:mt-0">
                                            <button 
                                                onClick={() => onNavigate('video_progress', { selectedCourseCode: course.code })}
                                                className="w-full lg:w-auto p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-unikl-orange hover:text-white hover:border-unikl-orange dark:hover:bg-orange-500 dark:hover:border-orange-500 transition-all shadow-sm group/btn flex items-center justify-center gap-2"
                                                title="View Details"
                                            >
                                                <span className="lg:hidden text-xs font-bold">View DCMS</span>
                                                <ArrowRight size={16} className="text-gray-400 dark:text-gray-300 group-hover:text-white transition-colors" />
                                            </button>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        })}

        {program.courses.length === 0 && (
             <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-400">
                <p>No courses found for this programme.</p>
             </div>
        )}
      </div>
    </div>
  );
};
