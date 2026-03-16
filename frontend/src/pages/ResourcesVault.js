import { useState, useEffect } from 'react';
import API from '../lib/api';
import { Phone, FileText, HeartPulse, MapPin, ClipboardCheck, Users, Search, Copy, Check } from 'lucide-react';

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
    API.get('/resources')
      .then(r => { setResources(r.data); setLoading(false); })
      .catch(() => setLoading(false));
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

  if (loading) return <div className="flex items-center justify-center h-64 text-[#707973]">Loading resources...</div>;

  return (
    <div data-testid="resources-vault" className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#002114] tracking-tight">Quick Resources Vault</h1>
        <p className="text-[#707973] mt-1">Emergency contacts, printable forms, and reference materials</p>
      </div>

      {/* Emergency banner */}
      <div className="rounded-[28px] bg-[#FFDAD6] p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4" data-testid="emergency-banner">
        <div className="w-12 h-12 rounded-[16px] bg-[#BA1A1A] flex items-center justify-center flex-shrink-0">
          <Phone className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-[#410002] text-sm">Emergency Numbers</h3>
          <p className="text-xs text-[#410002]/80 mt-0.5">For immediate emergencies, call these numbers directly</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <span className="bg-[#BA1A1A] text-white rounded-full px-4 py-2 text-sm font-bold">112</span>
          <span className="bg-[#410002] text-white rounded-full px-4 py-2 text-sm font-bold">CAMHS: 22284700</span>
        </div>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707973]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#F0F5F1] outline-none text-sm focus:bg-[#E8F0EB] transition-colors"
            placeholder="Search resources..."
            data-testid="search-resources"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                filter === cat ? 'bg-[#006C4C] text-white' : 'bg-[#F0F5F1] text-[#707973] hover:bg-[#E8F0EB]'
              }`}
              data-testid={`filter-${cat}`}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resource cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(res => {
          const IconComp = ICON_MAP[res.icon] || FileText;
          const isExpanded = expandedId === res.id;

          return (
            <div
              key={res.id}
              className="m3-card-elevated !rounded-[28px] cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : res.id)}
              data-testid={`resource-${res.id}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-[#D0E8D8] flex items-center justify-center flex-shrink-0">
                  <IconComp className="w-5 h-5 text-[#006C4C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#002114] text-sm mb-1">{res.title}</h3>
                  <span className="pill-info text-[10px]">{CATEGORY_LABELS[res.category] || res.category}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 animate-fade-in">
                  <pre className="text-xs text-[#404944] bg-[#F0F5F1] rounded-[16px] p-4 whitespace-pre-wrap font-[Manrope] leading-relaxed overflow-x-auto">
                    {res.content}
                  </pre>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyContent(res.id, res.content); }}
                    className="mt-3 m3-btn-tonal text-xs !px-4 !py-2 flex items-center gap-1.5"
                    data-testid={`copy-resource-${res.id}`}
                  >
                    {copied === res.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === res.id ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-[#707973]">No resources found matching your search</div>
      )}
    </div>
  );
}
