import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Route, Users, BookOpen, Award, FolderArchive,
  LogOut, Shield, Menu, X
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
    <div className="flex min-h-screen bg-[#FBFDF9]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-[260px] bg-[#FBFDF9] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[#006C4C] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-[#002114]" data-testid="app-title">I CAN SCHOOL</div>
            <div className="text-[10px] text-[#707973] font-medium tracking-wider uppercase">H&S Portal</div>
          </div>
          <button className="lg:hidden ml-auto p-1" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-[#404944]" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2" data-testid="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin' || link.to === '/dashboard'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <link.icon className="w-[18px] h-[18px]" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#DBE5DE]">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-[#D0E8D8] flex items-center justify-center text-[#006C4C] font-bold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#191C1A] truncate">{user?.name}</div>
              <div className="text-[11px] text-[#707973] truncate">{user?.role === 'admin' ? 'Administrator' : user?.staff_category}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-[#BA1A1A] hover:bg-[#FFDAD6]"
            data-testid="logout-btn"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden sticky top-0 z-20 bg-[#FBFDF9]/90 backdrop-blur-md px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} data-testid="mobile-menu-btn">
            <Menu className="w-6 h-6 text-[#404944]" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#006C4C]" />
            <span className="font-bold text-sm text-[#002114]">I CAN SCHOOL</span>
          </div>
        </div>
        <div className="p-4 lg:p-8 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
