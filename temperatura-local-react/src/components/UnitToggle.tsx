interface UnitToggleProps {
  unit: 'C' | 'F';
  onToggle: () => void;
}

export function UnitToggle({ unit, onToggle }: UnitToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70 transition-all hover:bg-white/15 hover:text-white"
      aria-label={`Alternar para ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
    >
      <span className={unit === 'C' ? 'font-bold text-white' : ''}>°C</span>
      <span className="text-white/40">/</span>
      <span className={unit === 'F' ? 'font-bold text-white' : ''}>°F</span>
    </button>
  );
}
