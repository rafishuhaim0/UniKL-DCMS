
import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onCancel: () => void;
  users?: User[]; // Optional to prevent crashes if undefined
}

export const Login: React.FC<LoginProps> = ({ onLogin, onCancel, users = [] }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('Attempting login...', { inputUser: username, availableUsers: users.length });

    if (!users || users.length === 0) {
        setError('System Error: No user database loaded.');
        return;
    }

    // Case-insensitive username match
    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

    if (!user) {
        setError('Invalid username.');
        return;
    }

    // Password check (usually case-sensitive)
    // specific check: if user has no password set in data, allow login (dev mode fallback), else check match
    if (user.password && user.password !== password) {
        setError('Invalid password.');
        return;
    }

    onLogin(user);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-md transition-colors duration-300">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-unikl-blue dark:text-blue-400 rounded-full mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Enter your credentials to manage data</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-lg border border-red-100 dark:border-red-800 text-center animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-unikl-orange focus:border-unikl-orange outline-none transition-all"
              placeholder="e.g. super_admin"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-unikl-orange focus:border-unikl-orange outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 bg-unikl-orange hover:bg-orange-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-orange-200 dark:shadow-none"
          >
            Login to Dashboard
          </button>
          
          <button 
            type="button" 
            onClick={onCancel}
            className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-center text-gray-400">
                Default Access:<br/>
                Username: <b>super_admin</b><br/>
                Password: <b>admin123</b>
            </p>
        </div>
      </div>
    </div>
  );
};
