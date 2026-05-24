interface AirQualityProps {
  aqi: number; // 1-5 scale from OpenWeatherMap
}

const AQI_LABELS: Record<number, { label: string; color: string; emoji: string }> = {
  1: { label: 'Boa', color: 'text-emerald-300', emoji: '😊' },
  2: { label: 'Razoável', color: 'text-yellow-300', emoji: '🙂' },
  3: { label: 'Moderada', color: 'text-orange-300', emoji: '😐' },
  4: { label: 'Ruim', color: 'text-red-300', emoji: '😷' },
  5: { label: 'Muito Ruim', color: 'text-purple-300', emoji: '🚨' },
};

export function AirQuality({ aqi }: AirQualityProps) {
  const info = AQI_LABELS[aqi] || AQI_LABELS[3];

  return (
    <div className="flex items-center justify-center gap-2 text-sm" role="status" aria-label={`Qualidade do ar: ${info.label}`}>
      <span className="text-white/60">Ar:</span>
      <span className={`font-medium ${info.color}`}>
        <span aria-hidden="true">{info.emoji}</span> {info.label}
      </span>
      <div className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-2 w-3 rounded-sm ${
              level <= aqi ? 'bg-current opacity-100' : 'bg-white/20'
            }`}
            style={level <= aqi ? { color: getBarColor(level) } : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function getBarColor(level: number): string {
  switch (level) {
    case 1: return '#6ee7b7';
    case 2: return '#fde047';
    case 3: return '#fdba74';
    case 4: return '#fca5a5';
    case 5: return '#d8b4fe';
    default: return '#ffffff';
  }
}
