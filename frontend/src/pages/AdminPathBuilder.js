import { useState, useEffect } from 'react';
import API from '../lib/api';
import { toast } from 'sonner';
import { GripVertical, Plus, X, Save, Trash2, ChevronDown } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableModule({ mod, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: mod.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 rounded-xl bg-[#FAFAFA] border border-[#F0F0F0] p-3 group" data-testid={`sortable-module-${mod.id}`}>
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-[#CCC] hover:text-[#FF8100]">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1">
        <div className="text-sm font-semibold text-[#222]">{mod.title}</div>
        <div className="text-[11px] text-[#999]">{mod.content?.length || 0} sections</div>
      </div>
      <button onClick={() => onRemove(mod.id)} className="opacity-0 group-hover:opacity-100 text-[#D32F2F] hover:bg-[#FFEBEE] p-1 rounded-lg transition-all" data-testid={`remove-module-${mod.id}`}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

const ROLES = ['Teachers', 'Security Guards', 'Kitchen Staff', 'Extra-Curricular Staff', 'Reception Staff', 'First Aid Team'];

export default function AdminPathBuilder() {
  const [paths, setPaths] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [pathModules, setPathModules] = useState([]);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editRole, setEditRole] = useState('Teachers');
  const [editExpiry, setEditExpiry] = useState(365);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    Promise.all([API.get('/learning-paths'), API.get('/modules')]).then(([pRes, mRes]) => {
      setPaths(pRes.data); setModules(mRes.data); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const selectPath = (path) => {
    setSelectedPath(path); setEditName(path.name); setEditDesc(path.description);
    setEditRole(path.target_role); setEditExpiry(path.certificate_expiry_days || 365);
    setPathModules(path.module_ids.map(id => modules.find(m => m.id === id)).filter(Boolean));
    setShowNew(false);
  };

  const startNew = () => {
    setSelectedPath(null); setEditName(''); setEditDesc('');
    setEditRole('Teachers'); setEditExpiry(365); setPathModules([]); setShowNew(true);
  };

  const addModule = (mod) => {
    if (pathModules.find(m => m.id === mod.id)) { toast.error('Module already in path'); return; }
    setPathModules([...pathModules, mod]);
  };

  const removeModule = (modId) => setPathModules(pathModules.filter(m => m.id !== modId));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIdx = pathModules.findIndex(m => m.id === active.id);
      const newIdx = pathModules.findIndex(m => m.id === over.id);
      setPathModules(arrayMove(pathModules, oldIdx, newIdx));
    }
  };

  const savePath = async () => {
    if (!editName.trim()) { toast.error('Path name required'); return; }
    if (pathModules.length === 0) { toast.error('Add at least one module'); return; }
    const payload = { name: editName, description: editDesc, target_role: editRole, module_ids: pathModules.map(m => m.id), certificate_expiry_days: editExpiry };
    try {
      if (selectedPath) {
        const { data } = await API.put(`/learning-paths/${selectedPath.id}`, payload);
        setPaths(paths.map(p => p.id === selectedPath.id ? data : p));
        setSelectedPath(data); toast.success('Path updated');
      } else {
        const { data } = await API.post('/learning-paths', payload);
        setPaths([...paths, data]); setSelectedPath(data); setShowNew(false); toast.success('Path created');
      }
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to save'); }
  };

  const deletePath = async (pathId) => {
    try {
      await API.delete(`/learning-paths/${pathId}`);
      setPaths(paths.filter(p => p.id !== pathId));
      if (selectedPath?.id === pathId) { setSelectedPath(null); setShowNew(false); }
      toast.success('Path deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-[#999]">Loading...</div>;

  const availableModules = modules.filter(m => !pathModules.find(pm => pm.id === m.id));

  return (
    <div data-testid="path-builder" className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Learning Path Builder</h1>
          <p className="text-[#999] text-sm mt-0.5">Create and customize training paths for each staff role</p>
        </div>
        <button onClick={startNew} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF8100] text-white text-sm font-semibold hover:bg-[#E67300] transition-all shadow-md shadow-[#FF8100]/15" data-testid="create-path-btn">
          <Plus className="w-4 h-4" /> New Path
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-2" data-testid="path-list">
          <h3 className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-2">Existing Paths</h3>
          {paths.map(p => (
            <div key={p.id} onClick={() => selectPath(p)}
              className={`bg-white rounded-xl border p-3 cursor-pointer flex items-center justify-between transition-all ${
                selectedPath?.id === p.id ? 'border-[#FF8100] bg-[#FFF3E0]/30' : 'border-[#E8E8E8] hover:border-[#DDD]'
              }`} data-testid={`path-item-${p.id}`}>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-[#222] truncate">{p.name}</div>
                <div className="text-[11px] text-[#999]">{p.target_role} &middot; {p.module_ids?.length || 0} modules</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deletePath(p.id); }}
                className="text-[#D32F2F] hover:bg-[#FFEBEE] p-1.5 rounded-lg flex-shrink-0 transition-colors" data-testid={`delete-path-${p.id}`}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {(selectedPath || showNew) && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 space-y-4" data-testid="path-editor">
              <div>
                <label className="block text-[10px] font-bold text-[#999] mb-1.5 uppercase tracking-widest">Path Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] outline-none text-sm focus:border-[#FF8100]"
                  placeholder="e.g., Teachers Safety Certification" data-testid="path-name-input" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#999] mb-1.5 uppercase tracking-widest">Description</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] outline-none text-sm resize-none h-16 focus:border-[#FF8100]"
                  placeholder="Describe the training path..." data-testid="path-desc-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#999] mb-1.5 uppercase tracking-widest">Target Role</label>
                  <div className="relative">
                    <select value={editRole} onChange={e => setEditRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] outline-none text-sm appearance-none cursor-pointer" data-testid="path-role-select">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BBB] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#999] mb-1.5 uppercase tracking-widest">Certificate Expiry (days)</label>
                  <input type="number" value={editExpiry} onChange={e => setEditExpiry(parseInt(e.target.value) || 365)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] outline-none text-sm" data-testid="path-expiry-input" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4" data-testid="path-modules">
                <h4 className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-3">Modules in Path ({pathModules.length})</h4>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={pathModules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2 min-h-[100px]">
                      {pathModules.length === 0 && <p className="text-xs text-[#BBB] text-center py-8">Click modules to add them</p>}
                      {pathModules.map(mod => <SortableModule key={mod.id} mod={mod} onRemove={removeModule} />)}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
              <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4" data-testid="available-modules">
                <h4 className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-3">Available Modules</h4>
                <div className="space-y-2">
                  {availableModules.map(mod => (
                    <div key={mod.id} onClick={() => addModule(mod)}
                      className="flex items-center gap-3 rounded-xl bg-[#FAFAFA] border border-transparent p-3 cursor-pointer hover:border-[#FF8100]/30 hover:bg-[#FFF3E0]/20 transition-all"
                      data-testid={`add-module-${mod.id}`}>
                      <Plus className="w-4 h-4 text-[#FF8100]" />
                      <div>
                        <div className="text-sm font-semibold text-[#222]">{mod.title}</div>
                        <div className="text-[11px] text-[#999]">{mod.content?.length || 0} sections</div>
                      </div>
                    </div>
                  ))}
                  {availableModules.length === 0 && <p className="text-xs text-[#BBB] text-center py-4">All modules added</p>}
                </div>
              </div>
            </div>

            <button onClick={savePath} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF8100] text-white text-sm font-semibold hover:bg-[#E67300] transition-all shadow-md shadow-[#FF8100]/15" data-testid="save-path-btn">
              <Save className="w-4 h-4" /> {selectedPath ? 'Update Path' : 'Create Path'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
