import { useMemo } from 'react';

interface WeatherParticlesProps {
  iconCode: string | null;
}

type ParticleType = 'rain' | 'snow' | 'sun' | 'thunder' | 'fog' | 'clouds' | null;

function getParticleType(iconCode: string | null): ParticleType {
  if (!iconCode) return null;
  const condition = iconCode.slice(0, 2);
  switch (condition) {
    case '01': return 'sun';
    case '02':
    case '03':
    case '04': return 'clouds';
    case '09':
    case '10': return 'rain';
    case '11': return 'thunder';
    case '13': return 'snow';
    case '50': return 'fog';
    default: return null;
  }
}

function RainParticles() {
  const drops = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 1.5 + Math.random() * 1,
      height: 15 + Math.random() * 15,
      opacity: 0.4 + Math.random() * 0.4,
    })), []);

  return (
    <>
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute rounded-full"
          style={{
            left: `${drop.left}%`,
            top: '-30px',
            width: '2px',
            height: `${drop.height}px`,
            background: 'linear-gradient(to bottom, transparent, rgba(147, 197, 253, 0.7), rgba(96, 165, 250, 0.9))',
            opacity: drop.opacity,
            animation: `rainFall ${drop.duration}s linear ${drop.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
}

function SnowParticles() {
  const flakes = useMemo(() =>
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5,
      size: 4 + Math.random() * 6,
      opacity: 0.5 + Math.random() * 0.5,
    })), []);

  return (
    <>
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${flake.left}%`,
            top: '-10px',
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snowFall ${flake.duration}s linear ${flake.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
}

function SunParticles() {
  return (
    <>
      {/* Glow orb */}
      <div
        className="absolute -right-10 -top-10 h-48 w-48 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, transparent 70%)',
          animation: 'sunPulse 4s ease-in-out infinite',
        }}
      />
      {/* Secondary glow */}
      <div
        className="absolute right-10 top-10 h-32 w-32 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(253, 224, 71, 0.15) 0%, transparent 70%)',
          animation: 'sunPulse 4s ease-in-out 1s infinite',
        }}
      />
      {/* Light rays */}
      <div
        className="absolute -right-5 -top-5 h-64 w-64 opacity-30"
        style={{
          background: 'conic-gradient(from 0deg, transparent, rgba(251, 191, 36, 0.3), transparent, rgba(251, 191, 36, 0.2), transparent, rgba(251, 191, 36, 0.3), transparent)',
          animation: 'sunSpin 20s linear infinite',
        }}
      />
    </>
  );
}

function ThunderParticles() {
  return (
    <>
      <RainParticles />
      <div
        className="absolute inset-0"
        style={{ animation: 'thunderFlash 4s ease-in-out infinite' }}
      />
      <div
        className="absolute inset-0"
        style={{ animation: 'thunderFlash 4s ease-in-out 2.3s infinite' }}
      />
    </>
  );
}

function FogParticles() {
  const layers = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      top: 15 + i * 18,
      delay: i * 1.5,
      duration: 10 + i * 3,
      opacity: 0.12 + i * 0.04,
      height: 40 + i * 10,
    })), []);

  return (
    <>
      {layers.map((layer) => (
        <div
          key={layer.id}
          className="absolute rounded-full bg-white/80 blur-2xl"
          style={{
            top: `${layer.top}%`,
            left: '-50%',
            width: '200%',
            height: `${layer.height}px`,
            opacity: layer.opacity,
            animation: `fogDrift ${layer.duration}s ease-in-out ${layer.delay}s infinite alternate`,
          }}
        />
      ))}
    </>
  );
}

function CloudParticles() {
  const clouds = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      top: 5 + Math.random() * 40,
      delay: i * 2.5,
      duration: 20 + Math.random() * 15,
      width: 100 + Math.random() * 150,
      height: 40 + Math.random() * 40,
      opacity: 0.08 + Math.random() * 0.1,
    })), []);

  return (
    <>
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className="absolute rounded-full bg-white blur-3xl"
          style={{
            top: `${cloud.top}%`,
            left: '-20%',
            width: `${cloud.width}px`,
            height: `${cloud.height}px`,
            opacity: cloud.opacity,
            animation: `fogDrift ${cloud.duration}s ease-in-out ${cloud.delay}s infinite alternate`,
          }}
        />
      ))}
    </>
  );
}

export function WeatherParticles({ iconCode }: WeatherParticlesProps) {
  const type = getParticleType(iconCode);

  if (!type) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {type === 'rain' && <RainParticles />}
      {type === 'snow' && <SnowParticles />}
      {type === 'sun' && <SunParticles />}
      {type === 'thunder' && <ThunderParticles />}
      {type === 'fog' && <FogParticles />}
      {type === 'clouds' && <CloudParticles />}
    </div>
  );
}
