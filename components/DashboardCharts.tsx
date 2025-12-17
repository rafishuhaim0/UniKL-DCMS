
import React, { useState, useRef } from 'react';

// --- Colors & Types ---
export interface ChartData {
  label: string;
  value: number;
  color: string;
  breakdown?: { label: string; value: number }[]; // Detailed breakdown (e.g., by campus)
}

export interface StackedBarData {
  label: string;
  total: number;
  segments: {
    label: string;
    value: number;
    completed: number; // Added for detailed tooltip
    color: string;
  }[];
}

// --- Pie Chart ---
interface PieChartProps {
  data: ChartData[];
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativePercent = 0;

  // Calculate coordinates with -90 degree offset (starting at 12 o'clock)
  const getCoordinatesForPercent = (percent: number) => {
    const angle = 2 * Math.PI * percent - Math.PI / 2;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    return [x, y];
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }
  };

  return (
    <div 
        className="relative w-full max-w-[320px] mx-auto group" 
        ref={containerRef}
        onMouseMove={handleMouseMove}
    >
      <div className="relative w-64 h-64 mx-auto">
        <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full">
            {data.map((slice, index) => {
            const startPercent = cumulativePercent;
            const slicePercent = slice.value / total;
            cumulativePercent += slicePercent;
            const endPercent = cumulativePercent;

            const [startX, startY] = getCoordinatesForPercent(startPercent);
            const [endX, endY] = getCoordinatesForPercent(endPercent);

            const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
            
            // Calculate label position (centroid of the slice arc)
            const midPercent = startPercent + slicePercent / 2;
            const labelRadius = 0.80; // Position text inside the slice
            const [labelX, labelY] = getCoordinatesForPercent(midPercent);
            
            const isHovered = hoveredIndex === index;

            // If slice is 100%, draw a full circle
            if (slicePercent === 1) {
                return (
                <g key={index}>
                    <circle
                        cx="0"
                        cy="0"
                        r="1"
                        fill={slice.color}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    />
                     <text 
                        x="0" y="0" 
                        fill="white" 
                        fontSize="0.2" 
                        fontWeight="bold" 
                        textAnchor="middle" 
                        dominantBaseline="middle"
                    >
                        {slice.label}
                    </text>
                </g>
                );
            }

            const pathData = [
                `M 0 0`,
                `L ${startX} ${startY}`,
                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `Z`
            ].join(' ');

            return (
                <g key={index}>
                    <path 
                        d={pathData} 
                        fill={slice.color} 
                        className="transition-all duration-300 ease-out cursor-pointer"
                        style={{ 
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)', 
                            transformOrigin: 'center',
                            opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    />
                    {/* Render Text Label - Forced on all slices, no rotation needed */}
                    <text
                        x={labelX * labelRadius}
                        y={labelY * labelRadius}
                        fill="white"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="pointer-events-none drop-shadow-md"
                        style={{ opacity: isHovered ? 1 : 0.9 }}
                    >
                        <tspan x={labelX * labelRadius} dy="-0.08em" fontSize="0.10" fontWeight="bold">{slice.label}</tspan>
                        <tspan x={labelX * labelRadius} dy="1.2em" fontSize="0.09">({slice.value})</tspan>
                    </text>
                </g>
            );
            })}
            {/* Inner circle for Donut effect - Adaptive Color */}
            <circle cx="0" cy="0" r="0.50" className="fill-white dark:fill-gray-800 transition-colors" />
        </svg>

        {/* Central Label */}
        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
            <div className="text-center">
                {hoveredIndex !== null ? (
                    <>
                         <span className="text-3xl font-bold" style={{ color: data[hoveredIndex].color }}>
                            {Math.round((data[hoveredIndex].value / total) * 100)}%
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mt-1">
                            {data[hoveredIndex].label}
                        </span>
                    </>
                ) : (
                    <>
                        <span className="text-3xl font-bold text-gray-800 dark:text-white">{total}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block mt-1">Total Courses</span>
                    </>
                )}
            </div>
        </div>
      </div>

      {/* Floating Tooltip for Breakdown */}
      {hoveredIndex !== null && data[hoveredIndex].breakdown && (
        <div 
            className="absolute z-50 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 pointer-events-none min-w-[200px] animate-in fade-in zoom-in duration-200"
            style={{ 
                left: mousePos.x + 20, 
                top: mousePos.y - 40,
            }}
        >
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 border-b dark:border-gray-700 pb-1">
                {data[hoveredIndex].label} Breakdown (by Campus)
            </h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
                {data[hoveredIndex].breakdown!.sort((a,b) => b.value - a.value).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs items-center">
                        <span className="text-gray-700 dark:text-gray-300 truncate max-w-[140px]">{item.label}</span>
                        <span className="font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-1.5 rounded">{item.value}</span>
                    </div>
                ))}
            </div>
            <div className="mt-2 pt-1 border-t dark:border-gray-700 flex justify-between text-xs font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>{data[hoveredIndex].value}</span>
            </div>
        </div>
      )}
    </div>
  );
};

// --- Stacked Bar Chart ---
interface StackedBarChartProps {
  data: StackedBarData[];
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {data.map((campus, index) => (
        <div key={index} className="w-full">
          <div className="flex justify-between items-end mb-1">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{campus.label}</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{campus.total} Courses</span>
          </div>
          
          {/* Label Row - Above the bar */}
          <div className="flex w-full px-0.5 mb-0.5">
            {campus.total > 0 && campus.segments.map((seg, segIdx) => {
                const totalWidthPct = (seg.value / campus.total) * 100;
                // Only show label if segment is wide enough (> 10%)
                if (totalWidthPct < 10) return <div key={segIdx} style={{ width: `${totalWidthPct}%` }}></div>;

                return (
                     <div 
                        key={segIdx} 
                        className="flex justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate px-1"
                        style={{ width: `${totalWidthPct}%` }}
                    >
                        {seg.label}
                    </div>
                );
            })}
          </div>

          {/* Main Bar Container - Removed overflow-hidden to allow tooltip to pop out */}
          <div className="h-9 w-full bg-gray-100 dark:bg-gray-700 rounded-lg flex relative border border-gray-200 dark:border-gray-600">
            {campus.total === 0 ? (
                <div className="w-full h-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-[10px] text-gray-400 italic rounded-lg">No Data</div>
            ) : (
                campus.segments.map((seg, segIdx) => {
                    const totalWidthPct = (seg.value / campus.total) * 100;
                    if (totalWidthPct === 0) return null;
                    
                    const completedPct = (seg.completed / seg.value) * 100;
                    const inProgressPct = 100 - completedPct;
                    const inProgressCount = seg.value - seg.completed;
                    const progress = seg.value > 0 ? Math.round((seg.completed / seg.value) * 100) : 0;

                    // Visibility checks for numbers inside bar
                    const showCompletedNum = (totalWidthPct * (completedPct/100)) > 3; 
                    const showInProgressNum = (totalWidthPct * (inProgressPct/100)) > 3;

                    // Rounded corners logic for first and last segments (since parent overflow is visible)
                    const isFirst = segIdx === 0;
                    const isLast = segIdx === campus.segments.length - 1;
                    const roundedLeft = isFirst ? 'rounded-l-lg' : '';
                    const roundedRight = isLast ? 'rounded-r-lg' : '';

                    // Separator Line Logic (Dashed Grey Line)
                    // Apply to all except the last segment
                    const borderClass = !isLast ? 'border-r-2 border-dotted border-gray-400 dark:border-gray-500' : '';

                    return (
                        <div 
                            key={segIdx}
                            // Added hover:z-30 to bring hovered segment to front for tooltip
                            className={`h-full group relative flex hover:z-30 transition-all hover:brightness-110 ${borderClass}`}
                            style={{ width: `${totalWidthPct}%` }}
                        >
                            {/* 1. Completed Part */}
                            {seg.completed > 0 && (
                                <div 
                                    className={`h-full flex items-center justify-center relative ${roundedLeft} ${isLast && inProgressCount === 0 ? 'rounded-r-lg' : ''}`}
                                    style={{ width: `${completedPct}%`, backgroundColor: seg.color }}
                                >
                                    {showCompletedNum && (
                                        <span className="text-[10px] font-bold text-white drop-shadow-md leading-none z-10">{seg.completed}</span>
                                    )}
                                </div>
                            )}

                            {/* 2. In Progress Part (Lesser Opacity) */}
                            {inProgressCount > 0 && (
                                <div 
                                    className={`h-full flex items-center justify-center relative ${isLast ? 'rounded-r-lg' : ''} ${isFirst && seg.completed === 0 ? 'rounded-l-lg' : ''}`}
                                    style={{ width: `${inProgressPct}%` }}
                                >
                                    {/* Faded Background */}
                                    <div className={`absolute inset-0 ${isLast ? 'rounded-r-lg' : ''} ${isFirst && seg.completed === 0 ? 'rounded-l-lg' : ''}`} style={{ backgroundColor: seg.color, opacity: 0.4 }}></div>
                                    
                                    {/* Text Label */}
                                    {showInProgressNum && (
                                        <span className="relative z-10 text-[10px] font-bold text-gray-700 dark:text-gray-100 drop-shadow-sm leading-none">{inProgressCount}</span>
                                    )}
                                </div>
                            )}

                            {/* Detailed Tooltip on Hover */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity min-w-[140px] pointer-events-none z-50">
                                <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-1 border-b dark:border-gray-700 pb-1">{seg.label} Statistics</div>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                                    <span className="text-gray-500 dark:text-gray-400">Total:</span>
                                    <span className="font-bold text-right text-gray-900 dark:text-white">{seg.value}</span>
                                    
                                    <span className="text-gray-500 dark:text-gray-400">Completed:</span>
                                    <span className="font-bold text-right text-green-600 dark:text-green-400">{seg.completed}</span>
                                    
                                    <span className="text-gray-500 dark:text-gray-400">In Progress:</span>
                                    <span className="font-bold text-right text-amber-600 dark:text-amber-400">{inProgressCount}</span>

                                    <span className="text-gray-500 dark:text-gray-400">Progress:</span>
                                    <span className="font-bold text-right text-gray-900 dark:text-white">{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 h-1.5 rounded-full mt-2 overflow-hidden">
                                    <div className="bg-green-500 h-full" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-gray-800"></div>
                            </div>
                        </div>
                    );
                })
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
