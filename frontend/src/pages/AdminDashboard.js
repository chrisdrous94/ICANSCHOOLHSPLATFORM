import { useState, useEffect } from 'react';
import API from '../lib/api';
import { Users, Award, TrendingUp, AlertTriangle, BookOpen, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/analytics/overview').then(r => { setAnalytics(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-[#999]">Loading analytics...</div>;

  const categoryData = analytics?.category_breakdown
    ? Object.entries(analytics.category_breakdown).map(([name, value]) => ({ name: name.replace(' Staff', ''), value }))
    : [];

  const examData = [
    { name: 'Passed', value: analytics?.passed_attempts || 0 },
    { name: 'Failed', value: (analytics?.total_attempts || 0) - (analytics?.passed_attempts || 0) },
  ];

  return (
    <div data-testid="admin-dashboard" className="space-y-5 animate-fade-in-up">
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Dashboard</h1>
        <p className="text-[#999] text-sm mt-0.5">Training progress and compliance overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" data-testid="stats-grid">
        {[
          { icon: Users, label: 'Total Staff', value: analytics?.total_staff || 0, color: '#FF8100', bg: '#FFF3E0' },
          { icon: Award, label: 'Certificates', value: analytics?.total_certificates || 0, color: '#2E7D32', bg: '#E8F5E9' },
          { icon: TrendingUp, label: 'Pass Rate', value: `${analytics?.pass_rate || 0}%`, color: '#1976D2', bg: '#E3F2FD' },
          { icon: AlertTriangle, label: 'Expiring Soon', value: analytics?.expiring_soon || 0, color: '#D32F2F', bg: '#FFEBEE' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E8E8E8] p-4 flex items-center gap-4 hover:shadow-sm transition-all" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1A1A1A]">{stat.value}</div>
              <div className="text-[11px] text-[#999] font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5" data-testid="category-chart">
          <h3 className="text-sm font-semibold text-[#222] mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#FF8100]" /> Staff by Category
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#999' }} angle={-15} textAnchor="end" height={55} />
                <YAxis tick={{ fontSize: 11, fill: '#999' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E8E8E8', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
                <Bar dataKey="value" fill="#FF8100" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-[#BBB]">No data yet</div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5" data-testid="exam-chart">
          <h3 className="text-sm font-semibold text-[#222] mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#FF8100]" /> Exam Results
          </h3>
          {analytics?.total_attempts > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={examData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  <Cell fill="#2E7D32" />
                  <Cell fill="#FFCDD2" />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E8E8E8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-[#BBB]">No exam attempts yet</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
        <h3 className="text-sm font-semibold text-[#222] mb-4">Compliance Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#FFF3E0] p-4 text-center">
            <div className="text-2xl font-bold text-[#E65100]">{analytics?.total_attempts || 0}</div>
            <div className="text-[11px] text-[#E65100]/70 font-medium mt-0.5">Total Attempts</div>
          </div>
          <div className="rounded-xl bg-[#E8F5E9] p-4 text-center">
            <div className="text-2xl font-bold text-[#2E7D32]">{analytics?.passed_attempts || 0}</div>
            <div className="text-[11px] text-[#2E7D32]/70 font-medium mt-0.5">Passed Exams</div>
          </div>
          <div className="rounded-xl bg-[#FFEBEE] p-4 text-center">
            <div className="text-2xl font-bold text-[#D32F2F]">{analytics?.expiring_soon || 0}</div>
            <div className="text-[11px] text-[#D32F2F]/70 font-medium mt-0.5">Expiring in 30 Days</div>
          </div>
        </div>
      </div>
    </div>
  );
}
