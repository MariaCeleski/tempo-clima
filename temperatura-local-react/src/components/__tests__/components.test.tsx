import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';
import { SearchForm } from '../SearchForm';
import { WeatherCard } from '../WeatherCard';
import type { WeatherData } from '../../types/weather';

describe('LoadingSpinner', () => {
  it('renders correctly with spinner animation', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('has role="status" for accessibility', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('ErrorMessage', () => {
  it('displays the error message', () => {
    render(<ErrorMessage message="Cidade não encontrada" />);
    expect(screen.getByText('Cidade não encontrada')).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    render(<ErrorMessage message="Erro" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('SearchForm', () => {
  const defaultProps = {
    onSearch: vi.fn(),
    onSearchByCep: vi.fn(),
    onGeolocate: vi.fn(),
    isLoading: false,
  };

  it('triggers search on Enter key press', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchForm {...defaultProps} onSearch={onSearch} />);

    const input = screen.getByLabelText('Nome da cidade');
    await user.type(input, 'São Paulo');
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledWith('São Paulo');
  });

  it('triggers search on button click', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchForm {...defaultProps} onSearch={onSearch} />);

    const input = screen.getByLabelText('Nome da cidade');
    await user.type(input, 'Rio de Janeiro');
    await user.click(screen.getByRole('button', { name: 'Buscar clima por cidade' }));

    expect(onSearch).toHaveBeenCalledWith('Rio de Janeiro');
  });

  it('disables button when isLoading is true', () => {
    render(<SearchForm {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('button', { name: 'Buscar clima por cidade' })).toBeDisabled();
  });

  it('has a label associated with the input via htmlFor', () => {
    render(<SearchForm {...defaultProps} />);
    const input = screen.getByLabelText('Nome da cidade');
    expect(input).toBeInTheDocument();
    expect(input.id).toBe('city-input');
  });

  it('shows CEP input when CEP mode is selected', async () => {
    const user = userEvent.setup();
    render(<SearchForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'CEP' }));
    expect(screen.getByLabelText('CEP')).toBeInTheDocument();
  });

  it('triggers onSearchByCep in CEP mode', async () => {
    const user = userEvent.setup();
    const onSearchByCep = vi.fn();
    render(<SearchForm {...defaultProps} onSearchByCep={onSearchByCep} />);

    await user.click(screen.getByRole('button', { name: 'CEP' }));
    const input = screen.getByLabelText('CEP');
    await user.type(input, '01001000');
    await user.click(screen.getByRole('button', { name: 'Buscar clima por CEP' }));

    expect(onSearchByCep).toHaveBeenCalledWith('01001000');
  });

  it('has a geolocation button', () => {
    render(<SearchForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: /usar minha localização/i })).toBeInTheDocument();
  });
});

describe('WeatherCard', () => {
  const mockData: WeatherData = {
    city_name: 'São Paulo',
    state: 'SP',
    country: 'BR',
    lat: -23.55,
    lon: -46.63,
    temperature: 25.3,
    feels_like: 26.1,
    description: 'nublado',
    humidity: 72,
    wind_speed: 3.5,
    icon_code: '04d',
    icon_url: 'https://openweathermap.org/img/wn/04d@2x.png',
    sunrise: 1700000000,
    sunset: 1700040000,
    timezone: -10800,
  };

  it('applies fadeInUp animation class', () => {
    const { container } = render(<WeatherCard data={mockData} />);
    const card = container.firstElementChild;
    expect(card).toHaveClass('animate-fadeInUp');
  });

  it('applies float animation to the icon', () => {
    render(<WeatherCard data={mockData} />);
    const icon = screen.getByAltText('Condição climática: nublado');
    expect(icon).toHaveClass('animate-float');
  });

  it('renders icon with correct alt text from description', () => {
    render(<WeatherCard data={mockData} />);
    const icon = screen.getByAltText('Condição climática: nublado');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', mockData.icon_url);
  });

  it('applies glassmorphism styles', () => {
    const { container } = render(<WeatherCard data={mockData} />);
    const card = container.firstElementChild;
    expect(card).toHaveClass('backdrop-blur-md');
    expect(card).toHaveClass('dark:bg-white/10');
    expect(card).toHaveClass('dark:border-white/25');
  });

  it('displays feels_like temperature', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByText(/Sensação: 26.1°C/)).toBeInTheDocument();
  });

  it('displays clothing suggestion', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByText(/Roupa leve/)).toBeInTheDocument();
  });
});
