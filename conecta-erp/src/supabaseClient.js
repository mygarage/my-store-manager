import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------
// CONFIGURACIÓN DE SUPABASE — CONECTA ERP
// La anon key es segura para exponer en el cliente: el acceso real a los
// datos está gobernado por las políticas de Row Level Security (RLS)
// definidas en 01_schema_conecta_erp.sql, no por esta clave.
// NUNCA expongas aquí la service_role key.
// ---------------------------------------------------------------------
const SUPABASE_URL = 'https://viwaaxiamrybwibawykf.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpd2FheGlhbXJ5YndpYmF3eWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NDEyMjUsImV4cCI6MjA5NzMxNzIyNX0.FYI0pNqBAVKsD2AjeoAsETvy0mTBU91q94E9qARfufo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
