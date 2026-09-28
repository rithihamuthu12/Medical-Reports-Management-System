import React, { useState, useEffect } from 'react';
import { CalendarCheck, Calendar, Filter, Plus, CheckCircle2, Clock, XCircle, Activity, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const FollowUpModule = () => {
  const { role, showToast } = useAuth();
  const [followUps, setFollowUps] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState('all'); // all, today, this_week, upcoming, completed
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    patient_id: '',
    follow_up_date: new Date().toISOString().split('T')[0],
    reason: '',
    notes: ''
  });

  const [deleteItem, setDeleteItem] = useState(null);

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const res = await api.getFollowUps({ filter: activeFilter, status: statusFilter });
      setFollowUps(res || []);
    } catch (err) {
      console.error(err);
      showToast('Error loading follow-up schedule.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [activeFilter, statusFilter]);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await api.getPatients({ limit: 100 });
        setPatients(res.patients || []);
      } catch (err) {
        console.error(err);
      }
    };
    if (role !== 'patient') loadPatients();
  }, [role]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateFollowUp(id, { status: newStatus });
      showToast(`Appointment status changed to ${newStatus}.`, 'success');
      fetchFollowUps();
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleForm.patient_id || !scheduleForm.follow_up_date || !scheduleForm.reason) {
      showToast('Please select Patient, Date, and Reason.', 'warning');
      return;
    }
    try {
      await api.createFollowUp(scheduleForm);
      showToast('Follow-up appointment scheduled successfully!', 'success');
      setIsScheduleOpen(false);
      setScheduleForm({ patient_id: '', follow_up_date: new Date().toISOString().split('T')[0], reason: '', notes: '' });
      fetchFollowUps();
    } catch (err) {
      showToast(err.message || 'Failed to schedule appointment.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    try {
      await api.deleteFollowUp(deleteItem.id);
      showToast('Follow-up appointment deleted.', 'success');
      fetchFollowUps();
    } catch (err) {
      showToast('Failed to delete follow-up.', 'error');
    } finally {
      setDeleteItem(null);
    }
  };

  const statusColors = {
    Scheduled: 'bg-amber-100 text-amber-800 border-amber-200',
    Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Missed: 'bg-rose-100 text-rose-800 border-rose-200',
    Cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Follow-Up Appointments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track patient reviews, status updates, and upcoming appointments
          </p>
        </div>

        {role !== 'patient' && (
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Follow-up</span>
          </button>
        )}
      </div>

      {/* Status Filter Tabs (Prompt requirement: Today, This week, Upcoming, Completed) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'all', label: 'All Appointments' },
          { id: 'today', label: "Today's Visits" },
          { id: 'this_week', label: 'This Week' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: 'Completed History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeFilter === tab.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Activity className="w-5 h-5 animate-spin text-teal-600" />
            <span>Fetching follow-up schedule...</span>
          </div>
        ) : followUps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Reason / Purpose</th>
                  <th className="py-3.5 px-4">Doctor</th>
                  <th className="py-3.5 px-4">Status</th>
                  {role !== 'patient' && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {followUps.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      {item.follow_up_date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.patient_name}
                      <span className="block text-[11px] font-mono text-slate-400 font-normal">
                        {item.patient_code} • {item.patient_phone}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {item.reason}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.doctor_name || 'Dr. Sarah Smith'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${statusColors[item.status] || 'bg-slate-100'}`}>
                        {item.status}
                      </span>
                    </td>
                    {role !== 'patient' && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.status === 'Scheduled' && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'Completed')}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-bold transition"
                            >
                              Mark Completed
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteItem(item)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400">
            No follow-up appointments found for the selected filter.
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      <Modal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} title="Schedule Follow-up Appointment">
        <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Patient *</label>
            <select
              value={scheduleForm.patient_id}
              onChange={(e) => setScheduleForm({ ...scheduleForm, patient_id: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.full_name} ({p.patient_id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Appointment Date *</label>
            <input
              type="date"
              required
              value={scheduleForm.follow_up_date}
              onChange={(e) => setScheduleForm({ ...scheduleForm, follow_up_date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason / Purpose *</label>
            <input
              type="text"
              required
              placeholder="e.g. BP dosage evaluation / Post-op review"
              value={scheduleForm.reason}
              onChange={(e) => setScheduleForm({ ...scheduleForm, reason: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Clinical Notes</label>
            <textarea
              rows="2"
              placeholder="Instructions for patient prior to visit..."
              value={scheduleForm.notes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setIsScheduleOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl">Confirm Schedule</button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDeleteConfirm}
        title="Cancel Follow-up Appointment"
        message={`Are you sure you want to delete the appointment scheduled for ${deleteItem?.patient_name} on ${deleteItem?.follow_up_date}?`}
      />

    </div>
  );
};
