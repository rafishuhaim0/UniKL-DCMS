
import React, { useState, useEffect, useRef } from 'react';
import { UNIVERSITY_STATS } from './constants';
import { database } from './database'; 
import { AppState, ViewState, Campus, ActivityItem, User } from './types';
import { Breadcrumb } from './components/Breadcrumb';
import { CampusOverview } from './components/CampusOverview';
import { ModeBreakdown } from './components/ModeBreakdown';
import { ProgramList } from './components/ProgramList';
import { CourseList } from './components/CourseList';
import { VideoProgress } from './components/VideoProgress';
import { UniversityDashboard } from './components/UniversityDashboard';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { Sidebar } from './components/Sidebar';
import { ActivityBoard } from './components/ActivityBoard';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Megaphone, ChevronLeft, Home, LogOut, Menu, X as CloseIcon, Send, User as UserIcon, Settings, Bell, ChevronUp } from 'lucide-react';

const App: React.FC = () => {
  const [appData, setAppData] = useState<Campus[]>(() => database.campuses.getAll());
  const [activities, setActivities] = useState<ActivityItem[]>(() => database.activities.getAll());
  const [users, setUsers] = useState<User[]>(() => database.users.getAll());

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);
  const [showPostConfirmation, setShowPostConfirmation] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

  const handleUpdateAppData = (newData: Campus[]) => {
      setAppData(newData);
      database.campuses.save(newData);
  };

  const handleUpdateUsers = (newUsers: User[]) => {
      setUsers(newUsers);
      database.users.save(newUsers);
  };

  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
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
      
      const updatedActivities = [newActivity, ...activities];
      setActivities(updatedActivities);
      database.activities.save(updatedActivities);

      const toastType = type === 'delete' ? 'error' : (type === 'create' || type === 'update' ? 'success' : 'announcement');
      addToast(message, toastType);
  };

  const handleDeleteActivity = (id: string) => {
    const updated = activities.filter(a => a.id !== id);
    setActivities(updated);
    database.activities.save(updated);
    addToast('Activity log removed', 'info');
  };

  const handleUpdateActivity = (id: string, message: string) => {
    const updated = activities.map(a => a.id === id ? { ...a, message } : a);
    setActivities(updated);
    database.activities.save(updated);
    addToast('Activity log updated', 'success');
  };

  const handlePostAnnouncementClick = () => {
    setAnnouncementText('');
    setIsPostingAnnouncement(true);
    setIsUserMenuOpen(false);
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
    if (window.innerWidth < 1024) setIsMenuOpen(false);
    setIsActivityOpen(false);
  };

  const handleLogin = (user: User) => {
    setIsLoading(true);
    setLoadingText('Authenticating Secure Portal...');
    setTimeout(() => {
        setState(prev => ({ ...prev, isLoggedIn: true, currentView: 'admin_panel', currentUser: user }));
        addToast(`Welcome back, ${user.username}!`, 'success');
        setIsLoading(false);
    }, 1200);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirmation(false);
    setIsUserMenuOpen(false);
    setIsLoading(true);
    setLoadingText('Clearing Session Data...');
    setTimeout(() => {
        setState(prev => ({ ...prev, isLoggedIn: false, currentView: 'university_dashboard', currentUser: undefined }));
        addToast('Safe Logout Successful', 'info');
        setIsLoading(false);
    }, 1200);
  };

  const currentCampus = state.selectedCampusId ? appData.find(c => c.id === state.selectedCampusId) : null;
  const program = state.selectedMode && state.selectedProgramName ? currentCampus?.modes[state.selectedMode]?.programmes?.find(p => p.name === state.selectedProgramName) : null;
  const course = program?.courses.find(c => c.code === state.selectedCourseCode);

  const handleBack = () => {
      if (state.currentView === 'video_progress') handleNavigate('course_list', { selectedProgramName: state.selectedProgramName });
      else if (state.currentView === 'course_list') handleNavigate('program_list', { selectedMode: state.selectedMode });
      else if (state.currentView === 'program_list') handleNavigate('mode_breakdown', { selectedCampusId: state.selectedCampusId });
      else if (state.currentView === 'mode_breakdown') handleNavigate('campus_overview');
      else handleNavigate('university_dashboard');
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 relative overflow-x-hidden">
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Persistent Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[200] bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-gray-100 dark:border-gray-800 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-t-unikl-orange border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute inset-0"></div>
            </div>
            <p className="mt-8 font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] animate-pulse">{loadingText}</p>
        </div>
      )}

      {/* Global Backdrop */}
      {(isMenuOpen || isActivityOpen) && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[85] animate-in fade-in duration-300"
            onClick={() => { setIsMenuOpen(false); setIsActivityOpen(false); }}
          />
      )}

      {/* Floating Notification Trigger (Top Right) */}
      <button 
        onClick={() => setIsActivityOpen(!isActivityOpen)}
        className="fixed top-6 right-6 z-[80] p-3.5 bg-white dark:bg-gray-800 text-unikl-blue dark:text-blue-300 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] hover:shadow-xl active:scale-95 transition-all border border-gray-100 dark:border-gray-700 group"
      >
        <Bell size={24} className="group-hover:rotate-12 transition-transform" />
        {activities.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-unikl-orange text-white text-[10px] font-black flex items-center justify-center rounded-lg shadow-lg border-2 border-white dark:border-gray-800">
                {activities.length > 9 ? '9+' : activities.length}
            </span>
        )}
      </button>

      {/* Global Actions Center (Bottom Right) */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-4">
          {/* Action Menu (Animated expansion) */}
          <div className={`flex flex-col gap-3 items-end transition-all duration-300 ${isUserMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-0 pointer-events-none'}`}>
              {state.isLoggedIn && (
                  <button 
                    onClick={handlePostAnnouncementClick}
                    className="flex items-center gap-3 px-6 py-3 bg-unikl-orange text-white rounded-2xl shadow-xl hover:bg-orange-600 transition-all font-bold text-sm"
                  >
                    <span>Post Update</span>
                    <Megaphone size={18} />
                  </button>
              )}
              {state.isLoggedIn && (
                  <button 
                    onClick={() => handleNavigate('admin_panel')}
                    className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl shadow-xl hover:bg-gray-50 transition-all font-bold text-sm border border-gray-100 dark:border-gray-700"
                  >
                    <span>Admin Panel</span>
                    <Settings size={18} />
                  </button>
              )}
              {state.isLoggedIn ? (
                  <button 
                    onClick={() => setShowLogoutConfirmation(true)}
                    className="flex items-center gap-3 px-6 py-3 bg-red-600 text-white rounded-2xl shadow-xl hover:bg-red-700 transition-all font-bold text-sm"
                  >
                    <span>Logout</span>
                    <LogOut size={18} />
                  </button>
              ) : (
                  <button 
                    onClick={() => handleNavigate('login')}
                    className="flex items-center gap-3 px-6 py-3 bg-unikl-blue text-white rounded-2xl shadow-xl hover:bg-blue-900 transition-all font-bold text-sm"
                  >
                    <span>Login Access</span>
                    <UserIcon size={18} />
                  </button>
              )}
          </div>

          {/* Main FAB Trigger */}
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`
                p-5 rounded-[2rem] shadow-2xl transition-all active:scale-95 flex items-center justify-center border-4 border-white dark:border-gray-900
                ${isUserMenuOpen ? 'bg-gray-900 text-white' : 'bg-unikl-orange text-white hover:bg-orange-600'}
            `}
          >
            {isUserMenuOpen ? <CloseIcon size={28} /> : (state.isLoggedIn ? <UserIcon size={28} /> : <Menu size={28} />)}
          </button>
      </div>

      {/* Standalone Activity Center (Right Side Drawer) */}
      <div 
        className={`
            fixed top-0 right-0 h-screen w-full max-w-md bg-white dark:bg-gray-950 z-[110] shadow-[-20px_0_60px_rgba(0,0,0,0.3)] transition-all duration-500 ease-in-out
            ${isActivityOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <ActivityBoard 
            activities={activities}
            isAdmin={state.currentUser?.role === 'super_admin' || state.currentUser?.role === 'campus_admin'}
            onDelete={handleDeleteActivity}
            onUpdate={handleUpdateActivity}
            onNavigate={handleNavigate}
            onClose={() => setIsActivityOpen(false)}
        />
      </div>

      {/* Main Sidebar */}
      <Sidebar 
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isLoggedIn={state.isLoggedIn}
        currentUser={state.currentUser}
        currentView={state.currentView}
        onNavigate={handleNavigate}
        onLogin={() => handleNavigate('login')}
        onAdmin={() => handleNavigate('admin_panel')}
        campuses={appData}
        selectedCampusId={state.selectedCampusId}
        isOpen={isMenuOpen}
        onToggleOpen={() => setIsMenuOpen(!isMenuOpen)}
      />

      {/* Post Announcement Modal */}
      {isPostingAnnouncement && (
          <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] w-full max-w-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
                  <div className="p-8 bg-unikl-orange text-white flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <Megaphone size={32} />
                        <div>
                            <h3 className="font-black text-2xl tracking-tight">University Alert</h3>
                            <p className="text-xs font-bold text-orange-200 uppercase tracking-widest">Broadcast Message</p>
                        </div>
                      </div>
                      <button onClick={() => setIsPostingAnnouncement(false)} className="hover:bg-black/10 p-2 rounded-xl transition-colors"><CloseIcon size={24}/></button>
                  </div>
                  <div className="p-8">
                      <textarea 
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        className="w-full h-40 p-5 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-100 dark:border-gray-800 rounded-[1.5rem] focus:ring-4 focus:ring-orange-500/10 focus:border-unikl-orange outline-none text-gray-900 dark:text-white transition-all resize-none text-lg leading-relaxed font-medium"
                        placeholder="Type your message to the community..."
                        autoFocus
                      />
                  </div>
                  <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-4">
                      <button onClick={() => setIsPostingAnnouncement(false)} className="px-8 py-3 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-gray-800 rounded-2xl transition-all">Discard</button>
                      <button 
                        onClick={handlePostConfirmationClick}
                        disabled={!announcementText.trim()}
                        className="px-10 py-3 bg-unikl-orange text-white font-black rounded-2xl shadow-xl hover:shadow-orange-500/40 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 active:scale-95"
                      >
                        <Send size={20} /> SEND BROADCAST
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Simple Discard Confirmation */}
      {showPostConfirmation && (
          <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center">
                  <div className="mx-auto w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-unikl-orange rounded-full flex items-center justify-center mb-6">
                      <Megaphone size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Publish Now?</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">This alert will be broadcasted to all users and saved in the activity logs.</p>
                  <div className="flex gap-3">
                      <button onClick={() => setShowPostConfirmation(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 rounded-2xl font-bold text-gray-600 dark:text-gray-300">Edit</button>
                      <button onClick={submitAnnouncement} className="flex-1 py-4 bg-unikl-orange text-white rounded-2xl font-black shadow-lg shadow-orange-200 dark:shadow-none active:scale-95">Confirm</button>
                  </div>
              </div>
          </div>
      )}

      {/* Logout Overlay */}
      {showLogoutConfirmation && (
          <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border border-gray-100 dark:border-gray-800">
                  <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-6">
                      <LogOut size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Ending Session?</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Are you sure you want to log out from the DCMS Control Panel?</p>
                  <div className="flex gap-3">
                      <button onClick={() => setShowLogoutConfirmation(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 rounded-2xl font-bold text-gray-600 dark:text-gray-300">Stay</button>
                      <button onClick={handleLogoutConfirm} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-200 dark:shadow-none active:scale-95">Logout</button>
                  </div>
              </div>
          </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden lg:pl-20">
        
        {/* Mobile Header (Only on small screens) */}
        <div className="lg:hidden flex justify-between items-center p-6 shrink-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
             <button onClick={() => setIsMenuOpen(true)} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl"><Menu size={24}/></button>
             <div className="flex flex-col items-center">
                <span className="font-black text-lg text-unikl-blue dark:text-white tracking-tighter">UniKL DCMS</span>
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Mobile Dashboard</span>
             </div>
             <div className="w-10"></div> {/* Spacer for symmetry */}
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-32">
            <div className="max-w-7xl mx-auto min-h-full flex flex-col">
                
                {/* Hero Header Section */}
                <div className="mb-10 flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        {state.currentView === 'university_dashboard' 
                            ? 'National Performance HQ' 
                            : (state.currentView === 'campus_overview' 
                                ? 'Participating Campuses' 
                                : (currentCampus ? currentCampus.name : 'System View'))}
                    </h1>
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm font-medium">
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-unikl-blue dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Digital Course Management</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14}/> 2024/2025 Session</span>
                    </div>
                </div>

                {/* Navigation/Breadcrumbs */}
                {state.currentView !== 'university_dashboard' && state.currentView !== 'login' && (
                    <div className="mb-8 flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="flex gap-3">
                            <button onClick={handleBack} className="flex items-center gap-2 px-5 py-2.5 bg-unikl-blue text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-900 transition-all text-sm active:scale-95">
                                <ChevronLeft size={18} /> Back
                            </button>
                            <button onClick={() => handleNavigate('university_dashboard')} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm active:scale-95 border border-gray-100 dark:border-gray-700">
                                <Home size={18} /> Overview
                            </button>
                        </div>
                        <Breadcrumb state={state} campusName={currentCampus ? currentCampus.name : 'All Campuses'} onNavigate={handleNavigate} />
                    </div>
                )}

                {/* Main View Transition */}
                <div className="transition-all duration-500 ease-in-out flex-1">
                    {state.currentView === 'university_dashboard' && <UniversityDashboard data={appData} onNavigateToCampus={handleNavigate} />}
                    {state.currentView === 'campus_overview' && <CampusOverview campuses={appData} onNavigate={(id) => handleNavigate('mode_breakdown', { selectedCampusId: id })} />}
                    
                    {state.currentView === 'login' && (
                        <div className="max-w-md mx-auto mt-12">
                            <Login onLogin={handleLogin} onCancel={() => handleNavigate('university_dashboard')} users={users} />
                        </div>
                    )}
                    {state.currentView === 'admin_panel' && (
                        <AdminPanel data={appData} onUpdateData={handleUpdateAppData} onLogActivity={handleLogActivity} onRequestDiscard={() => {}} currentUser={state.currentUser} users={users} onUpdateUsers={handleUpdateUsers} />
                    )}

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

        {/* Global Footer (Simplified) */}
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 py-6 px-10 text-center text-[10px] md:text-xs shrink-0 z-20 transition-colors">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <p className="font-bold text-gray-400">&copy; 2025 UNIKL DCMS ECOSYSTEM</p>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                    <p className="text-gray-400">All Rights Reserved.</p>
                </div>
                <div className="font-black text-blue-900/40 dark:text-blue-100/10 tracking-[0.3em] uppercase">Digital Performance HQ</div>
            </div>
        </footer>

      </div>
    </div>
  );
};

export default App;
