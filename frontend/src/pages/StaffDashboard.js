import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../lib/api';
import { BookOpen, Lock, CheckCircle2, ArrowRight, Award, ClipboardCheck, Flame, Heart, ShieldAlert, Brain, Stethoscope, Shield } from 'lucide-react';

const ICON_MAP = { Flame, Heart, ShieldAlert, Brain, Stethoscope, Shield };

export default function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [path, setPath] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [modRes, progRes, pathsRes] = await Promise.all([
          API.get('/modules'), API.get('/progress'), API.get('/learning-paths'),
        ]);
        setModules(modRes.data);
        setProgress(progRes.data);
        if (user?.assigned_path_id) {
          setPath(pathsRes.data.find(pp => pp.id === user.assigned_path_id) || null);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64 text-[#999]">Loading your training...</div>;

  const pathModules = path ? path.module_ids.map(id => modules.find(m => m.id === id)).filter(Boolean) : modules;
  const totalModules = pathModules.length;
  const completedModules = pathModules.filter(m => progress.find(p => p.module_id === m.id && p.completed)).length;
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  const allCompleted = completedModules === totalModules && totalModules > 0;

  const getModuleStatus = (mod, index) => {
    const prog = progress.find(p => p.module_id === mod.id);
    if (prog?.completed) return 'completed';
    if (prog) return 'in-progress';
    if (index === 0) return 'unlocked';
    const prevMod = pathModules[index - 1];
    const prevProg = progress.find(p => p.module_id === prevMod?.id);
    if (prevProg?.completed) return 'unlocked';
    return 'locked';
  };

  return (
    <div data-testid="staff-dashboard" className="space-y-6 animate-fade-in-up">
      {/* Hero greeting */}
      <div className="bg-[#1A1A1A] rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] rounded-full bg-[#FF8100]/8" />
        <div className="absolute bottom-[-20%] left-[30%] w-[200px] h-[200px] rounded-full bg-[#FF8100]/5" />
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-white text-xl lg:text-2xl font-bold tracking-tight mb-1">
                Welcome back, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-white/40 text-sm">
                {path ? path.name : 'Health & Safety Training'} &middot; {user?.staff_category}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 lg:w-48">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/50 text-xs">Progress</span>
                  <span className="text-[#FF8100] text-xs font-bold">{overallProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-[#FF8100] transition-all duration-700" style={{ width: `${overallProgress}%` }} />
                </div>
              </div>
              <div className="text-center bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                <div className="text-white text-lg font-bold">{completedModules}/{totalModules}</div>
                <div className="text-white/30 text-[10px] font-medium">Modules</div>
              </div>
            </div>
          </div>
          {allCompleted && (
            <button
              onClick={() => navigate('/exam')}
              className="mt-5 bg-[#FF8100] text-white rounded-xl px-6 py-3 font-semibold text-sm flex items-center gap-2 hover:bg-[#E67300] transition-all shadow-lg shadow-[#FF8100]/20"
              data-testid="take-exam-btn"
            >
              <ClipboardCheck className="w-4 h-4" /> Take Final Exam
            </button>
          )}
        </div>
      </div>

      {/* Module cards */}
      <div>
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">Training Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pathModules.map((mod, i) => {
            const status = getModuleStatus(mod, i);
            const prog = progress.find(p => p.module_id === mod.id);
            const IconComp = ICON_MAP[mod.icon] || BookOpen;
            const isLocked = status === 'locked';
            const sectionProg = prog ? `${prog.current_section + 1}/${prog.total_sections}` : '';

            return (
              <div
                key={mod.id}
                onClick={() => !isLocked && navigate(`/module/${mod.id}`)}
                className={`bg-white rounded-2xl border border-[#E8E8E8] p-4 flex items-start gap-4 transition-all ${
                  isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:border-[#DDD]'
                }`}
                data-testid={`module-card-${mod.id}`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  status === 'completed' ? 'bg-[#E8F5E9]' :
                  status === 'in-progress' ? 'bg-[#FFF3E0]' :
                  isLocked ? 'bg-[#F5F5F5]' : 'bg-[#FAFAFA]'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5 text-[#CCC]" />
                  ) : (
                    <IconComp className="w-5 h-5 text-[#FF8100]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-[#222] text-sm">{mod.title}</h3>
                    {status === 'completed' && <span className="px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold">DONE</span>}
                    {status === 'in-progress' && <span className="px-2 py-0.5 rounded-md bg-[#FFF3E0] text-[#E65100] text-[10px] font-bold">{sectionProg}</span>}
                  </div>
                  <p className="text-xs text-[#999] line-clamp-2 mb-2">{mod.description}</p>
                  {status === 'in-progress' && prog && (
                    <div className="h-1 rounded-full bg-[#F0F0F0] overflow-hidden">
                      <div className="h-full rounded-full bg-[#FF8100]" style={{ width: `${((prog.current_section + 1) / prog.total_sections) * 100}%` }} />
                    </div>
                  )}
                  {!isLocked && status !== 'completed' && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-[#FF8100] font-medium">
                      {status === 'in-progress' ? 'Continue' : 'Start'} <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div onClick={() => navigate('/certificates')} className="bg-white rounded-2xl border border-[#E8E8E8] p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all" data-testid="view-certificates-btn">
          <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] flex items-center justify-center"><Award className="w-5 h-5 text-[#2E7D32]" /></div>
          <div><h3 className="font-semibold text-[#222] text-sm">My Certificates</h3><p className="text-xs text-[#999]">View and download</p></div>
        </div>
        <div onClick={() => navigate('/resources')} className="bg-white rounded-2xl border border-[#E8E8E8] p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all" data-testid="view-resources-btn">
          <div className="w-11 h-11 rounded-xl bg-[#E3F2FD] flex items-center justify-center"><BookOpen className="w-5 h-5 text-[#1976D2]" /></div>
          <div><h3 className="font-semibold text-[#222] text-sm">Quick Resources</h3><p className="text-xs text-[#999]">Emergency contacts & forms</p></div>
        </div>
      </div>
    </div>
  );
}
