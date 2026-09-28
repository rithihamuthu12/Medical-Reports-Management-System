import React, { useState, useEffect } from 'react';
import { Search, User, Phone, ArrowRight, Activity, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { api } from '../services/api';

export const PatientSearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.quickSearchPatients(searchTerm);
        setResults(res);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectPatient = (patientId) => {
    onClose();
    setSearchTerm('');
    navigate(`/patients/${patientId}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Search Patient Records" maxWidth="max-w-xl">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Patient ID (PAT-2026-001), Name, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            autoFocus
          />
        </div>

        {/* Results List */}
        <div className="min-h-[220px] max-h-[360px] overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400 text-sm gap-2">
              <Activity className="w-5 h-5 animate-spin text-teal-600" />
              <span>Searching patient directory...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((patient) => (
              <div
                key={patient.id}
                onClick={() => handleSelectPatient(patient.id)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm shrink-0">
                    {patient.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm group-hover:text-teal-700 transition">
                        {patient.full_name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                        {patient.patient_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{patient.gender}, {patient.age} yrs</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {patient.phone}
                      </span>
                      {patient.blood_group && (
                        <>
                          <span>•</span>
                          <span className="text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.2 rounded">
                            {patient.blood_group}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition" />
              </div>
            ))
          ) : searchTerm.trim() ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No matching patient records found for "{searchTerm}".
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              Type a patient name, phone number, or ID above to search.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
