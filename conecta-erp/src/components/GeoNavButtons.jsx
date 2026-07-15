import { Navigation, MapPin } from 'lucide-react';
import { openInGoogleMaps, openInWaze } from '../lib/geoNav';

/**
 * Par de botones para abrir una ubicación en Google Maps o Waze,
 * detectando automáticamente el dispositivo del usuario.
 */
export default function GeoNavButtons({ lat, lng, label = '', compact = false }) {
  if (lat == null || lng == null) {
    return <span className="text-xs text-ink-faint">Sin coordenadas GPS</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => openInGoogleMaps(lat, lng, label)}
        className={compact ? 'btn-secondary px-2.5 py-1.5 text-xs' : 'btn-secondary'}
        title="Abrir en Google Maps"
      >
        <MapPin className="w-3.5 h-3.5" />
        {!compact && 'Maps'}
      </button>
      <button
        type="button"
        onClick={() => openInWaze(lat, lng)}
        className={compact ? 'btn-secondary px-2.5 py-1.5 text-xs' : 'btn-secondary'}
        title="Abrir en Waze"
      >
        <Navigation className="w-3.5 h-3.5" />
        {!compact && 'Waze'}
      </button>
    </div>
  );
}
