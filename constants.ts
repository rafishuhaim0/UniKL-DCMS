
import { Campus, ActivityItem, User } from './types';

export const UNIVERSITY_STATS = {
  totalCampuses: 12,
  totalCourses: 345,
  completedCourses: 182,
  modes: {
    odl: { count: 120, color: '#4f46e5' },      // Indigo
    mc: { count: 85, color: '#0ea5e9' },       // Sky
    mooc: { count: 45, color: '#8b5cf6' },     // Violet
    bridging: { count: 60, color: '#f59e0b' }, // Amber
    huffaz: { count: 35, color: '#10b981' },   // Emerald
  }
};

export const INITIAL_USERS: User[] = [
    { username: 'super_admin', password: 'admin123', role: 'super_admin' },
    { username: 'miit_admin', password: 'admin123', role: 'campus_admin', assignedCampusId: 'miit' },
    { username: 'bis_admin', password: 'admin123', role: 'campus_admin', assignedCampusId: 'bis' }
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
    { id: '1', type: 'announcement', message: 'Welcome to the new UniKL DCMS (Digital Course Management System)!', timestamp: new Date(Date.now() - 86400000).toISOString(), author: 'System' },
    { id: '2', type: 'update', message: 'Updated progress for course IRL60203', timestamp: new Date(Date.now() - 3600000).toISOString(), author: 'Admin' },
    { id: '3', type: 'create', message: 'Added new module to Research Methodology', timestamp: new Date(Date.now() - 1800000).toISOString(), author: 'Admin' }
];

export const APP_DATA: Campus[] = [
  {
    id: 'miit',
    name: 'UniKL MIIT',
    totalCourses: 42,
    completedCourses: 15,
    modes: {
      mc: { count: 10, completed: 8 },
      mooc: { count: 5, completed: 2 },
      bridging: { count: 4, completed: 4 },
      odl: {
        count: 15,
        completed: 10,
        programmes: [
          {
            name: 'Master In Computer Science',
            coordinator: 'Ts Dr Suzana Basaruddin',
            campusSection: 'MIIT Post Graduate Section',
            totalSubjectsCount: 19, 
            courses: [
              {
                code: 'IRL60203',
                name: 'Advanced Computer Science',
                smeLead: 'AP Ts Dr Munaisyah Abdullah',
                smeTeam: 'Prof Dr Shahriza Musa',
                semester: 1, // Semester 1
                progress: {
                  sim: 100,
                  introVideo: 100,
                  esim: 20,
                },
                modules: [
                  {
                    subject: 'Editing 10 Second Introduction',
                    category: 'intro_video',
                    status: 'Done',
                    actual: '2025-11-03',
                    finishDate: '2025-11-04',
                    esim: 'N',
                    sim: 'N',
                    remark: 'Completed ahead of target',
                  },
                  {
                    subject: 'Finding Asset for Slideshow',
                    category: 'intro_video',
                    status: 'Done',
                    actual: '2025-11-05',
                    finishDate: '2025-11-06',
                    esim: 'N',
                    sim: 'N',
                    remark: 'Assets approved',
                  },
                  {
                    subject: 'Sim Scripting',
                    category: 'sim',
                    status: 'Done',
                    actual: '2025-11-01',
                    finishDate: '2025-11-02',
                    esim: 'N',
                    sim: 'Y',
                    remark: '',
                  },
                  {
                    subject: 'Initial E-Sim Setup',
                    category: 'esim',
                    status: 'In Progress',
                    actual: '2025-11-10',
                    finishDate: '',
                    esim: 'Y',
                    sim: 'N',
                    remark: '',
                  }
                ],
              },
              {
                code: 'IMR60103',
                name: 'Research Methodology',
                smeLead: 'Dr Farah Hanan',
                smeTeam: 'Dr Adlina Ahmad',
                semester: 2, // Semester 2
                progress: {
                  sim: 20,
                  introVideo: 10,
                  esim: 30,
                },
                modules: [
                  {
                    subject: 'Research Design Module',
                    category: 'esim',
                    status: 'In Progress',
                    actual: '2025-12-01',
                    finishDate: '',
                    esim: 'Y',
                    sim: 'N',
                    remark: 'Waiting for footage.',
                  },
                ],
              },
            ],
          },
        ],
      },
      huffaz: { count: 8, completed: 3 },
      others: { count: 0, completed: 0 },
    },
  },
  {
    id: 'bis',
    name: 'UniKL BiS',
    totalCourses: 28,
    completedCourses: 12,
    modes: {
      mc: { count: 5, completed: 5 },
      mooc: { count: 3, completed: 1 },
      bridging: { count: 2, completed: 2 },
      odl: {
        count: 10,
        completed: 2,
        programmes: [
            {
                name: 'Bachelor in International Business',
                coordinator: 'Dr. Aminah Yasin',
                campusSection: 'BiS Undergraduate',
                courses: []
            }
        ]
      },
      huffaz: { count: 8, completed: 2 },
      others: { count: 0, completed: 0 },
    },
  },
];
