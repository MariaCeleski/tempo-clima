import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLElement | null>;
  cityName?: string;
}

export function ExportButton({ targetRef, cityName }: ExportButtonProps) {
  const { t } = useTranslation();
  const [isCapturing, setIsCapturing] = useState(false);

  async function handleExport() {
    if (!targetRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      const safeCityName = (cityName || 'cidade').replace(/\s+/g, '-').toLowerCase();
      link.download = `clima-${safeCityName}-${date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // Silently fail — capture not critical
    } finally {
      setIsCapturing(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isCapturing}
      aria-label={t('export.aria') || 'Exportar como imagem'}
      title={t('export.title') || 'Exportar'}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-white/20 bg-white/80 dark:bg-white/5 text-slate-600 dark:text-white/70 transition-all hover:bg-white dark:hover:bg-white/15 hover:text-slate-900 dark:hover:text-white disabled:opacity-50"
    >
      {isCapturing ? (
        <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </button>
  );
}
