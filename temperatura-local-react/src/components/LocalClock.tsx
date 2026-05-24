import { useState, useEffect } from 'react';

interface LocalClockProps {
  timezone: number; // offset in seconds from UTC
}

function getLocalTime(timezone: number): string {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const localDate = new Date(utcMs + timezone * 1000);
  const hours = localDate.getHours().toString().padStart(2, '0');
  const minutes = localDate.getMinutes().toString().padStart(2, '0');
  const seconds = localDate.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function LocalClock({ timezone }: LocalClockProps) {
  const [time, setTime] = useState(() => getLocalTime(timezone));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getLocalTime(timezone));
    }, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <p className="text-center text-sm text-white/70" aria-live="off" aria-atomic="true">
      <span aria-hidden="true">🕐</span> Hora local: <time className="font-mono text-white">{time}</time>
    </p>
  );
}
