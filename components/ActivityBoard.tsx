
import React, { useState } from 'react';
import { ActivityItem, ViewState } from '../types';
import { Bell, Edit, Plus, Trash2, Megaphone, ChevronDown, ChevronUp, Info, Save, X, ExternalLink } from 'lucide-react';

interface ActivityBoardProps {
  activities: ActivityItem[];
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, message: string) => void;
  variant?: 'default' | 'sidebar';
  onNavigate?: (view: ViewState, params: any) => void;
}

export const ActivityBoard: React.FC<ActivityBoardProps> = ({ 
  activities,
  isAdmin = false,
  onDelete,
  onUpdate,
  variant = 'default',
  onNavigate
}) => {
  const isSidebar = variant === 'sidebar';
  const [isExpanded, setIsExpanded] = useState(isSidebar); // Sidebar defaults to open, dashboard defaults to closed
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState('');
  
  // Custom Modal State for Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleStartEdit = (item: ActivityItem) => {
    setEditingId(item.id);
    setEditMessage(item.message);
  };

  const handleSaveEdit = (id: string) => {
    if (onUpdate && editMessage.trim()) {
        onUpdate(id, editMessage);
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditMessage('');
  };

  const handleDeleteRequest = (id: string) => {
      setItemToDelete(id);
      setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
      if (itemToDelete && onDelete) {
          onDelete(itemToDelete);
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
  };

  const cancelDelete = () => {
      setDeleteModalOpen(false);
      setItemToDelete(null);
  };

  const getIcon = (type: ActivityItem['type']) => {
    // Icons are colored standardly
    switch (type) {
      case 'create': return <Plus size={14} className="text-green-600 dark:text-green-400" />;
      case 'update': return <Edit size={14} className="text-blue-600 dark:text-blue-400" />;
      case 'delete': return <Trash2 size={14} className="text-red-600 dark:text-red-400" />;
      case 'announcement': return <Megaphone size={14} className="text-unikl-orange" />;
      default: return <Info size={14} className="text-gray-600" />;
    }
  };

  const getLabel = (type: ActivityItem['type']) => {
     switch (type) {
      case 'create': return 'Created';
      case 'update': return 'Updated';
      case 'delete': return 'Deleted';
      case 'announcement': return 'Alert';
      default: return 'Info';
    }
  }

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return "just now";
  };

  const sortedActivities = [...activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Dashboard view settings
  const displayActivities = isExpanded ? sortedActivities : sortedActivities.slice(0, 1);

  // Sidebar grouping logic
  const groups = {
      announcement: { 
          label: 'Announcements', 
          items: [] as ActivityItem[], 
          color: isSidebar ? 'text-gray-800' : 'text-unikl-orange dark:text-orange-400', 
          bg: isSidebar ? 'bg-transparent' : 'bg-orange-50 dark:bg-orange-900/20' 
      },
      create: { 
          label: 'Additions', 
          items: [] as ActivityItem[], 
          color: isSidebar ? 'text-gray-800' : 'text-green-600 dark:text-green-400', 
          bg: isSidebar ? 'bg-transparent' : 'bg-green-50 dark:bg-green-900/20' 
      },
      update: { 
          label: 'Updates', 
          items: [] as ActivityItem[], 
          color: isSidebar ? 'text-gray-800' : 'text-blue-600 dark:text-blue-400', 
          bg: isSidebar ? 'bg-transparent' : 'bg-blue-50 dark:bg-blue-900/20' 
      },
      delete: { 
          label: 'Removals', 
          items: [] as ActivityItem[], 
          color: isSidebar ? 'text-gray-800' : 'text-red-600 dark:text-red-400', 
          bg: isSidebar ? 'bg-transparent' : 'bg-red-50 dark:bg-red-900/20' 
      },
  };

  if (isSidebar) {
      // Process recent 50 activities to categorize
      const recent = sortedActivities.slice(0, 50);
      recent.forEach(item => {
          if (groups[item.type]) {
              groups[item.type].items.push(item);
          }
      });
  }

  const handleItemClick = (item: ActivityItem) => {
      if (editingId) return; // Don't navigate if editing
      if (item.targetView && onNavigate) {
          onNavigate(item.targetView, item.targetParams);
      }
  };

  // Render Item Function
  const renderItemContent = (item: ActivityItem, index: number) => (
    <div 
        key={item.id} 
        onClick={() => handleItemClick(item)}
        style={{ animationDelay: `${index * 50}ms` }}
        className={`
            ${isSidebar 
                ? 'p-2 hover:bg-black/5 border-b border-gray-100/50 last:border-0' // Sidebar: No bg, no shadow, just hover effect
                : 'px-4 py-3 hover:bg-white dark:hover:bg-gray-700/80 rounded-lg mb-1'} 
            flex items-start gap-2 transition-all group/item animate-in fade-in slide-in-from-top-2 duration-300 fill-mode-backwards
            ${!isSidebar && item.type === 'announcement' ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}
            ${item.targetView ? 'cursor-pointer' : ''}
        `}
    >
        <div className={`mt-0.5 p-1 rounded-full bg-opacity-20 flex-shrink-0
            ${item.type === 'create' ? (isSidebar ? 'bg-green-50 border border-green-100' : 'bg-green-100') : ''}
            ${item.type === 'update' ? (isSidebar ? 'bg-blue-50 border border-blue-100' : 'bg-blue-100') : ''}
            ${item.type === 'delete' ? (isSidebar ? 'bg-red-50 border border-red-100' : 'bg-red-100') : ''}
            ${item.type === 'announcement' ? (isSidebar ? 'bg-orange-50 border border-orange-100' : 'bg-orange-100') : ''}
        `}>
            {getIcon(item.type)}
        </div>
        <div className="flex-1 min-w-0">
            {editingId === item.id ? (
                <div className="flex flex-col gap-2 cursor-default" onClick={(e) => e.stopPropagation()}>
                    <textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-unikl-orange outline-none resize-none"
                        rows={3}
                        autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                        <button onClick={(e) => { e.stopPropagation(); handleSaveEdit(item.id); }} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"><Save size={12}/></button>
                        <button onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }} className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"><X size={12}/></button>
                    </div>
                </div>
            ) : (
                <>
                    <div className={`flex ${isSidebar ? 'flex-col gap-0.5' : 'justify-between items-start'}`}>
                        <div className="flex items-start gap-1">
                            <div className={`font-medium leading-tight ${isSidebar ? 'text-xs break-words text-gray-800 drop-shadow-none' : 'text-sm text-gray-800 dark:text-gray-200'}`}>
                                {item.message}
                            </div>
                            {item.targetView && isSidebar && (
                                <ExternalLink size={10} className="text-gray-400 mt-0.5 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            )}
                        </div>
                        <span className={`whitespace-nowrap ${isSidebar ? 'text-[9px] text-gray-400 font-medium' : 'text-xs ml-2 text-gray-400'}`}>{timeAgo(item.timestamp)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {!isSidebar && (
                                <span className="text-[10px] uppercase font-bold text-gray-400 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5">
                                    {getLabel(item.type)}
                                </span>
                            )}
                            {item.author && <span className={`text-[10px] font-medium ${isSidebar ? 'text-gray-500' : 'text-gray-400 dark:text-gray-500'}`}>{item.author}</span>}
                        </div>
                        
                        {/* Only allow CRUD operations on 'announcement' type items */}
                        {isAdmin && item.type === 'announcement' && (
                            <div className={`flex items-center gap-1 transition-opacity ${isSidebar ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'}`}>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleStartEdit(item); }}
                                    className={`p-1 transition-colors rounded ${isSidebar ? 'text-gray-400 hover:bg-gray-100 hover:text-unikl-blue' : 'text-gray-400 hover:text-unikl-blue hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    title="Edit"
                                >
                                    <Edit size={12} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteRequest(item.id); }}
                                    className={`p-1 transition-colors rounded ${isSidebar ? 'text-gray-400 hover:text-red-600 hover:bg-gray-100' : 'text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    title="Delete"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    </div>
  );

  if (activities.length === 0) return null;

  return (
    <>
        {/* Delete Confirmation Modal - Always Fixed to Viewport */}
        {deleteModalOpen && (
            <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center transform transition-all scale-100 p-6">
                    <div className="mb-4 p-4 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <Trash2 size={32} />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Delete Item?</h3>
                    <div className="mb-6 text-gray-600 dark:text-gray-300 text-sm">Are you sure you want to remove this announcement?</div>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={cancelDelete} 
                            className="flex-1 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDelete} 
                            className="flex-1 py-3 text-white bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none rounded-xl font-bold shadow-lg transition-transform active:scale-95"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className={`transition-all duration-300 ${isSidebar ? 'pt-0' : 'mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden'}`}>
            <div 
                className={`flex justify-between items-center cursor-pointer group ${isSidebar ? 'sticky top-0 z-30 bg-unikl-orange py-2 mb-0 px-4 border-b border-orange-500/30 shadow-none rounded-none' : 'px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className={`font-bold flex items-center gap-2 ${isSidebar ? 'text-xs text-white uppercase tracking-wider' : 'text-sm text-gray-700 dark:text-gray-200'}`}>
                    {isSidebar ? (
                        <>
                            <Bell size={12} className="text-white" />
                            <span>Updates</span>
                            {activities.length > 0 && <span className="bg-white text-unikl-orange text-[9px] px-1.5 py-0.5 rounded-full font-black">{activities.length}</span>}
                        </>
                    ) : (
                        <>
                            <Bell size={16} className="text-unikl-blue dark:text-indigo-400" /> 
                            Latest Updates & Announcements
                        </>
                    )}
                </h3>
                <button className={`${isSidebar ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-unikl-blue'}`}>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>
            
            {isExpanded && (
                <div className={`${isSidebar ? 'space-y-0 px-0 pb-0 bg-white/80 backdrop-blur-md rounded-none overflow-hidden' : 'divide-y divide-gray-100 dark:divide-gray-700/50 max-h-[300px] overflow-y-auto scrollbar-thin'}`}>
                    
                    {isSidebar ? (
                        // Grouped Sidebar View - Flat List on Shared Background
                        Object.entries(groups).map(([type, group], index) => {
                            if (group.items.length === 0) return null;
                            return (
                                <div 
                                    key={type} 
                                    className={`overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-left-4 duration-300 fill-mode-backwards
                                        ${isSidebar ? 'rounded-none mb-0' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border rounded-xl'}
                                    `}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Header Text: Transparent BG for cleaner look on shared white bg */}
                                    <h4 className={`px-2 py-1.5 text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-between 
                                        ${isSidebar ? 'bg-transparent text-gray-800 border-b border-gray-200/50 mb-0 shadow-none' : 'border-b border-gray-100 dark:border-gray-700/50 ' + group.color + ' ' + group.bg} 
                                        ${!isSidebar ? group.bg : ''}
                                    `}>
                                        {group.label}
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] shadow-sm ${isSidebar ? 'bg-unikl-orange text-white font-bold' : 'bg-white dark:bg-gray-900 text-gray-500'}`}>{group.items.length}</span>
                                    </h4>
                                    <div className="space-y-0">
                                        {/* Show top 5 items per group */}
                                        {group.items.slice(0, 5).map((item, idx) => renderItemContent(item, idx))}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        // Flat Dashboard View - Scrollable container
                        displayActivities.map((item, idx) => renderItemContent(item, idx))
                    )}
                    

                    {isSidebar && Object.values(groups).every(g => g.items.length === 0) && (
                         <div className="p-4 text-center text-xs text-gray-500 italic animate-in fade-in">No recent updates</div>
                    )}
                </div>
            )}
        </div>
    </>
  );
};
