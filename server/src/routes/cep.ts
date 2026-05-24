import { Router, Request, Response } from 'express';
import { validateCepParam } from '../middleware/validation.js';

const router = Router();

const VIACEP_BASE = 'https://viacep.com.br';
const FETCH_TIMEOUT_MS = 15000;

interface ViaCepResponse {
  erro?: boolean;
  [key: string]: unknown;
}

/**
 * GET /api/cep/:cep
 * Proxies CEP (Brazilian postal code) lookups to ViaCEP.
 * ViaCEP doesn't require an API key, so we use a direct fetch.
 */
router.get('/:cep', validateCepParam, async (req: Request, res: Response) => {
  const cep = req.params.cep;
  const url = `${VIACEP_BASE}/ws/${cep}/json/`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      if (response.status === 404) {
        res.status(404).json({ message: 'CEP not found' });
        return;
      }
      res.status(502).json({ message: 'External service error' });
      return;
    }

    const data = (await response.json()) as ViaCepResponse;

    // ViaCEP returns 200 with { erro: true } for invalid/not-found CEPs
    if (data.erro === true) {
      res.status(404).json({ message: 'CEP not found' });
      return;
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      res.status(504).json({ message: 'External service timeout' });
    } else {
      res.status(502).json({ message: 'External service unavailable' });
    }
  } finally {
    clearTimeout(timeoutId);
  }
});

export default router;
