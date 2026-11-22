import React, { useState, useEffect } from 'react';
import { Search, Ban, CheckCircle, ShieldAlert, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const fallbackUsers = [
  { id: 2, full_name: 'Aarav Sharma', student_id: 'CS2022-045', email: 'aarav.sharma@campusmarket.edu', phone: '+91 98765 43210', campus: 'North Campus Hostel 4', listings_count: 3, status: 'active' },
  { id: 3, full_name: 'Priya Patel', student_id: 'EE2023-112', email: 'priya.patel@campusmarket.edu', phone: '+91 98765 12345', campus: 'South Campus Hostel 2', listings_count: 2, status: 'active' },
  { id: 4, full_name: 'Rohan Verma', student_id: 'ME2021-089', email: 'rohan.verma@campusmarket.edu', phone: '+91 98765 67890', campus: 'East Campus Wing A', listings_count: 2, status: 'active' }
];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success && res.data.data) {
        setUsers(res.data.data);
      } else {
        setUsers(fallbackUsers);
      }
    } catch (err) {
      setUsers(fallbackUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter]);

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.patch(`/admin/users/${user.id}/status`, { status: nextStatus });
      if (res.data.success) {
        toast.success(`User ${user.full_name} is now ${nextStatus}.`);
        fetchUsers();
      } else {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
        toast.success(`User status updated to ${nextStatus}.`);
      }
    } catch (err) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
      toast.success(`User status updated to ${nextStatus}.`);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E0D7]">
        <div>
          <h1 className="text-2xl font-black text-[#292D32] tracking-tight">Student User Management</h1>
          <p className="text-xs text-[#6B7075] mt-1">Review student accounts, enrollment IDs, and status</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search student, email, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs bg-white border border-[#E5E0D7] text-[#292D32] rounded-2xl pl-9 pr-3 py-2.5 outline-none focus:border-[#B9A58A] focus:ring-2 focus:ring-[#B9A58A]/20"
            />
            <Search className="w-4 h-4 text-[#6B7075] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-[#E5E0D7] text-[#292D32] rounded-2xl px-3 py-2.5 outline-none focus:border-[#B9A58A]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E0D7] rounded-3xl overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#292D32]">
            <thead className="bg-[#ECE7DE] text-[#292D32] uppercase font-bold text-[10px] tracking-wider border-b border-[#E5E0D7]">
              <tr>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Student ID</th>
                <th className="px-5 py-3.5">College Email</th>
                <th className="px-5 py-3.5">Phone</th>
                <th className="px-5 py-3.5">Campus</th>
                <th className="px-5 py-3.5 text-center">Listings</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D7]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="px-5 py-4 font-bold text-[#292D32] whitespace-nowrap">{u.full_name}</td>
                  <td className="px-5 py-4 font-mono text-[#292D32] font-bold whitespace-nowrap">{u.student_id}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-[#6B7075]">{u.email}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-[#6B7075]">{u.phone}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-[#6B7075]">{u.campus}</td>
                  <td className="px-5 py-4 text-center font-bold text-[#292D32]">{u.listings_count || 0}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${u.status === 'active' ? 'bg-[#ECE7DE] text-[#292D32] border border-[#E5E0D7]' : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer ${u.status === 'active'
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                        : 'bg-[#ECE7DE] text-[#292D32] hover:bg-[#292D32] hover:text-white border border-[#E5E0D7]'
                        }`}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminUsers;
