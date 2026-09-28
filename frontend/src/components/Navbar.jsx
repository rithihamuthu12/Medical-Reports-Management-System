import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Search, LogOut, User, Shield, Stethoscope, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PatientSearchModal } from './PatientSearchModal';

export const Navbar = () => {
  const { user, logout, isAuthenticated, role } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    doctor: 'bg-teal-100 text-teal-700 border-teal-200',
    patient: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  const roleIcons = {
    admin: <Shield className="w-3.5 h-3.5" />,
    doctor: <Stethoscope className="w-3.5 h-3.5" />,
    patient: <User className="w-3.5 h-3.5" />,
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-none">
                Med<span className="text-teal-600">Case</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase block mt-0.5">
                Medical Records System
              </span>
            </div>
          </Link>

          {/* Quick Search Bar (For Authenticated Doctors & Admins) */}
          {isAuthenticated && role !== 'patient' && (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-100 hover:bg-slate-200/70 text-slate-500 rounded-xl text-xs font-medium w-full max-w-md transition border border-slate-200/60"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="flex-1 text-left">Quick search patients by ID, Name, or Phone...</span>
              <kbd className="px-2 py-0.5 text-[10px] font-semibold bg-white rounded border border-slate-200 text-slate-400">
                Ctrl + K
              </kbd>
            </button>
          )}

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-white font-bold text-sm flex items-center justify-center">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 leading-tight block">
                        {user?.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1 ${roleColors[role] || 'bg-slate-100'}`}>
                        {roleIcons[role]}
                        {role}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate max-w-[140px]">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in"
                    onMouseLeave={() => setIsMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Account Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-teal-600 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Patient Search Modal */}
      <PatientSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
