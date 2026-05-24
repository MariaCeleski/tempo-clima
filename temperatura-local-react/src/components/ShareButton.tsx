import { useState, useRef, useEffect } from 'react';
import type { WeatherData } from '../types/weather';

interface ShareButtonProps {
  data: WeatherData;
}

export function ShareButton({ data }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const shareText = `🌤️ Clima em ${data.city_name}${data.state ? ` (${data.state})` : ''}: ${data.temperature}°C — ${data.description}. Umidade: ${data.humidity}%, Vento: ${data.wind_speed} m/s`;
  const encodedText = encodeURIComponent(shareText);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1500);
    } catch {
      // Clipboard not available
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Clima em ${data.city_name}`, text: shareText });
      } catch {
        // User cancelled
      }
    }
    setOpen(false);
  }

  function openLink(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
    setOpen(false);
  }

  const shareOptions = [
    {
      name: 'WhatsApp',
      emoji: '💬',
      action: () => openLink(`https://wa.me/?text=${encodedText}`),
    },
    {
      name: 'Telegram',
      emoji: '✈️',
      action: () => openLink(`https://t.me/share/url?text=${encodedText}`),
    },
    {
      name: 'X (Twitter)',
      emoji: '🐦',
      action: () => openLink(`https://twitter.com/intent/tweet?text=${encodedText}`),
    },
    {
      name: 'Facebook',
      emoji: '👍',
      action: () => openLink(`https://www.facebook.com/sharer/sharer.php?quote=${encodedText}`),
    },
    {
      name: 'Email',
      emoji: '📧',
      action: () => openLink(`mailto:?subject=${encodeURIComponent(`Clima em ${data.city_name}`)}&body=${encodedText}`),
    },
    {
      name: copied ? '✓ Copiado!' : 'Copiar texto',
      emoji: '📋',
      action: handleCopy,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70 transition-all hover:bg-white/15 hover:text-white"
        aria-label="Compartilhar clima"
        aria-expanded={open}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Compartilhar
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-48 animate-fadeInUp rounded-xl border border-white/20 bg-slate-900/95 p-2 shadow-xl backdrop-blur-lg" role="menu" aria-label="Opções de compartilhamento">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/80 transition-all hover:bg-white/10 hover:text-white"
            >
              <span aria-hidden="true">{option.emoji}</span>
              <span>{option.name}</span>
            </button>
          ))}

          {'share' in navigator && (
            <>
              <div className="my-1 border-t border-white/10" role="separator" />
              <button
                onClick={handleNativeShare}
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/80 transition-all hover:bg-white/10 hover:text-white"
              >
                <span aria-hidden="true">📱</span>
                <span>Mais opções...</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
