import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../lib/api';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, List } from 'lucide-react';

function SectionContent({ text }) {
  const paragraphs = text.split('\n\n').filter(Boolean);
  return (
    <div className="space-y-5">
      {paragraphs.map((para, i) => {
        const lines = para.split('\n');
        const isHeading = lines[0] && (
          lines[0] === lines[0].toUpperCase() && lines[0].length < 60 && !lines[0].includes('.')
        );
        const isList = lines.some(l => l.trim().startsWith('-') || l.trim().startsWith('*') || /^\d+\./.test(l.trim()));

        if (isList) {
          return (
            <div key={i}>
              {lines.map((line, j) => {
                const trimmed = line.trim();
                const isItem = trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed);
                const isBold = trimmed.endsWith(':') || (isItem && trimmed.includes(':'));
                if (!isItem && trimmed) {
                  return <p key={j} className="text-[#222] text-[15px] leading-relaxed font-semibold mb-2">{trimmed}</p>;
                }
                if (isItem) {
                  const content = trimmed.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '');
                  const parts = content.split(':');
                  if (parts.length > 1 && parts[0].length < 40) {
                    return (
                      <div key={j} className="flex gap-2.5 ml-1 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF8100] mt-2 flex-shrink-0" />
                        <p className="text-[#444] text-[14px] leading-relaxed">
                          <span className="font-semibold text-[#222]">{parts[0]}:</span>{parts.slice(1).join(':')}
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div key={j} className="flex gap-2.5 ml-1 mb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF8100] mt-2 flex-shrink-0" />
                      <p className="text-[#444] text-[14px] leading-relaxed">{content}</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          );
        }

        if (isHeading) {
          return <h4 key={i} className="text-[#FF8100] font-bold text-base tracking-tight pt-1">{lines[0]}</h4>;
        }

        return (
          <p key={i} className="text-[#444] text-[15px] leading-[1.85]">
            {lines.map((line, j) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              if (trimmed.endsWith(':') && trimmed.length < 60) {
                return <span key={j} className="block font-semibold text-[#222] mt-3 mb-1">{trimmed}</span>;
              }
              return <span key={j}>{j > 0 ? '\n' : ''}{trimmed}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function ModuleReader() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [mod, setMod] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    setSidebarOpen(false);
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

  if (loading) return <div className="flex items-center justify-center h-64 text-[#999]">Loading module...</div>;
  if (!mod) return <div className="text-center py-12 text-[#999]">Module not found</div>;

  const section = mod.content[currentSection];
  const totalSections = mod.content.length;
  const isLast = currentSection === totalSections - 1;

  return (
    <div data-testid="module-reader" className="animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-9 h-9 rounded-xl bg-white border border-[#E8E8E8] flex items-center justify-center hover:bg-[#FAFAFA] transition-colors"
          data-testid="back-to-dashboard"
        >
          <ArrowLeft className="w-4 h-4 text-[#555]" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-[#1A1A1A] truncate">{mod.title}</h2>
          <p className="text-[11px] text-[#999]">Section {currentSection + 1} of {totalSections}</p>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden w-9 h-9 rounded-xl bg-white border border-[#E8E8E8] flex items-center justify-center"
          data-testid="toggle-sections"
        >
          <List className="w-4 h-4 text-[#555]" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-[#F0F0F0] mb-6">
        <div className="h-full rounded-full bg-[#FF8100] transition-all duration-500" style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }} />
      </div>

      <div className="flex gap-6">
        {/* Section sidebar */}
        <div className={`${sidebarOpen ? 'fixed inset-0 z-50 bg-black/20 lg:static lg:bg-transparent' : 'hidden lg:block'} lg:w-[240px] flex-shrink-0`}>
          <div className={`${sidebarOpen ? 'fixed right-0 top-0 h-full w-72 bg-white p-5 shadow-xl z-50' : ''} lg:sticky lg:top-8`}>
            {sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden mb-4 text-sm text-[#999]">Close</button>
            )}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4 lg:p-3">
              <h4 className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-3">Contents</h4>
              <div className="space-y-0.5">
                {mod.content.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`w-full text-left text-[12px] px-3 py-2 rounded-lg transition-all flex items-start gap-2 ${
                      i === currentSection
                        ? 'bg-[#FF8100]/10 text-[#FF8100] font-semibold'
                        : i < currentSection
                        ? 'text-[#2E7D32] font-medium hover:bg-[#F5F5F5]'
                        : 'text-[#999] hover:bg-[#F5F5F5] hover:text-[#555]'
                    }`}
                    data-testid={`section-nav-${i}`}
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-px ${
                      i === currentSection ? 'bg-[#FF8100] text-white' :
                      i < currentSection ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#F5F5F5] text-[#BBB]'
                    }`}>
                      {i < currentSection ? '\u2713' : i + 1}
                    </span>
                    <span className="leading-tight">{s.section_title.length > 30 ? s.section_title.substring(0, 30) + '...' : s.section_title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 min-w-0 max-w-2xl">
          <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden mb-6" data-testid="reader-content">
            {/* Section header */}
            <div className="bg-[#FAFAFA] border-b border-[#F0F0F0] px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF8100]/10 flex items-center justify-center">
                <span className="text-[#FF8100] font-bold text-xs">{currentSection + 1}</span>
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] tracking-tight">{section.section_title}</h3>
            </div>

            {/* Section body */}
            <div className="px-6 py-6 lg:px-8 lg:py-8">
              <SectionContent text={section.section_text} />
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={goPrev}
              disabled={currentSection === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E8E8E8] text-[#555] text-sm font-semibold hover:bg-[#FAFAFA] disabled:opacity-30 transition-all"
              data-testid="prev-section-btn"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
            <div className="hidden sm:flex items-center gap-1">
              {mod.content.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentSection ? 'bg-[#FF8100] w-5' :
                    i < currentSection ? 'bg-[#FF8100]/30' : 'bg-[#E0E0E0]'
                  }`}
                  data-testid={`section-dot-${i}`}
                />
              ))}
            </div>
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF8100] text-white text-sm font-semibold hover:bg-[#E67300] transition-all shadow-md shadow-[#FF8100]/15"
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
      </div>
    </div>
  );
}
