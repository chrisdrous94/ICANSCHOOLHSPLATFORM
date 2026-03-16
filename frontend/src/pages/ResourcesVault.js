import { useState, useEffect } from 'react';
import API from '../lib/api';
import { Phone, FileText, HeartPulse, MapPin, ClipboardCheck, Users, Search, Copy, Check, ChevronDown } from 'lucide-react';

const ICON_MAP = { Phone, FileText, HeartPulse, MapPin, ClipboardCheck, Users };
const CATEGORY_LABELS = {
  emergency: 'Emergency',
  forms: 'Forms & Documents',
  medical: 'Medical',
  evacuation: 'Evacuation',
  operations: 'Operations',
};

export default function ResourcesVault() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    API.get('/resources').then(r => { setResources(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const copyContent = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const categories = ['all', ...new Set(resources.map(r => r.category))];
  const filtered = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.content.toLowerCase().includes(search.toLowerCase());
    const matchCat = filter === 'all' || r.category === filter;
    return matchSearch && matchCat;
  });

  if (loading) return <div className="flex items-center justify-center h-64 text-[#999]">Loading resources...</div>;

  return (
    <div data-testid="resources-vault" className="animate-fade-in-up">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Quick Resources Vault</h1>
        <p className="text-[#999] text-sm mt-0.5">Emergency contacts, printable forms, and reference materials</p>
      </div>

      <div className="bg-[#D32F2F] rounded-2xl p-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-4" data-testid="emergency-banner">
        <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <Phone className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-sm">Emergency Numbers</h3>
          <p className="text-white/60 text-xs mt-0.5">For immediate emergencies, call directly</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="bg-white text-[#D32F2F] rounded-xl px-4 py-2 text-sm font-bold">112</span>
          <span className="bg-white/15 text-white rounded-xl px-4 py-2 text-sm font-bold">CAMHS: 22284700</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BBB]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8] outline-none text-sm focus:border-[#FF8100] transition-all"
            placeholder="Search resources..." data-testid="search-resources" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                filter === cat ? 'bg-[#FF8100] text-white' : 'bg-white border border-[#E8E8E8] text-[#999] hover:border-[#DDD] hover:text-[#555]'
              }`} data-testid={`filter-${cat}`}>
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(res => {
          const IconComp = ICON_MAP[res.icon] || FileText;
          const isExpanded = expandedId === res.id;

          return (
            <div key={res.id} className="bg-white rounded-2xl border border-[#E8E8E8] p-4 cursor-pointer hover:shadow-sm transition-all"
              onClick={() => setExpandedId(isExpanded ? null : res.id)} data-testid={`resource-${res.id}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FFF3E0] flex items-center justify-center flex-shrink-0">
                  <IconComp className="w-4 h-4 text-[#FF8100]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#222] text-sm mb-0.5">{res.title}</h3>
                  <span className="text-[10px] text-[#999] font-medium uppercase tracking-wider">{CATEGORY_LABELS[res.category] || res.category}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#BBB] transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>

              {isExpanded && (
                <div className="mt-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                  <pre className="text-xs text-[#555] bg-[#FAFAFA] border border-[#F0F0F0] rounded-xl p-4 whitespace-pre-wrap font-[Manrope] leading-relaxed overflow-x-auto">
                    {res.content}
                  </pre>
                  <button onClick={() => copyContent(res.id, res.content)}
                    className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E8E8E8] text-[#555] text-xs font-semibold hover:bg-[#FAFAFA] transition-all"
                    data-testid={`copy-resource-${res.id}`}>
                    {copied === res.id ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === res.id ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-[#999]">No resources found</div>}
    </div>
  );
}
