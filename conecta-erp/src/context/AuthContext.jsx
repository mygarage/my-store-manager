import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { logAction } from '../lib/auditLog';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error al cargar el perfil:', error.message);
      setProfile(null);
      return;
    }
    setProfile(data);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      if (session?.user) await fetchProfile(session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      await logAction('login_fallido', { details: { email, motivo: error.message } });
      throw error;
    }

    if (data?.user) {
      // Verifica que la cuenta no esté suspendida antes de dejarla pasar.
      const { data: prof } = await supabase
        .from('profiles')
        .select('account_status, failed_login_attempts')
        .eq('id', data.user.id)
        .single();

      if (prof?.account_status === 'suspended') {
        await supabase.auth.signOut();
        throw new Error('Esta cuenta está suspendida. Contacta a un administrador.');
      }

      await supabase
        .from('profiles')
        .update({ failed_login_attempts: 0, last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);

      await logAction('login_exitoso', { entity: 'profiles', entityId: data.user.id });
    }

    return data;
  };

  const logout = async () => {
    await logAction('logout');
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    loading,
    login,
    logout,
    refreshProfile: () => fetchProfile(session?.user?.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
