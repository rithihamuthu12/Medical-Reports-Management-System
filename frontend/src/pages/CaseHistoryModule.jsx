import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Save, ArrowLeft, Activity, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const CaseHistoryModule = () => {
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patientId');

  const { showToast } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: patientIdParam || '',
    consultation_date: new Date().toISOString().split('T')[0],
    chief_complaint: '',
    symptoms: '',
    duration: '1 Week',
    severity: 'Moderate',
    previous_history: '',
    family_history: '',
    lifestyle: '',
    notes: ''
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.getPatients({ limit: 100 });
        setPatients(res.patients || []);
      } catch (err) {
        console.error('Failed to load patient dropdown:', err);
      }
    };
    fetchPatients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.chief_complaint || !formData.symptoms) {
      showToast('Please fill out Patient, Chief Complaint, and Symptoms.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await api.createCaseHistory(formData);
      showToast('Case history recorded successfully!', 'success');
      navigate(`/patients/${formData.patient_id}?tab=case-history`);
    } catch (err) {
      showToast(err.message || 'Failed to record case history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Clinical Case-Taking Workspace
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500 text-slate-950 rounded-2xl font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">Detailed Clinical Case-Taking</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Record comprehensive patient history, symptom progression, family background, and lifestyle.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 text-xs">
          
          {/* Patient Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Select Patient <span className="text-rose-500">*</span>
            </label>
            <select
              name="patient_id"
              required
              value={formData.patient_id}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-semibold"
            >
              <option value="">-- Choose Patient Record --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.patient_id}) - {p.gender}, {p.age} yrs
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Consultation Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="consultation_date"
                required
                value={formData.consultation_date}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Symptom Severity
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-amber-600"
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Chief Complaint <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="chief_complaint"
              required
              placeholder="e.g. Severe headache in morning with chest tightness"
              value={formData.chief_complaint}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Detailed Symptoms <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="symptoms"
                required
                placeholder="e.g. Dizziness, blurred vision, palpitation"
                value={formData.symptoms}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Symptom Duration
              </label>
              <input
                type="text"
                name="duration"
                placeholder="e.g. 3 Weeks"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Previous Medical History
            </label>
            <textarea
              name="previous_history"
              rows="2"
              placeholder="e.g. Known Hypertension for 6 years, Type 2 Diabetes"
              value={formData.previous_history}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Family Medical History
              </label>
              <textarea
                name="family_history"
                rows="2"
                placeholder="e.g. Father had Myocardial Infarction at age 55"
                value={formData.family_history}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              ></textarea>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Lifestyle & Habits
              </label>
              <textarea
                name="lifestyle"
                rows="2"
                placeholder="e.g. Sedentary lifestyle, high sodium diet, non-smoker"
                value={formData.lifestyle}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              ></textarea>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Relevant Clinical Notes
            </label>
            <textarea
              name="notes"
              rows="2"
              placeholder="Additional clinical observation notes..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Record...' : 'Save Case Record'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
