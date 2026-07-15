import { supabase } from '../supabaseClient';

// Obtiene la IP pública del cliente vía un servicio externo gratuito.
// Si falla (sin red, bloqueado, etc.) se registra 'desconocida' en vez
// de romper el flujo de la acción que se está auditando.
async function getClientIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip || 'desconocida';
  } catch {
    return 'desconocida';
  }
}

/**
 * Registra una entrada inmutable en audit_logs.
 * @param {string} action - ej. 'login', 'crear_servicio', 'actualizar_inventario'
 * @param {object} [options]
 * @param {string} [options.entity] - nombre de la tabla/entidad afectada
 * @param {string} [options.entityId] - id del registro afectado
 * @param {object} [options.details] - metadata adicional en JSON
 */
export async function logAction(action, options = {}) {
  const { entity = null, entityId = null, details = {} } = options;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ip = await getClientIp();

  const { error } = await supabase.from('audit_logs').insert({
    user_id: user?.id ?? null,
    ip_address: ip,
    action,
    entity,
    entity_id: entityId,
    details,
  });

  if (error) {
    // No relanzamos el error: una falla al auditar no debe bloquear
    // la operación de negocio que la originó.
    console.error('No se pudo registrar el log de auditoría:', error.message);
  }
}
