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
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 rounded-[16px] bg-[#E8F0EB] p-3 group" data-testid={`sortable-module-${mod.id}`}>
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-[#707973] hover:text-[#006C4C]">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1">
        <div className="text-sm font-semibold text-[#002114]">{mod.title}</div>
        <div className="text-xs text-[#707973]">{mod.content?.length || 0} sections</div>
      </div>
      <button onClick={() => onRemove(mod.id)} className="opacity-0 group-hover:opacity-100 text-[#BA1A1A] hover:bg-[#FFDAD6] p-1 rounded-full transition-all" data-testid={`remove-module-${mod.id}`}>
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
      setPaths(pRes.data);
      setModules(mRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const selectPath = (path) => {
    setSelectedPath(path);
    setEditName(path.name);
    setEditDesc(path.description);
    setEditRole(path.target_role);
    setEditExpiry(path.certificate_expiry_days || 365);
    const ordered = path.module_ids.map(id => modules.find(m => m.id === id)).filter(Boolean);
    setPathModules(ordered);
    setShowNew(false);
  };

  const startNew = () => {
    setSelectedPath(null);
    setEditName('');
    setEditDesc('');
    setEditRole('Teachers');
    setEditExpiry(365);
    setPathModules([]);
    setShowNew(true);
  };

  const addModule = (mod) => {
    if (pathModules.find(m => m.id === mod.id)) { toast.error('Module already in path'); return; }
    setPathModules([...pathModules, mod]);
  };

  const removeModule = (modId) => {
    setPathModules(pathModules.filter(m => m.id !== modId));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = pathModules.findIndex(m => m.id === active.id);
      const newIndex = pathModules.findIndex(m => m.id === over.id);
      setPathModules(arrayMove(pathModules, oldIndex, newIndex));
    }
  };

  const savePath = async () => {
    if (!editName.trim()) { toast.error('Path name is required'); return; }
    if (pathModules.length === 0) { toast.error('Add at least one module'); return; }
    const payload = {
      name: editName,
      description: editDesc,
      target_role: editRole,
      module_ids: pathModules.map(m => m.id),
      certificate_expiry_days: editExpiry,
    };
    try {
      if (selectedPath) {
        const { data } = await API.put(`/learning-paths/${selectedPath.id}`, payload);
        setPaths(paths.map(p => p.id === selectedPath.id ? data : p));
        setSelectedPath(data);
        toast.success('Path updated');
      } else {
        const { data } = await API.post('/learning-paths', payload);
        setPaths([...paths, data]);
        setSelectedPath(data);
        setShowNew(false);
        toast.success('Path created');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save');
    }
  };

  const deletePath = async (pathId) => {
    try {
      await API.delete(`/learning-paths/${pathId}`);
      setPaths(paths.filter(p => p.id !== pathId));
      if (selectedPath?.id === pathId) { setSelectedPath(null); setShowNew(false); }
      toast.success('Path deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-[#707973]">Loading...</div>;

  const availableModules = modules.filter(m => !pathModules.find(pm => pm.id === m.id));

  return (
    <div data-testid="path-builder" className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#002114] tracking-tight">Learning Path Builder</h1>
          <p className="text-[#707973] mt-1">Create and customize training paths for each staff role</p>
        </div>
        <button onClick={startNew} className="m3-btn-filled flex items-center gap-2" data-testid="create-path-btn">
          <Plus className="w-4 h-4" /> New Path
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Path List */}
        <div className="space-y-2" data-testid="path-list">
          <h3 className="text-sm font-semibold text-[#707973] uppercase tracking-wider mb-3">Existing Paths</h3>
          {paths.map(p => (
            <div
              key={p.id}
              onClick={() => selectPath(p)}
              className={`m3-card cursor-pointer flex items-center justify-between ${selectedPath?.id === p.id ? '!bg-[#C0E9FA]' : ''}`}
              data-testid={`path-item-${p.id}`}
            >
              <div className="min-w-0">
                <div className="font-semibold text-sm text-[#002114] truncate">{p.name}</div>
                <div className="text-xs text-[#707973]">{p.target_role} &middot; {p.module_ids?.length || 0} modules</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deletePath(p.id); }}
                className="text-[#BA1A1A] hover:bg-[#FFDAD6] p-1.5 rounded-full flex-shrink-0"
                data-testid={`delete-path-${p.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Editor */}
        {(selectedPath || showNew) && (
          <div className="lg:col-span-2 space-y-4">
            <div className="m3-card space-y-4" data-testid="path-editor">
              <div>
                <label className="block text-sm font-medium text-[#404944] mb-1">Path Name</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-t-xl rounded-b-none border-b-2 border-[#707973] bg-[#DBE5DE]/30 focus:border-[#006C4C] outline-none text-sm"
                  placeholder="e.g., Teachers Safety Certification"
                  data-testid="path-name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#404944] mb-1">Description</label>
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-none bg-[#DBE5DE]/30 focus:bg-[#DBE5DE]/50 outline-none text-sm resize-none h-20"
                  placeholder="Describe the training path..."
                  data-testid="path-desc-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#404944] mb-1">Target Role</label>
                  <div className="relative">
                    <select
                      value={editRole}
                      onChange={e => setEditRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#DBE5DE]/30 outline-none text-sm appearance-none cursor-pointer"
                      data-testid="path-role-select"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707973] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#404944] mb-1">Certificate Expiry (days)</label>
                  <input
                    type="number"
                    value={editExpiry}
                    onChange={e => setEditExpiry(parseInt(e.target.value) || 365)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#DBE5DE]/30 outline-none text-sm"
                    data-testid="path-expiry-input"
                  />
                </div>
              </div>
            </div>

            {/* Modules DnD area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Modules in path */}
              <div className="m3-card" data-testid="path-modules">
                <h4 className="text-sm font-semibold text-[#002114] mb-3">Modules in Path ({pathModules.length})</h4>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={pathModules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2 min-h-[120px]">
                      {pathModules.length === 0 && <p className="text-xs text-[#707973] text-center py-8">Drag modules here or click to add</p>}
                      {pathModules.map(mod => (
                        <SortableModule key={mod.id} mod={mod} onRemove={removeModule} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              {/* Available modules */}
              <div className="m3-card" data-testid="available-modules">
                <h4 className="text-sm font-semibold text-[#002114] mb-3">Available Modules</h4>
                <div className="space-y-2">
                  {availableModules.map(mod => (
                    <div
                      key={mod.id}
                      onClick={() => addModule(mod)}
                      className="flex items-center gap-3 rounded-[16px] bg-white p-3 cursor-pointer hover:bg-[#E8F0EB] transition-colors"
                      data-testid={`add-module-${mod.id}`}
                    >
                      <Plus className="w-4 h-4 text-[#006C4C]" />
                      <div>
                        <div className="text-sm font-semibold text-[#002114]">{mod.title}</div>
                        <div className="text-xs text-[#707973]">{mod.content?.length || 0} sections</div>
                      </div>
                    </div>
                  ))}
                  {availableModules.length === 0 && <p className="text-xs text-[#707973] text-center py-4">All modules added</p>}
                </div>
              </div>
            </div>

            <button onClick={savePath} className="m3-btn-filled flex items-center gap-2" data-testid="save-path-btn">
              <Save className="w-4 h-4" /> {selectedPath ? 'Update Path' : 'Create Path'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
