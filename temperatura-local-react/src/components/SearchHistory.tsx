interface SearchHistoryProps {
  history: string[];
  onSelect: (city: string) => void;
  onClear: () => void;
}

export function SearchHistory({ history, onSelect, onClear }: SearchHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg border border-white/15 bg-white/5 p-3 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-white/60">Buscas recentes</span>
        <button
          onClick={onClear}
          className="text-xs text-white/40 hover:text-white/70 transition-colors"
          aria-label="Limpar histórico"
        >
          Limpar
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((city) => (
          <button
            key={city}
            onClick={() => onSelect(city)}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80 transition-all hover:bg-white/20 hover:text-white"
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
}
