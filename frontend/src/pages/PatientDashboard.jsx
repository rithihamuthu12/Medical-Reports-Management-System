import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Activity,
  FileSpreadsheet,
  Pill,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const res = await api.getPatientStats();
        setData(res);
      } catch (err) {
        console.error('Failed to load patient dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-xs gap-2">
        <Activity className="w-5 h-5 animate-spin text-teal-600" />
        <span>Loading Medical Record Vault...</span>
      </div>
    );
  }

  const patient = data?.patient;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Patient Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 p-6 rounded-3xl text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-white font-extrabold text-xl flex items-center justify-center shadow-inner shrink-0">
            {patient?.full_name?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{patient?.full_name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-200 border border-teal-400/30">
                {patient?.patient_id}
              </span>
            </div>
            <p className="text-xs text-teal-100/80 mt-1 flex items-center gap-3">
              <span>{patient?.gender}, {patient?.age} Years</span>
              <span>•</span>
              <span>Blood Group: <strong className="text-rose-300 font-semibold">{patient?.blood_group}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {patient?.phone}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl text-xs border border-white/20">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>Verified Digital Medical Record</span>
        </div>
      </div>

      {/* High Allergy Alert Banner if allergies exist */}
      {data?.allergies?.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-rose-900">
              Medical Allergy Warning Alert ({data.allergies.length})
            </h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {data.allergies.map((allergy) => (
                <span key={allergy.id} className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-bold text-rose-800 shadow-xs">
                  {allergy.allergy_name} ({allergy.reaction}) - <span className="text-rose-600 uppercase font-extrabold">{allergy.severity} Risk</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Consultations"
          value={data?.totalConsultations || 0}
          icon={FileSpreadsheet}
          color="teal"
          subtitle="Clinical visits recorded"
        />
        <StatCard
          title="Active Medications"
          value={data?.activeMedicationsCount || 0}
          icon={Pill}
          color="indigo"
          subtitle="Currently prescribed drugs"
        />
        <StatCard
          title="Recorded Allergies"
          value={data?.allergiesCount || 0}
          icon={AlertTriangle}
          color="rose"
          subtitle="Medical allergy alerts"
        />
      </div>

      {/* Next Upcoming Follow-Up Card */}
      {data?.nextFollowUp && (
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Next Upcoming Appointment
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                {data.nextFollowUp.follow_up_date} — {data.nextFollowUp.reason}
              </h4>
              <p className="text-xs text-slate-600">With {data.nextFollowUp.doctor_name || 'Dr. Sarah Smith'}</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
            {data.nextFollowUp.status}
          </span>
        </div>
      )}

      {/* Main Grid: Active Medications & Recent Consultation History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Medications List (Read Only) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Current Prescribed Medications</h3>
                <p className="text-xs text-slate-500">Active prescriptions from your doctor</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {data?.activeMedications?.length > 0 ? (
              data.activeMedications.map((med) => (
                <div key={med.id} className="py-3.5 hover:bg-slate-50/60 p-2 rounded-xl transition">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{med.medicine_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      {med.dosage}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                    <span>Frequency: <strong>{med.frequency}</strong></span>
                    <span>Duration: <strong>{med.duration}</strong></span>
                  </div>
                  {med.instructions && (
                    <p className="text-[11px] text-slate-500 mt-1 bg-slate-50 p-1.5 rounded italic">
                      Instructions: "{med.instructions}"
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No active medications prescribed.</p>
            )}
          </div>
        </div>

        {/* Previous Consultation History (Read Only) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Consultation & Diagnosis History</h3>
                <p className="text-xs text-slate-500">Read-only records entered by physicians</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {data?.recentConsultations?.length > 0 ? (
              data.recentConsultations.map((c) => (
                <div key={c.id} className="py-3.5 hover:bg-slate-50/60 p-2 rounded-xl transition">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      {c.consultation_date}
                    </span>
                    <span className="text-[11px] text-teal-700 font-semibold">
                      {c.doctor_name || 'Dr. Sarah Smith'}
                    </span>
                  </div>
                  <div className="mt-1">
                    <p className="text-xs font-bold text-slate-800">
                      Diagnosis: <span className="text-teal-700 font-semibold">{c.diagnosis_primary}</span>
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Chief Complaint: {c.chief_complaint}
                    </p>
                    <div className="mt-2 text-[11px] bg-slate-50 p-2 rounded-lg text-slate-700 font-mono">
                      <strong>Treatment Plan:</strong>
                      <pre className="font-sans whitespace-pre-wrap mt-0.5">{c.treatment_plan}</pre>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No previous consultation records found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
