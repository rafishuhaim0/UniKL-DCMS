
import React, { useState, useEffect } from 'react';
import { Home, Settings, LogIn, Moon, Sun, ChevronLeft, ChevronRight, Building2, ChevronDown, ChevronUp, LayoutDashboard } from 'lucide-react';
import { User, ViewState, Campus } from '../types';

interface SidebarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  isLoggedIn: boolean;
  currentUser?: User;
  currentView: ViewState;
  onNavigate: (view: ViewState, params: any) => void;
  onLogin: () => void;
  onAdmin: () => void;
  campuses?: Campus[];
  selectedCampusId?: string | null;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isDarkMode,
  toggleTheme,
  isLoggedIn,
  currentUser,
  currentView,
  onNavigate,
  onLogin,
  onAdmin,
  campuses = [],
  selectedCampusId,
  isOpen,
  onToggleOpen
}) => {
  const [isCampusesOpen, setIsCampusesOpen] = useState(false);

  useEffect(() => {
    if (selectedCampusId || currentView === 'campus_overview') {
        setIsCampusesOpen(true);
    }
  }, [selectedCampusId, currentView]);

  const handleItemClick = (action: () => void) => {
      action();
      if (window.innerWidth < 1024) onToggleOpen(); 
  };

  const NavItem = ({ icon: Icon, label, active, onClick, colorClass = "text-blue-200 group-hover:text-white", hasSubmenu = false, isOpenSub = false }: any) => (
    <button
      onClick={onClick}
      className={`group flex items-center p-3 rounded-xl transition-all duration-300 mb-1 w-full relative
        ${active && !hasSubmenu
          ? 'bg-unikl-orange text-white shadow-lg shadow-orange-900/20 translate-x-1' 
          : 'hover:bg-white/10 active:scale-95'
        }
        ${!isOpen ? 'lg:justify-center justify-between' : 'justify-between'}
      `}
      title={!isOpen ? label : undefined}
    >
      <div className="flex items-center gap-3 overflow-hidden">
          <div className={`shrink-0 ${active && !hasSubmenu ? 'text-white' : colorClass} transition-colors`}>
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
          </div>
          
          {isOpen && (
            <span className={`text-sm font-bold whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300 ${active && !hasSubmenu ? 'text-white' : 'text-blue-100 group-hover:text-white'}`}>
              {label}
            </span>
          )}
      </div>
      
      {isOpen && hasSubmenu && (
          <div className="text-blue-300">
              {isOpenSub ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
      )}
    </button>
  );

  return (
    <div 
      className={`
        fixed inset-y-0 left-0 h-full bg-unikl-blue border-r border-blue-900/50
        flex flex-col transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-[90]
        ${isOpen 
          ? 'w-72 translate-x-0 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.5)]' 
          : 'w-[280px] lg:w-20 -translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Floating Toggle Button (Desktop Only) */}
      <button 
        onClick={onToggleOpen}
        className={`
          hidden lg:flex absolute top-[84px] -right-4 w-8 h-8 
          bg-white dark:bg-gray-800 text-unikl-blue dark:text-blue-400 
          rounded-full shadow-xl border border-gray-200 dark:border-gray-700
          items-center justify-center z-[100] transition-all hover:scale-110 active:scale-95
          hover:text-unikl-orange dark:hover:text-orange-400
        `}
        aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Header / Logo Area */}
      <div className={`h-20 flex items-center px-4 border-b border-blue-800 relative shrink-0 bg-blue-900/20 transition-all ${isOpen ? 'justify-start' : 'justify-center'}`}>
        <button 
            onClick={() => handleItemClick(() => onNavigate('university_dashboard', {}))}
            className="flex items-center gap-2 overflow-hidden hover:opacity-80 transition-opacity focus:outline-none"
        >
            <div className="w-10 h-10 bg-unikl-orange rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-900/40">
                <Building2 className="text-white" size={20} />
            </div>
            {isOpen && (
                <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-500 text-left">
                    <span className="font-black text-xl text-white leading-none tracking-tight">UniKL</span>
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mt-0.5">DCMS HQ</span>
                </div>
            )}
        </button>
      </div>

      {/* Navigation Area */}
      <div className="flex-1 py-6 px-3 overflow-y-auto scrollbar-hide space-y-1">
        <div className={`mb-3 px-3 text-[10px] font-black text-blue-400/60 uppercase tracking-[0.2em] ${!isOpen ? 'text-center' : ''}`}>
            {!isOpen ? 'NAV' : 'MAIN NAVIGATION'}
        </div>
        
        <NavItem 
            icon={LayoutDashboard} 
            label="Overview" 
            active={currentView === 'university_dashboard'} 
            onClick={() => handleItemClick(() => onNavigate('university_dashboard', {}))} 
        />

        <NavItem 
            icon={Building2} 
            label="Campuses" 
            active={currentView === 'campus_overview' || currentView === 'mode_breakdown'}
            hasSubmenu={true}
            isOpenSub={isCampusesOpen}
            onClick={() => {
                if (!isOpen) {
                    onToggleOpen();
                    setTimeout(() => setIsCampusesOpen(true), 300);
                } else {
                    setIsCampusesOpen(!isCampusesOpen);
                }
            }} 
        />
        
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCampusesOpen && isOpen ? 'max-h-[500px] opacity-100 mb-2' : 'max-h-0 opacity-0'}`}>
            <div className="ml-4 pl-4 border-l-2 border-blue-800/50 space-y-1 mt-1">
                <button 
                    onClick={() => handleItemClick(() => onNavigate('campus_overview', {}))}
                    className={`
                        block w-full text-left py-2 px-3 text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wide
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
                            onClick={() => handleItemClick(() => onNavigate('mode_breakdown', { selectedCampusId: campus.id }))}
                            className={`
                                block w-full text-left py-2 px-3 text-xs rounded-lg transition-all truncate
                                ${isSelected 
                                    ? 'bg-blue-800/50 text-white font-bold border-l-2 border-unikl-orange pl-2.5' 
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
                label="Admin Control" 
                active={currentView === 'admin_panel'} 
                onClick={() => handleItemClick(onAdmin)} 
            />
        )}

        <div className="pt-6">
            <div className={`mb-3 px-3 text-[10px] font-black text-blue-400/60 uppercase tracking-[0.2em] ${!isOpen ? 'text-center' : ''}`}>
                {!isOpen ? 'SYS' : 'PREFERENCES'}
            </div>

            <NavItem 
                icon={isDarkMode ? Sun : Moon} 
                label={isDarkMode ? "Light UI" : "Dark UI"} 
                active={false} 
                onClick={toggleTheme}
                colorClass={isDarkMode ? "text-amber-400" : "text-blue-300"}
            />
        </div>
      </div>

      {/* Footer Branding - Clean & Minimal */}
      <div className="p-6 border-t border-blue-900/50 bg-blue-900/10">
          {isOpen ? (
              <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Version</p>
                  <p className="text-xs font-bold text-white">2.5.0 STABLE</p>
              </div>
          ) : (
              <div className="flex justify-center text-[10px] font-black text-blue-400">v2.5</div>
          )}
      </div>
    </div>
  );
};
