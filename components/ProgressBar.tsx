
import React from 'react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  percentage: number;
  title?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'titled' | 'compact';
  tooltip?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percentage, 
  title, 
  showPercentage = true, 
  size = 'md',
  variant = 'default',
  tooltip
}) => {
  let colorClass = 'bg-red-500';
  if (percentage === 100) colorClass = 'bg-emerald-500';
  else if (percentage > 50) colorClass = 'bg-amber-500';

  const heightClass = size === 'sm' ? 'h-2' : size === 'md' ? 'h-3' : 'h-4';

  if (variant === 'titled') {
    const textColorClass = percentage === 100 ? 'text-green-600 dark:text-green-400' : (percentage > 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400');
    return (
      <div className="space-y-1" title={tooltip || title}>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}: <span className={`font-bold ${textColorClass}`}>{percentage}%</span>
        </p>
        <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${heightClass}`}>
          <div 
            className={`h-full ${colorClass} transition-all duration-500 ease-in-out`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="w-full cursor-help group" title={tooltip || title}>
         <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${heightClass} mb-1 transform transition-all duration-300 group-hover:scale-105 origin-left shadow-sm group-hover:shadow-md`}>
          <div 
            className={`h-full ${colorClass} transition-all duration-500 ease-in-out flex items-center justify-center`} 
            style={{ width: `${percentage}%` }}
          >
            {percentage === 100 && <Check size={12} className="text-white" strokeWidth={4} />}
          </div>
        </div>
        {showPercentage && (
            <div className="text-xs font-bold text-gray-600 dark:text-gray-400 text-center group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{percentage}%</div>
        )}
      </div>
    );
  }

  // Default variant used for overall progress indicators in tables
  return (
    <div className="space-y-1 w-full" title={tooltip || title}>
      {title && <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{title}</p>}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${heightClass}`}>
        <div 
          className={`h-full ${colorClass} transition-all duration-500 ease-in-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && percentage > 0 && <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{percentage}%</p>}
    </div>
  );
};
