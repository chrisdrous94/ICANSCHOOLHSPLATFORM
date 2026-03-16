import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../lib/api';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';

export default function ModuleReader() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [mod, setMod] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get(`/modules/${moduleId}`);
        setMod(data);
        const progRes = await API.get('/progress');
        const prog = progRes.data.find(p => p.module_id === moduleId);
        if (prog) setCurrentSection(prog.current_section);
      } catch { toast.error('Failed to load module'); }
      setLoading(false);
    };
    load();
  }, [moduleId]);

  const saveProgress = async (sectionIdx) => {
    try {
      await API.put(`/progress/module/${moduleId}`, { current_section: sectionIdx });
    } catch { /* silent */ }
  };

  const goTo = (idx) => {
    setCurrentSection(idx);
    saveProgress(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goNext = () => {
    if (currentSection < mod.content.length - 1) goTo(currentSection + 1);
    else {
      saveProgress(currentSection);
      toast.success('Module completed!');
      navigate('/dashboard');
    }
  };

  const goPrev = () => {
    if (currentSection > 0) goTo(currentSection - 1);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-[#707973]">Loading module...</div>;
  if (!mod) return <div className="text-center py-12 text-[#707973]">Module not found</div>;

  const section = mod.content[currentSection];
  const totalSections = mod.content.length;
  const isLast = currentSection === totalSections - 1;

  return (
    <div data-testid="module-reader" className="animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 rounded-full bg-[#F0F5F1] flex items-center justify-center hover:bg-[#E8F0EB] transition-colors"
          data-testid="back-to-dashboard"
        >
          <ArrowLeft className="w-5 h-5 text-[#404944]" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-[#002114]">{mod.title}</h2>
          <p className="text-xs text-[#707973]">Section {currentSection + 1} of {totalSections}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          {mod.content.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentSection ? 'bg-[#006C4C] w-6' :
                i < currentSection ? 'bg-[#89F8C6]' : 'bg-[#DBE5DE]'
              }`}
              data-testid={`section-dot-${i}`}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="m3-progress-track mb-8">
        <div className="m3-progress-fill" style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }} />
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        <div className="m3-card-elevated !rounded-[28px] mb-8" data-testid="reader-content">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[14px] bg-[#D0E8D8] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#006C4C]" />
            </div>
            <h3 className="text-xl font-bold text-[#002114]">{section.section_title}</h3>
          </div>
          <div className="reader-content text-[#404944] leading-relaxed text-[15px] whitespace-pre-line">
            {section.section_text}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={goPrev}
            disabled={currentSection === 0}
            className="m3-btn-tonal flex items-center gap-2 disabled:opacity-30"
            data-testid="prev-section-btn"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-[#707973] font-medium">{currentSection + 1} / {totalSections}</span>
          <button
            onClick={goNext}
            className="m3-btn-filled flex items-center gap-2"
            data-testid="next-section-btn"
          >
            {isLast ? (
              <><CheckCircle2 className="w-4 h-4" /> Complete Module</>
            ) : (
              <>Next <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>

      {/* Section sidebar (for larger screens) */}
      <div className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 w-56">
        <div className="rounded-[20px] bg-[#F0F5F1] p-4">
          <h4 className="text-xs font-semibold text-[#707973] uppercase tracking-wider mb-3">Sections</h4>
          <div className="space-y-1.5">
            {mod.content.map((s, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-all ${
                  i === currentSection ? 'bg-[#006C4C] text-white font-semibold' :
                  i < currentSection ? 'text-[#006C4C] bg-[#D0E8D8]/50 font-medium' : 'text-[#707973] hover:bg-[#E8F0EB]'
                }`}
                data-testid={`section-nav-${i}`}
              >
                {s.section_title.length > 35 ? s.section_title.substring(0, 35) + '...' : s.section_title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
