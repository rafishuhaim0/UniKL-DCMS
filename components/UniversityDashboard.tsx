
import React, { useState, useRef, useEffect } from 'react';
import { PieChart, StackedBarChart, ChartData, StackedBarData } from './DashboardCharts';
import { Campus, ModeData, Programme, Course } from '../types';
import { CheckCircle, TrendingUp, Layers, GraduationCap, Info, FileText, ChevronDown, Printer, Download } from 'lucide-react';
import { CampusOverview } from './CampusOverview';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface UniversityDashboardProps {
  data: Campus[]; // Receives dynamic data
  onNavigateToCampus: (campusId: string) => void;
}

// Custom Interactive Tooltip
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

// Define consistent color palette for Modes
const MODE_COLORS: Record<string, string> = {
    odl: '#4f46e5',      // Indigo
    mc: '#0ea5e9',       // Sky
    mooc: '#8b5cf6',     // Violet
    bridging: '#f59e0b', // Amber
    huffaz: '#10b981',   // Emerald
    other: '#64748b'     // Slate
};

const getModeColor = (mode: string) => {
    const key = mode.toLowerCase();
    return MODE_COLORS[key] || MODE_COLORS['other'];
};

export const UniversityDashboard: React.FC<UniversityDashboardProps> = ({ data, onNavigateToCampus }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
              setShowExportMenu(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // 1. Dynamic Calculation of High Level Stats
  const totalCampuses = data.length;
  // Total Programmes Calculation
  const totalProgrammes = data.reduce((acc, c) => {
      const campusProgs = (Object.values(c.modes) as ModeData[]).reduce((sum, m) => sum + (m.programmes?.length || 0), 0);
      return acc + campusProgs;
  }, 0);

  const completedCourses = data.reduce((acc, c) => acc + c.completedCourses, 0);
  const totalCourses = data.reduce((acc, c) => acc + c.totalCourses, 0);
  const progressPercentage = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  // 2. Aggregate Global Mode Stats for Pie Chart + Breakdown
  const globalModeStats: Record<string, { count: number, breakdown: { label: string, value: number }[] }> = {};
  
  data.forEach(campus => {
    Object.entries(campus.modes).forEach(([mode, val]) => {
      const modeData = val as ModeData;
      if (modeData.count > 0) {
        const key = mode.toLowerCase();
        
        if (!globalModeStats[key]) {
            globalModeStats[key] = { count: 0, breakdown: [] };
        }
        
        globalModeStats[key].count += modeData.count;
        globalModeStats[key].breakdown.push({
            label: campus.name,
            value: modeData.count
        });
      }
    });
  });

  const pieData: ChartData[] = Object.entries(globalModeStats).map(([key, data]) => ({
    label: key.toUpperCase(),
    value: data.count,
    color: getModeColor(key),
    breakdown: data.breakdown
  })).filter(d => d.value > 0);

  // 3. Prepare Campus Mode Breakdown for Stacked Bar Chart
  const stackedBarData: StackedBarData[] = data.map(campus => {
      const segments = Object.entries(campus.modes).map(([mode, val]) => {
          const mData = val as ModeData;
          return {
            label: mode.toUpperCase(),
            value: mData.count,
            completed: mData.completed, // Include completed count
            color: getModeColor(mode)
          };
      }).filter(s => s.value > 0);

      // Sort segments to match legend order (optional, but looks better)
      segments.sort((a, b) => {
          const order = ['odl', 'mc', 'mooc', 'bridging', 'huffaz'];
          return order.indexOf(a.label.toLowerCase()) - order.indexOf(b.label.toLowerCase());
      });

      return {
          label: campus.name,
          total: campus.totalCourses,
          segments: segments
      };
  });

  const calcAvg = (c: Course) => Math.round((c.progress.sim + c.progress.esim + c.progress.introVideo) / 3);

  // --- PDF Report Generation Logic ---
  const handleGeneratePDF = (action: 'download' | 'preview') => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleDateString();

    // -- Header --
    doc.setFillColor(39, 46, 99); // UniKL Blue
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("UniKL Digital Course Management System", 14, 13);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Comprehensive Progress Report | Generated: ${timestamp}`, 14, 28);

    // -- Section 1: Overview --
    doc.setFontSize(12);
    doc.setTextColor(240, 143, 0); // UniKL Orange
    doc.text("1. University Overview", 14, 40);

    autoTable(doc, {
        startY: 45,
        head: [['Metric', 'Value', 'Metric', 'Value']],
        body: [
            ['Total Campuses', totalCampuses, 'Total Programmes', totalProgrammes],
            ['Total Courses', totalCourses, 'Courses Completed', completedCourses],
            ['Overall Progress', `${progressPercentage}%`, '', '']
        ],
        theme: 'striped',
        headStyles: { fillColor: [240, 143, 0] },
        styles: { fontSize: 10 }
    });

    // -- Section 2: Mode Stats --
    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY || 60;
    doc.text("2. Mode Statistics", 14, finalY + 15);
    
    const modeRows = pieData.map(d => [d.label, d.value]);
    autoTable(doc, {
        startY: finalY + 20,
        head: [['Mode', 'Total Courses']],
        body: modeRows,
        theme: 'grid',
        headStyles: { fillColor: [240, 143, 0] },
        styles: { fontSize: 10 },
        columnStyles: { 0: { fontStyle: 'bold' } }
    });

    // -- Section 3: Campus Summary --
    // @ts-ignore
    finalY = doc.lastAutoTable.finalY;
    doc.text("3. Campus Performance Summary", 14, finalY + 15);

    const campusRows = data.map(c => {
        const pct = c.totalCourses > 0 ? Math.round((c.completedCourses / c.totalCourses) * 100) : 0;
        return [c.name, c.totalCourses, c.completedCourses, `${pct}%`];
    });

    autoTable(doc, {
        startY: finalY + 20,
        head: [['Campus', 'Total', 'Done', 'Progress']],
        body: campusRows,
        theme: 'striped',
        headStyles: { fillColor: [39, 46, 99] }, // Blue Header
        styles: { fontSize: 9 }
    });

    // -- Section 4: Detailed Breakdown --
    // @ts-ignore
    finalY = doc.lastAutoTable.finalY;
    
    // Check if we need a new page for detailed
    if (finalY > 200) {
        doc.addPage();
        finalY = 20;
    } else {
        finalY += 15;
    }
    
    doc.setTextColor(240, 143, 0);
    doc.text("4. Detailed Course Breakdown", 14, finalY);

    const detailRows: any[][] = [];
    data.forEach(campus => {
        Object.entries(campus.modes).forEach(([modeKey, modeData]) => {
            const mData = modeData as ModeData;
            if (mData.programmes) {
                mData.programmes.forEach(prog => {
                    prog.courses.forEach(course => {
                        detailRows.push([
                            campus.name,
                            modeKey.toUpperCase(),
                            course.code,
                            // Truncate course name slightly for PDF fit
                            course.name.length > 25 ? course.name.substring(0, 25) + '...' : course.name,
                            course.smeLead.length > 15 ? course.smeLead.substring(0,15) + '...' : course.smeLead,
                            `${calcAvg(course)}%`,
                            `${course.progress.sim}%`,
                            `${course.progress.esim}%`,
                            `${course.progress.introVideo}%`
                        ]);
                    });
                });
            }
        });
    });

    autoTable(doc, {
        startY: finalY + 5,
        head: [['Campus', 'Mode', 'Code', 'Course', 'SME', 'All', 'SIM', 'ESIM', 'Vid']],
        body: detailRows,
        theme: 'grid',
        headStyles: { fillColor: [39, 46, 99], fontSize: 8 },
        styles: { fontSize: 7, cellPadding: 2 },
        columnStyles: {
            0: { cellWidth: 25 },
            3: { cellWidth: 40 }, // Course Name wider
            5: { fontStyle: 'bold' } // Overall bold
        }
    });

    if (action === 'download') {
        doc.save(`UniKL_DCMS_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } else {
        // Preview Mode: Open in new window
        window.open(doc.output('bloburl'), '_blank');
    }
    setShowExportMenu(false);
  };
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header with Download Action */}
      <div className="flex justify-end gap-3 mb-[-20px] relative z-10">
          <div className="relative z-20" ref={exportMenuRef}>
            <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all font-bold text-sm"
                title="Export Options"
            >
                <FileText size={18} />
                <span>Export Report</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                    <button
                        onClick={() => handleGeneratePDF('preview')}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                        <Printer size={16} className="text-gray-400" />
                        Preview / Print
                    </button>
                    <button
                        onClick={() => handleGeneratePDF('download')}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700 transition-colors"
                    >
                        <Download size={16} className="text-gray-400" />
                        Download PDF
                    </button>
                </div>
            )}
          </div>
      </div>

      {/* 1. Hero Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Programmes */}
        <div className="relative group bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-blue-500"></div>
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <GraduationCap size={20} />
                </div>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{totalProgrammes}</h3>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                Total Programmes
                <InteractiveTooltip content={
                    <div className="space-y-1">
                        <div className="font-bold border-b border-gray-600 pb-1 mb-1">Breakdown by Campus</div>
                        {data.map(c => {
                            const count = (Object.values(c.modes) as ModeData[]).reduce((s, m) => s + (m.programmes?.length || 0), 0);
                            if (count === 0) return null;
                            return <div key={c.id} className="flex justify-between gap-4"><span>{c.name}</span><span className="font-bold">{count}</span></div>
                        })}
                    </div>
                } />
            </div>
        </div>

        {/* Completed Courses */}
        <div className="relative group bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-green-500"></div>
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                    <CheckCircle size={20} />
                </div>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{completedCourses}</h3>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                Courses Completed
                <InteractiveTooltip content={
                    <div className="space-y-1">
                        <div className="font-bold border-b border-gray-600 pb-1 mb-1">Top Performers</div>
                        {data.slice().sort((a,b) => b.completedCourses - a.completedCourses).slice(0, 3).map(c => (
                            <div key={c.id} className="flex justify-between gap-4"><span>{c.name}</span><span className="font-bold">{c.completedCourses}</span></div>
                        ))}
                    </div>
                } />
            </div>
        </div>

        {/* Overall Progress */}
        <div className="relative group bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-indigo-500"></div>
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-indigo-50 dark:bg-blue-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <TrendingUp size={20} />
                </div>
            </div>
            <div className="flex items-end gap-2 mb-1">
                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{progressPercentage}%</h3>
                <span className="text-xs font-medium text-gray-400 mb-1.5">Global</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mt-2">
                Overall Progress
                <InteractiveTooltip content="Weighted average based on total completed digital courses across all campuses and modes." />
            </div>
        </div>

        {/* Total Campuses */}
        <div className="relative group bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-amber-500"></div>
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                    <Layers size={20} />
                </div>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{totalCampuses}</h3>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                Active Campuses
                <InteractiveTooltip content={
                    <div className="space-y-1">
                        <div className="font-bold border-b border-gray-600 pb-1 mb-1">Participating Locations</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {data.map(c => <span key={c.id} className="whitespace-nowrap">{c.name}</span>)}
                        </div>
                    </div>
                } />
            </div>
        </div>
      </div>

      {/* 2. Visualizations Section - Card Style */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pie Chart Card */}
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-unikl-blue"></div>
          <div className="mb-6 pl-2">
             <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                Programme Modes
             </h3>
             <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Distribution across university</div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            {pieData.length > 0 ? (
                <>
                    <PieChart data={pieData} />
                    <div className="mt-8 grid grid-cols-2 gap-3 w-full">
                    {pieData.map((d, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: d.color }}></span>
                                <span className="font-bold text-gray-600 dark:text-gray-300">{d.label}</span>
                            </div>
                            <span className="font-mono font-bold text-gray-900 dark:text-white">{d.value}</span>
                        </div>
                    ))}
                    </div>
                </>
            ) : (
                <div className="text-gray-400 py-10 italic">No Mode Data Available</div>
            )}
          </div>
        </div>

        {/* Stacked Bar Chart Card */}
        <div className="lg:col-span-2 relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
             <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-unikl-orange"></div>
             <div className="mb-6 pl-2 flex justify-between items-end">
                <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Mode Distribution by Campus</h3>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Detailed breakdown per location</div>
                </div>
             </div>
             
             {stackedBarData.length > 0 ? (
                <StackedBarChart data={stackedBarData} />
             ) : (
                <div className="text-gray-400 p-10 text-center italic">No Campus Data Available</div>
             )}
        </div>
      </div>

      {/* 3. Campus List Drill Down - Grid Layout (Reused Component) */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-emerald-500"></div>
            <CampusOverview campuses={data} onNavigate={onNavigateToCampus} />
      </div>
    </div>
  );
};
