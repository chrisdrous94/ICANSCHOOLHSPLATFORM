import { useState, useEffect } from 'react';
import API from '../lib/api';
import { toast } from 'sonner';
import { Search, UserPlus, ChevronDown, Award, Edit2, Trash2, Mail, Copy, Check, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

const ROLES = ['Teachers', 'Security Guards', 'Kitchen Staff', 'Extra-Curricular Staff', 'Reception Staff', 'First Aid Team'];

export default function AdminStaffDirectory() {
  const [staff, setStaff] = useState([]);
  const [paths, setPaths] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [inviteResult, setInviteResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', staff_category: 'Teachers', password: 'staff123' });
  const [editData, setEditData] = useState({ name: '', email: '', staff_category: '' });
  const [inviteData, setInviteData] = useState({ name: '', email: '', staff_category: 'Teachers' });

  const refreshStaff = async () => {
    try {
      const [sRes, pRes] = await Promise.all([API.get('/analytics/staff-progress'), API.get('/learning-paths')]);
      setStaff(sRes.data);
      setPaths(pRes.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    refreshStaff().then(() => setLoading(false));
  }, []);

  const addStaff = async () => {
    if (!newStaff.name || !newStaff.email) { toast.error('Name and email required'); return; }
    try {
      await API.post('/users/create-staff', newStaff);
      await refreshStaff();
      setShowAdd(false);
      setNewStaff({ name: '', email: '', staff_category: 'Teachers', password: 'staff123' });
      toast.success('Staff member added');
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to add'); }
  };

  const editStaff = async () => {
    if (!editData.name || !editData.email) { toast.error('Name and email required'); return; }
    try {
      await API.put(`/users/${selectedStaff.id}/edit`, editData);
      await refreshStaff();
      setShowEdit(false);
      toast.success('Staff updated');
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to update'); }
  };

  const deleteStaff = async () => {
    try {
      await API.delete(`/users/${selectedStaff.id}`);
      await refreshStaff();
      setShowDelete(false);
      toast.success('Staff member removed');
    } catch { toast.error('Failed to delete'); }
  };

  const inviteStaff = async () => {
    if (!inviteData.name || !inviteData.email) { toast.error('Name and email required'); return; }
    try {
      const { data } = await API.post('/users/invite', inviteData);
      setInviteResult(data);
      await refreshStaff();
      toast.success('Invitation created');
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to invite'); }
  };

  const copyCredentials = () => {
    if (inviteResult) {
      navigator.clipboard.writeText(`Email: ${inviteResult.email}\nTemporary Password: ${inviteResult.temp_password}\nPortal: ${window.location.origin}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const assignPath = async (userId, pathId) => {
    try {
      await API.post('/users/assign-path', { user_id: userId, path_id: pathId });
      setStaff(staff.map(s => s.id === userId ? { ...s, assigned_path_id: pathId } : s));
      toast.success('Path assigned');
    } catch { toast.error('Failed to assign'); }
  };

  const openEdit = (s) => {
    setSelectedStaff(s);
    setEditData({ name: s.name, email: s.email, staff_category: s.staff_category });
    setShowEdit(true);
  };

  const openDelete = (s) => {
    setSelectedStaff(s);
    setShowDelete(true);
  };

  const filtered = staff.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'All' || s.staff_category === filterRole;
    return matchSearch && matchRole;
  });

  if (loading) return <div className="flex items-center justify-center h-64 text-[#999]">Loading staff...</div>;

  return (
    <div data-testid="staff-directory" className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Staff Directory</h1>
          <p className="text-[#999] text-sm mt-0.5">{staff.length} staff members registered</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setInviteResult(null); setInviteData({ name: '', email: '', staff_category: 'Teachers' }); setShowInvite(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF8100] text-white text-sm font-semibold hover:bg-[#E67300] transition-all shadow-md shadow-[#FF8100]/15"
            data-testid="invite-staff-btn">
            <Send className="w-4 h-4" /> Invite Staff
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#222] text-white text-sm font-semibold hover:bg-[#333] transition-all"
            data-testid="add-staff-btn">
            <UserPlus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BBB]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8] outline-none text-sm focus:border-[#FF8100] focus:ring-2 focus:ring-[#FF8100]/10 transition-all"
            placeholder="Search by name or email..."
            data-testid="search-staff"
          />
        </div>
        <div className="relative">
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8] outline-none text-sm appearance-none pr-10 cursor-pointer focus:border-[#FF8100]"
            data-testid="filter-role"
          >
            <option value="All">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BBB] pointer-events-none" />
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden" data-testid="staff-table">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0]">
                <th className="text-left text-[10px] text-[#999] font-semibold uppercase tracking-wider py-3 px-4">Name & Email</th>
                <th className="text-left text-[10px] text-[#999] font-semibold uppercase tracking-wider py-3 px-3">Role</th>
                <th className="text-left text-[10px] text-[#999] font-semibold uppercase tracking-wider py-3 px-3">Progress</th>
                <th className="text-left text-[10px] text-[#999] font-semibold uppercase tracking-wider py-3 px-3">Exams</th>
                <th className="text-left text-[10px] text-[#999] font-semibold uppercase tracking-wider py-3 px-3">Certificate</th>
                <th className="text-left text-[10px] text-[#999] font-semibold uppercase tracking-wider py-3 px-3">Assigned Path</th>
                <th className="text-right text-[10px] text-[#999] font-semibold uppercase tracking-wider py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const certValid = s.certificate;
                const certExpiring = certValid && new Date(s.certificate.expires_at) < new Date(Date.now() + 30 * 86400000);
                return (
                  <tr key={s.id} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] transition-colors" data-testid={`staff-row-${s.id}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#FF8100]/10 flex items-center justify-center text-[#FF8100] font-bold text-xs flex-shrink-0">
                          {s.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[#222] text-sm truncate">{s.name}</div>
                          <div className="text-[11px] text-[#999] truncate flex items-center gap-1">
                            <Mail className="w-3 h-3 flex-shrink-0" /> {s.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-[#F0F0F0] text-[#555] text-[11px] font-semibold">{s.staff_category}</span>
                    </td>
                    <td className="px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-[#F0F0F0] overflow-hidden">
                          <div className="h-full rounded-full bg-[#FF8100] transition-all" style={{ width: `${s.progress_pct}%` }} />
                        </div>
                        <span className="text-[11px] text-[#999] font-medium w-8">{s.progress_pct}%</span>
                      </div>
                    </td>
                    <td className="px-3 text-[#555] text-sm">{s.exam_attempts}</td>
                    <td className="px-3">
                      {certValid ? (
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold ${certExpiring ? 'bg-[#FFF3E0] text-[#E65100]' : 'bg-[#E8F5E9] text-[#2E7D32]'}`}>
                          {certExpiring ? 'Expiring' : 'Active'}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-[#F5F5F5] text-[#BBB] text-[11px] font-semibold">None</span>
                      )}
                    </td>
                    <td className="px-3">
                      <div className="relative">
                        <select
                          value={s.assigned_path_id || ''}
                          onChange={e => assignPath(s.id, e.target.value)}
                          className="text-[11px] px-2 py-1.5 rounded-lg bg-[#FAFAFA] border border-[#E8E8E8] outline-none appearance-none pr-6 cursor-pointer max-w-[140px]"
                          data-testid={`assign-path-${s.id}`}
                        >
                          <option value="">No Path</option>
                          {paths.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#BBB] pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-2 rounded-lg hover:bg-[#E3F2FD] text-[#1976D2] transition-colors"
                          title="Edit"
                          data-testid={`edit-staff-${s.id}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDelete(s)}
                          className="p-2 rounded-lg hover:bg-[#FFEBEE] text-[#D32F2F] transition-colors"
                          title="Delete"
                          data-testid={`delete-staff-${s.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-10 text-[#999]">No staff found</div>}
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="rounded-2xl border border-[#E8E8E8] bg-white max-w-md shadow-xl">
          <DialogHeader><DialogTitle className="text-lg font-bold text-[#1A1A1A]">Add Staff Member</DialogTitle><DialogDescription className="sr-only">Add a new staff member to the platform</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Full Name</label>
              <input value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] outline-none text-sm focus:border-[#FF8100]" placeholder="e.g., John Smith" data-testid="new-staff-name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Email</label>
              <input value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] outline-none text-sm focus:border-[#FF8100]" placeholder="email@icanschool.com" data-testid="new-staff-email" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Staff Category</label>
              <select value={newStaff.staff_category} onChange={e => setNewStaff({ ...newStaff, staff_category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] outline-none text-sm appearance-none cursor-pointer" data-testid="new-staff-category">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Password</label>
              <input value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] outline-none text-sm focus:border-[#FF8100]" data-testid="new-staff-password" />
            </div>
            <button onClick={addStaff} className="w-full py-3 rounded-xl bg-[#222] text-white font-semibold text-sm hover:bg-[#333] transition-all" data-testid="confirm-add-staff">
              Add Staff Member
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="rounded-2xl border border-[#E8E8E8] bg-white max-w-md shadow-xl">
          <DialogHeader><DialogTitle className="text-lg font-bold text-[#1A1A1A]">Edit Staff Member</DialogTitle><DialogDescription className="sr-only">Edit staff member details</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Full Name</label>
              <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] outline-none text-sm focus:border-[#FF8100]" data-testid="edit-staff-name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Email</label>
              <input value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] outline-none text-sm focus:border-[#FF8100]" data-testid="edit-staff-email" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Staff Category</label>
              <select value={editData.staff_category} onChange={e => setEditData({ ...editData, staff_category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] outline-none text-sm appearance-none cursor-pointer" data-testid="edit-staff-category">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button onClick={editStaff} className="w-full py-3 rounded-xl bg-[#1976D2] text-white font-semibold text-sm hover:bg-[#1565C0] transition-all" data-testid="confirm-edit-staff">
              Save Changes
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="rounded-2xl border border-[#E8E8E8] bg-white max-w-sm shadow-xl">
          <DialogHeader><DialogTitle className="text-lg font-bold text-[#1A1A1A]">Remove Staff Member</DialogTitle><DialogDescription className="sr-only">Confirm staff removal</DialogDescription></DialogHeader>
          <div className="mt-2">
            <p className="text-sm text-[#666] mb-1">Are you sure you want to remove:</p>
            <div className="p-3 rounded-xl bg-[#FFF3E0] mb-4">
              <div className="font-semibold text-[#E65100] text-sm">{selectedStaff?.name}</div>
              <div className="text-xs text-[#E65100]/70">{selectedStaff?.email}</div>
            </div>
            <p className="text-xs text-[#999] mb-5">This action cannot be undone. All progress and exam data for this user will also be affected.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 rounded-xl bg-[#F5F5F5] text-[#555] font-semibold text-sm hover:bg-[#E8E8E8] transition-all" data-testid="cancel-delete-staff">
                Cancel
              </button>
              <button onClick={deleteStaff} className="flex-1 py-2.5 rounded-xl bg-[#D32F2F] text-white font-semibold text-sm hover:bg-[#C62828] transition-all" data-testid="confirm-delete-staff">
                Remove
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Staff Dialog */}
      <Dialog open={showInvite} onOpenChange={(open) => { setShowInvite(open); if (!open) setInviteResult(null); }}>
        <DialogContent className="rounded-2xl border border-[#E8E8E8] bg-white max-w-md shadow-xl">
          <DialogHeader><DialogTitle className="text-lg font-bold text-[#1A1A1A]">Invite Staff to Platform</DialogTitle><DialogDescription className="sr-only">Invite a new staff member</DialogDescription></DialogHeader>
          {!inviteResult ? (
            <div className="space-y-4 mt-2">
              <p className="text-xs text-[#999]">Create an account and generate login credentials to share with the new staff member.</p>
              <div>
                <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Full Name</label>
                <input value={inviteData.name} onChange={e => setInviteData({ ...inviteData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] outline-none text-sm focus:border-[#FF8100]" placeholder="Staff member name" data-testid="invite-staff-name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Email</label>
                <input value={inviteData.email} onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] outline-none text-sm focus:border-[#FF8100]" placeholder="email@icanschool.com" data-testid="invite-staff-email" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">Staff Category</label>
                <select value={inviteData.staff_category} onChange={e => setInviteData({ ...inviteData, staff_category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] outline-none text-sm appearance-none cursor-pointer" data-testid="invite-staff-category">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button onClick={inviteStaff} className="w-full py-3 rounded-xl bg-[#FF8100] text-white font-semibold text-sm hover:bg-[#E67300] transition-all shadow-md shadow-[#FF8100]/15" data-testid="confirm-invite-staff">
                <Send className="w-4 h-4 inline mr-2" /> Generate Invite
              </button>
            </div>
          ) : (
            <div className="space-y-4 mt-2" data-testid="invite-result">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#E8F5E9]">
                <Check className="w-5 h-5 text-[#2E7D32]" />
                <span className="text-sm font-semibold text-[#2E7D32]">Account created for {inviteResult.name}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] space-y-2">
                <p className="text-[10px] text-[#999] font-semibold uppercase tracking-wider">Login Credentials</p>
                <div className="text-sm"><span className="text-[#999]">Portal:</span> <span className="text-[#222] font-medium">{window.location.origin}</span></div>
                <div className="text-sm"><span className="text-[#999]">Email:</span> <span className="text-[#222] font-medium">{inviteResult.email}</span></div>
                <div className="text-sm"><span className="text-[#999]">Password:</span> <span className="text-[#FF8100] font-bold font-mono">{inviteResult.temp_password}</span></div>
              </div>
              <button onClick={copyCredentials} className="w-full py-3 rounded-xl bg-[#222] text-white font-semibold text-sm hover:bg-[#333] transition-all flex items-center justify-center gap-2" data-testid="copy-invite-credentials">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
              </button>
              <p className="text-xs text-[#999] text-center">Share these credentials securely with the staff member</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
