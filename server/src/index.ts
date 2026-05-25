import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import { createCorsMiddleware } from './middleware/cors.js';
import { createRateLimiter } from './middleware/rateLimiter.js';
import healthRouter from './routes/health.js';
import weatherRouter from './routes/weather.js';
import forecastRouter from './routes/forecast.js';
import airQualityRouter from './routes/airQuality.js';
import geocodeRouter from './routes/geocode.js';
import cepRouter from './routes/cep.js';

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
const apiKey = process.env.OPENWEATHERMAP_API_KEY;

if (!apiKey || apiKey.trim().length === 0) {
  console.error(
    'Error: OPENWEATHERMAP_API_KEY environment variable is not set or contains only whitespace. Server cannot start.'
  );
  process.exit(1);
}

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

// Middleware pipeline (order matters)
// 1. Request logging
app.use(morgan('dev'));

// 2. CORS
app.use(createCorsMiddleware());

// 3. Rate limiting
app.use(createRateLimiter());

// 4. JSON body parser
app.use(express.json());

// 5. Swagger UI documentation
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openapiPath = path.resolve(__dirname, '../openapi.yaml');
try {
  const openapiFile = readFileSync(openapiPath, 'utf-8');
  const openapiDoc = YAML.parse(openapiFile);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));
} catch {
  console.warn('Warning: openapi.yaml not found. Swagger UI disabled.');
}

// 6. Route handlers
app.use('/api/health', healthRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/forecast', forecastRouter);
app.use('/api/air-quality', airQualityRouter);
app.use('/api/geocode', geocodeRouter);
app.use('/api/cep', cepRouter);

// 7. Static file serving (optional deployment mode)
if (process.env.SERVE_STATIC === 'true') {
  const staticPath = path.resolve(__dirname, '../../temperatura-local-react/dist');
  app.use(express.static(staticPath));

  // Serve index.html for any non-API routes (SPA fallback)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Start HTTP server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
