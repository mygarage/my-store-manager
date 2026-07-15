import { FolderOpen, ExternalLink } from 'lucide-react';

/**
 * Muestra el contenido de una carpeta de Google Drive embebida.
 * Requiere que la carpeta esté compartida como "Cualquier persona con
 * el enlace puede ver" para que el iframe pueda renderizarla.
 */
export default function GoogleDriveViewer({ folderId, title = 'Archivos del cliente' }) {
  if (!folderId) {
    return (
      <div className="card p-6 text-center text-sm text-ink-soft">
        <FolderOpen className="w-6 h-6 mx-auto mb-2 text-ink-faint" />
        Este cliente aún no tiene una carpeta de Google Drive vinculada.
      </div>
    );
  }

  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
  const externalUrl = `https://drive.google.com/drive/folders/${folderId}`;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <div className="flex items-center gap-2 text-sm font-medium text-ink">
          <FolderOpen className="w-4 h-4 text-brass-500" />
          {title}
        </div>
        <a
          href={externalUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs text-navy-500 hover:text-navy-600 font-medium"
        >
          Abrir en Drive <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-[420px] border-0"
        loading="lazy"
      />
    </div>
  );
}
