import { Router, Request, Response } from 'express';
import { validateWeatherParams } from '../middleware/validation.js';
import { proxyRequest, ProxyError } from '../services/proxyService.js';

const router = Router();

const OPENWEATHERMAP_BASE = 'https://api.openweathermap.org';

/**
 * GET /api/forecast
 * Proxies 5-day forecast requests to OpenWeatherMap.
 * Supports lookup by city name (q) or coordinates (lat/lon).
 * When both q and lat/lon are provided, q takes priority.
 */
router.get('/', validateWeatherParams, async (req: Request, res: Response) => {
  const { q, lat, lon, units, lang } = req.query;

  const params: Record<string, string> = {};

  // q takes priority over lat/lon
  if (q !== undefined) {
    params.q = String(q).trim();
  } else if (lat !== undefined && lon !== undefined) {
    params.lat = String(lat);
    params.lon = String(lon);
  }

  if (units !== undefined) {
    params.units = String(units);
  }

  if (lang !== undefined) {
    params.lang = String(lang);
  }

  try {
    const result = await proxyRequest({
      baseUrl: OPENWEATHERMAP_BASE,
      path: '/data/2.5/forecast',
      params,
    });

    res.status(result.status).json(result.data);
  } catch (error: unknown) {
    if (error instanceof ProxyError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

export default router;
