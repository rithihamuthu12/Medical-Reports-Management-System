import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserPlus, User, Calendar, Phone, Mail, MapPin, Heart, AlertCircle, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const PatientRegistration = () => {
  const { id } = useParams(); // If present, edit mode!
  const isEditMode = !!id;
  const { showToast } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    emergency_contact: '',
    blood_group: 'O+',
    known_allergies: '',
    existing_conditions: '',
    current_medications: ''
  });

  // Calculate age automatically when DOB changes
  useEffect(() => {
    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      if (!isNaN(dob.getTime())) {
        const diffMs = Date.now() - dob.getTime();
        const ageDate = new Date(diffMs);
        const calcAge = Math.abs(ageDate.getUTCFullYear() - 1970);
        setFormData(prev => ({ ...prev, age: calcAge }));
      }
    }
  }, [formData.date_of_birth]);

  // Load existing data if editing
  useEffect(() => {
    if (isEditMode) {
      const loadPatient = async () => {
        try {
          const res = await api.getPatientById(id);
          const p = res.patient;
          setFormData({
            full_name: p.full_name || '',
            date_of_birth: p.date_of_birth || '',
            age: p.age || '',
            gender: p.gender || 'Male',
            phone: p.phone || '',
            email: p.email || '',
            address: p.address || '',
            emergency_contact: p.emergency_contact || '',
            blood_group: p.blood_group || 'O+',
            known_allergies: '',
            existing_conditions: '',
            current_medications: ''
          });
        } catch (err) {
          showToast('Failed to load patient record for editing.', 'error');
        }
      };
      loadPatient();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name.trim() || !formData.date_of_birth || !formData.phone.trim()) {
      showToast('Please fill out all required fields marked with *', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await api.updatePatient(id, formData);
        showToast('Patient record updated successfully!', 'success');
        navigate(`/patients/${id}`);
      } else {
        const res = await api.createPatient(formData);
        showToast(`Patient ${res.patient.full_name} (${res.patient.patient_id}) registered successfully!`, 'success');
        navigate(`/patients/${res.patient.id}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to save patient record.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </button>
        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
          {isEditMode ? 'Edit Mode' : 'New Intake Registration'}
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-6 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500 text-slate-950 rounded-2xl font-bold">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                {isEditMode ? 'Update Patient Profile' : 'Patient Registration Form'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Fill in personal demographics and medical alert parameters.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Section 1: Personal Information */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              1. Personal Demographics & Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  required
                  placeholder="e.g. Robert Vance"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  required
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Age (Calculated)
                </label>
                <input
                  type="number"
                  name="age"
                  readOnly
                  placeholder="Auto calculated from DOB"
                  value={formData.age}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+1-555-0199"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Emergency Contact (Name & Phone)
                </label>
                <input
                  type="text"
                  name="emergency_contact"
                  placeholder="e.g. Mary Vance (Wife) - +1-555-0190"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="742 Evergreen Terrace, Springfield"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Medical Baseline Info */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600" />
              2. Baseline Medical Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-semibold text-rose-600"
                >
                  <option value="O+">O Rh-positive (O+)</option>
                  <option value="O-">O Rh-negative (O-)</option>
                  <option value="A+">A Rh-positive (A+)</option>
                  <option value="A-">A Rh-negative (A-)</option>
                  <option value="B+">B Rh-positive (B+)</option>
                  <option value="B-">B Rh-negative (B-)</option>
                  <option value="AB+">AB Rh-positive (AB+)</option>
                  <option value="AB-">AB Rh-negative (AB-)</option>
                </select>
              </div>

              {!isEditMode && (
                <>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1 text-rose-700">
                      Known Allergies (Drug/Food)
                    </label>
                    <input
                      type="text"
                      name="known_allergies"
                      placeholder="e.g. Penicillin, Peanuts, Latex"
                      value={formData.known_allergies}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-rose-50/50 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Existing Medical Conditions
                    </label>
                    <input
                      type="text"
                      name="existing_conditions"
                      placeholder="e.g. Hypertension, Type 2 Diabetes"
                      value={formData.existing_conditions}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Current Medications
                    </label>
                    <input
                      type="text"
                      name="current_medications"
                      placeholder="e.g. Metformin 500mg, Amlodipine 5mg"
                      value={formData.current_medications}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/patients')}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : isEditMode ? 'Update Patient' : 'Save & Register Patient'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
