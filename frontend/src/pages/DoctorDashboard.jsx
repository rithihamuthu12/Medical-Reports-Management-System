import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Users,
  CalendarCheck,
  UserPlus,
  Search,
  Activity,
  ArrowRight,
  PlusCircle,
  FileText,
  Clock,
  Phone
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick search inline state
  const [inlineSearch, setInlineSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDoctorStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load doctor stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setInlineSearch(val);
    if (!val.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.quickSearchPatients(val);
      setSearchResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-xs gap-2">
        <Activity className="w-5 h-5 animate-spin text-teal-600" />
        <span>Loading Clinical Workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 rounded-3xl text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-200 border border-teal-400/30">
            {user?.specialization || 'Attending Physician'}
          </span>
          <h1 className="text-2xl font-bold mt-2">Welcome back, {user?.name}</h1>
          <p className="text-xs text-teal-100/80 mt-1">
            Manage consultations, record clinical cases, and review patient follow-ups.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/consultation/new"
            className="px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start Consultation</span>
          </Link>
          <Link
            to="/patients/new"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Patient</span>
          </Link>
        </div>
      </div>

      {/* Quick Doctor Patient Lookup */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative">
        <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-teal-600" />
          <span>Patient Lookup (Search by ID, Name, or Phone)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Type patient name, phone number, or patient code (e.g. PAT-2026-001)..."
            value={inlineSearch}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Search Results Dropdown Overlay */}
        {inlineSearch.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-72 overflow-y-auto divide-y divide-slate-100 p-2">
            {isSearching ? (
              <p className="text-xs text-slate-400 p-4 text-center">Searching directory...</p>
            ) : searchResults.length > 0 ? (
              searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/patients/${p.id}`)}
                  className="p-3 hover:bg-teal-50/60 rounded-xl cursor-pointer flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">
                      {p.full_name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900">{p.full_name}</span>
                      <span className="ml-2 text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {p.patient_id}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {p.gender}, {p.age} yrs • Phone: {p.phone}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal-600 flex items-center gap-1">
                    Open Record <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 p-4 text-center">No matching patient records found.</p>
            )}
          </div>
        )}
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Today's Consultations"
          value={stats?.todayConsultations || 0}
          icon={Stethoscope}
          color="teal"
          subtitle="Sessions conducted today"
        />
        <StatCard
          title="Total Assigned Patients"
          value={stats?.totalPatients || 0}
          icon={Users}
          color="sky"
          subtitle="Hospital patient database"
        />
        <StatCard
          title="Upcoming Follow-ups"
          value={stats?.upcomingFollowupsCount || 0}
          icon={CalendarCheck}
          color="amber"
          subtitle="Pending reviews"
        />
      </div>

      {/* Main Grid: Today's Followup Appointments & Recent Patient Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Today's Scheduled Appointments</h3>
              <p className="text-xs text-slate-500">Follow-up visits assigned for today</p>
            </div>
            <Link to="/follow-ups" className="text-xs font-bold text-teal-600 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3 mt-4">
            {stats?.todaySchedule?.length > 0 ? (
              stats.todaySchedule.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link to={`/patients/${item.patient_id}`} className="font-bold text-xs text-slate-900 hover:text-teal-600">
                        {item.patient_name}
                      </Link>
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                        {item.patient_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Reason: {item.reason}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {item.patient_phone}
                    </p>
                  </div>
                  <Link
                    to={`/consultation/new?patientId=${item.patient_id}`}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    Consult Now
                  </Link>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No scheduled appointments for today.
              </div>
            )}
          </div>
        </div>

        {/* Recent Patient Records */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Patient Directory</h3>
              <p className="text-xs text-slate-500">Quick link to recent medical files</p>
            </div>
            <Link to="/patients" className="text-xs font-bold text-teal-600 hover:underline">
              Patient List →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {stats?.recentRecords?.length > 0 ? (
              stats.recentRecords.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between hover:bg-slate-50/60 p-2 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-200/60">
                      {p.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/patients/${p.id}`} className="font-bold text-xs text-slate-900 hover:text-teal-600">
                          {p.full_name}
                        </Link>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                          {p.patient_id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {p.gender}, {p.age} yrs • Blood Group: <strong className="text-rose-600">{p.blood_group || 'N/A'}</strong>
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/patients/${p.id}`}
                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                    title="View Profile"
                  >
                    <FileText className="w-4 h-4" />
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No patient records found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
