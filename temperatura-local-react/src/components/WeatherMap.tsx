import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatTemperature } from '../services/weatherApi';

interface WeatherMapProps {
  lat: number;
  lon: number;
  cityName: string;
  temperature: number;
  description: string;
  iconUrl: string;
  unit: 'C' | 'F';
}

// Fix default marker icon issue with bundlers
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapUpdater({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 11, { animate: true });
  }, [lat, lon, map]);
  return null;
}

export function WeatherMap({ lat, lon, cityName, temperature, description, iconUrl, unit }: WeatherMapProps) {
  return (
    <div
      className="animate-fadeInUp mt-4 overflow-hidden rounded-2xl border border-white/25"
      role="img"
      aria-label={`Mapa mostrando a localização de ${cityName} com temperatura de ${formatTemperature(temperature, unit)}`}
    >
      <MapContainer
        center={[lat, lon]}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: '200px', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />
        <Marker position={[lat, lon]} icon={markerIcon}>
          <Popup>
            <div className="flex flex-col items-center gap-1 text-center">
              <strong className="text-sm">{cityName}</strong>
              <img src={iconUrl} alt={description} className="h-8 w-8" />
              <span className="text-sm font-medium">{formatTemperature(temperature, unit)}</span>
              <span className="text-xs capitalize text-gray-600">{description}</span>
            </div>
          </Popup>
        </Marker>
        <MapUpdater lat={lat} lon={lon} />
      </MapContainer>
    </div>
  );
}
