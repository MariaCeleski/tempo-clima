import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { WeatherCard } from '../WeatherCard';
import type { WeatherData } from '../../types/weather';

/**
 * Feature: temperatura-local, Property 8: WeatherCard exibe todos os campos obrigatórios
 *
 * For any valid WeatherData object, the rendered WeatherCard SHALL contain
 * city_name, formatted temperature, description, humidity, and wind_speed
 * in the output elements.
 *
 * **Validates: Requirements 2.1**
 */

const weatherDataArb: fc.Arbitrary<WeatherData> = fc.record({
  city_name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  state: fc.constantFrom('SP', 'RJ', 'SC', 'MG', 'PR', ''),
  country: fc.constantFrom('BR', 'US', 'PT', ''),
  lat: fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
  lon: fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
  temperature: fc.double({ min: -60, max: 60, noNaN: true }).map((v) => Math.round(v * 10) / 10),
  feels_like: fc.double({ min: -60, max: 60, noNaN: true }).map((v) => Math.round(v * 10) / 10),
  description: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
  humidity: fc.integer({ min: 0, max: 100 }),
  wind_speed: fc.double({ min: 0, max: 200, noNaN: true }).map((v) => Math.round(v * 10) / 10),
  icon_code: fc.stringMatching(/^[0-9]{2}[dn]$/),
  icon_url: fc.stringMatching(/^[0-9]{2}[dn]$/).map(
    (code) => `https://openweathermap.org/img/wn/${code}@2x.png`
  ),
  sunrise: fc.integer({ min: 1000000000, max: 2000000000 }),
  sunset: fc.integer({ min: 1000000000, max: 2000000000 }),
  timezone: fc.integer({ min: -43200, max: 43200 }),
});

describe('Feature: temperatura-local, Property 8: WeatherCard exibe todos os campos obrigatórios', () => {
  it('should display all required fields for any valid WeatherData', () => {
    fc.assert(
      fc.property(weatherDataArb, (data) => {
        const { container } = render(<WeatherCard data={data} />);
        const text = container.textContent ?? '';

        // city_name must be present
        expect(text).toContain(data.city_name);

        // temperature formatted with °C
        expect(text).toContain(`${data.temperature}°C`);

        // description must be present
        expect(text).toContain(data.description);

        // humidity with %
        expect(text).toContain(`${data.humidity}%`);

        // wind_speed with m/s
        expect(text).toContain(`${data.wind_speed} m/s`);
      }),
      { numRuns: 100 }
    );
  });
});
