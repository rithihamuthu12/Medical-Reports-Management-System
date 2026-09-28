import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Stethoscope, Activity, AlertTriangle, Plus, Trash2, Save, ArrowLeft, Heart, Pill } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ConsultationModule = () => {
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patientId');

  const { showToast } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [patientId, setPatientId] = useState(patientIdParam || '');
  const [consultationDate, setConsultationDate] = useState(new Date().toISOString().split('T')[0]);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState('');

  // Vitals
  const [vitals, setVitals] = useState({
    temperature: '98.6 °F',
    blood_pressure: '120/80 mmHg',
    heart_rate: '72 bpm',
    spo2: '98%',
    weight: '70 kg'
  });

  // Clinical
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosisPrimary, setDiagnosisPrimary] = useState('');
  const [diagnosisAdditional, setDiagnosisAdditional] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');

  // Prescribed Medicines list builder
  const [medicines, setMedicines] = useState([
    { medicine_name: '', dosage: '1 tablet', frequency: 'Once daily', duration: '7 Days', instructions: 'Take after meals' }
  ]);

  // Load Patients list
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.getPatients({ limit: 100 });
        setPatients(res.patients || []);
      } catch (err) {
        console.error('Failed to load patient list:', err);
      }
    };
    fetchPatients();
  }, []);

  // Fetch full details of selected patient to show Banner with Allergies & Conditions
  useEffect(() => {
    if (patientId) {
      const loadPatientDetails = async () => {
        try {
          const res = await api.getPatientById(patientId);
          setSelectedPatient(res);
        } catch (err) {
          console.error(err);
        }
      };
      loadPatientDetails();
    } else {
      setSelectedPatient(null);
    }
  }, [patientId]);

  const addMedicineRow = () => {
    setMedicines([...medicines, { medicine_name: '', dosage: '1 tablet', frequency: 'Once daily', duration: '7 Days', instructions: '' }]);
  };

  const removeMedicineRow = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientId || !chiefComplaint.trim() || !symptoms.trim() || !diagnosisPrimary.trim() || !treatmentPlan.trim()) {
      showToast('Please complete all required fields: Patient, Chief Complaint, Symptoms, Primary Diagnosis, Treatment Plan.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const validMeds = medicines.filter(m => m.medicine_name && m.medicine_name.trim());

      await api.createConsultation({
        patient_id: patientId,
        consultation_date: consultationDate,
        chief_complaint: chiefComplaint,
        symptoms,
        ...vitals,
        clinical_notes: clinicalNotes,
        diagnosis_primary: diagnosisPrimary,
        diagnosis_additional: diagnosisAdditional,
        treatment_plan: treatmentPlan,
        doctor_notes: doctorNotes,
        prescribed_medicines: validMeds
      });

      showToast('Doctor Consultation and Prescription recorded successfully!', 'success');
      navigate(`/patients/${patientId}?tab=consultations`);
    } catch (err) {
      showToast(err.message || 'Failed to record consultation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Doctor Consultation & EHR Workspace
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-400 text-slate-950 rounded-2xl font-bold">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">New Clinical Consultation</h1>
              <p className="text-xs text-teal-100/80 mt-0.5">
                Record vital signs, clinical examination notes, diagnosis, and issue prescriptions.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 text-xs">
          
          {/* Section 1: Select Patient */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">
              1. Select Patient
            </h3>
            
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Patient Record <span className="text-rose-500">*</span>
              </label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-teal-800 text-xs focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Select Patient for Consultation --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.patient_id}) - {p.gender}, {p.age} yrs • Blood Group: {p.blood_group}
                  </option>
                ))}
              </select>
            </div>

            {/* AUTO-DISPLAYED PATIENT SUMMARY & ALLERGIES BANNER (Prompt requirement!) */}
            {selectedPatient && (
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
                <div className="flex items-center justify-between text-slate-900">
                  <div className="font-bold text-sm">
                    {selectedPatient.patient.full_name} ({selectedPatient.patient.patient_id})
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    {selectedPatient.patient.gender}, {selectedPatient.patient.age} yrs • Phone: {selectedPatient.patient.phone}
                  </div>
                </div>

                {/* VISUAL ALLERGY WARNING ON CONSULTATION FORM */}
                {selectedPatient.allergies?.length > 0 ? (
                  <div className="p-2.5 bg-rose-100 border border-rose-300 rounded-xl text-rose-900 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      WARNING ALLERGIES: {selectedPatient.allergies.map(a => `${a.allergy_name} (${a.reaction})`).join(', ')}
                    </span>
                  </div>
                ) : (
                  <div className="text-slate-500 text-[11px]">No known drug or food allergies recorded.</div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Consultation Details & Vitals */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">
              2. Consultation Info & Vital Signs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Consultation Date</label>
                <input
                  type="date"
                  value={consultationDate}
                  onChange={(e) => setConsultationDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chief Complaint *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Uncontrolled morning headache & dizziness"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Symptoms *</label>
              <input
                type="text"
                required
                placeholder="e.g. Elevated blood pressure readings, mild chest tightness"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Vitals Grid */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                Vital Signs Measurement
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={vitals.blood_pressure}
                    onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Temperature</label>
                  <input
                    type="text"
                    value={vitals.temperature}
                    onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Heart Rate</label>
                  <input
                    type="text"
                    value={vitals.heart_rate}
                    onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">SpO2</label>
                  <input
                    type="text"
                    value={vitals.spo2}
                    onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Weight</label>
                  <input
                    type="text"
                    value={vitals.weight}
                    onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Clinical Notes & Physical Examination</label>
              <textarea
                rows="2"
                placeholder="Doctor's clinical findings during examination..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              ></textarea>
            </div>
          </div>

          {/* Section 3: Diagnosis and Treatment */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">
              3. Clinical Diagnosis & Treatment Plan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stage 1 Essential Hypertension"
                  value={diagnosisPrimary}
                  onChange={(e) => setDiagnosisPrimary(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-teal-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Additional Diagnosis</label>
                <input
                  type="text"
                  placeholder="e.g. Hyperlipidemia / Mild Anxiety"
                  value={diagnosisAdditional}
                  onChange={(e) => setDiagnosisAdditional(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Treatment Plan & Recommendations *</label>
              <textarea
                rows="3"
                required
                placeholder="1. Increase Amlodipine to 10mg daily.&#10;2. Low sodium diet (<2g/day).&#10;3. Follow up in 2 weeks."
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              ></textarea>
            </div>
          </div>

          {/* Section 4: Prescribed Medicines (Multi-Row Builder) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                <Pill className="w-4 h-4 text-indigo-600" />
                4. Prescribed Medications
              </h3>
              <button
                type="button"
                onClick={addMedicineRow}
                className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
              >
                <Plus className="w-3.5 h-3.5" /> Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Amlodipine)"
                      value={med.medicine_name}
                      onChange={(e) => handleMedicineChange(index, 'medicine_name', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 10 mg)"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Frequency (e.g. Once daily)"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Duration (e.g. 30 Days)"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicineRow(index)}
                        className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
              <span>{loading ? 'Recording Consultation...' : 'Finalize & Save Consultation'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
