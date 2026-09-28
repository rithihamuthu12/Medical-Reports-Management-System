import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  FileSpreadsheet,
  CalendarCheck,
  UserPlus,
  ArrowRight,
  Clock,
  Activity,
  Phone,
  Calendar
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { api } from '../services/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-xs gap-2">
        <Activity className="w-5 h-5 animate-spin text-teal-600" />
        <span>Loading Admin Analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 rounded-3xl text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            System Administrator Overview
          </span>
          <h1 className="text-2xl font-bold mt-2">Hospital Command Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time metric monitoring for medical staff, consultations, and patient registrations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/patients/new"
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Patient</span>
          </Link>
          <Link
            to="/users"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition"
          >
            Manage Users
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients || 0}
          icon={Users}
          color="teal"
          subtitle="Registered profiles"
        />
        <StatCard
          title="Total Doctors"
          value={stats?.totalDoctors || 0}
          icon={Stethoscope}
          color="indigo"
          subtitle="Active medical staff"
        />
        <StatCard
          title="Total Consultations"
          value={stats?.totalConsultations || 0}
          icon={FileSpreadsheet}
          color="blue"
          subtitle="Recorded clinical sessions"
        />
        <StatCard
          title="Pending Follow-ups"
          value={stats?.pendingFollowups || 0}
          icon={CalendarCheck}
          color="amber"
          subtitle="Scheduled appointments"
        />
      </div>

      {/* Main Grid: Recent Patients & Recent Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Patient Registrations */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Patient Registrations</h3>
              <p className="text-xs text-slate-500">Newly added patient records</p>
            </div>
            <Link to="/patients" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {stats?.recentPatients?.length > 0 ? (
              stats.recentPatients.map((patient) => (
                <div key={patient.id} className="py-3 flex items-center justify-between hover:bg-slate-50/60 p-2 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">
                      {patient.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/patients/${patient.id}`} className="font-semibold text-xs text-slate-900 hover:text-teal-600 transition">
                          {patient.full_name}
                        </Link>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          {patient.patient_id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {patient.gender}, {patient.age} yrs • {patient.phone}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(patient.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No recent patient registrations.</p>
            )}
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Consultations</h3>
              <p className="text-xs text-slate-500">Latest clinical diagnoses</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {stats?.recentConsultations?.length > 0 ? (
              stats.recentConsultations.map((c) => (
                <div key={c.id} className="py-3 hover:bg-slate-50/60 p-2 rounded-xl transition">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      {c.patient_name} <span className="text-slate-400 font-normal">({c.patient_code})</span>
                    </span>
                    <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200/60">
                      {c.consultation_date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold mt-1">
                    Diagnosis: <span className="text-slate-900 font-normal">{c.diagnosis_primary}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    Attending: {c.doctor_name || 'Dr. On Duty'} • Complaint: {c.chief_complaint}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No recent consultations found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Follow-ups Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Upcoming Follow-up Appointments</h3>
            <p className="text-xs text-slate-500">Scheduled patient review sessions</p>
          </div>
          <Link to="/follow-ups" className="text-xs font-bold text-teal-600 hover:underline">
            Manage All Follow-ups →
          </Link>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Assigned Doctor</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.upcomingFollowups?.length > 0 ? (
                stats.upcomingFollowups.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {f.follow_up_date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {f.patient_name} <span className="text-slate-400 text-[10px]">({f.patient_code})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{f.reason}</td>
                    <td className="py-3 px-4 text-slate-700">{f.doctor_name || 'Dr. Sarah Smith'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-200">
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400">
                    No scheduled follow-up appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
