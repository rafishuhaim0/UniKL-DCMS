
import React, { useState, useMemo } from 'react';
import { ActivityItem, ViewState } from '../types';
import { Plus, Edit, Trash2, Megaphone, Info, Save, X, ExternalLink, Filter, Search, Clock, Calendar } from 'lucide-react';

interface ActivityBoardProps {
  activities: ActivityItem[];
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, message: string) => void;
  onNavigate?: (view: ViewState, params: any) => void;
  onClose?: () => void;
}

export const ActivityBoard: React.FC<ActivityBoardProps> = ({ 
  activities,
  isAdmin = false,
  onDelete,
  onUpdate,
  onNavigate,
  onClose
}) => {
  const [filter, setFilter] = useState<ActivityItem['type'] | 'all'>('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState('');
  
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });

  const filteredActivities = useMemo(() => {
      return activities
        .filter(a => filter === 'all' || a.type === filter)
        .filter(a => a.message.toLowerCase().includes(search.toLowerCase()) || a.author?.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities, filter, search]);

  const handleStartEdit = (item: ActivityItem) => {
    setEditingId(item.id);
    setEditMessage(item.message);
  };

  const handleSaveEdit = (id: string) => {
    if (onUpdate && editMessage.trim()) onUpdate(id, editMessage);
    setEditingId(null);
  };

  const confirmDelete = () => {
      if (deleteModal.id && onDelete) onDelete(deleteModal.id);
      setDeleteModal({ open: false, id: null });
  };

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'create': return <Plus size={16} className="text-green-500" />;
      case 'update': return <Edit size={16} className="text-blue-500" />;
      case 'delete': return <Trash2 size={16} className="text-red-500" />;
      case 'announcement': return <Megaphone size={16} className="text-unikl-orange" />;
      default: return <Info size={16} className="text-gray-400" />;
    }
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const categories: {id: any, label: string, color: string}[] = [
      { id: 'all', label: 'All', color: 'bg-gray-100 dark:bg-gray-800' },
      { id: 'announcement', label: 'Alerts', color: 'bg-orange-100 dark:bg-orange-900/30' },
      { id: 'update', label: 'Updates', color: 'bg-blue-100 dark:bg-blue-900/30' },
      { id: 'create', label: 'Entries', color: 'bg-green-100 dark:bg-green-900/30' },
      { id: 'delete', label: 'Deleted', color: 'bg-red-100 dark:bg-red-900/30' },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 bg-unikl-blue text-white flex justify-between items-center shrink-0 border-b border-blue-900">
            <div>
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <Megaphone className="text-unikl-orange" />
                    Activity Center
                </h2>
                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mt-1">Real-time University Stream</p>
            </div>
            {onClose && (
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95">
                    <X size={20} />
                </button>
            )}
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-4 bg-gray-50/50 dark:bg-gray-950/20 shrink-0">
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search messages or authors..."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-unikl-orange outline-none transition-all shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setFilter(cat.id)}
                        className={`
                            px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border
                            ${filter === cat.id 
                                ? 'bg-unikl-orange border-unikl-orange text-white shadow-md' 
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                            }
                        `}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {filteredActivities.length > 0 ? (
                filteredActivities.map((item, idx) => (
                    <div 
                        key={item.id}
                        className={`
                            group relative p-4 rounded-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2
                            ${item.type === 'announcement' ? 'bg-orange-50/40 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800' : 'bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 hover:shadow-md'}
                        `}
                        style={{ animationDelay: `${idx * 40}ms` }}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl shrink-0 ${
                                item.type === 'announcement' ? 'bg-unikl-orange/10' :
                                item.type === 'create' ? 'bg-green-500/10' :
                                item.type === 'update' ? 'bg-blue-500/10' :
                                'bg-red-500/10'
                            }`}>
                                {getIcon(item.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <Clock size={10} /> {timeAgo(item.timestamp)}
                                    </span>
                                    {item.targetView && (
                                        <button 
                                            onClick={() => onNavigate?.(item.targetView!, item.targetParams)}
                                            className="text-unikl-blue dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="View Context"
                                        >
                                            <ExternalLink size={14} />
                                        </button>
                                    )}
                                </div>

                                {editingId === item.id ? (
                                    <div className="space-y-2 mt-2">
                                        <textarea 
                                            className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-unikl-orange"
                                            value={editMessage}
                                            onChange={(e) => setEditMessage(e.target.value)}
                                            autoFocus
                                            rows={3}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                                            <button onClick={() => handleSaveEdit(item.id)} className="px-3 py-1 text-xs font-bold bg-green-600 text-white rounded-lg shadow-sm">Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed mb-2">
                                        {item.message}
                                    </p>
                                )}

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        {item.author && (
                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                                @{item.author}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {isAdmin && item.type === 'announcement' && !editingId && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button 
                                                onClick={() => handleStartEdit(item)}
                                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button 
                                                onClick={() => setDeleteModal({ open: true, id: item.id })}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-8 space-y-4">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Search size={32} />
                    </div>
                    <p className="text-sm font-medium">No matching activities found.<br/><span className="text-xs">Try adjusting your filters.</span></p>
                </div>
            )}
        </div>

        {/* Delete Confirmation Overlay */}
        {deleteModal.open && (
            <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-xs w-full text-center animate-in zoom-in-95">
                    <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <Trash2 size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Alert?</h3>
                    <p className="text-sm text-gray-500 mb-6">This message will be permanently removed from the public feed.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteModal({ open: false, id: null })} className="flex-1 py-2 text-sm font-bold bg-gray-100 dark:bg-gray-700 rounded-xl">Keep it</button>
                        <button onClick={confirmDelete} className="flex-1 py-2 text-sm font-bold bg-red-600 text-white rounded-xl shadow-lg">Delete</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
