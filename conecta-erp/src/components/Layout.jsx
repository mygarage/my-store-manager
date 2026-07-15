import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutGrid, Briefcase, Building2, Boxes, Settings, LogOut, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/servicios', label: 'Servicios', icon: Briefcase },
  { to: '/clientes', label: 'Clientes', icon: Building2 },
  { to: '/inventario', label: 'Inventario', icon: Boxes },
  { to: '/configuracion', label: 'Configuración', icon: Settings, adminOnly: true },
];

export default function Layout() {
  const { profile, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-paper">
      <aside className="w-64 shrink-0 bg-navy-500 text-white flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="font-display font-bold text-lg tracking-tight">CONECTA</div>
          <div className="font-mono text-xs text-brass-400">ERP · panel interno</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.filter((item) => !item.adminOnly || profile?.role === 'admin').map(
            ({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-navy-100 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            )
          )}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-brass-500 flex items-center justify-center text-xs font-semibold text-navy-700">
              {(profile?.full_name || '?').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{profile?.full_name || 'Usuario'}</div>
              <div className="text-xs text-navy-100 flex items-center gap-1 capitalize">
                <ShieldCheck className="w-3 h-3" /> {profile?.role || '—'}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-navy-100 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
