import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
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
      {/* Left - Brand Hero */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[#1A1A1A]">
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FF8100]/8" />
          <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#FF8100]/5" />
          <div className="absolute top-[40%] left-[60%] w-[200px] h-[200px] rounded-full bg-[#FF8100]/3" />
        </div>
        <div className="relative z-10 flex flex-col justify-between py-12 px-14 w-full">
          <div className="flex items-center gap-3">
            <img src="https://icanskill.com/img/logo/ican.svg" alt="ICan" className="h-8" />
            <div className="h-6 w-px bg-white/20" />
            <span className="text-white/50 text-xs font-medium tracking-widest uppercase">School</span>
          </div>

          <div>
            <div className="mb-8">
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#FF8100]/15 text-[#FF8100] text-xs font-semibold tracking-wide uppercase mb-6">
                Health & Safety Training Portal
              </div>
              <h1 className="text-white text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight mb-5">
                Complete Your<br />Safety Training<br />& Certification
              </h1>
              <p className="text-white/40 text-base leading-relaxed max-w-md">
                Access your training modules, complete assessments, and earn your official Health & Safety certificate.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md">
              {[
                { num: '6', label: 'Training Modules' },
                { num: '10', label: 'Exam Questions' },
                { num: '100%', label: 'Pass Required' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/5 border border-white/8 p-4 text-center">
                  <div className="text-[#FF8100] text-2xl font-bold">{s.num}</div>
                  <div className="text-white/30 text-[10px] font-medium mt-1 tracking-wide uppercase">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-white/20 text-xs">
            ICANSCHOOL LTD &middot; Registration HE 434549 &middot; Limassol, Cyprus
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <img src="https://icanskill.com/img/logo/ican.svg" alt="ICan" className="h-7" />
            <div className="h-5 w-px bg-[#E0E0E0]" />
            <span className="text-[#FF8100] text-[10px] font-bold tracking-widest uppercase">School H&S</span>
          </div>

          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1 tracking-tight">Sign in</h2>
          <p className="text-[#999] text-sm mb-8">Access your training portal</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-2 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-[#E0E0E0] bg-[#FAFAFA] focus:border-[#FF8100] focus:bg-white focus:ring-2 focus:ring-[#FF8100]/10 outline-none transition-all text-[#222] text-sm"
                placeholder="your@email.com"
                data-testid="login-email"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-[#E0E0E0] bg-[#FAFAFA] focus:border-[#FF8100] focus:bg-white focus:ring-2 focus:ring-[#FF8100]/10 outline-none transition-all text-[#222] text-sm pr-12"
                  placeholder="Enter your password"
                  data-testid="login-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BBB] hover:text-[#FF8100] transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#FF8100] text-white font-semibold text-sm hover:bg-[#E67300] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[#FF8100]/20"
              data-testid="login-submit-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-[#FAFAFA] border border-[#F0F0F0]">
            <p className="text-[10px] text-[#999] font-semibold uppercase tracking-wider mb-2">Demo Accounts</p>
            <div className="space-y-1.5 text-xs text-[#666]">
              <div><span className="font-semibold text-[#333]">Admin:</span> admin@icanschool.com / admin123</div>
              <div><span className="font-semibold text-[#333]">Staff:</span> julia@icanschool.com / staff123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
