import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Hotel,
  Settings,
  Utensils,
  Calendar,
  Info,
  Phone,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001/api";

const navItems = [
  {
    to: "/admin",
    icon: LayoutDashboard,
    label: "Dashboard",
    end: true,
  },
  {
    to: "/admin/home",
    icon: Home,
    label: "Home",
  },
  {
    to: "/admin/room",
    icon: Hotel,
    label: "Rooms",
  },
  {
    to: "/admin/services",
    icon: Settings,
    label: "Services",
  },
  {
    to: "/admin/restaurant",
    icon: Utensils,
    label: "Restaurant",
  },
  {
    to: "/admin/conference",
    icon: Calendar,
    label: "Conference",
  },
  {
    to: "/admin/about",
    icon: Info,
    label: "About",
    badge: "Soon",
  },
  {
    to: "/admin/contact",
    icon: Phone,
    label: "Contact",
    badge: "Soon",
  },
];

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("authToken")
  );
}

function clearAuthStorage() {
  localStorage.removeItem("token");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("admin");
}

export default function Layouts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const token = getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      clearAuthStorage();
      setLoggingOut(false);
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile overlay */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-all duration-300 lg:hidden ${
          sidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col bg-slate-950 text-white shadow-2xl shadow-slate-950/40
          transition-transform duration-300 ease-out
          lg:static lg:translate-x-0 lg:shadow-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="group flex items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-black text-white shadow-lg shadow-emerald-500/30 transition-transform duration-300 group-hover:scale-105">
              MV
            </div>

            <div>
              <h1 className="text-sm font-bold leading-tight text-white">
                Mountain View
              </h1>

              <p className="text-[11px] font-medium text-slate-400">
                Admin Panel
              </p>
            </div>
          </button>

          <button
            type="button"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <SidebarLink
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              end={item.end}
              badge={item.badge}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* Sign out */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-300 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition-all duration-300 group-hover:bg-red-500/10 group-hover:text-red-300">
              {loggingOut ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogOut size={18} />
              )}
            </span>

            {loggingOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Welcome back, Admin
              </h2>

              <p className="hidden text-xs text-slate-500 sm:block">
                Manage Mountain View Resort content from one place.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-slate-700">Admin</p>
              <p className="text-[11px] text-slate-400">Online</p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 ring-4 ring-emerald-50">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ to, icon: Icon, label, end = false, onClick, badge }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
          isActive
            ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/10"
            : "text-slate-300 hover:translate-x-1 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 ${
              isActive
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
            }`}
          >
            <Icon size={18} />
          </span>

          <span className="flex-1 flex items-center justify-between">
            <span>{label}</span>
            {badge && (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                {badge}
              </span>
            )}
          </span>

          <ChevronRight
            size={15}
            className={`transition-all duration-300 ${
              isActive
                ? "translate-x-0 text-emerald-300 opacity-100"
                : "text-slate-500 opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
            }`}
          />
        </>
      )}
    </NavLink>
  );
}