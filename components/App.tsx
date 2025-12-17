
import React, { useState, useEffect, useRef } from 'react';
import { APP_DATA as INITIAL_APP_DATA, UNIVERSITY_STATS, INITIAL_ACTIVITIES, INITIAL_USERS } from './constants';
import { AppState, ViewState, Campus, ActivityItem, User } from './types';
import { Breadcrumb } from './components/Breadcrumb';
import { ProgressBar } from './components/ProgressBar';
import { CampusOverview } from './components/CampusOverview';
import { ModeBreakdown } from './components/ModeBreakdown';
import { ProgramList } from './components/ProgramList';
import { CourseList } from './components/CourseList';
import { VideoProgress } from './components/VideoProgress';
import { UniversityDashboard } from './components/UniversityDashboard';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { ActivityBoard } from './components/ActivityBoard';
import { Settings, ChevronLeft, Moon, Sun, Lock, LogOut, AlertTriangle, Megaphone, X, AlertCircle, Home } from 'lucide-react';
import { Sidebar } from './components/Sidebar'; // Ensure Sidebar is imported
import { ToastContainer, ToastMessage } from './components/Toast'; // Ensure Toast is imported

const App: React.FC = () => {
  const [appData, setAppData] = useState<Campus[]>(INITIAL_APP_DATA);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  
  // Lift User State
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);
  const pendingDiscardAction = useRef<(() => void) | null>(null);
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);
  const [showPostConfirmation, setShowPostConfirmation] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');

  // Loading State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [state, setState] = useState<AppState>({
    currentView: 'university_dashboard', 
    selectedCampusId: null, 
    selectedMode: null,      
    selectedProgramName: null,
    selectedCourseCode: null,
    isLoggedIn: false,
    currentUser: undefined,
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Toast Helper
  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto remove
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogActivity = (message: string, type: ActivityItem['type'] = 'update', targetView?: ViewState, targetParams?: Record<string, any>) => {
      let author = 'System';
      
      if (state.currentUser) {
          author = state.currentUser.username;
          if (state.currentUser.assignedCampusId) {
             const c = appData.find(c => c.id === state.currentUser?.assignedCampusId);
             const cName = c ? c.name.replace('UniKL ', '') : state.currentUser.assignedCampusId.toUpperCase();
             author = `${author} (${cName})`;
          } else if (state.currentUser.role === 'super_admin') {
             author = `${author} (HQ)`;
          }
      }

      const newActivity: ActivityItem = {
          id: Date.now().toString(),
          type,
          message,
          timestamp: new Date().toISOString(),
          author: author,
          targetView,
          targetParams
      };
      setActivities(prev => [newActivity, ...prev]);

      const toastType = type === 'delete' ? 'error' : (type === 'create' || type === 'update' ? 'success' : 'announcement');
      addToast(message, toastType);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    addToast('Activity log removed', 'info');
  };

  const handleUpdateActivity = (id: string, message: string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, message } : a));
    addToast('Activity log updated', 'success');
  };

  const handlePostAnnouncementClick = () => {
    setAnnouncementText('');
    setShowPostConfirmation(false);
    setIsPostingAnnouncement(true);
  };

  const handlePostConfirmationClick = () => {
      if (!announcementText.trim()) return;
      setShowPostConfirmation(true);
  };

  const submitAnnouncement = () => {
      handleLogActivity(announcementText, 'announcement');
      setShowPostConfirmation(false);
      setIsPostingAnnouncement(false);
      setAnnouncementText('');
  };

  const handleNavigate = (view: ViewState, params: any = {}) => {
    setState(prev => ({
      ...prev,
      currentView: view,
      ...params,
      ...(view === 'university_dashboard' ? { selectedCampusId: null, selectedMode: null, selectedProgramName: null, selectedCourseCode: null } : {}),
      ...(view === 'campus_overview' ? { selectedMode: null, selectedProgramName: null, selectedCourseCode: null } : {}),
      ...(view === 'mode_breakdown' ? { selectedProgramName: null, selectedCourseCode: null } : {}),
      ...(view === 'program_list' ? { selectedCourseCode: null } : {}),
    }));
  };

  const handleCampusSelect = (campusId: string) => {
    handleNavigate('mode_breakdown', { selectedCampusId: campusId });
  };

  const handleLogin = (user: User) => {
    setIsLoading(true);
    setLoadingText('Accessing Secure Dashboard...');
    
    setTimeout(() => {
        setState(prev => ({ 
            ...prev, 
            isLoggedIn: true, 
            currentView: 'admin_panel',
            currentUser: user 
        }));
        addToast(`Welcome back, ${user.username}!`, 'success');
        setIsLoading(false);
    }, 1500);
  };

  const handleLogoutRequest = () => {
    setShowLogoutConfirmation(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirmation(false);
    setIsLoading(true);
    setLoadingText('Securely Signing Out...');

    setTimeout(() => {
        setState(prev => ({ ...prev, isLoggedIn: false, currentView: 'university_dashboard', currentUser: undefined }));
        addToast('Logged out successfully', 'info');
        setIsLoading(false);
    }, 1500);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirmation(false);
  };

  const handleRequestDiscard = (action: () => void) => {
      pendingDiscardAction.current = action;
      setShowDiscardConfirmation(true);
  };

  const handleDiscardConfirm = () => {
      if (pendingDiscardAction.current) {
          pendingDiscardAction.current();
      }
      setShowDiscardConfirmation(false);
      pendingDiscardAction.current = null;
  };

  const handleDiscardCancel = () => {
      setShowDiscardConfirmation(false);
      pendingDiscardAction.current = null;
  };

  const currentCampus = state.selectedCampusId 
    ? appData.find(c => c.id === state.selectedCampusId) 
    : null;
  
  const getCurrentData = () => {
    if (!currentCampus) return { modeData: null, program: null, course: null };
    const modeData = state.selectedMode ? currentCampus.modes[state.selectedMode] : null;
    const program = modeData?.programmes?.find(p => p.name === state.selectedProgramName);
    const course = program?.courses.find(c => c.code === state.selectedCourseCode);
    return { modeData, program, course };
  };

  const { program, course } = getCurrentData();

  const globalProgress = currentCampus 
    ? Math.round((currentCampus.completedCourses / currentCampus.totalCourses) * 100)
    : Math.round((UNIVERSITY_STATS.completedCourses / UNIVERSITY_STATS.totalCourses) * 100);

  const handleBack = () => {
      if (state.currentView === 'video_progress') handleNavigate('course_list', { selectedProgramName: state.selectedProgramName });
      else if (state.currentView === 'course_list') handleNavigate('program_list', { selectedMode: state.selectedMode });
      else if (state.currentView === 'program_list') handleNavigate('mode_breakdown', { selectedCampusId: state.selectedCampusId });
      else if (state.currentView === 'mode_breakdown') handleNavigate('campus_overview');
      else if (state.currentView === 'campus_overview') handleNavigate('university_dashboard');
      else handleNavigate('university_dashboard');
  };

  return (
    <div className="flex min-h-screen bg-[#f7f9fb] dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 relative">
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {isLoading && (
        <div className="fixed inset-0 z-[200] bg-white/90 dark:bg-gray-950/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Loading Spinner */}
            <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 border-4 border-gray-200 dark:border-gray-800 rounded-full"></div>
                <div className="w-24 h-24 border-4 border-t-unikl-orange border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute inset-0"></div>
            </div>
            <h2 className="mt-8 text-xl font-black text-gray-800 dark:text-white tracking-tight animate-pulse">{loadingText}</h2>
        </div>
      )}

      <Sidebar 
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isLoggedIn={state.isLoggedIn}
        currentUser={state.currentUser}
        currentView={state.currentView}
        onNavigate={handleNavigate}
        onLogin={() => handleNavigate('login')}
        onLogout={handleLogoutRequest}
        onAdmin={() => handleNavigate('admin_panel')}
        activities={activities}
        onDeleteActivity={handleDeleteActivity}
        onUpdateActivity={handleUpdateActivity}
        campuses={appData}
        selectedCampusId={state.selectedCampusId}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        
        {/* Modals and Overlays (Same as before) */}
        {showLogoutConfirmation && (
            <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                {/* ... Logout Modal Content ... */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                     <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800/50 flex items-center gap-3">
                         <div className="p-2 bg-red-100 dark:bg-red-800 rounded-full text-red-600 dark:text-red-200"><LogOut size={20} /></div>
                         <h3 className="font-bold text-lg text-gray-900 dark:text-white">Confirm Logout</h3>
                     </div>
                     <div className="p-6"><p className="text-gray-600 dark:text-gray-300 text-sm">Are you sure you want to end your session?</p></div>
                     <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                         <button onClick={handleLogoutCancel} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium text-sm transition-colors">Cancel</button>
                         <button onClick={handleLogoutConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors">Yes, Logout</button>
                     </div>
                </div>
            </div>
        )}

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto min-h-full flex flex-col">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white border-l-4 border-unikl-blue dark:border-blue-500 pl-4">
                        {state.currentView === 'university_dashboard' 
                            ? 'UniKL DCMS - Digital Course Management System' 
                            : (state.currentView === 'campus_overview' 
                                ? 'All Campuses Overview' 
                                : (currentCampus ? currentCampus.name : 'Dashboard'))}
                    </h1>
                    
                    {state.isLoggedIn && state.currentView !== 'login' && (
                        <button onClick={handlePostAnnouncementClick} className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors font-medium text-sm whitespace-nowrap border border-orange-200 dark:border-orange-800">
                            <Megaphone size={16} /> <span>Post Announcement</span>
                        </button>
                    )}
                </div>

                {/* Navigation/Breadcrumbs */}
                {state.currentView !== 'university_dashboard' && state.currentView !== 'login' && (
                    <div className="mb-6 flex flex-col gap-4">
                        <div className="flex gap-2">
                            <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2 bg-unikl-blue text-white rounded-lg font-bold shadow-md hover:bg-blue-900 transition-all text-sm">
                                <ChevronLeft size={16} /> Back
                            </button>
                            <button onClick={() => handleNavigate('university_dashboard')} className="flex items-center gap-2 px-4 py-2 bg-unikl-orange text-white rounded-lg font-bold shadow-md hover:bg-orange-600 transition-all text-sm">
                                <Home size={16} /> Home
                            </button>
                        </div>
                        <Breadcrumb state={state} campusName={currentCampus ? currentCampus.name : 'All Campuses'} onNavigate={handleNavigate} />
                    </div>
                )}

                {/* View Content */}
                <div className="transition-all duration-300 ease-in-out flex-1">
                    {state.currentView === 'university_dashboard' && <UniversityDashboard data={appData} onNavigateToCampus={handleCampusSelect} />}
                    {state.currentView === 'campus_overview' && <CampusOverview campuses={appData} onNavigate={handleCampusSelect} />}
                    
                    {state.currentView === 'login' && (
                        <div className="max-w-md mx-auto mt-10"><Login onLogin={handleLogin} onCancel={() => handleNavigate('university_dashboard')} users={users} /></div>
                    )}
                    {state.currentView === 'admin_panel' && (
                        <AdminPanel data={appData} onUpdateData={setAppData} onLogActivity={handleLogActivity} onRequestDiscard={handleRequestDiscard} currentUser={state.currentUser} users={users} onUpdateUsers={setUsers} />
                    )}

                    {/* Mode Breakdown View */}
                    {state.currentView === 'mode_breakdown' && currentCampus && (
                        <ModeBreakdown campus={currentCampus} onNavigate={handleNavigate} />
                    )}
                    
                    {state.currentView === 'program_list' && currentCampus && state.selectedMode && (
                        <ProgramList campus={currentCampus} mode={state.selectedMode} onNavigate={handleNavigate} />
                    )}
                    {state.currentView === 'course_list' && program && (
                        <CourseList program={program} onNavigate={handleNavigate} />
                    )}
                    {state.currentView === 'video_progress' && course && (
                        <VideoProgress course={course} program={program || undefined} />
                    )}
                </div>
            </div>
        </div>

        {/* Black Footer - Fixed at bottom of main content area, outside scroll */}
        <footer className="bg-unikl-blue text-white py-4 px-6 text-center text-xs shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
                <p>&copy; 2025 UniKL DCMS. All Rights Reserved.</p>
                <p className="opacity-70">Developed by Rafiq Shuhaimi | v2.1.0</p>
            </div>
        </footer>

      </div>
    </div>
  );
};

export default App;
