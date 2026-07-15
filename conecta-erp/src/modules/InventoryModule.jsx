import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Boxes } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { logAction } from '../lib/auditLog';
import StatusBadge from '../components/StatusBadge';

const EMPTY_FORM = {
  id: null,
  name: '',
  category: '',
  sku: '',
  stock_quantity: '',
  unit: 'pza',
  min_threshold: '',
  unit_cost: '',
  location: '',
};

function computeStatus(quantity, threshold) {
  if (quantity <= 0) return 'agotado';
  if (quantity <= threshold) return 'stock_bajo';
  return 'disponible';
}

export default function InventoryModule() {
  const { profile } = useAuth();
  const canWrite = profile?.role === 'admin' || profile?.role === 'supervisor';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name');
    if (error) setError(error.message);
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(item) {
    setForm(item);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const quantity = Number(form.stock_quantity) || 0;
    const threshold = Number(form.min_threshold) || 0;

    const payload = {
      name: form.name,
      category: form.category || null,
      sku: form.sku || null,
      stock_quantity: quantity,
      unit: form.unit || 'pza',
      min_threshold: threshold,
      status: computeStatus(quantity, threshold),
      unit_cost: form.unit_cost === '' ? 0 : Number(form.unit_cost),
      location: form.location || null,
    };

    let result;
    if (form.id) {
      result = await supabase.from('inventory').update(payload).eq('id', form.id);
      if (!result.error) await logAction('actualizar_inventario', { entity: 'inventory', entityId: form.id });
    } else {
      result = await supabase.from('inventory').insert(payload).select().single();
      if (!result.error) await logAction('crear_inventario', { entity: 'inventory', entityId: result.data?.id });
    }

    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setShowForm(false);
    loadItems();
  }

  async function handleDelete(item) {
    if (!confirm(`¿Eliminar "${item.name}" del inventario?`)) return;
    const { error } = await supabase.from('inventory').delete().eq('id', item.id);
    if (error) {
      setError(error.message);
      return;
    }
    await logAction('eliminar_inventario', { entity: 'inventory', entityId: item.id });
    loadItems();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Inventario</h1>
          <p className="text-sm text-ink-soft mt-1">Materiales y existencias.</p>
        </div>
        {canWrite && (
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> Nuevo material
          </button>
        )}
      </div>

      {error && <div className="rounded-card bg-danger-50 text-danger-600 text-sm px-4 py-3">{error}</div>}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-ink-soft text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Material</th>
              <th className="text-left px-4 py-3 font-medium">SKU</th>
              <th className="text-left px-4 py-3 font-medium">Existencias</th>
              <th className="text-left px-4 py-3 font-medium">Estado</th>
              <th className="text-left px-4 py-3 font-medium">Costo unitario</th>
              <th className="text-left px-4 py-3 font-medium">Ubicación</th>
              <th className="text-right px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-ink-faint">Cargando…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-ink-soft">
                <Boxes className="w-5 h-5 mx-auto mb-2 text-ink-faint" />
                No hay materiales registrados aún.
              </td></tr>
            ) : (
              items.map((i) => (
                <tr key={i.id} className="hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{i.name}</div>
                    <div className="text-xs text-ink-faint">{i.category}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{i.sku || '—'}</td>
                  <td className="px-4 py-3 font-mono text-ink">
                    {i.stock_quantity} {i.unit}
                    <span className="text-ink-faint text-xs"> / mín. {i.min_threshold}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-3 font-mono text-ink">${Number(i.unit_cost || 0).toLocaleString('es-MX')}</td>
                  <td className="px-4 py-3 text-ink-soft">{i.location || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {canWrite && (
                        <>
                          <button onClick={() => openEdit(i)} className="btn-secondary px-2.5 py-1.5">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(i)} className="btn-danger px-2.5 py-1.5">
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
            className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-ink">
                {form.id ? 'Editar material' : 'Nuevo material'}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-ink-faint hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Nombre del material *</label>
                <input required className="input" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Categoría</label>
                  <input className="input" value={form.category || ''}
                    onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div>
                  <label className="label">SKU</label>
                  <input className="input font-mono" value={form.sku || ''}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Existencias *</label>
                  <input required type="number" step="0.01" className="input font-mono" value={form.stock_quantity}
                    onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
                </div>
                <div>
                  <label className="label">Unidad</label>
                  <input className="input" value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                </div>
                <div>
                  <label className="label">Mínimo</label>
                  <input type="number" step="0.01" className="input font-mono" value={form.min_threshold}
                    onChange={(e) => setForm({ ...form, min_threshold: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Costo unitario (MXN)</label>
                  <input type="number" step="0.01" className="input font-mono" value={form.unit_cost}
                    onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} />
                </div>
                <div>
                  <label className="label">Ubicación / almacén</label>
                  <input className="input" value={form.location || ''}
                    onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
              <p className="text-xs text-ink-faint">
                El estado (disponible / stock bajo / agotado) se calcula automáticamente según existencias y mínimo.
              </p>
            </div>

            {error && <div className="mt-4 text-sm text-danger-600">{error}</div>}

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Guardando…' : 'Guardar material'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
