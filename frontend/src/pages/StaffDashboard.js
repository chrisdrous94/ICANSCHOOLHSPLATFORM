import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../lib/api';
import { BookOpen, Lock, CheckCircle2, ArrowRight, Award, ClipboardCheck, Flame, Heart, ShieldAlert, Brain, Stethoscope, Shield } from 'lucide-react';

const ICON_MAP = {
  Flame, Heart, ShieldAlert, Brain, Stethoscope, Shield,
};

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
          API.get('/modules'),
          API.get('/progress'),
          API.get('/learning-paths'),
        ]);
        setModules(modRes.data);
        setProgress(progRes.data);
        if (user?.assigned_path_id) {
          const p = pathsRes.data.find(pp => pp.id === user.assigned_path_id);
          setPath(p || null);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64 text-[#707973]">Loading your training...</div>;

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
    <div data-testid="staff-dashboard" className="space-y-8 animate-fade-in-up">
      {/* Greeting */}
      <div className="m3-card bg-gradient-to-br from-[#006C4C] to-[#003D2B] text-white !rounded-[28px] p-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-[#89F8C6]/80 text-sm mb-6">
          {path ? path.name : 'Health & Safety Training'} &middot; {user?.staff_category}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/80">Overall Progress</span>
              <span className="text-sm font-bold">{overallProgress}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full rounded-full bg-[#89F8C6] transition-all duration-700" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
          <div className="text-center bg-white/10 rounded-[20px] px-4 py-3 backdrop-blur-sm">
            <div className="text-xl font-bold">{completedModules}/{totalModules}</div>
            <div className="text-[10px] text-white/60">Modules</div>
          </div>
        </div>
        {allCompleted && (
          <button
            onClick={() => navigate('/exam')}
            className="mt-5 bg-[#89F8C6] text-[#002114] rounded-full px-6 py-3 font-semibold text-sm flex items-center gap-2 hover:bg-white transition-colors"
            data-testid="take-exam-btn"
          >
            <ClipboardCheck className="w-4 h-4" /> Take Final Exam
          </button>
        )}
      </div>

      {/* Module cards */}
      <div>
        <h2 className="text-xl font-bold text-[#002114] mb-4">Training Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pathModules.map((mod, i) => {
            const status = getModuleStatus(mod, i);
            const prog = progress.find(p => p.module_id === mod.id);
            const IconComp = ICON_MAP[mod.icon] || BookOpen;
            const isLocked = status === 'locked';
            const sectionProgress = prog ? `${prog.current_section + 1}/${prog.total_sections}` : '';

            return (
              <div
                key={mod.id}
                onClick={() => !isLocked && navigate(`/module/${mod.id}`)}
                className={`m3-card flex items-start gap-4 ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01]'} transition-all`}
                data-testid={`module-card-${mod.id}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0 ${
                  status === 'completed' ? 'bg-[#D0E8D8]' :
                  status === 'in-progress' ? 'bg-[#C0E9FA]' :
                  isLocked ? 'bg-[#E0EBE5]' : 'bg-[#F0F5F1]'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-[#006C4C]" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5 text-[#707973]" />
                  ) : (
                    <IconComp className="w-5 h-5 text-[#006C4C]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-[#002114] text-sm">{mod.title}</h3>
                    {status === 'completed' && <span className="pill-success text-[10px]">Done</span>}
                    {status === 'in-progress' && <span className="pill-info text-[10px]">{sectionProgress}</span>}
                  </div>
                  <p className="text-xs text-[#707973] line-clamp-2">{mod.description}</p>
                  {status === 'in-progress' && prog && (
                    <div className="mt-2 m3-progress-track">
                      <div className="m3-progress-fill" style={{ width: `${((prog.current_section + 1) / prog.total_sections) * 100}%` }} />
                    </div>
                  )}
                  {!isLocked && status !== 'completed' && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-[#006C4C] font-medium">
                      {status === 'in-progress' ? 'Continue reading' : 'Start module'} <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => navigate('/certificates')}
          className="m3-card cursor-pointer flex items-center gap-4 hover:scale-[1.01] transition-all"
          data-testid="view-certificates-btn"
        >
          <div className="w-12 h-12 rounded-[16px] bg-[#D0E8D8] flex items-center justify-center">
            <Award className="w-5 h-5 text-[#006C4C]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#002114] text-sm">My Certificates</h3>
            <p className="text-xs text-[#707973]">View and download your certificates</p>
          </div>
        </div>
        <div
          onClick={() => navigate('/resources')}
          className="m3-card cursor-pointer flex items-center gap-4 hover:scale-[1.01] transition-all"
          data-testid="view-resources-btn"
        >
          <div className="w-12 h-12 rounded-[16px] bg-[#C0E9FA] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#3C6472]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#002114] text-sm">Quick Resources</h3>
            <p className="text-xs text-[#707973]">Emergency contacts, forms, and references</p>
          </div>
        </div>
      </div>
    </div>
  );
}
