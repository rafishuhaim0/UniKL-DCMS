
import React, { useState, useEffect } from 'react';
import { Campus, Programme, Course, ModeData, ModuleData, ActivityItem, User, UserRole, ViewState } from '../types';
import { Check, ChevronLeft, Plus, Edit2, Trash2, X, Layers, AlertTriangle, Info, AlertCircle, Calendar as CalendarIcon, ChevronRight, Clock, Users, UserPlus, Shield, ArrowRightCircle, Filter, ArrowRight } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

interface AdminPanelProps {
  data: Campus[];
  onUpdateData: (newData: Campus[]) => void;
  onLogActivity: (message: string, type: ActivityItem['type'], targetView?: ViewState, targetParams?: Record<string, any>) => void;
  onRequestDiscard: (action: () => void) => void;
  currentUser?: User; 
  users?: User[]; // List of system users
  onUpdateUsers?: (newUsers: User[]) => void; // Handler to update users
}

type AdminTab = 'campuses' | 'content' | 'users';
type CampusViewMode = 'list' | 'modes';

interface ModalState {
    isOpen: boolean;
    mode: 'confirm' | 'alert';
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    dataSummary?: React.ReactNode;
    onConfirm?: () => void;
    confirmLabel?: string; // New field to customize button text
}

const CAMPUS_PRESETS = [
    "UniKL MIIT", "UniKL MFI", "UniKL MIAT", "UniKL MIMET", "UniKL BMI", 
    "UniKL RCMP", "UniKL MIDI", "UniKL MITEC", "UniKL MESTECH", "UniKL BiS", 
    "UniKL MSI", "UniKL MICET", "IPS", "CPS"
];

// Helper to generate ID from name
const generateCampusId = (name: string) => {
    let cleaned = name.trim();
    if (cleaned.toLowerCase().startsWith('unikl ')) {
        cleaned = cleaned.substring(6);
    }
    return cleaned.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Helper for Days Calculation
const calculateDaysTaken = (start: string, end: string) => {
    if (!start || !end || start === '-' || end === '-') return '-';
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '-';
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays + 1;
};

// --- Custom Calendar Modal Component ---
interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (date: string) => void;
    initialDate?: string;
    relatedDate?: string; // The "other" date (start if picking end, end if picking start)
    isStartField?: boolean; // Context for range calculation
    title: string;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, onSelect, initialDate, relatedDate, isStartField, title }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'day' | 'year'>('day');
    const [tempSelectedDate, setTempSelectedDate] = useState<string | null>(null);
    const today = new Date();
    
    useEffect(() => {
        if (isOpen) {
            let focusDate = new Date();
            if (initialDate && initialDate !== '-' && initialDate !== '') {
                focusDate = new Date(initialDate);
            } else if (relatedDate && relatedDate !== '-' && relatedDate !== '') {
                focusDate = new Date(relatedDate);
            }

            if (!isNaN(focusDate.getTime())) {
                setCurrentDate(focusDate);
                setTempSelectedDate(initialDate || null);
            }
            setViewMode('day');
        }
    }, [isOpen, initialDate, relatedDate]);

    if (!isOpen) return null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const handleDateClick = (day: number) => {
        const monthStr = (month + 1).toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        const newDateStr = `${year}-${monthStr}-${dayStr}`;
        setTempSelectedDate(newDateStr); 
        onSelect(newDateStr);
    };

    const handleYearClick = (newYear: number) => {
        setCurrentDate(new Date(newYear, month, 1));
        setViewMode('day');
    };

    const handleJumpToToday = () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();
        const d = now.getDate();
        const dateStr = `${y}-${(m+1).toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
        
        setCurrentDate(now);
        setTempSelectedDate(dateStr);
        onSelect(dateStr);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getRangeStatus = (day: number) => {
        if (!relatedDate || relatedDate === '-') return 'none';
        const currentStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const currentTs = new Date(currentStr).getTime();
        const relatedTs = new Date(relatedDate).getTime();
        if (isNaN(relatedTs)) return 'none';
        const selectedStr = tempSelectedDate || initialDate;
        const selectedTs = selectedStr ? new Date(selectedStr).getTime() : 0;
        if (currentTs === relatedTs) return 'related';
        if (selectedTs && selectedTs !== relatedTs) {
            const start = Math.min(selectedTs, relatedTs);
            const end = Math.max(selectedTs, relatedTs);
            if (currentTs > start && currentTs < end) return 'in-range';
        }
        return 'none';
    };

    const isToday = (day: number) => {
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    };

    const getDurationText = () => {
        const selectedStr = tempSelectedDate || initialDate;
        if (!selectedStr || !relatedDate || relatedDate === '-') return null;
        const d1 = new Date(selectedStr);
        const d2 = new Date(relatedDate);
        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
        return `${diffDays} Days`;
    };

    return (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="p-4 bg-unikl-blue text-white flex justify-between items-center shrink-0 transition-colors duration-300">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-blue-200 uppercase tracking-wider">{title}</span>
                        <h3 className="font-bold text-lg leading-tight">{viewMode === 'day' ? `${monthNames[month]} ${year}` : `Select Year`}</h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors"><X size={20}/></button>
                </div>
                <div className="p-4 overflow-y-auto">
                    {viewMode === 'day' ? (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors"><ChevronLeft size={20}/></button>
                                <button onClick={() => setViewMode('year')} className="font-bold text-gray-800 dark:text-gray-200 text-base hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1 rounded-lg transition-colors">{monthNames[month]} {year}</button>
                                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors"><ChevronRight size={20}/></button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (<div key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</div>))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dateStr = `${year}-${(month+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
                                    const isSelected = (tempSelectedDate || initialDate) === dateStr;
                                    const rangeStatus = getRangeStatus(day);
                                    let bgClass = 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200';
                                    if (isSelected) bgClass = 'bg-unikl-orange text-white shadow-md scale-110 z-10';
                                    else if (rangeStatus === 'related') bgClass = 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500 font-bold';
                                    else if (rangeStatus === 'in-range') bgClass = 'bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100';
                                    const todayStyle = isToday(day) && !isSelected ? 'ring-2 ring-blue-400 dark:ring-blue-500 font-bold' : '';
                                    return (<button key={day} onClick={() => handleDateClick(day)} className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-all relative ${bgClass} ${todayStyle}`}>{day}</button>);
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-1">
                            {Array.from({ length: 24 }).map((_, i) => {
                                const y = year - 12 + i;
                                const isCurrent = y === new Date().getFullYear();
                                const isSelected = y === year;
                                return (<button key={y} onClick={() => handleYearClick(y)} className={`py-2 rounded-lg text-sm font-bold transition-all ${isSelected ? 'bg-unikl-blue text-white shadow-md' : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'} ${isCurrent && !isSelected ? 'border-2 border-unikl-blue text-unikl-blue' : ''}`}>{y}</button>);
                            })}
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 text-xs border-t border-gray-200 dark:border-gray-700 shrink-0 flex flex-col gap-3">
                    <div className="flex justify-between items-center w-full">
                        <button onClick={handleJumpToToday} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-700 text-unikl-blue dark:text-blue-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"><Clock size={14} /> Today</button>
                        {getDurationText() && (<div className="font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm">Total: {getDurationText()}</div>)}
                    </div>
                    <div className="flex gap-3 pt-1 border-t border-gray-200 dark:border-gray-700/50">
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-unikl-orange"></span><span className="text-gray-500 dark:text-gray-400">Selected</span></div>
                        {relatedDate && <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span><span className="text-gray-500 dark:text-gray-400">{isStartField ? 'Finish' : 'Start'} Date</span></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  data, 
  onUpdateData, 
  onLogActivity, 
  onRequestDiscard, 
  currentUser,
  users = [],
  onUpdateUsers
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('campuses');
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const assignedCampusId = currentUser?.assignedCampusId;

  // Lazy initialization for selectedCampusId based on role
  const [selectedCampusId, setSelectedCampusId] = useState<string>(() => {
      if (!isSuperAdmin && assignedCampusId) {
          // Attempt to find existing ID or use assigned directly
          const exists = data.find(c => c.id === assignedCampusId);
          return exists ? exists.id : assignedCampusId;
      }
      return data.length > 0 ? data[0].id : '';
  });

  const [selectedMode, setSelectedMode] = useState<string>('odl');
  const [selectedProgrammeIndex, setSelectedProgrammeIndex] = useState<number | null>(null);
  const [selectedCourseIndex, setSelectedCourseIndex] = useState<number | null>(null);

  // Manage Modes State
  const [campusViewMode, setCampusViewMode] = useState<CampusViewMode>('list');
  const [selectedCampusForModes, setSelectedCampusForModes] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalState>({
      isOpen: false,
      mode: 'alert',
      title: '',
      message: '',
      type: 'info'
  });

  // Calendar Modal State
  const [calendarState, setCalendarState] = useState<{
      isOpen: boolean;
      field: 'actual' | 'finishDate';
      currentValue: string;
      relatedValue?: string; // The value of the OTHER field to calculate range
  }>({ isOpen: false, field: 'actual', currentValue: '' });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null); 
  const [isAdding, setIsAdding] = useState(false);

  // Forms
  const [campusForm, setCampusForm] = useState<{id: string, name: string}>({ id: '', name: '' });
  const [campusNameMode, setCampusNameMode] = useState<'preset' | 'custom'>('preset'); // New state for Add Campus toggle

  const [modeForm, setModeForm] = useState<{ selectKey: string; customKey: string; originalKey?: string; }>({ selectKey: 'odl', customKey: '' });
  const [progForm, setProgForm] = useState<Partial<Programme>>({ name: '', coordinator: '', campusSection: '', totalSubjectsCount: 0, courses: [] });
  const [courseForm, setCourseForm] = useState<Partial<Course>>({ code: '', name: '', smeLead: '', smeTeam: '', semester: 1, progress: { sim: 0, introVideo: 0, esim: 0 } });
  const [moduleForm, setModuleForm] = useState<ModuleData>({ subject: '', category: 'common', status: 'In Progress', actual: '', finishDate: '', esim: 'N', sim: 'N', remark: '' });
  
  // User Management Form
  const [userForm, setUserForm] = useState<User>({ username: '', password: '', role: 'campus_admin', assignedCampusId: '' });

  // Initialize view based on user role - Enforce restriction
  useEffect(() => {
    if (!isSuperAdmin && assignedCampusId) {
        // Fallback: try to find ID by name if exact ID match fails
        const matchedCampus = data.find(c => c.id === assignedCampusId || c.name === assignedCampusId);
        
        if (matchedCampus) {
            setSelectedCampusId(matchedCampus.id);
        } else {
             // Just use the value as is, might be a custom ID
            setSelectedCampusId(assignedCampusId);
        }

        // If current tab is 'users' (restricted), switch to content
        if (activeTab === 'users') setActiveTab('content');
        
        if (matchedCampus) {
             const availableModes = Object.keys(matchedCampus.modes);
             if (!availableModes.includes(selectedMode) && availableModes.length > 0) {
                 setSelectedMode(availableModes[0]);
             }
        }
    }
  }, [currentUser, data, isSuperAdmin, assignedCampusId]);

  const currentCampusIndex = data.findIndex(c => c.id === selectedCampusId);
  const currentCampus = data[currentCampusIndex];

  // Filter available campuses based on role
  const managedCampuses = isSuperAdmin 
      ? data 
      : data.filter(c => c.id === selectedCampusId);

  const resetSelectionState = () => {
      setIsAdding(false);
      setEditingIndex(null);
      setEditingKey(null);
      setSelectedProgrammeIndex(null);
      setSelectedCourseIndex(null);
      setCampusViewMode('list'); 
  };

  const handleTabChange = (tab: AdminTab) => {
      if (tab === activeTab) return;
      const hasUnsavedChanges = isAdding || editingIndex !== null || editingKey !== null;
      if (hasUnsavedChanges) {
          showConfirm('Unsaved Changes', 'You have unsaved changes. Are you sure you want to switch tabs? Your progress will be lost.', 'warning', null, () => {
              resetSelectionState();
              setActiveTab(tab);
              closeModal();
          });
      } else {
          resetSelectionState();
          setActiveTab(tab);
      }
  };

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));
  const showAlert = (title: string, message: string, type: 'danger' | 'warning' | 'info' | 'success' = 'warning') => { setModal({ isOpen: true, mode: 'alert', title, message, type }); };
  const showConfirm = (title: string, message: string, type: 'danger' | 'warning' | 'info' | 'success', dataSummary: React.ReactNode, onConfirm: () => void, confirmLabel?: string) => { setModal({ isOpen: true, mode: 'confirm', title, message, type, dataSummary, onConfirm, confirmLabel }); };

  const inputClass = "w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-unikl-orange focus:border-unikl-orange outline-none transition-all shadow-sm";
  const smallInputClass = "w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-unikl-orange outline-none text-center shadow-sm";
  
  const labelClass = "block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide";
  const btnBase = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all duration-200 border";
  const btnPrimary = `${btnBase} bg-unikl-orange hover:bg-orange-600 text-white border-transparent hover:shadow-orange-200 dark:hover:shadow-none`;
  const btnSecondary = `${btnBase} bg-unikl-blue text-white border-transparent hover:bg-blue-900`;
  const btnDanger = `${btnBase} bg-red-600 text-white border-transparent hover:bg-red-700`;
  const btnSuccess = `${btnBase} bg-green-600 text-white border-transparent hover:bg-green-700`;

  const recalculateProgressFromModules = (modules: ModuleData[]): { sim: number, esim: number, introVideo: number } => {
    const calcCat = (cat: ModuleData['category']) => {
        const relevant = modules.filter(m => m.category === cat);
        if (relevant.length === 0) return 0;
        const done = relevant.filter(m => m.status === 'Done').length;
        return Math.round((done / relevant.length) * 100);
    };
    return { sim: calcCat('sim'), esim: calcCat('esim'), introVideo: calcCat('intro_video') };
  };

  const calculateSemesterProgress = (courses: Course[], semester: number) => {
        const relevant = courses.filter(c => (c.semester || 1) === semester);
        if (!relevant.length) return { avg: 0, count: 0 };
        const totalProgress = relevant.reduce((sum, c) => sum + ((c.progress.sim + c.progress.esim + c.progress.introVideo) / 3), 0);
        return { avg: Math.round(totalProgress / relevant.length), count: relevant.length };
  };

  // --- CRUD Handlers ---
  const handleSaveCampus = () => {
    if (!isSuperAdmin) return;
    if (!campusForm.name.trim()) return showAlert("Validation Error", "Campus Name cannot be empty.");
    const isEdit = editingIndex !== null;
    if (!isEdit && !campusForm.id.trim()) return showAlert("Validation Error", "Please enter a Campus ID.");
    if (!isEdit && data.find(c => c.id.toLowerCase() === campusForm.id.toLowerCase().trim())) return showAlert("Duplicate Error", "This Campus ID already exists.");
    
    showConfirm(
        isEdit ? 'Update Campus' : 'Add Campus', 
        isEdit ? `Rename ${data[editingIndex!].name} to ${campusForm.name}?` : 'Are you sure you want to add this new campus?', 
        'info', 
        null, 
        () => {
            const newData = [...data];
            const campusId = isEdit ? newData[editingIndex!].id : campusForm.id.toLowerCase().replace(/\s/g, '');
            if (isEdit) { 
                newData[editingIndex!] = { ...newData[editingIndex!], name: campusForm.name }; 
                onLogActivity(`Renamed campus ${newData[editingIndex!].id} to ${campusForm.name}`, 'update', 'mode_breakdown', { selectedCampusId: campusId }); 
            } else { 
                const newCampus: Campus = { id: campusId, name: campusForm.name, totalCourses: 0, completedCourses: 0, modes: { odl: { count: 0, completed: 0, programmes: [] } } }; 
                newData.push(newCampus); 
                onLogActivity(`Created new campus: ${newCampus.name}`, 'create', 'mode_breakdown', { selectedCampusId: campusId }); 
            }
            onUpdateData(newData); 
            setIsAdding(false); 
            setEditingIndex(null); 
            setCampusForm({ id: '', name: '' });
            
            // Chain: Automatic User Creation Prompt (Only for New Campus)
            if (!isEdit && onUpdateUsers && users) {
                const proposedUsername = `${campusId}_admin`;
                
                // If user already exists, just close modal
                if (users.find(u => u.username === proposedUsername)) {
                    closeModal();
                    return;
                }

                // Immediately switch to the second modal without closing (replace state)
                setModal({
                    isOpen: true,
                    mode: 'confirm',
                    title: 'Create Campus Admin?',
                    message: `Campus created successfully. Do you want to automatically generate an admin account for it?`,
                    type: 'success',
                    dataSummary: (
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm border border-gray-200 dark:border-gray-700 mt-2 space-y-1">
                            <p><strong>Username:</strong> {proposedUsername}</p>
                            <p><strong>Password:</strong> admin123</p>
                            <p><strong>Role:</strong> Campus Admin</p>
                        </div>
                    ),
                    onConfirm: () => {
                        const newUser: User = {
                            username: proposedUsername,
                            password: 'admin123',
                            role: 'campus_admin',
                            assignedCampusId: campusId
                        };
                        onUpdateUsers([...users, newUser]);
                        onLogActivity(`Auto-created admin user: ${newUser.username}`, 'create');
                        
                        // Chain: Prompt to go to User Management
                        setModal({
                            isOpen: true,
                            mode: 'confirm',
                            title: 'User Created',
                            message: `Admin user '${proposedUsername}' has been created successfully. Would you like to view it in User Management?`,
                            type: 'success',
                            confirmLabel: 'Go to User Management',
                            onConfirm: () => {
                                setActiveTab('users');
                                closeModal();
                            }
                        });
                    }
                });
            } else {
                closeModal();
            }
        }
    );
  };

  const handleDeleteCampus = (idx: number) => { const campus = data[idx]; showConfirm('Delete Campus', `Are you sure you want to delete ${campus.name}?`, 'danger', <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded"><strong>Warning:</strong> All data associated with this campus (Modes, Programmes, Courses) will be permanently lost.</div>, () => { const newData = [...data]; newData.splice(idx, 1); if (campus.id === selectedCampusId) setSelectedCampusId(newData.length > 0 ? newData[0].id : ''); onUpdateData(newData); onLogActivity(`Deleted campus: ${campus.name}`, 'delete'); closeModal(); }); };
  const handleManageModes = (campusId: string) => { setSelectedCampusForModes(campusId); setCampusViewMode('modes'); setIsAdding(false); setEditingKey(null); };
  
  const handleSaveMode = () => {
        if (!selectedCampusForModes) return;
        let key = modeForm.selectKey === 'others' ? modeForm.customKey.trim().toLowerCase() : modeForm.selectKey;
        if (!key) return showAlert("Error", "Mode name required");
        const cIdx = data.findIndex(c => c.id === selectedCampusForModes);
        const isEdit = editingKey !== null;
        if ((!isEdit || key !== editingKey) && data[cIdx].modes[key]) { return showAlert("Error", "Mode name already exists"); }
        showConfirm(isEdit ? 'Update Mode' : 'Add Mode', isEdit ? `Rename '${editingKey!.toUpperCase()}' to '${key.toUpperCase()}'?` : `Add mode '${key.toUpperCase()}' to ${data[cIdx].name}?`, 'info', null, () => {
            const newData = [...data]; const campus = { ...newData[cIdx] };
            if (isEdit) { const modeData = campus.modes[editingKey!]; delete campus.modes[editingKey!]; campus.modes[key] = modeData; onLogActivity(`Renamed mode '${editingKey}' to '${key}'`, 'update'); }
            else { campus.modes[key] = { count: 0, completed: 0, programmes: [] }; onLogActivity(`Added mode '${key}' to ${campus.name}`, 'create', 'program_list', { selectedCampusId: campus.id, selectedMode: key }); }
            newData[cIdx] = campus; onUpdateData(newData); setIsAdding(false); setEditingKey(null); closeModal();
        });
  };
  const handleDeleteMode = (key: string) => { if (!selectedCampusForModes) return; showConfirm('Delete Mode', `Are you sure you want to delete mode '${key.toUpperCase()}'?`, 'danger', <div className="text-sm text-red-600 dark:text-red-400 font-medium">All programmes within this mode will be lost.</div>, () => { const cIdx = data.findIndex(c => c.id === selectedCampusForModes); const newData = [...data]; const campus = { ...newData[cIdx] }; const newModes = { ...campus.modes }; delete newModes[key]; campus.modes = newModes; newData[cIdx] = campus; onUpdateData(newData); onLogActivity(`Deleted mode '${key}'`, 'delete'); closeModal(); }); };

  const handleSaveProgramme = () => {
        if (!progForm.name) return showAlert("Error", "Name required");
        const isEdit = editingIndex !== null;
        showConfirm(isEdit ? 'Update Programme' : 'Add Programme', isEdit ? 'Save changes to this programme?' : `Add '${progForm.name}'?`, 'info', null, () => {
            const newData = [...data]; const mData = newData[currentCampusIndex].modes[selectedMode];
            const navParams = { selectedCampusId: currentCampus.id, selectedMode: selectedMode, selectedProgramName: progForm.name };
            if (isEdit) { if (mData && mData.programmes) { mData.programmes[editingIndex!] = { ...mData.programmes[editingIndex!], ...progForm }; onLogActivity(`Updated programme '${progForm.name}'`, 'update', 'course_list', navParams); } }
            else { mData.programmes = [...(mData.programmes || []), { name: progForm.name!, coordinator: progForm.coordinator!, campusSection: progForm.campusSection!, courses: [] }]; mData.count = mData.programmes.length; onLogActivity(`Added prog '${progForm.name}'`, 'create', 'course_list', navParams); }
            newData[currentCampusIndex].modes[selectedMode] = mData; onUpdateData(newData); setIsAdding(false); setEditingIndex(null); setProgForm({name:'', coordinator:'', campusSection:''}); closeModal();
        });
  };
  const handleDeleteProgramme = (idx: number) => { const newData = [...data]; const mData = newData[currentCampusIndex].modes[selectedMode]; const progName = mData.programmes![idx].name; showConfirm('Delete Programme', `Delete ${progName}?`, 'danger', <div className="text-sm text-red-600 dark:text-red-400">All courses within this programme will be permanently removed.</div>, () => { mData.programmes!.splice(idx, 1); mData.count = mData.programmes!.length; onUpdateData(newData); onLogActivity(`Deleted programme ${progName}`, 'delete'); closeModal(); }); };

  const handleSaveCourse = () => {
        if (!courseForm.code) return showAlert("Error", "Code required");
        const isEdit = editingIndex !== null;
        showConfirm(isEdit ? 'Update Course' : 'Add Course', isEdit ? 'Save changes to this course?' : `Add course ${courseForm.code}?`, 'info', null, () => {
            const newData = [...data]; const prog = newData[currentCampusIndex].modes[selectedMode].programmes![selectedProgrammeIndex!];
            const navParams = { selectedCampusId: currentCampus.id, selectedMode: selectedMode, selectedProgramName: prog.name, selectedCourseCode: courseForm.code };
            if (isEdit) { const courses = prog.courses; courses[editingIndex!] = { ...courses[editingIndex!], ...courseForm as Course }; onLogActivity(`Updated course ${courseForm.code}`, 'update', 'video_progress', navParams); }
            else { prog.courses.push({ code: courseForm.code!, name: courseForm.name!, smeLead: courseForm.smeLead || '', smeTeam: '', semester: courseForm.semester || 1, progress: { sim: 0, introVideo: 0, esim: 0 }, modules: [] }); onLogActivity(`Added course ${courseForm.code}`, 'create', 'video_progress', navParams); }
            onUpdateData(newData); setIsAdding(false); setEditingIndex(null); setCourseForm({code:'', name:'', smeLead:'', semester: 1, progress: {sim:0, introVideo:0, esim:0}}); closeModal();
        });
  };
  const handleDeleteCourse = (idx: number) => { showConfirm('Delete Course', 'Are you sure you want to delete this course?', 'danger', <div className="text-sm text-red-600 dark:text-red-400">This action cannot be undone. All tasks associated with this course will be lost.</div>, () => { const newData = [...data]; newData[currentCampusIndex].modes[selectedMode].programmes![selectedProgrammeIndex!].courses.splice(idx, 1); onUpdateData(newData); closeModal(); }); };
  
  const handleSaveTask = () => {
        if (!moduleForm.subject) return showAlert("Error", "Task subject required");
        const moduleToSave = { ...moduleForm };
        const isEdit = editingIndex !== null;
        showConfirm(isEdit ? 'Update Task' : 'Add Task', isEdit ? 'Save changes to this task?' : `Add new task '${moduleForm.subject}'?`, 'info', null, () => {
                const newData = [...data]; const prog = newData[currentCampusIndex].modes[selectedMode].programmes![selectedProgrammeIndex!]; const course = prog.courses[selectedCourseIndex!];
                const navParams = { selectedCampusId: currentCampus.id, selectedMode: selectedMode, selectedProgramName: prog.name, selectedCourseCode: course.code };
                if (isEdit) { course.modules[editingIndex!] = moduleToSave; onLogActivity(`Updated task '${moduleToSave.subject}'`, 'update', 'video_progress', navParams); }
                else { course.modules.push(moduleToSave); onLogActivity(`Added task '${moduleToSave.subject}'`, 'create', 'video_progress', navParams); }
                course.progress = recalculateProgressFromModules(course.modules); onUpdateData(newData); setIsAdding(false); setEditingIndex(null); setModuleForm({subject:'', category:'common', status:'In Progress', actual:'', finishDate:'', esim:'N', sim:'N', remark:''}); closeModal();
            }
        );
  };
  const handleDeleteModule = (idx: number) => { showConfirm('Delete Task', 'Are you sure you want to delete this task?', 'danger', <div className="text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded font-medium border border-red-100 dark:border-red-900">This action cannot be undone and the data will be permanently removed.</div>, () => { const newData = [...data]; const course = newData[currentCampusIndex].modes[selectedMode].programmes![selectedProgrammeIndex!].courses[selectedCourseIndex!]; course.modules.splice(idx, 1); course.progress = recalculateProgressFromModules(course.modules); onUpdateData(newData); closeModal(); }); };

  // --- User Management Handlers ---
  const handleSaveUser = () => {
      if (!onUpdateUsers || !users) return;
      if (!userForm.username.trim()) return showAlert("Error", "Username is required");
      if (!userForm.password?.trim()) return showAlert("Error", "Password is required");
      if (userForm.role === 'campus_admin' && !userForm.assignedCampusId) return showAlert("Error", "Assigned Campus is required for Campus Admins.");

      const isEdit = editingIndex !== null;
      if (!isEdit && users.find(u => u.username === userForm.username.trim())) {
          return showAlert("Error", "Username already exists");
      }

      showConfirm(isEdit ? 'Update User' : 'Add User', isEdit ? `Update details for ${userForm.username}?` : `Create new user ${userForm.username}?`, 'info', null, () => {
          const newUsers = [...users];
          if (isEdit) {
              newUsers[editingIndex!] = userForm;
              onLogActivity(`Updated user ${userForm.username}`, 'update');
          } else {
              newUsers.push(userForm);
              onLogActivity(`Created user ${userForm.username}`, 'create');
          }
          onUpdateUsers(newUsers);
          setIsAdding(false);
          setEditingIndex(null);
          setUserForm({ username: '', password: '', role: 'campus_admin', assignedCampusId: '' });
          closeModal();
      });
  };

  const handleDeleteUser = (idx: number) => {
      if (!onUpdateUsers || !users) return;
      const userToDelete = users[idx];
      
      if (userToDelete.username === currentUser?.username) {
          return showAlert("Action Denied", "You cannot delete your own account while logged in.");
      }

      showConfirm('Delete User', `Are you sure you want to delete ${userToDelete.username}?`, 'danger', null, () => {
          const newUsers = [...users];
          newUsers.splice(idx, 1);
          onUpdateUsers(newUsers);
          onLogActivity(`Deleted user ${userToDelete.username}`, 'delete');
          closeModal();
      });
  };

  // --- Date Picker Logic ---
  const openCalendar = (field: 'actual' | 'finishDate', value: string) => {
      const relatedField = field === 'actual' ? 'finishDate' : 'actual';
      const relatedValue = moduleForm[relatedField];
      setCalendarState({ isOpen: true, field, currentValue: value, relatedValue: relatedValue });
  };
  const handleDateSelect = (date: string) => {
      const updatedModule = { ...moduleForm, [calendarState.field]: date };
      setModuleForm(updatedModule);
      if (calendarState.field === 'actual') { setCalendarState({ isOpen: true, field: 'finishDate', currentValue: updatedModule.finishDate || date, relatedValue: date }); } 
      else { setCalendarState(prev => ({ ...prev, isOpen: false })); }
  };

  // --- View Rendering ---
  const renderContentTab = () => { /* ... existing Content Tab logic ... */ 
    if (!currentCampus) return <div className="p-10 text-center text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">Select a campus to manage content</div>;

    if (selectedCourseIndex !== null && selectedProgrammeIndex !== null) {
        // ... (Task View - Unchanged)
        const prog = currentCampus.modes[selectedMode].programmes![selectedProgrammeIndex];
        const course = prog.courses[selectedCourseIndex];
        const displayCategories = ['sim', 'esim', 'intro_video', 'common'];
        const getTaskStats = (cat: ModuleData['category']) => { const tasks = course.modules.filter(m => m.category === cat); const done = tasks.filter(m => m.status === 'Done').length; const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0; return { total: tasks.length, done, pct }; };
        const simStats = getTaskStats('sim'); const esimStats = getTaskStats('esim'); const introStats = getTaskStats('intro_video');
        const semesterProgression = calculateSemesterProgress(prog.courses, course.semester || 1);

        return (
            <div className="p-6">
                 <CalendarModal isOpen={calendarState.isOpen} onClose={() => setCalendarState({...calendarState, isOpen: false})} onSelect={handleDateSelect} initialDate={calendarState.currentValue} relatedDate={calendarState.relatedValue} isStartField={calendarState.field === 'actual'} title={calendarState.field === 'actual' ? 'Select Start Date' : 'Select Finish Date'} />
                 <button onClick={() => {setSelectedCourseIndex(null); setIsAdding(false); setEditingIndex(null);}} className={btnSecondary + " mb-6"}><ChevronLeft size={16}/> Back to Courses</button>
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"><div><h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Layers className="text-unikl-orange"/> DCMS: {course.code}</h3><div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{course.name} (Semester {course.semester || 1})</div></div><button onClick={() => {setIsAdding(true); setEditingIndex(null); setModuleForm({subject:'', category:'common', status:'In Progress', actual:'', finishDate:'', esim:'N', sim:'N', remark:''})}} className={btnPrimary}><Plus size={16}/> Add Task</button></div>
                 <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800"><ProgressBar percentage={semesterProgression.avg} title={`Semester ${course.semester || 1} Overall Progression`} variant="titled" tooltip={`Average of SIM + E-Sim + Intro for all ${semesterProgression.count} courses in Semester ${course.semester || 1}`}/></div>
                 <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700"><ProgressBar percentage={simStats.pct} title="SIM Integration" variant="titled" tooltip={`${simStats.done}/${simStats.total} Tasks Completed (${simStats.pct}%)`} /><ProgressBar percentage={esimStats.pct} title="E-Sim" variant="titled" tooltip={`${esimStats.done}/${esimStats.total} Tasks Completed (${esimStats.pct}%)`} /><ProgressBar percentage={introStats.pct} title="Intro Video" variant="titled" tooltip={`${introStats.done}/${introStats.total} Tasks Completed (${introStats.pct}%)`} /></div>
                 {isAdding && ( <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg animate-in fade-in slide-in-from-top-4"><h4 className="font-bold mb-4 text-sm uppercase text-gray-500 tracking-wider">{editingIndex !== null ? 'Edit Task Details' : 'New Task Details'}</h4><div className="grid gap-6 md:grid-cols-4"><div className="md:col-span-2"><label className={labelClass}>Task Name</label><input className={inputClass} value={moduleForm.subject} onChange={e => setModuleForm({...moduleForm, subject: e.target.value})} placeholder="e.g. Scripting Phase 1" /></div><div><label className={labelClass}>Category</label><select className={inputClass} value={moduleForm.category} onChange={e => setModuleForm({...moduleForm, category: e.target.value as any})}><option value="common">Common / Other</option><option value="sim">SIM Integration</option><option value="esim">E-Sim</option><option value="intro_video">Intro Video</option></select></div><div><label className={labelClass}>Status</label><select className={inputClass} value={moduleForm.status} onChange={e => setModuleForm({...moduleForm, status: e.target.value})}><option value="In Progress">In Progress</option><option value="Done">Done</option><option value="Pending">Pending</option></select></div><div className="md:col-span-2 relative"><label className={labelClass}>Start Date</label><div className="relative"><input type="text" readOnly className={inputClass + " cursor-pointer pl-10"} value={moduleForm.actual} onClick={() => openCalendar('actual', moduleForm.actual)} placeholder="YYYY-MM-DD" /><CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/></div></div><div className="md:col-span-2 relative"><label className={labelClass}>Finish Date</label><div className="relative"><input type="text" readOnly className={inputClass + " cursor-pointer pl-10"} value={moduleForm.finishDate} onClick={() => openCalendar('finishDate', moduleForm.finishDate)} placeholder="YYYY-MM-DD" /><CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/></div></div><div className="md:col-span-4"><label className={labelClass}>Remark</label><input className={inputClass} value={moduleForm.remark} onChange={e => setModuleForm({...moduleForm, remark: e.target.value})} placeholder="Optional remarks..." /></div></div><div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700"><button onClick={() => { setIsAdding(false); setEditingIndex(null); }} className={btnSecondary}>Cancel</button><button onClick={handleSaveTask} className={btnPrimary}>{editingIndex !== null ? 'Update Task' : 'Save Task'}</button></div></div> )}
                 <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-100 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">No</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th><th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Status</th><th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Start</th><th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Finish</th><th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">Days</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remark</th><th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">Actions</th></tr></thead><tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">{displayCategories.map(catKey => { const catModules = course.modules.filter(m => m.category === catKey); if (catModules.length === 0) return null; return ( <React.Fragment key={catKey}> <tr className="bg-gray-50 dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700"> <td colSpan={8} className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider"> {catKey.replace('_', ' ')} Tasks </td> </tr> {catModules.map((mod, localIdx) => { const idx = course.modules.indexOf(mod); const isBeingEdited = editingIndex === idx; return ( <tr key={idx} className={`${isBeingEdited ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors`}> <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono">{localIdx+1}</td> <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-200 font-medium">{mod.subject}</td> <td className="px-4 py-3 text-center"><span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold border ${mod.status === 'Done' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'}`}>{mod.status}</span></td> <td className="px-4 py-3 text-center text-xs text-gray-600 dark:text-gray-400 font-mono">{mod.actual}</td> <td className="px-4 py-3 text-center text-xs text-gray-600 dark:text-gray-400 font-mono">{mod.finishDate}</td> <td className="px-4 py-3 text-center text-xs font-bold text-gray-900 dark:text-white">{calculateDaysTaken(mod.actual, mod.finishDate)}</td> <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 italic truncate max-w-[150px]">{mod.remark}</td> <td className="px-4 py-3 flex justify-center gap-2"> <button onClick={() => { setEditingIndex(idx); setModuleForm({...mod}); setIsAdding(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={btnSecondary + " px-2 py-1"} title="Edit" > <Edit2 size={14}/> </button> <button onClick={() => handleDeleteModule(idx)} className={btnDanger + " px-2 py-1"} title="Delete"><Trash2 size={14}/></button> </td> </tr> ); })} </React.Fragment> ); })} {course.modules.length === 0 && ( <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">No tasks found. Click "Add Task" to create one.</td></tr> )} </tbody></table></div>
            </div>
        );
    }
    
    // ... (rest of renderContentTab: Programme List & Main Content Tab)
    
    // ... (Programme List View) ...
    if (selectedProgrammeIndex !== null) {
        // ... (Course List View - Unchanged)
        const prog = currentCampus.modes[selectedMode].programmes![selectedProgrammeIndex];
        const coursesBySemester = prog.courses.reduce((acc, course) => { const sem = course.semester || 1; if (!acc[sem]) acc[sem] = []; acc[sem].push(course); return acc; }, {} as Record<number, Course[]>);
        const semesters = Object.keys(coursesBySemester).map(Number).sort((a, b) => a - b);
        let progSim = 0, progEsim = 0, progIntro = 0, count = 0; prog.courses.forEach(c => { progSim += c.progress.sim; progEsim += c.progress.esim; progIntro += c.progress.introVideo; count++; }); if (count > 0) { progSim=Math.round(progSim/count); progEsim=Math.round(progEsim/count); progIntro=Math.round(progIntro/count); }
        const s1Progress = calculateSemesterProgress(prog.courses, 1); const s2Progress = calculateSemesterProgress(prog.courses, 2); const s3Progress = calculateSemesterProgress(prog.courses, 3);

        return (
            <div className="p-6">
                <button onClick={() => {setSelectedProgrammeIndex(null); setIsAdding(false); setEditingIndex(null);}} className={btnSecondary + " mb-6"}><ChevronLeft size={16}/> Back to Programmes</button>
                <div className="flex justify-between items-center mb-6"><div><h3 className="text-xl font-bold text-gray-900 dark:text-white">Courses: {prog.name}</h3><div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{prog.courses.length} Courses Listed</div></div><button onClick={() => {setIsAdding(true); setEditingIndex(null); setCourseForm({code:'', name:'', smeLead:'', semester:1, progress:{sim:0,introVideo:0,esim:0}})}} className={btnPrimary}><Plus size={16}/> Add Course</button></div>
                <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800"><h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-3 uppercase tracking-wider">Semester Overall Progression (SIM + E-Sim + Intro)</h4><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><ProgressBar percentage={s1Progress.avg} title="Semester 1" variant="titled" tooltip={`Avg of all ${s1Progress.count} courses in Sem 1`} /><ProgressBar percentage={s2Progress.avg} title="Semester 2" variant="titled" tooltip={`Avg of all ${s2Progress.count} courses in Sem 2`} /><ProgressBar percentage={s3Progress.avg} title="Semester 3" variant="titled" tooltip={`Avg of all ${s3Progress.count} courses in Sem 3`} /></div></div>
                <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700"><ProgressBar percentage={progSim} title="Avg SIM Integration" variant="titled" tooltip={`Average across ${count} courses`} /><ProgressBar percentage={progEsim} title="Avg E-Sim" variant="titled" tooltip={`Average across ${count} courses`} /><ProgressBar percentage={progIntro} title="Avg Intro Video" variant="titled" tooltip={`Average across ${count} courses`} /></div>
                {isAdding && ( <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg animate-in fade-in slide-in-from-top-4"><h4 className="font-bold mb-4 text-sm uppercase text-gray-500 tracking-wider">{editingIndex !== null ? 'Edit Course Details' : 'New Course Details'}</h4><div className="grid gap-6 md:grid-cols-4"><div><label className={labelClass}>Code</label><input className={inputClass} value={courseForm.code} onChange={e => setCourseForm({...courseForm, code: e.target.value})} placeholder="e.g. CS101" /></div><div className="md:col-span-2"><label className={labelClass}>Name</label><input className={inputClass} value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} placeholder="e.g. Intro to Programming" /></div><div><label className={labelClass}>Semester</label><input type="number" className={inputClass} value={courseForm.semester} onChange={e => setCourseForm({...courseForm, semester: parseInt(e.target.value)||1})} /></div></div><div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700"><button onClick={() => {setIsAdding(false); setEditingIndex(null);}} className={btnSecondary}>Cancel</button><button onClick={handleSaveCourse} className={btnPrimary}>{editingIndex !== null ? 'Update Course' : 'Save Course'}</button></div></div> )}
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-100 dark:bg-gray-800"><tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th><th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stats (SIM/E-Sim/Intro)</th><th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">{semesters.map(sem => ( <React.Fragment key={sem}> <tr className="bg-blue-50 dark:bg-blue-900/20 border-t border-b border-gray-200 dark:border-gray-700"><td colSpan={5} className="px-6 py-2 text-sm font-bold text-unikl-blue dark:text-blue-300 uppercase tracking-wider">Semester {sem}</td></tr> {coursesBySemester[sem].map((course, idx) => { const originalIdx = prog.courses.findIndex(c => c.code === course.code); const isBeingEdited = editingIndex === originalIdx; return ( <tr key={course.code} className={`${isBeingEdited ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors`}> <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{idx+1}</td> <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{course.code}</td> <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{course.name}</td> <td className="px-6 py-4 text-center"> <div className="flex gap-2 justify-center text-xs text-gray-700 dark:text-gray-300"> <span title={`SIM: ${course.progress.sim}%`} className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 font-medium text-purple-700 dark:text-purple-300">S: {course.progress.sim}%</span> <span title={`E-SIM: ${course.progress.esim}%`} className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 font-medium text-blue-700 dark:text-blue-300">E: {course.progress.esim}%</span> <span title={`Intro Video: ${course.progress.introVideo}%`} className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 font-medium text-amber-700 dark:text-amber-300">I: {course.progress.introVideo}%</span> </div> </td> <td className="px-6 py-4 flex justify-center gap-2"> <button onClick={() => setSelectedCourseIndex(originalIdx)} className={btnSuccess + " px-2 py-1 border-gray-300 dark:border-gray-600"} title="Manage Tasks"><Layers size={14}/></button> <button onClick={() => {setEditingIndex(originalIdx); setCourseForm({...course}); setIsAdding(true); window.scrollTo({ top: 0, behavior: 'smooth' });}} className={btnSecondary + " px-2 py-1"} title="Edit"><Edit2 size={14}/></button> <button onClick={() => handleDeleteCourse(originalIdx)} className={btnDanger + " px-2 py-1"} title="Delete"><Trash2 size={14}/></button> </td> </tr> ) })} </React.Fragment> ))} {prog.courses.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No courses found.</td></tr>} </tbody></table></div>
            </div>
        );
    }

    const progs = currentCampus.modes[selectedMode].programmes || [];
    return (
        <div className="p-6">
             {/* New Selector Header */}
             <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 items-end md:items-center shadow-sm">
                
                {/* Campus Selector - Restricted for Non-Super Admin */}
                <div className="flex-1 w-full">
                    <label className={labelClass}>Selected Campus</label>
                    {isSuperAdmin ? (
                        <select 
                            className={inputClass} 
                            value={selectedCampusId} 
                            onChange={(e) => {
                                setSelectedCampusId(e.target.value);
                                setSelectedProgrammeIndex(null);
                                setSelectedCourseIndex(null);
                                const c = data.find(c => c.id === e.target.value);
                                if (c) {
                                    const modes = Object.keys(c.modes);
                                    if (modes.length > 0 && !modes.includes(selectedMode)) {
                                        setSelectedMode(modes[0]);
                                    } else if (modes.length === 0) {
                                        setSelectedMode('');
                                    }
                                }
                            }}
                        >
                            {data.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    ) : (
                        <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold text-sm shadow-sm cursor-not-allowed opacity-90">
                            <Shield size={14} className="text-blue-500" />
                            {currentCampus?.name || 'Assigned Campus'}
                        </div>
                    )}
                </div>

                {/* Mode Selector */}
                <div className="flex-1 w-full">
                    <label className={labelClass}>Programme Mode</label>
                    <select 
                        className={inputClass} 
                        value={selectedMode} 
                        onChange={(e) => {
                            setSelectedMode(e.target.value);
                            setSelectedProgrammeIndex(null);
                            setSelectedCourseIndex(null);
                        }}
                    >
                        {currentCampus && Object.keys(currentCampus.modes).length > 0 ? (
                            Object.keys(currentCampus.modes).map(m => (
                                <option key={m} value={m}>{m.toUpperCase()}</option>
                            ))
                        ) : (
                            <option value="">No Modes Configured</option>
                        )}
                    </select>
                </div>

                {/* Add Programme Button */}
                <div className="w-full md:w-auto">
                     <button onClick={() => {
                         if (!selectedMode) return showAlert("Error", "Please select a valid mode first.");
                         setIsAdding(true); 
                         setEditingIndex(null); 
                         setProgForm({name:'', coordinator:'', campusSection:''})
                     }} className={btnPrimary + " w-full md:w-auto h-[42px]"}>
                        <Plus size={16}/> Add Programme
                     </button>
                </div>
             </div>

             {/* Add Programme Form */}
             {isAdding && ( <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg animate-in fade-in slide-in-from-top-4"><h4 className="font-bold mb-4 text-sm uppercase text-gray-500 tracking-wider">{editingIndex !== null ? 'Edit Programme Details' : 'New Programme Details'}</h4><div className="grid gap-6 md:grid-cols-4"><div className="md:col-span-2"><label className={labelClass}>Name</label><input className={inputClass} value={progForm.name} onChange={e => setProgForm({...progForm, name: e.target.value})} placeholder="e.g. Bachelor of Computer Science" /></div><div><label className={labelClass}>Coordinator</label><input className={inputClass} value={progForm.coordinator} onChange={e => setProgForm({...progForm, coordinator: e.target.value})} placeholder="e.g. Dr. Smith" /></div><div><label className={labelClass}>Campus/Section</label><input className={inputClass} value={progForm.campusSection} onChange={e => setProgForm({...progForm, campusSection: e.target.value})} placeholder="e.g. FYP Section" /></div></div><div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700"><button onClick={() => {setIsAdding(false); setEditingIndex(null);}} className={btnSecondary}>Cancel</button><button onClick={handleSaveProgramme} className={btnPrimary}>{editingIndex !== null ? 'Update Programme' : 'Save Programme'}</button></div></div> )}
             
             {/* Programme Table */}
             <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-100 dark:bg-gray-800"><tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">No</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Programme Name</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Coordinator</th><th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Semester Progression (S1/S2/S3)</th><th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Actions</th></tr></thead><tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">{progs.map((prog, idx) => { const s1 = calculateSemesterProgress(prog.courses, 1); const s2 = calculateSemesterProgress(prog.courses, 2); const s3 = calculateSemesterProgress(prog.courses, 3); const isBeingEdited = editingIndex === idx; return ( <tr key={idx} className={`${isBeingEdited ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors`}> <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{idx + 1}</td> <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{prog.name}</td> <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{prog.coordinator}</td> <td className="px-6 py-4 text-center"> <div className="flex gap-2 justify-center items-center h-full"> <div className="flex flex-col items-center gap-1"> <span className="text-[10px] font-bold text-gray-400">S1</span> <div className="w-12"> <ProgressBar percentage={s1.avg} variant="compact" size="sm" tooltip={`Semester 1 Overall: ${s1.avg}% (Avg of ${s1.count} courses)`} /> </div> </div> <div className="flex flex-col items-center gap-1"> <span className="text-[10px] font-bold text-gray-400">S2</span> <div className="w-12"> <ProgressBar percentage={s2.avg} variant="compact" size="sm" tooltip={`Semester 2 Overall: ${s2.avg}% (Avg of ${s2.count} courses)`} /> </div> </div> <div className="flex flex-col items-center gap-1"> <span className="text-[10px] font-bold text-gray-400">S3</span> <div className="w-12"> <ProgressBar percentage={s3.avg} variant="compact" size="sm" tooltip={`Semester 3 Overall: ${s3.avg}% (Avg of ${s3.count} courses)`} /> </div> </div> </div> </td> <td className="px-6 py-4 flex justify-center gap-2"> <button onClick={() => setSelectedProgrammeIndex(idx)} className={btnSecondary + " px-2 py-1 text-xs"} >Courses</button> <button onClick={() => {setEditingIndex(idx); setProgForm({...prog}); setIsAdding(true); window.scrollTo({ top: 0, behavior: 'smooth' });}} className={btnSecondary + " px-2 py-1"} title="Edit"><Edit2 size={14}/></button> <button onClick={() => handleDeleteProgramme(idx)} className={btnDanger + " px-2 py-1"} title="Delete"><Trash2 size={14}/></button> </td> </tr> ); })} {progs.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No programmes found in this mode.</td></tr>} </tbody></table></div>
        </div>
    );
  }; // End of renderContentTab

  // Render Functions for Cleanliness
  const renderCampusList = () => (
    <div className="p-6">
        <div className="flex justify-between items-center mb-6"><div><h3 className="text-xl font-bold text-gray-900 dark:text-white">University Campuses</h3><div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage physical campuses and their specific mode configurations.</div></div>{isSuperAdmin && <button onClick={() => {
            setIsAdding(true); 
            setEditingIndex(null); 
            const defaultName = CAMPUS_PRESETS[0];
            setCampusForm({id: generateCampusId(defaultName), name: defaultName}); 
            setCampusNameMode('preset');
        }} className={btnPrimary}><Plus size={16}/> Add Campus</button>}</div>
        {isAdding && ( 
            <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg animate-in fade-in slide-in-from-top-4">
                {/* ... Add Campus Form (Same as before) ... */}
                <h4 className="font-bold mb-4 text-sm uppercase text-gray-500 tracking-wider">{editingIndex !== null ? 'Edit Campus Details' : 'New Campus Details'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Campus Name</label>
                        {editingIndex === null ? (
                            <>
                                <select 
                                    className={inputClass}
                                    value={campusNameMode === 'custom' ? 'Custom' : (CAMPUS_PRESETS.includes(campusForm.name) ? campusForm.name : 'Custom')}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === 'Custom') {
                                            setCampusNameMode('custom');
                                            setCampusForm(prev => ({...prev, name: '', id: ''}));
                                        } else {
                                            setCampusNameMode('preset');
                                            const newId = generateCampusId(val);
                                            setCampusForm({name: val, id: newId});
                                        }
                                    }}
                                >
                                    {CAMPUS_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                                    <option value="Custom">Custom</option>
                                </select>
                                {campusNameMode === 'custom' && (
                                    <input 
                                        className={inputClass + " mt-2"} 
                                        placeholder="Enter custom campus name" 
                                        value={campusForm.name} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const newId = generateCampusId(val);
                                            setCampusForm({name: val, id: newId});
                                        }} 
                                        autoFocus
                                    />
                                )}
                            </>
                        ) : (
                            <input 
                                className={inputClass} 
                                value={campusForm.name} 
                                onChange={(e) => setCampusForm({...campusForm, name: e.target.value})} 
                            />
                        )}
                    </div>
                    <div>
                        <label className={labelClass}>Campus ID (Unique)</label>
                        <input 
                            className={inputClass} 
                            placeholder="e.g. miit" 
                            value={campusForm.id} 
                            onChange={e => setCampusForm({...campusForm, id: e.target.value})} 
                            disabled={editingIndex !== null} 
                        />
                        <div className="text-xs text-gray-400 mt-1">{editingIndex !== null ? "Cannot be changed." : "Auto-generated based on name. You can edit this manually."}</div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={() => {setIsAdding(false); setEditingIndex(null);}} className={btnSecondary}>Cancel</button>
                    <button onClick={handleSaveCampus} className={btnPrimary}>{editingIndex !== null ? 'Update Campus' : 'Save Campus'}</button>
                </div>
            </div> 
        )}
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-100 dark:bg-gray-800"><tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th><th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-48">Actions</th></tr></thead><tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
        {managedCampuses.map((c, idx) => { 
            // Important: Find original index in full data for edit/delete functions which rely on full data index
            const originalIdx = data.findIndex(item => item.id === c.id);
            const isBeingEdited = editingIndex === originalIdx; 
            return ( <tr key={c.id} className={`${isBeingEdited ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors`}> <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{c.id}</td> <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{c.name}</td> <td className="px-6 py-4 flex justify-center gap-2"> <button onClick={() => handleManageModes(c.id)} className={btnSecondary + " px-3 py-1 text-xs"}>Manage Modes</button> {isSuperAdmin && ( <> <button onClick={() => {setEditingIndex(originalIdx); setCampusForm({id: c.id, name: c.name}); setIsAdding(true); window.scrollTo({ top: 0, behavior: 'smooth' });}} className={btnSecondary + " px-2 py-1"} title="Edit Name"><Edit2 size={14}/></button> <button onClick={() => handleDeleteCampus(originalIdx)} className={btnDanger + " px-2 py-1"} title="Delete"><Trash2 size={14}/></button> </> )} </td> </tr> ); 
        })}
        </tbody></table></div>
     </div>
  );

  const renderModesList = () => (
    <div className="p-6">
        <button onClick={() => setCampusViewMode('list')} className={btnSecondary + " mb-6"}><ChevronLeft size={16}/> Back to Campuses</button>
        <div className="flex justify-between items-center mb-6"><div><h3 className="text-xl font-bold text-gray-900 dark:text-white">Modes for {data.find(c=>c.id===selectedCampusForModes)?.name}</h3><div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure active modes for this campus.</div></div><button onClick={() => {setIsAdding(true); setEditingKey(null); setModeForm({selectKey:'odl', customKey:''})}} className={btnPrimary}><Plus size={16}/> Add Mode</button></div>
        {isAdding && ( <div className="mb-8 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col md:flex-row gap-4 items-end animate-in fade-in slide-in-from-top-4 shadow-lg"><div className="flex-1 w-full"><label className={labelClass}>Select Mode</label><select className={inputClass} value={modeForm.selectKey} onChange={e => { const val = e.target.value; setModeForm(prev => ({ ...prev, selectKey: val, customKey: val !== 'others' ? '' : prev.customKey })); }} > <option value="odl">ODL</option> <option value="mc">MC</option> <option value="mooc">MOOC</option> <option value="bridging">Bridging</option> <option value="huffaz">Huffaz</option> <option value="others">Others (Custom)</option> </select></div>{modeForm.selectKey === 'others' && ( <div className="flex-1 w-full"><label className={labelClass}>Custom Key</label><input className={inputClass} placeholder="e.g. short-course" value={modeForm.customKey} onChange={e => setModeForm({...modeForm, customKey: e.target.value})} /></div> )}<div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0"><button onClick={() => { setIsAdding(false); setEditingKey(null); }} className={btnSecondary + " flex-1"}>Cancel</button><button onClick={handleSaveMode} className={btnPrimary + " flex-1"}>{editingKey ? 'Update Mode' : 'Save Mode'}</button></div></div> )}
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-100 dark:bg-gray-800"><tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Key</th><th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Programmes</th><th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40">Actions</th></tr></thead><tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">{Object.entries(data.find(c=>c.id===selectedCampusForModes)?.modes || {}).map(([k,v]) => { const isBeingEdited = editingKey === k; return ( <tr key={k} className={`${isBeingEdited ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors`}> <td className="px-6 py-4 uppercase font-bold text-sm text-gray-900 dark:text-white">{k}</td> <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">{(v as ModeData).programmes?.length||0}</td> <td className="px-6 py-4 text-center flex justify-center gap-2"> <button onClick={() => { setEditingKey(k); setIsAdding(true); const standardModes = ['odl', 'mc', 'mooc', 'bridging', 'huffaz']; const isStandard = standardModes.includes(k); setModeForm({ selectKey: isStandard ? k : 'others', customKey: isStandard ? '' : k, originalKey: k }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={btnSecondary + " px-2 py-1"} title="Edit" > <Edit2 size={14}/> </button> <button onClick={() => handleDeleteMode(k)} className={btnDanger + " px-2 py-1"} title="Delete"><Trash2 size={14}/></button> </td> </tr> ); })}{Object.keys(data.find(c=>c.id===selectedCampusForModes)?.modes || {}).length === 0 && <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">No modes configured for this campus.</td></tr>}</tbody></table></div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="p-6">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="text-unikl-blue" /> User Management
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and manage admin accounts for the system.</div>
            </div>
            <button onClick={() => {
                setIsAdding(true); 
                setEditingIndex(null); 
                setUserForm({ 
                    username: '', 
                    password: 'admin123', 
                    role: 'campus_admin', 
                    assignedCampusId: data.length > 0 ? data[0].id : '' 
                });
            }} className={btnPrimary}>
                <UserPlus size={16}/> Add User
            </button>
        </div>

        {isAdding && (
            <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg animate-in fade-in slide-in-from-top-4">
                <h4 className="font-bold mb-4 text-sm uppercase text-gray-500 tracking-wider">
                    {editingIndex !== null ? 'Edit User Details' : 'New User Details'}
                </h4>
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Username</label>
                        <input className={inputClass} value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} placeholder="e.g. campus_admin" />
                    </div>
                    <div>
                        <label className={labelClass}>Password</label>
                        <input type="text" className={inputClass} value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} placeholder="Set password" />
                        {editingIndex === null && <div className="text-xs text-gray-400 mt-1">Default: admin123</div>}
                    </div>
                    <div>
                        <label className={labelClass}>Role</label>
                        <select className={inputClass} value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})}>
                            <option value="super_admin">Super Admin</option>
                            <option value="campus_admin">Campus Admin</option>
                        </select>
                    </div>
                    {userForm.role === 'campus_admin' && (
                        <div>
                            <label className={labelClass}>Assigned Campus</label>
                            <select 
                                className={inputClass} 
                                value={userForm.assignedCampusId} 
                                onChange={(e) => setUserForm({...userForm, assignedCampusId: e.target.value})}
                                disabled={data.length === 0}
                            >
                                {data.length === 0 && <option value="">No Campuses Available</option>}
                                {data.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
                            </select>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-start gap-1.5">
                                <Info size={14} className="shrink-0 mt-0.5 text-unikl-blue dark:text-blue-400" />
                                <span>
                                    List only shows existing campuses. To add a new one, go to the 
                                    <span className="font-bold text-gray-700 dark:text-gray-300"> Campus Structure</span> tab first.
                                </span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={() => {setIsAdding(false); setEditingIndex(null);}} className={btnSecondary}>Cancel</button>
                    <button onClick={handleSaveUser} className={btnPrimary}>{editingIndex !== null ? 'Update User' : 'Create User'}</button>
                </div>
            </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned Campus</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {users?.map((u, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {u.role === 'super_admin' ? <Shield size={14} className="text-unikl-orange"/> : <Users size={14} className="text-blue-500"/>}
                                {u.username}
                                {currentUser?.username === u.username && <span className="ml-2 text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded border border-green-200 uppercase">You</span>}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 capitalize">{u.role.replace('_', ' ')}</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                {u.assignedCampusId ? data.find(c => c.id === u.assignedCampusId)?.name || <span className="text-red-500 flex items-center gap-1"><AlertCircle size={12}/> Invalid ID ({u.assignedCampusId})</span> : <span className="text-gray-400 italic">All Access</span>}
                            </td>
                            <td className="px-6 py-4 flex justify-center gap-2">
                                <button 
                                    onClick={() => { setEditingIndex(idx); setUserForm({...u}); setIsAdding(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                                    className={btnSecondary + " px-2 py-1"} 
                                    title="Edit"
                                >
                                    <Edit2 size={14}/>
                                </button>
                                <button onClick={() => handleDeleteUser(idx)} className={btnDanger + " px-2 py-1 " + (currentUser?.username === u.username ? "opacity-50 cursor-not-allowed" : "")} title="Delete" disabled={currentUser?.username === u.username}>
                                    <Trash2 size={14}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  // Main Return
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[500px] relative">
        {modal.isOpen && (
            <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center transform transition-all scale-100">
                    <div className={`mb-4 p-4 rounded-full ${modal.type === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : (modal.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-unikl-blue text-white')}`}>
                        {modal.type === 'danger' && <AlertCircle size={32}/>} {modal.type === 'warning' && <AlertTriangle size={32}/>} {modal.type === 'info' && <Info size={32}/>} {modal.type === 'success' && <Check size={32}/>}
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{modal.title}</h3>
                    <div className="mb-6 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{modal.message}</div>
                    {modal.dataSummary && <div className="mb-6 w-full text-left">{modal.dataSummary}</div>}
                    <div className="flex gap-3 w-full">
                        {modal.mode === 'confirm' && (<button onClick={closeModal} className="flex-1 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">Cancel</button>)}
                        <button onClick={modal.onConfirm || closeModal} className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95 ${modal.type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none' : 'bg-unikl-orange hover:bg-orange-600 shadow-orange-200 dark:shadow-none'}`}>
                            {modal.confirmLabel ? modal.confirmLabel : (modal.mode === 'confirm' ? 'Confirm' : 'Okay')}
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button onClick={() => handleTabChange('campuses')} className={`flex-1 py-4 font-bold border-b-2 text-sm uppercase tracking-wide transition-colors ${activeTab==='campuses'?'border-unikl-orange text-unikl-orange bg-white dark:bg-gray-800':'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>Campus Structure</button>
            <button onClick={() => handleTabChange('content')} className={`flex-1 py-4 font-bold border-b-2 text-sm uppercase tracking-wide transition-colors ${activeTab==='content'?'border-unikl-orange text-unikl-orange bg-white dark:bg-gray-800':'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>Content Management</button>
            {isSuperAdmin && (
                <button onClick={() => handleTabChange('users')} className={`flex-1 py-4 font-bold border-b-2 text-sm uppercase tracking-wide transition-colors ${activeTab==='users'?'border-unikl-orange text-unikl-orange bg-white dark:bg-gray-800':'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>User Management</button>
            )}
        </div>

        {/* Animated Tab Content Wrapper */}
        <div key={`${activeTab}-${campusViewMode}`} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === 'campuses' ? (
                campusViewMode === 'list' ? renderCampusList() : renderModesList()
            ) : activeTab === 'users' && isSuperAdmin ? (
                renderUserManagement()
            ) : (
                renderContentTab()
            )}
        </div>
    </div>
  );
};
