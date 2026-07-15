import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FolderOpen, X, Building2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { logAction } from '../lib/auditLog';
import GoogleDriveViewer from '../components/GoogleDriveViewer';

const EMPTY_FORM = {
  id: null,
  company_name: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  rfc: '',
  address: '',
  google_drive_folder_id: '',
  notes: '',
};

export default function ClientsModule() {
  const { profile } = useAuth();
  const canWrite = profile?.role === 'admin' || profile?.role === 'supervisor';

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [driveClient, setDriveClient] = useState(null);

  async function loadClients() {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setClients(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadClients();
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(client) {
    setForm(client);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      company_name: form.company_name,
      contact_name: form.contact_name || null,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
      rfc: form.rfc || null,
      address: form.address || null,
      google_drive_folder_id: form.google_drive_folder_id || null,
      notes: form.notes || null,
    };

    let result;
    if (form.id) {
      result = await supabase.from('clients').update(payload).eq('id', form.id);
      if (!result.error) await logAction('actualizar_cliente', { entity: 'clients', entityId: form.id });
    } else {
      result = await supabase.from('clients').insert(payload).select().single();
      if (!result.error) await logAction('crear_cliente', { entity: 'clients', entityId: result.data?.id });
    }

    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setShowForm(false);
    loadClients();
  }

  async function handleDelete(client) {
    if (!confirm(`¿Eliminar a ${client.company_name}? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from('clients').delete().eq('id', client.id);
    if (error) {
      setError(error.message);
      return;
    }
    await logAction('eliminar_cliente', { entity: 'clients', entityId: client.id });
    loadClients();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Clientes</h1>
          <p className="text-sm text-ink-soft mt-1">Empresas y contactos de consultoría.</p>
        </div>
        {canWrite && (
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> Nuevo cliente
          </button>
        )}
      </div>

      {error && <div className="rounded-card bg-danger-50 text-danger-600 text-sm px-4 py-3">{error}</div>}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-ink-soft text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Empresa</th>
              <th className="text-left px-4 py-3 font-medium">Contacto</th>
              <th className="text-left px-4 py-3 font-medium">RFC</th>
              <th className="text-left px-4 py-3 font-medium">Drive</th>
              <th className="text-right px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-faint">Cargando…</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-soft">No hay clientes registrados aún.</td></tr>
            ) : (
              clients.map((c) => (
                <tr key={c.id} className="hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium text-ink">
                      <Building2 className="w-4 h-4 text-navy-400" />
                      {c.company_name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    <div>{c.contact_name || '—'}</div>
                    <div className="text-xs text-ink-faint">{c.contact_email}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{c.rfc || '—'}</td>
                  <td className="px-4 py-3">
                    {c.google_drive_folder_id ? (
                      <button
                        onClick={() => setDriveClient(c)}
                        className="flex items-center gap-1 text-navy-500 hover:text-navy-600 text-xs font-medium"
                      >
                        <FolderOpen className="w-3.5 h-3.5" /> Ver archivos
                      </button>
                    ) : (
                      <span className="text-xs text-ink-faint">Sin vincular</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {canWrite && (
                        <>
                          <button onClick={() => openEdit(c)} className="btn-secondary px-2.5 py-1.5">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(c)} className="btn-danger px-2.5 py-1.5">
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

      {/* Panel de Drive */}
      {driveClient && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-6 z-50" onClick={() => setDriveClient(null)}>
          <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button onClick={() => setDriveClient(null)} className="btn-secondary px-2 py-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <GoogleDriveViewer
              folderId={driveClient.google_drive_folder_id}
              title={`Archivos de ${driveClient.company_name}`}
            />
          </div>
        </div>
      )}

      {/* Formulario modal */}
      {showForm && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-6 z-50" onClick={() => setShowForm(false)}>
          <form
            onSubmit={handleSubmit}
            className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-ink">
                {form.id ? 'Editar cliente' : 'Nuevo cliente'}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-ink-faint hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Nombre de la empresa *</label>
                <input required className="input" value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre de contacto</label>
                  <input className="input" value={form.contact_name || ''}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
                </div>
                <div>
                  <label className="label">RFC</label>
                  <input className="input font-mono" value={form.rfc || ''}
                    onChange={(e) => setForm({ ...form, rfc: e.target.value.toUpperCase() })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Correo de contacto</label>
                  <input type="email" className="input" value={form.contact_email || ''}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input className="input" value={form.contact_phone || ''}
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Dirección</label>
                <input className="input" value={form.address || ''}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className="label">ID de carpeta de Google Drive</label>
                <input className="input font-mono" value={form.google_drive_folder_id || ''}
                  onChange={(e) => setForm({ ...form, google_drive_folder_id: e.target.value })}
                  placeholder="1A2b3C4d5E6f... (de la URL de la carpeta)" />
                <p className="text-xs text-ink-faint mt-1">
                  La carpeta debe compartirse como "Cualquiera con el enlace puede ver".
                </p>
              </div>
              <div>
                <label className="label">Notas</label>
                <textarea className="input" rows={3} value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>

            {error && <div className="mt-4 text-sm text-danger-600">{error}</div>}

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Guardando…' : 'Guardar cliente'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
