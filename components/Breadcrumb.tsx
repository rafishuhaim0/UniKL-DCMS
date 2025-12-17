
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { AppState } from '../types';

interface BreadcrumbProps {
  state: AppState;
  campusName: string;
  onNavigate: (view: any, params?: any) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ state, campusName, onNavigate }) => {
  const isDashboard = state.currentView === 'university_dashboard';
  
  const steps = [
    { label: 'UniKL', view: 'university_dashboard', active: isDashboard, icon: <Home size={14}/> },
    
    !isDashboard && { 
        label: campusName, 
        view: 'mode_breakdown', 
        params: { selectedCampusId: state.selectedCampusId },
        active: state.currentView === 'mode_breakdown' 
    },
    
    (state.currentView === 'program_list' || state.currentView === 'course_list' || state.currentView === 'video_progress') && { 
        label: state.selectedMode ? state.selectedMode.toUpperCase() : 'Mode', 
        view: 'program_list',
        params: { selectedMode: state.selectedMode },
        active: state.currentView === 'program_list'
    },

    (state.currentView === 'course_list' || state.currentView === 'video_progress') && {
        label: state.selectedProgramName || 'Programme',
        view: 'course_list',
        params: { selectedProgramName: state.selectedProgramName },
        active: state.currentView === 'course_list'
    },

    state.currentView === 'video_progress' && {
        label: state.selectedCourseCode || 'Tracker',
        view: 'video_progress',
        params: { selectedCourseCode: state.selectedCourseCode },
        active: true
    }
  ].filter(Boolean) as { label: string; view: string; params?: any; active: boolean; icon?: React.ReactNode }[];

  return (
    <div className="mb-8">
        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
            {steps.map((step, idx) => (
                <React.Fragment key={idx}>
                    <button
                        onClick={() => onNavigate(step.view, step.params)}
                        disabled={step.active}
                        className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                            ${step.active 
                                ? 'bg-unikl-blue text-white shadow-md cursor-default border border-transparent' 
                                : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                            }
                        `}
                    >
                        {step.icon && step.icon}
                        {step.label}
                    </button>
                    
                    {idx < steps.length - 1 && (
                        <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
                    )}
                </React.Fragment>
            ))}
        </div>
    </div>
  );
};
