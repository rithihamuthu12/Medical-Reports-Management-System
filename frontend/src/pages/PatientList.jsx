import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  FileText,
  Activity,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const PatientList = () => {
  const { role, showToast } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Search State
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [bloodFilter, setBloodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Confirm delete dialog state
  const [deletePatientItem, setDeletePatientItem] = useState(null);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.getPatients({
        search,
        gender: genderFilter,
        blood_group: bloodFilter,
        status: statusFilter,
        sort,
        page,
        limit
      });
      setPatients(res.patients || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load patient list:', err);
      showToast('Error loading patient directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, genderFilter, bloodFilter, statusFilter, sort, page]);

  const handleDeleteConfirm = async () => {
    if (!deletePatientItem) return;
    try {
      await api.deletePatient(deletePatientItem.id);
      showToast(`Patient ${deletePatientItem.full_name} deleted successfully.`, 'success');
      fetchPatients();
    } catch (err) {
      showToast(err.message || 'Failed to delete patient record.', 'error');
    } finally {
      setDeletePatientItem(null);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and manage registered patient medical profiles ({total} Total Records)
          </p>
        </div>

        {role !== 'patient' && (
          <Link
            to="/patients/new"
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </Link>
        )}
      </div>

      {/* Filter and Search Control Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Patient ID, Name, Phone, Email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            />
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={genderFilter}
              onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Blood Group Filter */}
          <div>
            <select
              value={bloodFilter}
              onChange={(e) => { setBloodFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Activity className="w-5 h-5 animate-spin text-teal-600" />
            <span>Fetching patient database...</span>
          </div>
        ) : patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Patient ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Age / Gender</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Reg. Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                      {patient.patient_id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <Link to={`/patients/${patient.id}`} className="hover:text-teal-600 transition">
                        {patient.full_name}
                      </Link>
                      {patient.email && (
                        <span className="block text-[11px] font-normal text-slate-400">{patient.email}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {patient.age} yrs • {patient.gender}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono">
                      {patient.phone}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-600">
                      {patient.blood_group || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/patients/${patient.id}`}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                          title="View Profile & Medical Record"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {role !== 'patient' && (
                          <>
                            <button
                              onClick={() => navigate(`/patients/edit/${patient.id}`)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit Patient"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {role === 'admin' && (
                              <button
                                onClick={() => setDeletePatientItem(patient)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Patient"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400">
            No patient records match the selected filters.
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} Records)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletePatientItem}
        onClose={() => setDeletePatientItem(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient Record"
        message={`Are you sure you want to permanently delete patient ${deletePatientItem?.full_name} (${deletePatientItem?.patient_id})? All associated clinical consultations, medical history, and prescriptions will be deleted.`}
        confirmText="Permanently Delete"
      />
    </div>
  );
};
