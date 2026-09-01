import { Home, Heart, History, Settings, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { path: "/",        icon: Home,       label: "Home"    },
  { path: "/couple",  icon: Heart,      label: "Couple"  },
  { path: "/add",     icon: Plus,       label: "Add",    primary: true },
  { path: "/history", icon: History,    label: "History" },
  { path: "/settings",icon: Settings,   label: "Settings"},
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <div
        className="max-w-md mx-auto rounded-3xl pointer-events-auto"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(5,150,105,0.15), 0 2px 10px rgba(0,0,0,0.06)",
          border: "1px solid rgba(255,255,255,0.95)",
          margin: "0 16px",
        }}
      >
        <div className="flex items-center justify-around px-2 py-1.5">
          {navItems.map(({ path, icon: Icon, label, primary }) => {
            const active = location.pathname === path;

            if (primary) {
              return (
                <Link key={path} to={path} className="flex flex-col items-center gap-0.5 -mt-3 active:scale-95 transition-transform">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{
                      background: "linear-gradient(135deg,#059669,#10B981)",
                      boxShadow: "0 6px 18px rgba(5,150,105,0.4)",
                    }}
                  >
                    <Icon className="text-white" size={24} strokeWidth={2.8} />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: '#059669' }}>{label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={path}
                to={path}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all active:scale-95"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: active ? "rgba(5,150,105,0.12)" : "transparent",
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.5 : 1.9}
                    style={{ color: active ? "#059669" : "#64748B" }}
                  />
                </div>
                <span
                  className="text-[10px] font-semibold transition-colors leading-none"
                  style={{ color: active ? "#059669" : "#64748B" }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}


