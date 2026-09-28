import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Shield,
  UserCheck,
  FileSpreadsheet,
  Stethoscope,
  Calendar,
  Pill,
  ArrowRight,
  CheckCircle2,
  Lock,
  Clock,
  Search,
  Database
} from 'lucide-react';
import { Footer } from '../components/Footer';

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-slate-900 to-slate-900 text-white py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-6">
              <Activity className="w-4 h-4 text-teal-400" />
              Centralized Healthcare Management Platform
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Patient Case-Taking & <span className="text-teal-400">Medical Record</span> Management System
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
              “Digitize patient records, simplify case-taking, and help healthcare professionals manage medical information efficiently.”
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition"
              >
                Staff & Doctor Login
              </Link>
            </div>
          </div>

          {/* Quick Demo Credentials Banner */}
          <div className="mt-16 max-w-4xl mx-auto p-4 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
              ⚡ College Viva Demo Accounts Ready
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                <span className="font-bold text-slate-200 block">Admin:</span>
                <span className="text-slate-400 font-mono">admin@medrecord.com</span> / <span className="text-teal-300 font-mono">admin123</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                <span className="font-bold text-slate-200 block">Doctor:</span>
                <span className="text-slate-400 font-mono">dr.smith@medrecord.com</span> / <span className="text-teal-300 font-mono">doctor123</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                <span className="font-bold text-slate-200 block">Patient:</span>
                <span className="text-slate-400 font-mono">john.doe@gmail.com</span> / <span className="text-teal-300 font-mono">patient123</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Key Capabilities</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">Comprehensive Clinical Modules</h3>
            <p className="text-slate-600 text-sm mt-3">
              Everything required to run modern patient record management without paperwork hassle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-400 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold mb-4">
                <UserCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Patient Registration</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Streamlined intake form capturing personal info, contact, emergency contacts, blood group, and automatic age calculation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-400 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold mb-4">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Digital Case History</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Record chief complaints, detailed symptom duration, severity, family history, and lifestyle factors in chronological order.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-400 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-4">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Doctor Consultation</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Record patient vitals (BP, Temp, Pulse, SpO2), clinical notes, primary/secondary diagnosis, and treatment plans.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-400 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold mb-4">
                <Pill className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Medical History & Allergies</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Highlight high-risk drug allergies prominently on patient profile banner alongside active chronic conditions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-400 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Follow-up Management</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Schedule follow-up visits with automatic filtering for Today, This Week, Upcoming, and Completed appointments.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-400 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Secure Role-Based Access</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Strict authorization hierarchy ensuring Admins, Doctors, and Patients only access authorized data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">About the Project</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2 leading-snug">
                Replacing Paper-Based Medical Files with Centralized Intelligence
              </h2>
              <p className="text-slate-600 text-sm mt-4 leading-relaxed">
                Manual paper-based patient files suffer from risk of loss, missing history, illegible handwriting, and slow search capabilities.
              </p>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                <strong>Patient Case-Taking & Medical Record Management System</strong> bridges this gap by providing an organized digital repository where clinical histories, allergy warnings, diagnosis records, and prescriptions remain accessible in seconds.
              </p>

              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  Instant patient search by Patient ID, Name, or Phone Number
                </li>
                <li className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  Visual high-severity allergy alerts to prevent medical errors
                </li>
                <li className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  Role-separated dashboards for Admin, Doctor, and Patient
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-teal-600" />
                  <span className="font-bold text-slate-800 text-sm">System Architecture Overview</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                  Full Stack Express + React
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">Frontend Layer</span>
                  React.js, Vite, Tailwind CSS, Lucide Icons, Client-side validation & protected routing.
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">Backend API Layer</span>
                  Node.js & Express.js REST API with JWT authorization, role middleware, and bcrypt hashing.
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">Relational Database</span>
                  SQLite zero-config engine + PostgreSQL migration <code className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded">schema.sql</code>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
