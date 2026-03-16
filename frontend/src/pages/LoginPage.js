import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome to I CAN SCHOOL');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #006C4C 0%, #003D2B 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[#89F8C6]" />
          <div className="absolute bottom-32 right-16 w-48 h-48 rounded-full bg-[#C0E9FA]" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-[#D0E8D8]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-[20px] bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Shield className="w-8 h-8 text-[#89F8C6]" />
            </div>
            <div>
              <h1 className="text-white text-3xl font-bold tracking-tight">I CAN SCHOOL</h1>
              <p className="text-[#89F8C6] text-sm font-medium tracking-wide">Health & Safety Portal</p>
            </div>
          </div>
          <h2 className="text-white text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Training &<br />Certification<br />Portal
          </h2>
          <p className="text-[#89F8C6]/80 text-lg leading-relaxed max-w-md">
            Complete your health and safety training, pass the certification exam, and download your official certificate.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { num: '6', label: 'Modules' },
              { num: '10', label: 'Questions' },
              { num: '100%', label: 'To Pass' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-[20px] p-4 text-center">
                <div className="text-[#89F8C6] text-2xl font-bold">{s.num}</div>
                <div className="text-white/60 text-xs font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#FBFDF9]">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-[16px] bg-[#006C4C] flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-[#002114]">I CAN SCHOOL</div>
              <div className="text-xs text-[#707973]">Health & Safety Portal</div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-[#002114] mb-2">Welcome back</h2>
          <p className="text-[#707973] mb-8">Sign in to access your training portal</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#404944] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-t-xl rounded-b-none border-b-2 border-[#707973] bg-[#DBE5DE]/30 focus:border-[#006C4C] focus:bg-[#DBE5DE]/50 outline-none transition-all text-[#191C1A]"
                placeholder="your@email.com"
                data-testid="login-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#404944] mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-t-xl rounded-b-none border-b-2 border-[#707973] bg-[#DBE5DE]/30 focus:border-[#006C4C] focus:bg-[#DBE5DE]/50 outline-none transition-all text-[#191C1A] pr-12"
                  placeholder="Enter your password"
                  data-testid="login-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707973] hover:text-[#006C4C]">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full m3-btn-filled py-4 text-base disabled:opacity-50"
              data-testid="login-submit-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-[20px] bg-[#F0F5F1]">
            <p className="text-xs text-[#707973] font-medium mb-2">Demo Accounts:</p>
            <div className="space-y-1.5 text-xs text-[#404944]">
              <div><span className="font-semibold">Admin:</span> admin@icanschool.com / admin123</div>
              <div><span className="font-semibold">Staff:</span> julia@icanschool.com / staff123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
