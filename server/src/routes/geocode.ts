import { Router, Request, Response } from 'express';
import { validateCoordinateParams } from '../middleware/validation.js';
import { proxyRequest, ProxyError } from '../services/proxyService.js';

const router = Router();

const OPENWEATHERMAP_BASE = 'https://api.openweathermap.org';

/**
 * GET /api/geocode/reverse
 * Proxies reverse geocoding requests to OpenWeatherMap.
 * Requires lat and lon parameters. Appends limit=1.
 */
router.get('/reverse', validateCoordinateParams, async (req: Request, res: Response) => {
  const { lat, lon } = req.query;

  const params: Record<string, string> = {
    lat: String(lat),
    lon: String(lon),
    limit: '1',
  };

  try {
    const result = await proxyRequest({
      baseUrl: OPENWEATHERMAP_BASE,
      path: '/geo/1.0/reverse',
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
