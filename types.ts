
export interface ModuleData {
  subject: string; // Mapped to "Task" in UI
  category: 'sim' | 'esim' | 'intro_video' | 'common'; // New field for grouping
  status: string;
  actual: string; // Mapped to "Start Date" in UI (YYYY-MM-DD)
  finishDate: string; // New field (YYYY-MM-DD)
  esim: string; // Legacy field kept for compatibility or reference
  sim: string; // Legacy field kept for compatibility or reference
  remark: string;
}

export interface CourseProgress {
  sim: number;
  introVideo: number;
  esim: number; // Simplified: S1/S2/S3 logic now handled by Course.semester
}

export interface Course {
  code: string;
  name: string;
  smeLead: string;
  smeTeam: string;
  semester: number; // New field: 1, 2, 3, etc.
  progress: CourseProgress;
  modules: ModuleData[];
}

export interface Programme {
  name: string;
  coordinator: string;
  campusSection: string;
  courses: Course[];
  totalSubjectsCount?: number;
}

export interface ModeData {
  count: number;
  completed: number;
  programmes?: Programme[];
}

// Changed to Record to allow dynamic creation of modes
export type CampusModes = Record<string, ModeData>;

export interface Campus {
  id: string;
  name: string;
  totalCourses: number;
  completedCourses: number;
  modes: CampusModes;
}

export interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'announcement';
  message: string;
  timestamp: string; // ISO string
  author?: string;
  // Navigation Metadata
  targetView?: ViewState;
  targetParams?: Record<string, any>;
}

// --- Auth Types ---
export type UserRole = 'super_admin' | 'campus_admin';

export interface User {
    username: string;
    password?: string; // Added for dynamic auth management
    role: UserRole;
    assignedCampusId?: string; // Optional, only for campus_admin
}

export type ViewState = 'university_dashboard' | 'campus_overview' | 'mode_breakdown' | 'program_list' | 'course_list' | 'video_progress' | 'login' | 'admin_panel';

export interface AppState {
  currentView: ViewState;
  selectedCampusId: string | null;
  selectedMode: string | null; // Changed from keyof CampusModes
  selectedProgramName: string | null;
  selectedCourseCode: string | null;
  isLoggedIn: boolean;
  currentUser?: User; // Added to track logged in user details
}
