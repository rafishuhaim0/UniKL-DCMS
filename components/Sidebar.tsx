
import React, { useState, useEffect } from 'react';
import { Home, Settings, LogOut, LogIn, Moon, Sun, ChevronLeft, ChevronRight, Building2, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { User, ViewState, ActivityItem, Campus } from '../types';
import { ActivityBoard } from './ActivityBoard';

interface SidebarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  isLoggedIn: boolean;
  currentUser?: User;
  currentView: ViewState;
  onNavigate: (view: ViewState, params: any) => void;
  onLogin: () => void;
  onLogout: () => void;
  onAdmin: () => void;
  activities?: ActivityItem[];
  onDeleteActivity?: (id: string) => void;
  onUpdateActivity?: (id: string, message: string) => void;
  campuses?: Campus[];
  selectedCampusId?: string | null; // Added prop to track active campus
}

export const Sidebar: React.FC<SidebarProps> = ({
  isDarkMode,
  toggleTheme,
  isLoggedIn,
  currentUser,
  currentView,
  onNavigate,
  onLogin,
  onLogout,
  onAdmin,
  activities = [],
  onDeleteActivity,
  onUpdateActivity,
  campuses = [],
  selectedCampusId
}) => {
  // Default to true (collapsed/icon-only) as requested
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isCampusesOpen, setIsCampusesOpen] = useState(false);

  // Automatically expand Campuses menu if a campus is selected or we are in overview
  useEffect(() => {
    if (selectedCampusId || currentView === 'campus_overview') {
        setIsCampusesOpen(true);
    }
  }, [selectedCampusId, currentView]);

  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'campus_admin';

  const NavItem = ({ icon: Icon, label, active, onClick, colorClass = "text-blue-200 group-hover:text-white", hasSubmenu = false, isOpen = false }: any) => (
    <button
      onClick={onClick}
      className={`group flex items-center p-3 rounded-xl transition-all duration-200 mb-1 w-full relative
        ${active && !hasSubmenu
          ? 'bg-unikl-orange text-white shadow-lg shadow-orange-900/20' 
          : 'hover:bg-white/10'
        }
        ${isCollapsed ? 'justify-center' : 'justify-between'}
      `}
      title={isCollapsed ? label : undefined}
    >
      <div className="flex items-center gap-3 overflow-hidden">
          <div className={`shrink-0 ${active && !hasSubmenu ? 'text-white' : colorClass} transition-colors`}>
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
          </div>
          
          {!isCollapsed && (
            <span className={`text-sm font-bold whitespace-nowrap overflow-hidden ${active && !hasSubmenu ? 'text-white' : 'text-blue-100 group-hover:text-white'}`}>
              {label}
            </span>
          )}
      </div>
      
      {!isCollapsed && hasSubmenu && (
          <div className="text-blue-300">
              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
      )}
    </button>
  );

  return (
    <div 
      className={`
        sticky top-0 h-screen bg-unikl-blue border-r border-blue-900
        flex flex-col transition-all duration-300 ease-out z-50 shrink-0
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Header / Logo Area */}
      <div className="h-20 flex items-center justify-center border-b border-blue-800 relative shrink-0 bg-blue-900/20">
        <button 
            onClick={() => onNavigate('university_dashboard', {})}
            className="flex items-center gap-2 overflow-hidden px-4 hover:opacity-80 transition-opacity focus:outline-none"
            title="Go to Dashboard"
        >
            <div className="w-8 h-8 bg-unikl-orange rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-orange-900/40">
                <Building2 className="text-white" size={18} />
            </div>
            {!isCollapsed && (
                <div className="flex flex-col animate-in fade-in duration-300 text-left">
                    <span className="font-black text-lg text-white leading-none tracking-tight">UniKL</span>
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">DCMS</span>
                </div>
            )}
        </button>
        
        <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-unikl-blue hover:text-unikl-orange transition-colors shadow-sm z-10"
        >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation Area - Scrollable, Flex Grow */}
      <div className="flex-1 py-6 px-3 overflow-y-auto scrollbar-hide">
        <div className={`mb-4 px-3 text-xs font-bold text-blue-400 uppercase tracking-wider ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? 'Nav' : 'Main Menu'}
        </div>
        
        <NavItem 
            icon={Home} 
            label="Dashboard" 
            active={currentView === 'university_dashboard'} 
            onClick={() => onNavigate('university_dashboard', {})} 
        />

        {/* Campuses Menu */}
        <NavItem 
            icon={Building2} 
            label="Campuses" 
            active={currentView === 'campus_overview' || currentView === 'mode_breakdown'}
            hasSubmenu={true}
            isOpen={isCampusesOpen}
            onClick={() => {
                if (isCollapsed) {
                    setIsCollapsed(false);
                    setTimeout(() => setIsCampusesOpen(true), 150);
                } else {
                    setIsCampusesOpen(!isCampusesOpen);
                }
            }} 
        />
        
        {/* Campuses Submenu */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCampusesOpen && !isCollapsed ? 'max-h-96 opacity-100 mb-2' : 'max-h-0 opacity-0'}`}>
            <div className="ml-4 pl-4 border-l-2 border-blue-800 space-y-1 mt-1">
                <button 
                    onClick={() => onNavigate('campus_overview', {})}
                    className={`
                        block w-full text-left py-2 px-3 text-xs font-bold rounded-lg transition-colors uppercase tracking-wide
                        ${currentView === 'campus_overview' 
                            ? 'text-unikl-orange' 
                            : 'text-blue-300 hover:text-white hover:bg-white/5'
                        }
                    `}
                >
                    View All Campuses
                </button>
                {campuses.map(campus => {
                    const isSelected = selectedCampusId === campus.id;
                    return (
                        <button 
                            key={campus.id}
                            onClick={() => onNavigate('mode_breakdown', { selectedCampusId: campus.id })}
                            className={`
                                block w-full text-left py-2 px-3 text-sm rounded-lg transition-all truncate
                                ${isSelected 
                                    ? 'bg-blue-800/50 text-white font-bold border-l-2 border-unikl-orange pl-2.5 shadow-sm' 
                                    : 'text-blue-200 hover:text-white hover:bg-white/5'
                                }
                            `}
                        >
                            {campus.name}
                        </button>
                    );
                })}
            </div>
        </div>
        
        {isLoggedIn && (
            <NavItem 
                icon={Settings} 
                label="Admin Panel" 
                active={currentView === 'admin_panel'} 
                onClick={onAdmin} 
            />
        )}

        <div className={`mt-8 mb-4 px-3 text-xs font-bold text-blue-400 uppercase tracking-wider ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? 'Sys' : 'System'}
        </div>

        <NavItem 
            icon={isDarkMode ? Sun : Moon} 
            label={isDarkMode ? "Light Mode" : "Dark Mode"} 
            active={false} 
            onClick={toggleTheme}
            colorClass={isDarkMode ? "text-amber-400" : "text-blue-300"}
        />
      </div>

      {/* Updates / Activity Board Area - ORANGE BACKGROUND */}
      <div className="px-0 pb-0 shrink-0 border-t border-orange-600 bg-unikl-orange z-10 pt-0">
        {!isCollapsed ? (
            // Inner container is now transparent and allows floating items
            <div className="max-h-[35vh] overflow-y-auto scrollbar-hide relative pr-0 -mr-0">
                <ActivityBoard 
                    activities={activities} 
                    variant="sidebar" 
                    isAdmin={isAdmin}
                    onDelete={onDeleteActivity}
                    onUpdate={onUpdateActivity}
                    onNavigate={onNavigate}
                />
            </div>
        ) : (
             <div className="p-3">
                 <button 
                    onClick={() => setIsCollapsed(false)}
                    className="w-full flex justify-center p-3 rounded-xl bg-white text-unikl-orange hover:bg-orange-50 transition-all shadow-lg relative group border-2 border-transparent hover:border-white/50"
                    title="View Updates"
                 >
                    <Bell size={20} className="shrink-0" />
                    {activities.length > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    )}
                 </button>
             </div>
        )}
      </div>

      {/* Footer / User Profile - ORANGE BACKGROUND */}
      <div className="p-3 border-t border-orange-600 bg-unikl-orange shrink-0">
        {isLoggedIn ? (
            <div 
                className={`
                    group/profile relative flex items-center 
                    ${isCollapsed ? 'justify-center p-3 cursor-pointer hover:bg-red-600 border-2 border-transparent hover:border-red-400' : 'gap-3 p-2 border border-white/20'} 
                    rounded-xl bg-white shadow-md transition-all duration-300
                `}
                onClick={isCollapsed ? onLogout : undefined}
                title={isCollapsed ? "Click to Logout" : undefined}
            >
                {/* Collapsed Mode */}
                {isCollapsed ? (
                    <>
                         {/* Avatar - Hidden on Hover */}
                        <div className="w-5 h-5 rounded-full bg-unikl-orange flex items-center justify-center text-white font-bold shrink-0 text-[10px] border border-orange-200 group-hover/profile:opacity-0 transition-opacity">
                            {currentUser?.username.charAt(0).toUpperCase()}
                        </div>
                         {/* Logout Icon - Visible on Hover */}
                        <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover/profile:opacity-100 transition-opacity">
                            <LogOut size={20} />
                        </div>
                    </>
                ) : (
                    /* Expanded Mode */
                    <>
                        <div className="w-8 h-8 rounded-full bg-unikl-orange flex items-center justify-center text-white font-bold shrink-0 text-xs border border-orange-200">
                            {currentUser?.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden animate-in fade-in duration-300">
                            <p className="text-xs font-bold text-gray-900 truncate">{currentUser?.username}</p>
                            <p className="text-[10px] text-unikl-orange truncate capitalize">{currentUser?.role.replace('_', ' ')}</p>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onLogout(); }} 
                            className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-100 shadow-sm" 
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </>
                )}
            </div>
        ) : (
            <button 
                onClick={onLogin}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-3'} p-3 rounded-xl bg-white text-unikl-orange hover:bg-orange-50 transition-all font-bold text-sm shadow-lg group border-2 border-transparent hover:border-white/50`}
                title="Login"
            >
                <LogIn size={18} className="shrink-0" />
                {!isCollapsed && <span className="animate-in fade-in duration-300">Login Access</span>}
            </button>
        )}
      </div>
    </div>
  );
};
