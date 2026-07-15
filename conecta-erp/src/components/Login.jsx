import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LoaderCircle, TriangleAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Credenciales inválidas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-paper">
      {/* Panel de marca */}
      <div className="hidden lg:flex flex-col justify-between bg-navy-500 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative">
          <span className="font-display font-bold text-2xl tracking-tight">CONECTA</span>
          <span className="ml-2 font-mono text-xs text-brass-400 align-super">ERP</span>
        </div>
        <div className="relative max-w-md">
          <p className="font-display text-3xl leading-snug">
            Operación, clientes e inventario en un solo lugar —
            <span className="text-brass-400"> sin hojas de cálculo.</span>
          </p>
          <p className="mt-4 text-navy-100 text-sm">
            Panel de control para servicios, personal en campo y consultoría.
          </p>
        </div>
        <div className="relative text-xs text-navy-100 font-mono">
          v1.0 · Sistema interno
        </div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm card p-8">
          <div className="lg:hidden mb-8 font-display font-bold text-xl text-navy-500">
            CONECTA <span className="text-brass-500 font-mono text-sm">ERP</span>
          </div>
          <h1 className="font-display text-xl font-semibold text-ink mb-1">Inicia sesión</h1>
          <p className="text-sm text-ink-soft mb-6">Ingresa con tu correo y contraseña.</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-card bg-danger-50 text-danger-600 text-sm px-3 py-2">
              <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-4">
            <label className="label" htmlFor="email">Correo electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-9"
                placeholder="tucorreo@conecta.mx"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="label" htmlFor="password">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-9"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
