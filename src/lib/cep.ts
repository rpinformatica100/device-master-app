import { z } from 'zod';

// Schema for validating ViaCEP API response
const CepResponseSchema = z.object({
  cep: z.string().regex(/^\d{5}-?\d{3}$/).transform(s => s.replace('-', '')),
  logradouro: z.string().max(200).default(''),
  complemento: z.string().max(200).default(''),
  bairro: z.string().max(100).default(''),
  localidade: z.string().max(100),
  uf: z.string().length(2),
  erro: z.boolean().optional(),
});

export interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

/**
 * Fetches address data from ViaCEP API with proper validation.
 * - Validates CEP format before making the request
 * - Validates response data against a schema
 * - Includes timeout to prevent hanging requests
 * - Sanitizes all string fields
 */
export async function fetchAddressByCep(cep: string): Promise<CepResponse | null> {
  // Sanitize input: remove non-digits
  const cleanCep = cep.replace(/\D/g, '');
  
  // Validate CEP format
  if (cleanCep.length !== 8 || !/^\d{8}$/.test(cleanCep)) {
    return null;
  }
  
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('CEP API returned non-OK status:', response.status);
      return null;
    }
    
    const rawData = await response.json();
    
    // Check for API error response
    if (rawData.erro === true) {
      return null;
    }
    
    // Validate and parse response using zod schema
    const parseResult = CepResponseSchema.safeParse(rawData);
    
    if (!parseResult.success) {
      console.error('CEP API response validation failed:', parseResult.error);
      return null;
    }
    
    const data = parseResult.data;
    
    // Sanitize string fields to remove any potentially dangerous characters
    const sanitizedResponse: CepResponse = {
      cep: data.cep.replace(/[^\d-]/g, ''),
      logradouro: sanitizeString(data.logradouro),
      complemento: sanitizeString(data.complemento),
      bairro: sanitizeString(data.bairro),
      localidade: sanitizeString(data.localidade),
      uf: data.uf.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2),
    };
    
    return sanitizedResponse;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('CEP API request timed out');
    } else {
      console.error('Erro ao buscar CEP:', error);
    }
    return null;
  }
}

/**
 * Sanitizes a string by removing control characters and limiting length.
 * React's JSX escapes values automatically, but this adds an extra layer of protection.
 */
function sanitizeString(str: string): string {
  return str
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Remove HTML tags (extra safety)
    .replace(/<[^>]*>/g, '')
    // Trim whitespace
    .trim()
    // Limit length
    .slice(0, 200);
}
