import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, PlusCircle, History, Settings } from 'lucide-react';
import BottomNav from './BottomNav';
import { useApp } from '../context/AppContext';

const navItems = [
  { path: '/',         icon: Home,        label: 'Home'     },
  { path: '/couple',   icon: Heart,       label: 'Couple'   },
  { path: '/add',      icon: PlusCircle,  label: 'Add'      },
  { path: '/history',  icon: History,     label: 'History'  },
  { path: '/settings', icon: Settings,    label: 'Settings' },
];

export default function Layout({ children }) {
  const location  = useLocation();
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen">

      {/* ───── Desktop Sidebar (hidden on mobile) ───── */}
      <aside
        className="sidebar-desktop flex-col fixed inset-y-0 left-0 z-40 overflow-hidden"
        style={{
          width: 220,
          background: 'linear-gradient(160deg,#022c22 0%,#065F46 30%,#059669 65%,#10B981 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-14 -right-14 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        />
        <div
          className="absolute bottom-0 -left-8 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        />

        {/* Brand */}
        <div className="relative px-5 pt-7 pb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.18)' }}
            >
              💕
            </div>
            <div>
              <p className="text-white font-bold text-[15px] leading-tight">SaveTogether</p>
              <p className="text-[10px] font-medium mt-0.5" style={{ color: 'rgba(167,243,208,0.85)' }}>Couple Budget Tracker</p>
            </div>
          </div>
        </div>

        {/* Active user pill */}
        {currentUser && (
          <div className="relative mx-4 mb-4">
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl group transition-all"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                {currentUser.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold leading-tight truncate">
                  {currentUser.name}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(167,243,208,0.8)' }}>
                  Personal account · RM {currentUser.dailyBudget?.toFixed(2)}/day
                </p>
              </div>
              <Settings size={12} style={{ color: 'rgba(255,255,255,0.3)' }} className="flex-shrink-0" />
            </Link>
          </div>
        )}

        <div className="mx-5 mb-3 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />

        {/* Nav links */}
        <nav className="relative flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all"
                style={{
                  background: active ? 'rgba(255,255,255,0.16)' : 'transparent',
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: active
                      ? 'rgba(255,255,255,0.22)'
                      : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <Icon
                    size={16}
                    style={{ color: active ? '#fff' : 'rgba(255,255,255,0.5)' }}
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: active ? '#fff' : 'rgba(255,255,255,0.6)' }}
                >
                  {label}
                </span>
                {active && (
                  <div
                    className="ml-auto w-1.5 h-5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.5)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="relative px-5 pb-5 pt-3">
          <div className="h-px mb-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <p className="text-[9px] font-medium" style={{ color: 'rgba(52,211,153,0.55)' }}>SaveTogether © 2025</p>
          <p className="text-[9px] mt-0.5" style={{ color: 'rgba(52,211,153,0.35)' }}>Data stored locally on your device</p>
        </div>
      </aside>

      {/* ───── Main content area ───── */}
      <main className="main-with-sidebar min-h-screen">
        <div className="layout-content">
          {children}
        </div>
      </main>

      {/* ───── Mobile bottom nav (hidden on desktop) ───── */}
      <div className="mobile-nav-only">
        <BottomNav />
      </div>
    </div>
  );
}
