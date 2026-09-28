import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, Stethoscope, User, Plus, Trash2, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const UserManagement = () => {
  const { showToast } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor',
    phone: '',
    specialization: 'Internal Medicine'
  });

  const [deleteUserItem, setDeleteUserItem] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      setUsers(res || []);
    } catch (err) {
      showToast('Error loading user accounts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email || !userForm.password) {
      showToast('Name, Email, and Password are required.', 'warning');
      return;
    }

    try {
      await api.createUser(userForm);
      showToast(`User ${userForm.name} created successfully!`, 'success');
      setIsAddUserOpen(false);
      setUserForm({ name: '', email: '', password: '', role: 'doctor', phone: '', specialization: 'Internal Medicine' });
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to create user account.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUserItem) return;
    try {
      await api.deleteUser(deleteUserItem.id);
      showToast('User account deleted.', 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to delete user.', 'error');
    } finally {
      setDeleteUserItem(null);
    }
  };

  const roleBadges = {
    admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    doctor: 'bg-teal-100 text-teal-700 border-teal-200',
    patient: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff & User Accounts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage system administrators, medical doctors, and staff authorization
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Account</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Activity className="w-5 h-5 animate-spin text-teal-600" />
            <span>Loading user accounts...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Specialization</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                      {u.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${roleBadges[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{u.specialization || '-'}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{u.phone || '-'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setDeleteUserItem(u)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Create Staff Account">
        <form onSubmit={handleAddUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Emily Chen"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="doctor@medrecord.com"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Role *</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
              >
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
                <option value="patient">Patient</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Specialization</label>
              <input
                type="text"
                placeholder="e.g. Cardiology / Pediatrics"
                value={userForm.specialization}
                onChange={(e) => setUserForm({ ...userForm, specialization: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="+1-555-0103"
              value={userForm.phone}
              onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddUserOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl">Create Account</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteUserItem}
        onClose={() => setDeleteUserItem(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account"
        message={`Are you sure you want to delete user account ${deleteUserItem?.name} (${deleteUserItem?.email})?`}
      />
    </div>
  );
};
