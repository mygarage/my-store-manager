import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, MapPinned } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { logAction } from '../lib/auditLog';
import StatusBadge from '../components/StatusBadge';
import GeoNavButtons from '../components/GeoNavButtons';

const EMPTY_FORM = {
  id: null,
  client_id: '',
  title: '',
  description: '',
  status: 'pendiente',
  gps_lat: '',
  gps_lng: '',
  address: '',
  start_date: '',
  end_date: '',
  budget: '',
};

const STATUS_OPTIONS = ['pendiente', 'en_progreso', 'completado', 'cancelado'];

export default function ServicesModule() {
  const { profile } = useAuth();
  const canWrite = profile?.role === 'admin' || profile?.role === 'supervisor';

  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    const [servicesRes, clientsRes] = await Promise.all([
      supabase
        .from('services')
        .select('*, clients(company_name)')
        .order('created_at', { ascending: false }),
      supabase.from('clients').select('id, company_name').order('company_name'),
    ]);
    if (servicesRes.error) setError(servicesRes.error.message);
    setServices(servicesRes.data || []);
    setClients(clientsRes.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(service) {
    setForm({
      ...service,
      gps_lat: service.gps_lat ?? '',
      gps_lng: service.gps_lng ?? '',
      budget: service.budget ?? '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      client_id: form.client_id,
      title: form.title,
      description: form.description || null,
      status: form.status,
      gps_lat: form.gps_lat === '' ? null : Number(form.gps_lat),
      gps_lng: form.gps_lng === '' ? null : Number(form.gps_lng),
      address: form.address || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      budget: form.budget === '' ? 0 : Number(form.budget),
    };

    let result;
    if (form.id) {
      result = await supabase.from('services').update(payload).eq('id', form.id);
      if (!result.error) await logAction('actualizar_servicio', { entity: 'services', entityId: form.id });
    } else {
      result = await supabase.from('services').insert(payload).select().single();
      if (!result.error) await logAction('crear_servicio', { entity: 'services', entityId: result.data?.id });
    }

    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setShowForm(false);
    loadData();
  }

  async function handleDelete(service) {
    if (!confirm(`¿Eliminar el servicio "${service.title}"?`)) return;
    const { error } = await supabase.from('services').delete().eq('id', service.id);
    if (error) {
      setError(error.message);
      return;
    }
    await logAction('eliminar_servicio', { entity: 'services', entityId: service.id });
    loadData();
  }

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError('Este dispositivo no soporta geolocalización.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          gps_lat: pos.coords.latitude.toFixed(6),
          gps_lng: pos.coords.longitude.toFixed(6),
        }));
      },
      () => setError('No se pudo obtener tu ubicación actual.')
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Servicios</h1>
          <p className="text-sm text-ink-soft mt-1">Órdenes de servicio y trabajo en campo.</p>
        </div>
        {canWrite && (
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> Nuevo servicio
          </button>
        )}
      </div>

      {error && <div className="rounded-card bg-danger-50 text-danger-600 text-sm px-4 py-3">{error}</div>}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-ink-soft text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Servicio</th>
              <th className="text-left px-4 py-3 font-medium">Cliente</th>
              <th className="text-left px-4 py-3 font-medium">Estado</th>
              <th className="text-left px-4 py-3 font-medium">Fechas</th>
              <th className="text-left px-4 py-3 font-medium">Presupuesto</th>
              <th className="text-left px-4 py-3 font-medium">Ubicación</th>
              <th className="text-right px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-ink-faint">Cargando…</td></tr>
            ) : services.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-ink-soft">No hay servicios registrados aún.</td></tr>
            ) : (
              services.map((s) => (
                <tr key={s.id} className="hover:bg-paper/60 align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{s.title}</div>
                    <div className="text-xs text-ink-faint truncate max-w-[220px]">{s.description}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{s.clients?.company_name || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                    <div>{s.start_date || '—'}</div>
                    <div className="text-ink-faint">a {s.end_date || '—'}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-ink">
                    {s.budget ? `$${Number(s.budget).toLocaleString('es-MX')} ${s.currency}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <GeoNavButtons lat={s.gps_lat} lng={s.gps_lng} label={s.title} compact />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {canWrite && (
                        <>
                          <button onClick={() => openEdit(s)} className="btn-secondary px-2.5 py-1.5">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(s)} className="btn-danger px-2.5 py-1.5">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-6 z-50" onClick={() => setShowForm(false)}>
          <form
            onSubmit={handleSubmit}
            className="card w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-ink">
                {form.id ? 'Editar servicio' : 'Nuevo servicio'}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-ink-faint hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Título del servicio *</label>
                <input required className="input" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Cliente *</label>
                  <select required className="input" value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
                    <option value="" disabled>Selecciona un cliente</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Estado</label>
                  <select className="input" value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Descripción</label>
                <textarea className="input" rows={2} value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Fecha de inicio</label>
                  <input type="date" className="input" value={form.start_date || ''}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div>
                  <label className="label">Fecha de fin</label>
                  <input type="date" className="input" value={form.end_date || ''}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="label">Presupuesto (MXN)</label>
                <input type="number" step="0.01" className="input font-mono" value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })} />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="label mb-0">Ubicación GPS</label>
                  <button type="button" onClick={useCurrentLocation}
                    className="text-xs text-navy-500 font-medium flex items-center gap-1">
                    <MapPinned className="w-3.5 h-3.5" /> Usar mi ubicación actual
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <input type="number" step="any" placeholder="Latitud" className="input font-mono"
                    value={form.gps_lat} onChange={(e) => setForm({ ...form, gps_lat: e.target.value })} />
                  <input type="number" step="any" placeholder="Longitud" className="input font-mono"
                    value={form.gps_lng} onChange={(e) => setForm({ ...form, gps_lng: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="label">Dirección (referencia)</label>
                <input className="input" value={form.address || ''}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>

            {error && <div className="mt-4 text-sm text-danger-600">{error}</div>}

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Guardando…' : 'Guardar servicio'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
