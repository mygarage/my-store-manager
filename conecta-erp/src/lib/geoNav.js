// Detecta el sistema operativo del dispositivo para decidir si usar
// esquemas de URL nativos (abren la app instalada) o el fallback web.
function detectPlatform() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
  return 'desktop';
}

/**
 * Abre Google Maps con direcciones hacia (lat, lng).
 */
export function openInGoogleMaps(lat, lng, label = '') {
  if (lat == null || lng == null) return;
  const platform = detectPlatform();
  const query = encodeURIComponent(label);

  if (platform === 'ios') {
    // comgooglemaps:// abre la app si está instalada; si no, Safari
    // hace fallback automático a la URL https de abajo.
    window.location.href = `comgooglemaps://?daddr=${lat},${lng}&q=${query}`;
    setTimeout(() => {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }, 800);
    return;
  }

  if (platform === 'android') {
    window.location.href = `google.navigation:q=${lat},${lng}`;
    setTimeout(() => {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }, 800);
    return;
  }

  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
}

/**
 * Abre Waze con navegación hacia (lat, lng).
 */
export function openInWaze(lat, lng) {
  if (lat == null || lng == null) return;
  const platform = detectPlatform();
  const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

  if (platform === 'ios' || platform === 'android') {
    window.location.href = `waze://?ll=${lat},${lng}&navigate=yes`;
    setTimeout(() => {
      window.open(wazeUrl, '_blank');
    }, 800);
    return;
  }

  window.open(wazeUrl, '_blank');
}
