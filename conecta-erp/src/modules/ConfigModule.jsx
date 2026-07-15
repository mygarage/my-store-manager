import { useEffect, useState } from 'react';
import { Save, ShieldAlert, Users, Palette } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { logAction } from '../lib/auditLog';

export default function ConfigModule() {
  const { profile } = useAuth();

  if (profile?.role !== 'admin') {
    return (
      <div className="card p-8 text-center">
        <ShieldAlert className="w-6 h-6 mx-auto mb-3 text-danger-500" />
        <p className="text-sm text-ink-soft">
          Solo los administradores pueden acceder a la configuración del sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Configuración</h1>
        <p className="text-sm text-ink-soft mt-1">Marca del sistema y administración de usuarios.</p>
      </div>
      <BrandingSection />
      <UsersSection />
    </div>
  );
}

function BrandingSection() {
  const [config, setConfig] = useState({
    company_name: '',
    logo_url: '',
    primary_color: '#16324F',
    secondary_color: '#C98A3E',
    wallpaper_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('system_branding').select('config').eq('id', 1).single();
      if (data?.config) setConfig({ ...config, ...data.config });
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('system_branding')
      .update({ config, updated_by: user?.id, updated_at: new Date().toISOString() })
      .eq('id', 1);
    setSaving(false);
    if (!error) {
      setSaved(true);
      await logAction('actualizar_branding', { entity: 'system_branding', entityId: '1' });
      setTimeout(() => setSaved(false), 2500);
    }
  }

  if (loading) return <div className="card p-6 text-sm text-ink-faint">Cargando configuración…</div>;

  return (
    <form onSubmit={handleSave} className="card p-6">
      <h2 className="font-display text-base font-semibold text-ink flex items-center gap-2 mb-4">
        <Palette className="w-4 h-4 text-brass-500" /> Marca del sistema
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Nombre de la empresa</label>
          <input className="input" value={config.company_name}
            onChange={(e) => setConfig({ ...config, company_name: e.target.value })} />
        </div>
        <div>
          <label className="label">URL del logo</label>
          <input className="input" value={config.logo_url}
            onChange={(e) => setConfig({ ...config, logo_url: e.target.value })} />
        </div>
        <div>
          <label className="label">Color primario</label>
          <div className="flex items-center gap-2">
            <input type="color" className="h-9 w-12 rounded-card border border-line"
              value={config.primary_color}
              onChange={(e) => setConfig({ ...config, primary_color: e.target.value })} />
            <input className="input font-mono" value={config.primary_color}
              onChange={(e) => setConfig({ ...config, primary_color: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Color secundario</label>
          <div className="flex items-center gap-2">
            <input type="color" className="h-9 w-12 rounded-card border border-line"
              value={config.secondary_color}
              onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })} />
            <input className="input font-mono" value={config.secondary_color}
              onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })} />
          </div>
        </div>
        <div className="col-span-2">
          <label className="label">URL de wallpaper / fondo</label>
          <input className="input" value={config.wallpaper_url}
            onChange={(e) => setConfig({ ...config, wallpaper_url: e.target.value })} />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-5">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="w-4 h-4" /> {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {saved && <span className="text-sm text-success-600">Guardado correctamente.</span>}
      </div>
    </form>
  );
}

function UsersSection() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateRole(id, role) {
    await supabase.from('profiles').update({ role }).eq('id', id);
    await logAction('cambiar_rol_usuario', { entity: 'profiles', entityId: id, details: { role } });
    load();
  }

  async function toggleStatus(profile) {
    const newStatus = profile.account_status === 'active' ? 'suspended' : 'active';
    await supabase.from('profiles').update({ account_status: newStatus }).eq('id', profile.id);
    await logAction('cambiar_estado_cuenta', {
      entity: 'profiles',
      entityId: profile.id,
      details: { account_status: newStatus },
    });
    load();
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-line">
        <h2 className="font-display text-base font-semibold text-ink flex items-center gap-2">
          <Users className="w-4 h-4 text-brass-500" /> Usuarios del sistema
        </h2>
        <p className="text-xs text-ink-soft mt-1">
          Los usuarios se registran vía Supabase Auth; aquí solo se gestionan rol y estado.
        </p>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-paper text-ink-soft text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-6 py-3 font-medium">Nombre</th>
            <th className="text-left px-6 py-3 font-medium">Correo</th>
            <th className="text-left px-6 py-3 font-medium">Rol</th>
            <th className="text-left px-6 py-3 font-medium">Estado</th>
            <th className="text-left px-6 py-3 font-medium">Intentos fallidos</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {loading ? (
            <tr><td colSpan={5} className="px-6 py-6 text-center text-ink-faint">Cargando…</td></tr>
          ) : (
            profiles.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-3 font-medium text-ink">{p.full_name}</td>
                <td className="px-6 py-3 text-ink-soft">{p.email}</td>
                <td className="px-6 py-3">
                  <select
                    className="input py-1 text-xs"
                    value={p.role}
                    onChange={(e) => updateRole(p.id, e.target.value)}
                  >
                    <option value="staff">staff</option>
                    <option value="supervisor">supervisor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => toggleStatus(p)}
                    className={`badge ${p.account_status === 'active' ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'}`}
                  >
                    {p.account_status}
                  </button>
                </td>
                <td className="px-6 py-3 font-mono text-ink-soft">{p.failed_login_attempts}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
