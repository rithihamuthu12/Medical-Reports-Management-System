import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Activity,
  AlertTriangle,
  FileSpreadsheet,
  Stethoscope,
  Pill,
  CalendarCheck,
  Plus,
  Clock,
  Phone,
  Mail,
  MapPin,
  Heart,
  ChevronRight,
  ShieldAlert,
  FileText,
  Edit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const PatientProfile = () => {
  const { id } = useParams();
  const { role, user, showToast } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') || 'overview';

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [isAddAllergyOpen, setIsAddAllergyOpen] = useState(false);
  const [isAddMedicalHistoryOpen, setIsAddMedicalHistoryOpen] = useState(false);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = useState(false);

  // Form states
  const [allergyForm, setAllergyForm] = useState({ allergy_name: '', allergy_type: 'Drug', reaction: '', severity: 'High', notes: '' });
  const [medHistoryForm, setMedHistoryForm] = useState({ condition: '', diagnosed_date: new Date().toISOString().split('T')[0], status: 'Active', treatment: '', notes: '' });
  const [medicationForm, setMedicationForm] = useState({ medicine_name: '', dosage: '', frequency: 'Once daily', duration: '30 Days', instructions: '' });
  const [followUpForm, setFollowUpForm] = useState({ follow_up_date: '', reason: '', notes: '' });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const patientIdToFetch = (id === 'me' && user?.patient_id) ? user.patient_id : id;
      const res = await api.getPatientById(patientIdToFetch);
      setProfileData(res);
    } catch (err) {
      console.error('Failed to load patient profile:', err);
      showToast('Error loading patient medical record.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-xs gap-2">
        <Activity className="w-5 h-5 animate-spin text-teal-600" />
        <span>Decrypting patient profile & clinical history...</span>
      </div>
    );
  }

  const patient = profileData?.patient;
  if (!patient) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Patient record not found.
      </div>
    );
  }

  const { allergies = [], medicalHistory = [], caseHistories = [], consultations = [], medications = [], followUps = [] } = profileData;

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // Submit Handlers
  const handleAddAllergy = async (e) => {
    e.preventDefault();
    try {
      await api.createAllergy({ patient_id: patient.id, ...allergyForm });
      showToast('Allergy alert added successfully!', 'success');
      setIsAddAllergyOpen(false);
      setAllergyForm({ allergy_name: '', allergy_type: 'Drug', reaction: '', severity: 'High', notes: '' });
      loadProfile();
    } catch (err) {
      showToast(err.message || 'Failed to add allergy.', 'error');
    }
  };

  const handleAddMedHistory = async (e) => {
    e.preventDefault();
    try {
      await api.createMedicalHistory({ patient_id: patient.id, ...medHistoryForm });
      showToast('Medical history condition recorded!', 'success');
      setIsAddMedicalHistoryOpen(false);
      setMedHistoryForm({ condition: '', diagnosed_date: new Date().toISOString().split('T')[0], status: 'Active', treatment: '', notes: '' });
      loadProfile();
    } catch (err) {
      showToast(err.message || 'Failed to add condition.', 'error');
    }
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    try {
      await api.createMedication({ patient_id: patient.id, start_date: new Date().toISOString().split('T')[0], ...medicationForm });
      showToast('Medication prescribed!', 'success');
      setIsAddMedicationOpen(false);
      setMedicationForm({ medicine_name: '', dosage: '', frequency: 'Once daily', duration: '30 Days', instructions: '' });
      loadProfile();
    } catch (err) {
      showToast(err.message || 'Failed to add medication.', 'error');
    }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    try {
      await api.createFollowUp({ patient_id: patient.id, status: 'Scheduled', ...followUpForm });
      showToast('Follow-up appointment scheduled!', 'success');
      setIsAddFollowUpOpen(false);
      setFollowUpForm({ follow_up_date: '', reason: '', notes: '' });
      loadProfile();
    } catch (err) {
      showToast(err.message || 'Failed to schedule follow-up.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Patient Profile Card Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        
        {/* Banner Top */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shrink-0 border border-teal-400/30">
              {patient.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{patient.full_name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {patient.patient_id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {patient.status}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-slate-300 mt-2 flex-wrap">
                <span>Age: <strong>{patient.age} Yrs ({patient.gender})</strong></span>
                <span>•</span>
                <span>DOB: <strong>{patient.date_of_birth}</strong></span>
                <span>•</span>
                <span>Blood Group: <strong className="text-rose-400 font-extrabold">{patient.blood_group}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {role !== 'patient' && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate(`/consultation/new?patientId=${patient.id}`)}
                className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Stethoscope className="w-4 h-4" />
                <span>New Consultation</span>
              </button>
              <button
                onClick={() => navigate(`/patients/edit/${patient.id}`)}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
                title="Edit Demographics"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Contact & Emergency Details Bar */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Phone: <strong className="text-slate-800 font-mono">{patient.phone}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="truncate">Email: <strong className="text-slate-800">{patient.email || 'N/A'}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="truncate">Emergency: <strong className="text-slate-800">{patient.emergency_contact || 'N/A'}</strong></span>
          </div>
        </div>

        {/* VISUAL MEDICAL ALERTS BANNER (Prompt requirement: "Make important allergy information visually noticeable") */}
        {allergies.length > 0 && (
          <div className="bg-rose-50 border-b-2 border-rose-200 p-4 px-6">
            <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs uppercase tracking-wider mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>CRITICAL MEDICAL ALLERGY ALERTS ({allergies.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergies.map((al) => (
                <div key={al.id} className="px-3 py-1.5 bg-white border border-rose-300 rounded-xl text-xs font-bold text-rose-900 shadow-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                  <span>{al.allergy_name}</span>
                  <span className="text-[10px] text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded font-semibold uppercase">
                    {al.severity} Severity
                  </span>
                  <span className="text-slate-500 font-normal">({al.reaction})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TABS NAVIGATION (Prompt requirement: 1. Overview, 2. Case History, 3. Medical History, 4. Consultations, 5. Medications, 6. Allergies, 7. Follow-ups) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'case-history', label: `Case History (${caseHistories.length})`, icon: FileText },
          { id: 'medical-history', label: `Medical History (${medicalHistory.length})`, icon: Heart },
          { id: 'consultations', label: `Consultations (${consultations.length})`, icon: Stethoscope },
          { id: 'medications', label: `Medications (${medications.length})`, icon: Pill },
          { id: 'allergies', label: `Allergies (${allergies.length})`, icon: AlertTriangle },
          { id: 'follow-ups', label: `Follow-ups (${followUps.length})`, icon: CalendarCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {currentTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Recent Consultations Overview */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Recent Clinical Consultation</h3>
                <button onClick={() => setTab('consultations')} className="text-xs font-bold text-teal-600 hover:underline">
                  View All ({consultations.length})
                </button>
              </div>

              {consultations.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {consultations.slice(0, 2).map((c) => (
                    <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{c.consultation_date}</span>
                        <span className="text-xs font-semibold text-teal-700">{c.doctor_name}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-2">
                        Primary Diagnosis: <span className="text-teal-700 font-semibold">{c.diagnosis_primary}</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-1">Chief Complaint: {c.chief_complaint}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No consultations recorded yet.</p>
              )}
            </div>

            {/* Chronic Medical Conditions Overview */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Existing Medical Conditions</h3>
                {role !== 'patient' && (
                  <button onClick={() => setIsAddMedicalHistoryOpen(true)} className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Condition
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                {medicalHistory.length > 0 ? (
                  medicalHistory.map((m) => (
                    <div key={m.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900">{m.condition}</span>
                        {m.treatment && (
                          <p className="text-[11px] text-slate-500 mt-0.5">Treatment: {m.treatment}</p>
                        )}
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-100 text-sky-800">
                        {m.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No recorded medical conditions.</p>
                )}
              </div>
            </div>

          </div>

          {/* Right Column Summary Cards */}
          <div className="space-y-6">
            
            {/* Active Medications */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Active Medications</h3>
                {role !== 'patient' && (
                  <button onClick={() => setIsAddMedicationOpen(true)} className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Prescribe
                  </button>
                )}
              </div>

              <div className="space-y-2.5 mt-3">
                {medications.filter(m => m.status === 'Active').length > 0 ? (
                  medications.filter(m => m.status === 'Active').map((med) => (
                    <div key={med.id} className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs">
                      <div className="flex items-center justify-between font-bold text-indigo-950">
                        <span>{med.medicine_name}</span>
                        <span className="text-[10px] bg-indigo-100 px-1.5 py-0.2 rounded">{med.dosage}</span>
                      </div>
                      <p className="text-[11px] text-indigo-700 mt-0.5">{med.frequency} • {med.duration}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No active medications.</p>
                )}
              </div>
            </div>

            {/* Next Follow-up */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Upcoming Follow-up</h3>
                {role !== 'patient' && (
                  <button onClick={() => setIsAddFollowUpOpen(true)} className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Schedule
                  </button>
                )}
              </div>

              <div className="mt-3">
                {followUps.filter(f => f.status === 'Scheduled').length > 0 ? (
                  followUps.filter(f => f.status === 'Scheduled').map((f) => (
                    <div key={f.id} className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-amber-900">
                        <span>{f.follow_up_date}</span>
                        <span className="text-[10px] bg-amber-200 px-1.5 py-0.2 rounded">{f.status}</span>
                      </div>
                      <p className="text-slate-700">{f.reason}</p>
                    </div>
                  ))[0]
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No follow-ups scheduled.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 2: CASE HISTORY */}
      {currentTab === 'case-history' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Case History Records</h3>
              <p className="text-xs text-slate-500">Chronological history of complaints, duration, and lifestyle</p>
            </div>
            {role !== 'patient' && (
              <button
                onClick={() => navigate(`/case-history/new?patientId=${patient.id}`)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Record Case History
              </button>
            )}
          </div>

          <div className="space-y-4">
            {caseHistories.length > 0 ? (
              caseHistories.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-bold text-xs text-teal-700">Date: {c.consultation_date}</span>
                    <span className="text-xs font-semibold text-slate-600">Attending: {c.doctor_name || 'Dr. Smith'}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <strong className="text-slate-900 block mb-1">Chief Complaint:</strong>
                      <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200">{c.chief_complaint}</p>
                    </div>
                    <div>
                      <strong className="text-slate-900 block mb-1">Symptoms & Duration:</strong>
                      <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200">{c.symptoms} ({c.duration || 'N/A'})</p>
                    </div>
                  </div>
                  {c.family_history && (
                    <p className="text-xs text-slate-600"><strong>Family History:</strong> {c.family_history}</p>
                  )}
                  {c.lifestyle && (
                    <p className="text-xs text-slate-600"><strong>Lifestyle Notes:</strong> {c.lifestyle}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-10 text-center">No case history entries recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: MEDICAL HISTORY */}
      {currentTab === 'medical-history' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Long-Term Medical History</h3>
              <p className="text-xs text-slate-500">Diagnosed chronic conditions, surgeries, and past hospitalizations</p>
            </div>
            {role !== 'patient' && (
              <button
                onClick={() => setIsAddMedicalHistoryOpen(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Condition
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 font-bold text-slate-700 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Condition / Disease</th>
                  <th className="p-3">Diagnosed Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Treatment Protocol</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicalHistory.length > 0 ? (
                  medicalHistory.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{m.condition}</td>
                      <td className="p-3 text-slate-500">{m.diagnosed_date}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">{m.treatment || 'N/A'}</td>
                      <td className="p-3 text-slate-500">{m.notes || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-slate-400">No medical history entries.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: CONSULTATIONS */}
      {currentTab === 'consultations' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Doctor Consultations</h3>
              <p className="text-xs text-slate-500">Clinical notes, vital signs, diagnosis, and treatment plans</p>
            </div>
            {role !== 'patient' && (
              <button
                onClick={() => navigate(`/consultation/new?patientId=${patient.id}`)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Conduct New Consultation
              </button>
            )}
          </div>

          <div className="space-y-4">
            {consultations.length > 0 ? (
              consultations.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs text-slate-900">Consultation Date: {c.consultation_date}</span>
                    <span className="text-xs font-semibold text-teal-700">{c.doctor_name} ({c.specialization || 'Internal Medicine'})</span>
                  </div>

                  {/* Vitals Banner */}
                  {(c.blood_pressure || c.temperature || c.heart_rate || c.spo2 || c.weight) && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                      <div><span className="text-slate-400 block text-[10px]">BP:</span> <strong>{c.blood_pressure || 'N/A'}</strong></div>
                      <div><span className="text-slate-400 block text-[10px]">Temp:</span> <strong>{c.temperature || 'N/A'}</strong></div>
                      <div><span className="text-slate-400 block text-[10px]">Pulse:</span> <strong>{c.heart_rate || 'N/A'}</strong></div>
                      <div><span className="text-slate-400 block text-[10px]">SpO2:</span> <strong>{c.spo2 || 'N/A'}</strong></div>
                      <div><span className="text-slate-400 block text-[10px]">Weight:</span> <strong>{c.weight || 'N/A'}</strong></div>
                    </div>
                  )}

                  <div className="text-xs space-y-2">
                    <p><strong>Primary Diagnosis:</strong> <span className="text-teal-700 font-bold">{c.diagnosis_primary}</span></p>
                    {c.diagnosis_additional && <p><strong>Additional Diagnosis:</strong> {c.diagnosis_additional}</p>}
                    <div>
                      <strong>Treatment Plan & Recommendations:</strong>
                      <pre className="font-sans whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-200 mt-1 text-slate-700">
                        {c.treatment_plan}
                      </pre>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-10 text-center">No consultation records recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: MEDICATIONS */}
      {currentTab === 'medications' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Prescribed Medications</h3>
              <p className="text-xs text-slate-500">Current and completed medical prescriptions</p>
            </div>
            {role !== 'patient' && (
              <button
                onClick={() => setIsAddMedicationOpen(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Prescribe Medicine
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 font-bold text-slate-700 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Medicine Name</th>
                  <th className="p-3">Dosage</th>
                  <th className="p-3">Frequency</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medications.length > 0 ? (
                  medications.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{m.medicine_name}</td>
                      <td className="p-3 font-semibold text-indigo-700">{m.dosage}</td>
                      <td className="p-3">{m.frequency}</td>
                      <td className="p-3">{m.duration}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{m.instructions || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="p-6 text-center text-slate-400">No medication records.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: ALLERGIES */}
      {currentTab === 'allergies' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Allergy Management</h3>
              <p className="text-xs text-slate-500">Record drug, food, or environmental hypersensitivities</p>
            </div>
            {role !== 'patient' && (
              <button
                onClick={() => setIsAddAllergyOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Allergy Alert
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allergies.length > 0 ? (
              allergies.map((al) => (
                <div key={al.id} className="p-4 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-rose-900">{al.allergy_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-200 text-rose-900">
                      {al.severity} Severity
                    </span>
                  </div>
                  <p className="text-xs text-slate-700"><strong>Type:</strong> {al.allergy_type || 'Drug'}</p>
                  <p className="text-xs text-slate-700"><strong>Reaction:</strong> {al.reaction}</p>
                  {al.notes && <p className="text-[11px] text-slate-500 italic">"{al.notes}"</p>}
                </div>
              ))
            ) : (
              <div className="col-span-2 py-10 text-center text-xs text-slate-400">No allergy records listed.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: FOLLOW-UPS */}
      {currentTab === 'follow-ups' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Follow-up Appointments</h3>
              <p className="text-xs text-slate-500">Scheduled and previous follow-up visit history</p>
            </div>
            {role !== 'patient' && (
              <button
                onClick={() => setIsAddFollowUpOpen(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Schedule Follow-up
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 font-bold text-slate-700 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Appointment Date</th>
                  <th className="p-3">Reason / Purpose</th>
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {followUps.length > 0 ? (
                  followUps.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{f.follow_up_date}</td>
                      <td className="p-3 font-semibold text-slate-800">{f.reason}</td>
                      <td className="p-3">{f.doctor_name || 'Dr. Sarah Smith'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          {f.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{f.notes || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="p-6 text-center text-slate-400">No follow-up appointments.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Add Allergy */}
      <Modal isOpen={isAddAllergyOpen} onClose={() => setIsAddAllergyOpen(false)} title="Record New Allergy Alert">
        <form onSubmit={handleAddAllergy} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Allergy Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Penicillin, Aspirin, Peanuts"
              value={allergyForm.allergy_name}
              onChange={(e) => setAllergyForm({ ...allergyForm, allergy_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Allergy Type</label>
              <select
                value={allergyForm.allergy_type}
                onChange={(e) => setAllergyForm({ ...allergyForm, allergy_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              >
                <option value="Drug">Drug / Medication</option>
                <option value="Food">Food</option>
                <option value="Environmental">Environmental</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Severity *</label>
              <select
                value={allergyForm.severity}
                onChange={(e) => setAllergyForm({ ...allergyForm, severity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-rose-600"
              >
                <option value="High">High (Anaphylaxis Risk)</option>
                <option value="Moderate">Moderate</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Allergic Reaction *</label>
            <input
              type="text"
              required
              placeholder="e.g. Skin rash, facial swelling, breathing difficulty"
              value={allergyForm.reaction}
              onChange={(e) => setAllergyForm({ ...allergyForm, reaction: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Clinical Notes</label>
            <textarea
              rows="2"
              placeholder="e.g. Strictly avoid all Beta-lactams"
              value={allergyForm.notes}
              onChange={(e) => setAllergyForm({ ...allergyForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddAllergyOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl">Save Allergy Alert</button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Add Medical History Condition */}
      <Modal isOpen={isAddMedicalHistoryOpen} onClose={() => setIsAddMedicalHistoryOpen(false)} title="Add Medical Condition History">
        <form onSubmit={handleAddMedHistory} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Condition / Disease *</label>
            <input
              type="text"
              required
              placeholder="e.g. Type 2 Diabetes, Essential Hypertension, Asthma"
              value={medHistoryForm.condition}
              onChange={(e) => setMedHistoryForm({ ...medHistoryForm, condition: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Diagnosed Date</label>
              <input
                type="date"
                value={medHistoryForm.diagnosed_date}
                onChange={(e) => setMedHistoryForm({ ...medHistoryForm, diagnosed_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={medHistoryForm.status}
                onChange={(e) => setMedHistoryForm({ ...medHistoryForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              >
                <option value="Active">Active</option>
                <option value="Resolved">Resolved</option>
                <option value="Chronic">Chronic</option>
                <option value="Under Treatment">Under Treatment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Treatment Protocol</label>
            <input
              type="text"
              placeholder="e.g. Metformin 500mg daily & lifestyle control"
              value={medHistoryForm.treatment}
              onChange={(e) => setMedHistoryForm({ ...medHistoryForm, treatment: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddMedicalHistoryOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl">Save Condition</button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Prescribe Medication */}
      <Modal isOpen={isAddMedicationOpen} onClose={() => setIsAddMedicationOpen(false)} title="Prescribe New Medication">
        <form onSubmit={handleAddMedication} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Medicine Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Amoxicillin / Amlodipine"
              value={medicationForm.medicine_name}
              onChange={(e) => setMedicationForm({ ...medicationForm, medicine_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Dosage *</label>
              <input
                type="text"
                required
                placeholder="e.g. 500 mg"
                value={medicationForm.dosage}
                onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Frequency *</label>
              <input
                type="text"
                required
                placeholder="e.g. Twice daily"
                value={medicationForm.frequency}
                onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                placeholder="e.g. 7 Days"
                value={medicationForm.duration}
                onChange={(e) => setMedicationForm({ ...medicationForm, duration: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Special Instructions</label>
            <input
              type="text"
              placeholder="e.g. Take with meals"
              value={medicationForm.instructions}
              onChange={(e) => setMedicationForm({ ...medicationForm, instructions: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddMedicationOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl">Prescribe Medication</button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Schedule Follow-up */}
      <Modal isOpen={isAddFollowUpOpen} onClose={() => setIsAddFollowUpOpen(false)} title="Schedule Follow-up Appointment">
        <form onSubmit={handleAddFollowUp} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Follow-up Date *</label>
            <input
              type="date"
              required
              value={followUpForm.follow_up_date}
              onChange={(e) => setFollowUpForm({ ...followUpForm, follow_up_date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Visit *</label>
            <input
              type="text"
              required
              placeholder="e.g. Blood Pressure Re-check / Post-op review"
              value={followUpForm.reason}
              onChange={(e) => setFollowUpForm({ ...followUpForm, reason: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Doctor Notes</label>
            <textarea
              rows="2"
              placeholder="Instructions prior to visit..."
              value={followUpForm.notes}
              onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddFollowUpOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl">Confirm Schedule</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
