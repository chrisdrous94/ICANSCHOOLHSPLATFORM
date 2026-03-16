import { useState, useEffect } from 'react';
import API from '../lib/api';
import { toast } from 'sonner';
import { Search, Plus, UserPlus, ChevronDown, Award, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const ROLES = ['Teachers', 'Security Guards', 'Kitchen Staff', 'Extra-Curricular Staff', 'Reception Staff', 'First Aid Team'];

export default function AdminStaffDirectory() {
  const [staff, setStaff] = useState([]);
  const [paths, setPaths] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', staff_category: 'Teachers', password: 'staff123' });

  useEffect(() => {
    Promise.all([API.get('/analytics/staff-progress'), API.get('/learning-paths')])
      .then(([sRes, pRes]) => { setStaff(sRes.data); setPaths(pRes.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const addStaff = async () => {
    if (!newStaff.name || !newStaff.email) { toast.error('Name and email required'); return; }
    try {
      await API.post('/users/create-staff', newStaff);
      const { data } = await API.get('/analytics/staff-progress');
      setStaff(data);
      setShowAdd(false);
      setNewStaff({ name: '', email: '', staff_category: 'Teachers', password: 'staff123' });
      toast.success('Staff member added');
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to add'); }
  };

  const assignPath = async (userId, pathId) => {
    try {
      await API.post('/users/assign-path', { user_id: userId, path_id: pathId });
      setStaff(staff.map(s => s.id === userId ? { ...s, assigned_path_id: pathId } : s));
      toast.success('Path assigned');
    } catch { toast.error('Failed to assign'); }
  };

  const filtered = staff.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'All' || s.staff_category === filterRole;
    return matchSearch && matchRole;
  });

  if (loading) return <div className="flex items-center justify-center h-64 text-[#707973]">Loading staff...</div>;

  return (
    <div data-testid="staff-directory" className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#002114] tracking-tight">Staff Directory</h1>
          <p className="text-[#707973] mt-1">{staff.length} staff members registered</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="m3-btn-filled flex items-center gap-2" data-testid="add-staff-btn">
          <UserPlus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707973]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#F0F5F1] outline-none text-sm focus:bg-[#E8F0EB] transition-colors"
            placeholder="Search by name or email..."
            data-testid="search-staff"
          />
        </div>
        <div className="relative">
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="px-4 py-2.5 rounded-full bg-[#F0F5F1] outline-none text-sm appearance-none pr-10 cursor-pointer"
            data-testid="filter-role"
          >
            <option value="All">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707973] pointer-events-none" />
        </div>
      </div>

      {/* Staff Table */}
      <div className="m3-card overflow-x-auto" data-testid="staff-table">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#707973] font-semibold uppercase tracking-wider">
              <th className="pb-3 pl-2">Name</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Progress</th>
              <th className="pb-3">Exams</th>
              <th className="pb-3">Certificate</th>
              <th className="pb-3">Path</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DBE5DE]">
            {filtered.map(s => {
              const pathObj = paths.find(p => p.id === s.assigned_path_id);
              const certValid = s.certificate && !s.certificate.is_revoked;
              const certExpiring = certValid && new Date(s.certificate.expires_at) < new Date(Date.now() + 30 * 86400000);
              return (
                <tr key={s.id} className="hover:bg-[#E8F0EB]/50 transition-colors" data-testid={`staff-row-${s.id}`}>
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#D0E8D8] flex items-center justify-center text-[#006C4C] font-bold text-xs">
                        {s.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#002114]">{s.name}</div>
                        <div className="text-xs text-[#707973]">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="pill-info">{s.staff_category}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="m3-progress-track w-20">
                        <div className="m3-progress-fill" style={{ width: `${s.progress_pct}%` }} />
                      </div>
                      <span className="text-xs text-[#707973]">{s.progress_pct}%</span>
                    </div>
                  </td>
                  <td className="text-[#404944]">{s.exam_attempts}</td>
                  <td>
                    {certValid ? (
                      <span className={certExpiring ? 'pill-warning' : 'pill-success'}>
                        {certExpiring ? 'Expiring' : 'Active'}
                      </span>
                    ) : (
                      <span className="pill-neutral">None</span>
                    )}
                  </td>
                  <td>
                    <div className="relative">
                      <select
                        value={s.assigned_path_id || ''}
                        onChange={e => assignPath(s.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-full bg-[#F0F5F1] outline-none appearance-none pr-6 cursor-pointer"
                        data-testid={`assign-path-${s.id}`}
                      >
                        <option value="">No Path</option>
                        {paths.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-[#707973] pointer-events-none" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-[#707973]">No staff found</div>}
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="rounded-[28px] border-none bg-[#FBFDF9] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#002114]">Add Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-[#404944] mb-1">Full Name</label>
              <input
                value={newStaff.name}
                onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#DBE5DE]/30 outline-none text-sm focus:bg-[#DBE5DE]/50"
                placeholder="e.g., John Smith"
                data-testid="new-staff-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#404944] mb-1">Email</label>
              <input
                value={newStaff.email}
                onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#DBE5DE]/30 outline-none text-sm focus:bg-[#DBE5DE]/50"
                placeholder="email@icanschool.com"
                data-testid="new-staff-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#404944] mb-1">Staff Category</label>
              <select
                value={newStaff.staff_category}
                onChange={e => setNewStaff({ ...newStaff, staff_category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#DBE5DE]/30 outline-none text-sm appearance-none cursor-pointer"
                data-testid="new-staff-category"
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#404944] mb-1">Temporary Password</label>
              <input
                value={newStaff.password}
                onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#DBE5DE]/30 outline-none text-sm focus:bg-[#DBE5DE]/50"
                data-testid="new-staff-password"
              />
            </div>
            <button onClick={addStaff} className="m3-btn-filled w-full" data-testid="confirm-add-staff">
              Add Staff Member
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
