import { useState, useEffect } from 'react';
import API from '../lib/api';
import { Users, Award, TrendingUp, AlertTriangle, BookOpen, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#006C4C', '#4D6357', '#3C6472', '#89F8C6', '#D0E8D8', '#C0E9FA'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/analytics/overview').then(r => { setAnalytics(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-[#707973]">Loading analytics...</div></div>;

  const categoryData = analytics?.category_breakdown
    ? Object.entries(analytics.category_breakdown).map(([name, value]) => ({ name: name.replace(' Staff', ''), value }))
    : [];

  const examData = [
    { name: 'Passed', value: analytics?.passed_attempts || 0 },
    { name: 'Failed', value: (analytics?.total_attempts || 0) - (analytics?.passed_attempts || 0) },
  ];

  return (
    <div data-testid="admin-dashboard" className="space-y-6 animate-fade-in-up">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-[#002114] tracking-tight">Admin Dashboard</h1>
        <p className="text-[#707973] mt-1">Overview of training progress and compliance status</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="stats-grid">
        {[
          { icon: Users, label: 'Total Staff', value: analytics?.total_staff || 0, color: '#006C4C', bg: '#D0E8D8' },
          { icon: Award, label: 'Certificates', value: analytics?.total_certificates || 0, color: '#3C6472', bg: '#C0E9FA' },
          { icon: TrendingUp, label: 'Pass Rate', value: `${analytics?.pass_rate || 0}%`, color: '#006C4C', bg: '#89F8C6' },
          { icon: AlertTriangle, label: 'Expiring Soon', value: analytics?.expiring_soon || 0, color: '#BA1A1A', bg: '#FFDAD6' },
        ].map((stat, i) => (
          <div key={i} className="m3-card flex items-center gap-4" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="w-12 h-12 rounded-[16px] flex items-center justify-center" style={{ background: stat.bg }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#002114]">{stat.value}</div>
              <div className="text-xs text-[#707973] font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Staff by Category */}
        <div className="m3-card" data-testid="category-chart">
          <h3 className="text-lg font-semibold text-[#002114] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#006C4C]" /> Staff by Category
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DBE5DE" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#707973' }} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11, fill: '#707973' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="#006C4C" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-[#707973]">No data yet</div>
          )}
        </div>

        {/* Exam Results */}
        <div className="m3-card" data-testid="exam-chart">
          <h3 className="text-lg font-semibold text-[#002114] mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#006C4C]" /> Exam Results
          </h3>
          {analytics?.total_attempts > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={examData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {examData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#006C4C' : '#FFDAD6'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-[#707973]">No exam attempts yet</div>
          )}
        </div>
      </div>

      {/* Quick Info */}
      <div className="m3-card">
        <h3 className="text-lg font-semibold text-[#002114] mb-3">Compliance Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="rounded-[20px] bg-[#D0E8D8] p-4">
            <div className="text-2xl font-bold text-[#006C4C]">{analytics?.total_attempts || 0}</div>
            <div className="text-xs text-[#4D6357] font-medium mt-1">Total Exam Attempts</div>
          </div>
          <div className="rounded-[20px] bg-[#C0E9FA] p-4">
            <div className="text-2xl font-bold text-[#3C6472]">{analytics?.passed_attempts || 0}</div>
            <div className="text-xs text-[#001F28] font-medium mt-1">Passed Exams</div>
          </div>
          <div className="rounded-[20px] bg-[#FFDAD6] p-4">
            <div className="text-2xl font-bold text-[#BA1A1A]">{analytics?.expiring_soon || 0}</div>
            <div className="text-xs text-[#410002] font-medium mt-1">Expiring in 30 Days</div>
          </div>
        </div>
      </div>
    </div>
  );
}
