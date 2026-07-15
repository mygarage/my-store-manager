const STATUS_STYLES = {
  // servicios
  pendiente: 'bg-ink-faint/15 text-ink-soft',
  en_progreso: 'bg-brass-50 text-brass-600',
  completado: 'bg-success-50 text-success-600',
  cancelado: 'bg-danger-50 text-danger-600',
  // inventario
  disponible: 'bg-success-50 text-success-600',
  stock_bajo: 'bg-brass-50 text-brass-600',
  agotado: 'bg-danger-50 text-danger-600',
  // asignaciones
  asignado: 'bg-navy-50 text-navy-500',
  en_sitio: 'bg-brass-50 text-brass-600',
  finalizado: 'bg-success-50 text-success-600',
  ausente: 'bg-danger-50 text-danger-600',
};

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completado: 'Completado',
  cancelado: 'Cancelado',
  disponible: 'Disponible',
  stock_bajo: 'Stock bajo',
  agotado: 'Agotado',
  asignado: 'Asignado',
  en_sitio: 'En sitio',
  finalizado: 'Finalizado',
  ausente: 'Ausente',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_STYLES[status] || 'bg-ink-faint/15 text-ink-soft'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
