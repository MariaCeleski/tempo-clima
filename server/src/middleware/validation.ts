import { Request, Response, NextFunction } from 'express';

/**
 * Allowed query parameters per endpoint.
 */
const ALLOWED_PARAMS: Record<string, string[]> = {
  '/api/weather': ['q', 'lat', 'lon', 'units', 'lang'],
  '/api/forecast': ['q', 'lat', 'lon', 'units', 'lang'],
  '/api/air-quality': ['lat', 'lon'],
  '/api/geocode/reverse': ['lat', 'lon'],
};

const VALID_UNITS = ['metric', 'imperial', 'standard'];

/**
 * Regex matching control characters: U+0000-U+001F and U+007F-U+009F
 */
const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F-\u009F]/;

/**
 * Truncates a value for safe inclusion in error messages (max 50 chars).
 */
function truncateValue(value: string, maxLength = 50): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength) + '...';
}

/**
 * Validates the `q` (city name) query parameter.
 * Must be 1-100 characters after trim, no control characters.
 */
function validateQ(q: string): string | null {
  const trimmed = q.trim();
  if (trimmed.length < 1) {
    return 'Parameter "q" must be between 1 and 100 characters after trimming';
  }
  if (trimmed.length > 100) {
    return 'Parameter "q" must be between 1 and 100 characters after trimming';
  }
  if (CONTROL_CHAR_REGEX.test(trimmed)) {
    return 'Parameter "q" contains invalid control characters';
  }
  return null;
}

/**
 * Validates latitude value: numeric, -90 to 90.
 */
function validateLat(value: string): string | null {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) {
    return 'Parameter "lat" must be a valid number between -90 and 90';
  }
  if (num < -90 || num > 90) {
    return 'Parameter "lat" must be a valid number between -90 and 90';
  }
  return null;
}

/**
 * Validates longitude value: numeric, -180 to 180.
 */
function validateLon(value: string): string | null {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) {
    return 'Parameter "lon" must be a valid number between -180 and 180';
  }
  if (num < -180 || num > 180) {
    return 'Parameter "lon" must be a valid number between -180 and 180';
  }
  return null;
}

/**
 * Validates the `units` query parameter: must be one of metric, imperial, standard.
 */
function validateUnits(value: string): string | null {
  if (!VALID_UNITS.includes(value)) {
    return `Parameter "units" must be one of: ${VALID_UNITS.join(', ')}`;
  }
  return null;
}

/**
 * Validates a CEP path parameter: exactly 8 digits.
 */
function validateCep(value: string): string | null {
  if (!/^\d{8}$/.test(value)) {
    return 'Parameter "cep" must be exactly 8 digits';
  }
  return null;
}

/**
 * Checks for unknown query parameters not in the allowed set for the endpoint.
 */
function checkUnknownParams(query: Record<string, unknown>, allowedParams: string[]): string | null {
  const unknownParams = Object.keys(query).filter((key) => !allowedParams.includes(key));
  if (unknownParams.length > 0) {
    return `Unknown query parameter(s): ${unknownParams.map((p) => `"${truncateValue(p)}"`).join(', ')}`;
  }
  return null;
}

/**
 * Creates a validation middleware for weather and forecast endpoints.
 * Accepts q, lat, lon, units, lang parameters.
 */
export function validateWeatherParams(req: Request, res: Response, next: NextFunction): void {
  const endpoint = req.path;
  const allowedParams = ALLOWED_PARAMS[endpoint];

  if (allowedParams) {
    const unknownError = checkUnknownParams(req.query as Record<string, unknown>, allowedParams);
    if (unknownError) {
      res.status(400).json({ message: unknownError });
      return;
    }
  }

  const { q, lat, lon, units } = req.query;

  // Validate q parameter if present
  if (q !== undefined) {
    const qError = validateQ(String(q));
    if (qError) {
      res.status(400).json({ message: qError });
      return;
    }
  }

  // Validate lat if present
  if (lat !== undefined) {
    const latError = validateLat(String(lat));
    if (latError) {
      res.status(400).json({ message: latError });
      return;
    }
  }

  // Validate lon if present
  if (lon !== undefined) {
    const lonError = validateLon(String(lon));
    if (lonError) {
      res.status(400).json({ message: lonError });
      return;
    }
  }

  // Validate units if present
  if (units !== undefined) {
    const unitsError = validateUnits(String(units));
    if (unitsError) {
      res.status(400).json({ message: unitsError });
      return;
    }
  }

  next();
}

/**
 * Creates a validation middleware for air quality and geocode/reverse endpoints.
 * Requires lat and lon parameters.
 */
export function validateCoordinateParams(req: Request, res: Response, next: NextFunction): void {
  const endpoint = req.path;
  const allowedParams = ALLOWED_PARAMS[endpoint];

  if (allowedParams) {
    const unknownError = checkUnknownParams(req.query as Record<string, unknown>, allowedParams);
    if (unknownError) {
      res.status(400).json({ message: unknownError });
      return;
    }
  }

  const { lat, lon } = req.query;

  // lat and lon are required for these endpoints
  if (lat === undefined) {
    res.status(400).json({ message: 'Parameter "lat" is required' });
    return;
  }

  if (lon === undefined) {
    res.status(400).json({ message: 'Parameter "lon" is required' });
    return;
  }

  const latError = validateLat(String(lat));
  if (latError) {
    res.status(400).json({ message: latError });
    return;
  }

  const lonError = validateLon(String(lon));
  if (lonError) {
    res.status(400).json({ message: lonError });
    return;
  }

  next();
}

/**
 * Validation middleware for the CEP endpoint.
 * Validates the :cep path parameter is exactly 8 digits.
 */
export function validateCepParam(req: Request, res: Response, next: NextFunction): void {
  const cep = String(req.params.cep);

  const cepError = validateCep(cep);
  if (cepError) {
    res.status(400).json({ message: cepError });
    return;
  }

  next();
}

// Export individual validators for testing
export {
  validateQ,
  validateLat,
  validateLon,
  validateUnits,
  validateCep,
  checkUnknownParams,
  ALLOWED_PARAMS,
};
