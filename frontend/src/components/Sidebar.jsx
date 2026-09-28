import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Stethoscope,
  ClipboardList,
  CalendarCheck,
  Pill,
  AlertTriangle,
  FileText,
  UserCheck,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { role, user } = useAuth();

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin-dashboard';
    if (role === 'doctor') return '/doctor-dashboard';
    if (role === 'patient') return '/patient-dashboard';
    return '/';
  };

  const navItems = {
    admin: [
      { label: 'Admin Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
      { label: 'Patient Directory', path: '/patients', icon: Users },
      { label: 'Register Patient', path: '/patients/new', icon: UserPlus },
      { label: 'Follow-ups', path: '/follow-ups', icon: CalendarCheck },
      { label: 'User Management', path: '/users', icon: UserCheck },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
    doctor: [
      { label: 'Doctor Dashboard', path: '/doctor-dashboard', icon: LayoutDashboard },
      { label: 'All Patients', path: '/patients', icon: Users },
      { label: 'Register Patient', path: '/patients/new', icon: UserPlus },
      { label: 'New Consultation', path: '/consultation/new', icon: Stethoscope },
      { label: 'Follow-ups', path: '/follow-ups', icon: CalendarCheck },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
    patient: [
      { label: 'My Dashboard', path: '/patient-dashboard', icon: LayoutDashboard },
      { label: 'My Medical Profile', path: `/patients/${user?.patient_id || 'me'}`, icon: FileText },
      { label: 'My Follow-ups', path: '/follow-ups', icon: CalendarCheck },
      { label: 'Settings', path: '/settings', icon: Settings },
    ]
  };

  const items = navItems[role] || [];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:block shrink-0 min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        <div>
          <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Menu
          </h4>
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-teal-50 text-teal-700 font-bold border border-teal-200/60 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Info Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
          <p className="font-bold text-slate-800">Need Help?</p>
          <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
            Access medical records, issue prescriptions, and manage follow-ups efficiently.
          </p>
          <a
            href="#help"
            onClick={(e) => { e.preventDefault(); alert("Patient Case-Taking System v1.0. For support contact admin@medrecord.com"); }}
            className="inline-block mt-3 text-teal-700 font-bold hover:underline text-[11px]"
          >
            System Guidelines →
          </a>
        </div>
      </div>
    </aside>
  );
};
