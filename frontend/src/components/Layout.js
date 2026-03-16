import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Route, Users, BookOpen, Award, FolderArchive,
  LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/paths', icon: Route, label: 'Path Builder' },
  { to: '/admin/staff', icon: Users, label: 'Staff Directory' },
  { to: '/admin/certificates', icon: Award, label: 'Certificates' },
  { to: '/resources', icon: FolderArchive, label: 'Resources' },
];

const staffLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'My Training' },
  { to: '/certificates', icon: Award, label: 'Certificates' },
  { to: '/resources', icon: FolderArchive, label: 'Resources' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const links = user?.role === 'admin' ? adminLinks : staffLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-[260px] bg-white border-r border-[#E8E8E8] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 flex items-center gap-3 border-b border-[#F0F0F0]">
          <img src="https://icanskill.com/img/logo/ican.svg" alt="ICan" className="h-7" data-testid="ican-logo" />
          <div className="h-5 w-px bg-[#E0E0E0]" />
          <div>
            <div className="text-[10px] text-[#FF8100] font-bold tracking-widest uppercase">SCHOOL</div>
            <div className="text-[9px] text-[#999] font-medium tracking-wider uppercase">H&S Portal</div>
          </div>
          <button className="lg:hidden ml-auto p-1" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-[#666]" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 mt-4" data-testid="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin' || link.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#FF8100]/10 text-[#FF8100] font-semibold'
                    : 'text-[#555] hover:bg-[#F5F5F5] hover:text-[#333]'
                }`
              }
              onClick={() => setSidebarOpen(false)}
              data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <link.icon className="w-[18px] h-[18px]" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#F0F0F0]">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-[#FF8100]/10 flex items-center justify-center text-[#FF8100] font-bold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#222] truncate">{user?.name}</div>
              <div className="text-[11px] text-[#999] truncate">{user?.role === 'admin' ? 'Administrator' : user?.staff_category}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium w-full text-[#D32F2F] hover:bg-[#FFEBEE] transition-all"
            data-testid="logout-btn"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 bg-[#FAFAFA]">
        <div className="lg:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-[#E8E8E8]">
          <button onClick={() => setSidebarOpen(true)} data-testid="mobile-menu-btn">
            <Menu className="w-6 h-6 text-[#555]" />
          </button>
          <img src="https://icanskill.com/img/logo/ican.svg" alt="ICan" className="h-5" />
          <span className="text-[10px] text-[#FF8100] font-bold tracking-widest uppercase">SCHOOL</span>
        </div>
        <div className="p-4 lg:p-8 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
