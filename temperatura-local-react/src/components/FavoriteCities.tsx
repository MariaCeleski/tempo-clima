interface FavoriteCitiesProps {
  favorites: string[];
  onSelect: (city: string) => void;
  onRemove: (city: string) => void;
  onClear: () => void;
}

export function FavoriteCities({ favorites, onSelect, onRemove, onClear }: FavoriteCitiesProps) {
  if (favorites.length === 0) return null;

  return (
    <nav className="mt-3 rounded-lg border border-amber-200 dark:border-amber-400/20 bg-white/70 dark:bg-white/5 p-3 shadow-sm dark:shadow-none backdrop-blur-sm" aria-label="Cidades favoritas">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-amber-600 dark:text-amber-300/80" id="favorite-cities-label">
          ★ Favoritas
        </span>
        <button
          onClick={onClear}
          className="text-xs text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70 transition-colors"
          aria-label="Limpar favoritos"
        >
          Limpar favoritos
        </button>
      </div>
      <div className="flex flex-wrap gap-2" role="list" aria-labelledby="favorite-cities-label">
        {favorites.map((city) => (
          <span
            key={city}
            role="listitem"
            className="inline-flex items-center gap-1 rounded-full border border-amber-200 dark:border-amber-400/25 bg-amber-50/80 dark:bg-amber-400/10 px-3 py-1 text-xs text-amber-800 dark:text-amber-200 transition-all hover:bg-amber-100 dark:hover:bg-amber-400/20"
          >
            <button
              onClick={() => onSelect(city)}
              className="hover:underline"
              aria-label={`Buscar clima em ${city}`}
            >
              {city}
            </button>
            <button
              onClick={() => onRemove(city)}
              className="ml-1 text-amber-400 dark:text-amber-300/60 hover:text-amber-700 dark:hover:text-amber-100 transition-colors"
              aria-label={`Remover ${city} dos favoritos`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </nav>
  );
}
