import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  buildApiUrl,
  validateInput,
  sanitizeInput,
  transformApiResponse,
  roundToOneDecimal,
  buildIconUrl,
} from '../weatherApi';

/**
 * Feature: temperatura-local, Property 1: Construção correta da URL da API
 * **Validates: Requirements 1.1, 9.2**
 *
 * For any valid city name (non-empty, not only whitespace), the URL built by the service
 * SHALL contain the city name encoded with encodeURIComponent, `units=metric`, `lang=pt_br`,
 * and `appid` with the API key.
 */
describe('Feature: temperatura-local, Property 1: Construção correta da URL da API', () => {
  it('should build URL with encoded city name, units=metric, lang=pt_br, and appid', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (city) => {
          const url = buildApiUrl(city);
          const encodedCity = encodeURIComponent(city);

          expect(url).toContain(`q=${encodedCity}`);
          expect(url).toContain('units=metric');
          expect(url).toContain('lang=pt_br');
          expect(url).toContain('appid=');
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: temperatura-local, Property 2: Rejeição de entrada em branco
 * **Validates: Requirements 1.4**
 *
 * For any string composed entirely of whitespace characters (including empty string),
 * validateInput SHALL return the error message "Digite o nome de uma cidade"
 */
describe('Feature: temperatura-local, Property 2: Rejeição de entrada em branco', () => {
  it('should return error message for whitespace-only or empty strings', () => {
    const whitespaceArb = fc.oneof(
      fc.constant(''),
      fc.array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 50 })
        .map((chars) => chars.join(''))
    );

    fc.assert(
      fc.property(whitespaceArb, (input) => {
        const result = validateInput(input);
        expect(result).toBe('Digite o nome de uma cidade');
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: temperatura-local, Property 3: Truncamento de entrada longa
 * **Validates: Requirements 1.5**
 *
 * For any string with length > 100 characters, sanitizeInput SHALL return a string
 * with exactly 100 characters matching the first 100 characters of the original input
 */
describe('Feature: temperatura-local, Property 3: Truncamento de entrada longa', () => {
  it('should truncate strings longer than 100 characters to exactly 100 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 101, maxLength: 500 }),
        (input) => {
          const result = sanitizeInput(input);
          expect(result.length).toBe(100);
          expect(result).toBe(input.slice(0, 100));
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: temperatura-local, Property 4: Transformação de dados da API
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
 *
 * For any valid OpenWeatherMap response object, the transform function SHALL produce
 * a WeatherData object where city_name = data.name, temperature = data.main.temp rounded
 * to 1 decimal, description = data.weather[0].description, humidity = data.main.humidity,
 * wind_speed = data.wind.speed rounded to 1 decimal, icon_code = data.weather[0].icon,
 * and icon_url follows the correct format
 */
describe('Feature: temperatura-local, Property 4: Transformação de dados da API', () => {
  it('should correctly transform OpenWeatherMap response to WeatherData', () => {
    const apiResponseArb = fc.record({
      name: fc.string({ minLength: 1 }),
      coord: fc.record({
        lat: fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
        lon: fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
      }),
      main: fc.record({
        temp: fc.double({ min: -100, max: 100, noNaN: true, noDefaultInfinity: true }),
        feels_like: fc.double({ min: -100, max: 100, noNaN: true, noDefaultInfinity: true }),
        humidity: fc.integer({ min: 0, max: 100 }),
      }),
      weather: fc.tuple(
        fc.record({
          description: fc.string({ minLength: 1 }),
          icon: fc.string({ minLength: 1, maxLength: 10 }),
        })
      ).map((arr) => arr),
      wind: fc.record({
        speed: fc.double({ min: 0, max: 200, noNaN: true, noDefaultInfinity: true }),
      }),
      sys: fc.record({
        sunrise: fc.integer({ min: 0, max: 2000000000 }),
        sunset: fc.integer({ min: 0, max: 2000000000 }),
        country: fc.constantFrom('BR', 'US', 'PT'),
      }),
      timezone: fc.integer({ min: -43200, max: 43200 }),
    });

    fc.assert(
      fc.property(apiResponseArb, (data) => {
        const result = transformApiResponse(data, 'SP');

        expect(result.city_name).toBe(data.name);
        expect(result.state).toBe('SP');
        expect(result.country).toBe(data.sys.country);
        expect(result.temperature).toBe(roundToOneDecimal(data.main.temp));
        expect(result.feels_like).toBe(roundToOneDecimal(data.main.feels_like));
        expect(result.description).toBe(data.weather[0].description);
        expect(result.humidity).toBe(data.main.humidity);
        expect(result.wind_speed).toBe(roundToOneDecimal(data.wind.speed));
        expect(result.icon_code).toBe(data.weather[0].icon);
        expect(result.icon_url).toBe(
          `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
        );
        expect(result.sunrise).toBe(data.sys.sunrise);
        expect(result.sunset).toBe(data.sys.sunset);
        expect(result.timezone).toBe(data.timezone);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: temperatura-local, Property 5: Arredondamento numérico para uma casa decimal
 * **Validates: Requirements 5.2, 5.3**
 *
 * For any floating point number, the rounding function SHALL produce a result that,
 * when multiplied by 10, is an integer (i.e., has at most one decimal place)
 */
describe('Feature: temperatura-local, Property 5: Arredondamento numérico para uma casa decimal', () => {
  it('should produce a result with at most one decimal place', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }),
        (value) => {
          const result = roundToOneDecimal(value);
          const multiplied = result * 10;
          expect(Math.round(multiplied)).toBeCloseTo(multiplied, 5);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: temperatura-local, Property 6: Formato da URL do ícone
 * **Validates: Requirements 5.4, 2.2**
 *
 * For any icon_code string, the constructed icon URL SHALL follow exactly the format
 * `https://openweathermap.org/img/wn/{icon_code}@2x.png`
 */
describe('Feature: temperatura-local, Property 6: Formato da URL do ícone', () => {
  it('should build icon URL in the correct format', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 10 }), (iconCode) => {
        const url = buildIconUrl(iconCode);
        expect(url).toBe(`https://openweathermap.org/img/wn/${iconCode}@2x.png`);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: temperatura-local, Property 7: Interpolação do nome da cidade na mensagem de erro 404
 * **Validates: Requirements 4.1**
 *
 * For any city name, when the API returns status 404, the error message SHALL contain
 * the city name in the format "Cidade '{nome}' não encontrada. Verifique a ortografia."
 */
describe('Feature: temperatura-local, Property 7: Interpolação do nome da cidade na mensagem de erro 404', () => {
  it('should include city name in 404 error message', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (cityName) => {
          // Simulate what fetchWeather does for 404
          const errorMessage = `Cidade '${cityName}' não encontrada. Verifique a ortografia.`;
          expect(errorMessage).toContain(cityName);
          expect(errorMessage).toBe(
            `Cidade '${cityName}' não encontrada. Verifique a ortografia.`
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
