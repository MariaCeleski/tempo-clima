import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';

describe('App Integration Tests', () => {
  const mockWeatherResponse = {
    name: 'São Paulo',
    coord: { lat: -23.55, lon: -46.63 },
    main: { temp: 22.35, feels_like: 23.1, humidity: 65 },
    weather: [{ description: 'nublado', icon: '04d' }],
    wind: { speed: 3.27 },
    sys: { sunrise: 1700000000, sunset: 1700040000, country: 'BR' },
    timezone: -10800,
  };

  const mockForecastResponse = {
    list: [
      {
        dt: 1700100000,
        main: { temp: 24.5, temp_min: 22.0, temp_max: 26.0, feels_like: 25.0, humidity: 60 },
        weather: [{ description: 'céu limpo', icon: '01d' }],
        wind: { speed: 2.5 },
      },
      {
        dt: 1700186400,
        main: { temp: 22.0, temp_min: 20.0, temp_max: 24.0, feels_like: 22.5, humidity: 70 },
        weather: [{ description: 'nublado', icon: '04d' }],
        wind: { speed: 3.0 },
      },
    ],
  };

  beforeEach(() => {
    vi.stubEnv('VITE_API_KEY', 'test-api-key');
    // Mock geolocation to not auto-trigger
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition: vi.fn((_s, fail) => fail && fail()) },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('should show weather data after successful search', async () => {
    const user = userEvent.setup();

    const mockGeoResponse = [{ name: 'São Paulo', state: 'São Paulo', country: 'BR' }];

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;

      if (url.includes('/data/2.5/weather')) {
        return { ok: true, status: 200, json: async () => mockWeatherResponse } as Response;
      }
      if (url.includes('/geo/1.0/reverse')) {
        return { ok: true, status: 200, json: async () => mockGeoResponse } as Response;
      }
      if (url.includes('/data/2.5/forecast')) {
        return { ok: true, status: 200, json: async () => mockForecastResponse } as Response;
      }
      return { ok: false, status: 404 } as Response;
    });

    render(<App />);

    const input = screen.getByLabelText('Nome da cidade');
    const button = screen.getByRole('button', { name: 'Buscar clima por cidade' });

    await user.type(input, 'São Paulo');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getAllByText('São Paulo').length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getByText('22.4°C')).toBeInTheDocument();
    expect(screen.getAllByText('nublado').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/65%/)).toBeInTheDocument();
    expect(screen.getByText(/3.3 m\/s/)).toBeInTheDocument();
  });

  it('should show error message when city is not found (404)', async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'city not found' }),
    } as Response);

    render(<App />);

    const input = screen.getByLabelText('Nome da cidade');
    const button = screen.getByRole('button', { name: 'Buscar clima por cidade' });

    await user.type(input, 'CidadeInexistente');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText("Cidade 'CidadeInexistente' não encontrada. Verifique a ortografia.")).toBeInTheDocument();
  });

  it('should show unavailable message on 5xx error', async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    render(<App />);

    const input = screen.getByLabelText('Nome da cidade');
    const button = screen.getByRole('button', { name: 'Buscar clima por cidade' });

    await user.type(input, 'Londres');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText('Dados climáticos temporariamente indisponíveis. Tente mais tarde.')).toBeInTheDocument();
  });

  it('should show validation error for empty input without calling fetch', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    render(<App />);

    const button = screen.getByRole('button', { name: 'Buscar clima por cidade' });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText('Digite o nome de uma cidade')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should show timeout message when request is aborted', async () => {
    const user = userEvent.setup();

    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(abortError);

    render(<App />);

    const input = screen.getByLabelText('Nome da cidade');
    const button = screen.getByRole('button', { name: 'Buscar clima por cidade' });

    await user.type(input, 'Tokyo');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText('A requisição expirou. Tente novamente.')).toBeInTheDocument();
  });
});
