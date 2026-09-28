import React from 'react';
import { Activity, Shield, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-white font-extrabold text-base mb-3">
              <Activity className="w-5 h-5 text-teal-400" />
              <span>MedCase Management</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Centralized digital patient case-taking and medical record management system for hospitals and medical clinics.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition">Key Features</a></li>
              <li><a href="#about" className="hover:text-white transition">About System</a></li>
              <li><a href="/login" className="hover:text-white transition">Staff Login</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">System Modules</h4>
            <ul className="space-y-2">
              <li>Patient Registration & Profiles</li>
              <li>Clinical Case Taking</li>
              <li>Consultation & Diagnosis</li>
              <li>Medications & Allergies</li>
              <li>Follow-up Scheduling</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Academic Project</h4>
            <p className="text-slate-400 leading-relaxed mb-3">
              Developed as a 3rd-year college computer science capstone project.
            </p>
            <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px] bg-slate-800 p-2 rounded-lg border border-slate-700">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Built with React + Node + Express</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 Patient Case-Taking & Medical Record Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Designed for healthcare excellence <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
