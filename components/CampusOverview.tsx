
import React from 'react';
import { Campus } from '../types';
import { Building2, ArrowRight, Info } from 'lucide-react';

interface CampusOverviewProps {
  campuses: Campus[];
  onNavigate: (campusId: string) => void;
}

export const CampusOverview: React.FC<CampusOverviewProps> = ({ campuses, onNavigate }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 pl-2 border-b border-gray-100 dark:border-gray-700 pb-4">
          <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              Campus Performance Overview
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
              Select a campus to view specific modes and programmes
          </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {campuses.map((campus, idx) => {
          const percentage = campus.totalCourses > 0 ? Math.round((campus.completedCourses / campus.totalCourses) * 100) : 0;
          return (
              <div 
                  key={campus.id}
                  className="group relative flex flex-col bg-gray-50 dark:bg-gray-700/20 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:bg-white dark:hover:bg-gray-750 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer"
                  onClick={() => onNavigate(campus.id)}
                  style={{ animationDelay: `${idx * 50}ms` }} // Staggered animation
              >
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-white dark:bg-gray-800 text-unikl-blue dark:text-blue-400 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform duration-300">
                          <Building2 size={24} />
                      </div>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider transition-colors duration-300 ${percentage === 100 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-700 dark:group-hover:bg-blue-900/50 dark:group-hover:text-blue-300'}`}>
                          {percentage}% Done
                      </span>
                  </div>
                  
                  <h4 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1 group-hover:text-unikl-blue dark:group-hover:text-blue-400 transition-colors duration-300">{campus.name}</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4 transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-300">{campus.totalCourses} Courses Tracked</p>
                  
                  {/* Split Progress Bar Style */}
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-4 overflow-hidden flex">
                      <div 
                          className="bg-blue-500 h-full transition-all duration-1000 ease-out group-hover:bg-unikl-orange" 
                          style={{ width: `${percentage}%` }}
                      />
                      <div className="flex-1 bg-blue-500/20 h-full transition-colors group-hover:bg-orange-500/20"></div>
                  </div>
                  
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-6 uppercase tracking-wider">
                      <span>{campus.completedCourses} Completed</span>
                      <span>{campus.totalCourses - campus.completedCourses} Remaining</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                      <span className="text-xs font-bold text-gray-400 group-hover:text-unikl-orange flex items-center gap-1 transition-colors duration-300 translate-x-0 group-hover:-translate-x-1">
                          View Dashboard <ArrowRight size={14} className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      </span>
                  </div>
              </div>
          );
      })}
      </div>
    </div>
  );
};
