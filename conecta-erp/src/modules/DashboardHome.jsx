import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Building2, Boxes, Activity, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import StatusBadge from '../components/StatusBadge';
import GeoNavButtons from '../components/GeoNavButtons';

const STATUS_RAIL_ORDER = { en_progreso: 0, pendiente: 1, completado: 2, cancelado: 3 };

export default function DashboardHome() {
  const [stats, setStats] = useState({ services: 0, clients: 0, lowStock: 0 });
  const [activeServices, setActiveServices] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [servicesRes, clientsRes, inventoryRes, recentServicesRes, logsRes] =
        await Promise.all([
          supabase.from('services').select('id', { count: 'exact', head: true }),
          supabase.from('clients').select('id', { count: 'exact', head: true }),
          supabase.from('inventory').select('id', { count: 'exact', head: true }).eq('status', 'stock_bajo'),
          supabase
            .from('services')
            .select('id, title, status, gps_lat, gps_lng, start_date, clients(company_name)')
            .order('created_at', { ascending: false })
            .limit(8),
          supabase
            .from('audit_logs')
            .select('id, action, created_at, entity, profiles(full_name)')
            .order('created_at', { ascending: false })
            .limit(6),
        ]);

      if (!mounted) return;

      setStats({
        services: servicesRes.count ?? 0,
        clients: clientsRes.count ?? 0,
        lowStock: inventoryRes.count ?? 0,
      });

      const ordered = [...(recentServicesRes.data || [])].sort(
        (a, b) => (STATUS_RAIL_ORDER[a.status] ?? 9) - (STATUS_RAIL_ORDER[b.status] ?? 9)
      );
      setActiveServices(ordered);
      setRecentLogs(logsRes.data || []);
      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="text-sm text-ink-soft mt-1">Vista general de la operación en tiempo real.</p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Briefcase} label="Servicios activos" value={stats.services} to="/servicios" />
        <StatCard icon={Building2} label="Clientes" value={stats.clients} to="/clientes" />
        <StatCard
          icon={Boxes}
          label="Materiales con stock bajo"
          value={stats.lowStock}
          to="/inventario"
          alert={stats.lowStock > 0}
        />
      </div>

      {/* Rail de Operaciones en Vivo — elemento de firma del dashboard */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-semibold text-ink flex items-center gap-2">
            <Activity className="w-4 h-4 text-brass-500" />
            Rail de operaciones en vivo
          </h2>
          <Link to="/servicios" className="text-xs font-medium text-navy-500 flex items-center gap-1">
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-ink-faint">Cargando…</div>
        ) : activeServices.length === 0 ? (
          <div className="card p-6 text-sm text-ink-soft text-center">
            Aún no hay servicios registrados. Crea el primero en el módulo de Servicios.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {activeServices.map((s) => (
              <div
                key={s.id}
                className={`card min-w-[260px] p-4 border-l-4 ${railBorderColor(s.status)}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink truncate">{s.title}</div>
                    <div className="text-xs text-ink-soft truncate">
                      {s.clients?.company_name || 'Sin cliente'}
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <div className="font-mono text-xs text-ink-faint mb-3">
                  {s.start_date ? new Date(s.start_date).toLocaleDateString('es-MX') : 'Sin fecha'}
                </div>
                <GeoNavButtons lat={s.gps_lat} lng={s.gps_lng} label={s.title} compact />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actividad reciente (audit log) */}
      <div>
        <h2 className="font-display text-base font-semibold text-ink mb-3">Actividad reciente</h2>
        <div className="card divide-y divide-line">
          {recentLogs.length === 0 ? (
            <div className="p-4 text-sm text-ink-soft">Sin actividad registrada todavía.</div>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <span className="font-medium text-ink">{log.profiles?.full_name || 'Sistema'}</span>
                  <span className="text-ink-soft"> — {log.action.replaceAll('_', ' ')}</span>
                </div>
                <span className="font-mono text-xs text-ink-faint">
                  {new Date(log.created_at).toLocaleString('es-MX')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function railBorderColor(status) {
  switch (status) {
    case 'en_progreso':
      return 'border-l-brass-500';
    case 'completado':
      return 'border-l-success-500';
    case 'cancelado':
      return 'border-l-danger-500';
    default:
      return 'border-l-ink-faint';
  }
}

function StatCard({ icon: Icon, label, value, to, alert }) {
  return (
    <Link to={to} className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div
        className={`w-10 h-10 rounded-card flex items-center justify-center ${
          alert ? 'bg-danger-50 text-danger-600' : 'bg-navy-50 text-navy-500'
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="font-mono text-2xl font-semibold text-ink leading-none">{value}</div>
        <div className="text-xs text-ink-soft mt-1">{label}</div>
      </div>
    </Link>
  );
}
