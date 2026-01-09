// Maps technical database errors to user-friendly messages
// Logs full errors to console for debugging while showing safe messages to users

interface PostgresError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

const ERROR_CODE_MESSAGES: Record<string, string> = {
  // Unique constraint violations
  '23505': 'Este registro já existe no sistema.',
  // Foreign key violations
  '23503': 'Operação bloqueada: este registro possui dependências.',
  // Not null violations
  '23502': 'Campo obrigatório não preenchido.',
  // Check constraint violations
  '23514': 'Valor inválido para o campo.',
  // RLS policy violations
  '42501': 'Você não tem permissão para esta operação.',
  // Authentication errors
  'PGRST301': 'Sessão expirada. Faça login novamente.',
  // Invalid credentials
  'invalid_credentials': 'Email ou senha incorretos.',
  // Email already registered
  'user_already_exists': 'Este email já está cadastrado.',
  // Invalid email
  'invalid_email': 'Email inválido.',
  // Weak password
  'weak_password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
};

const ERROR_MESSAGE_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /duplicate key/i, message: 'Este registro já existe no sistema.' },
  { pattern: /foreign key/i, message: 'Operação bloqueada: este registro possui dependências.' },
  { pattern: /not null/i, message: 'Campo obrigatório não preenchido.' },
  { pattern: /row-level security/i, message: 'Você não tem permissão para esta operação.' },
  { pattern: /JWT/i, message: 'Sessão expirada. Faça login novamente.' },
  { pattern: /network/i, message: 'Erro de conexão. Verifique sua internet.' },
  { pattern: /timeout/i, message: 'Operação demorou muito. Tente novamente.' },
];

/**
 * Converts technical error messages to user-friendly Portuguese messages.
 * Logs the full error to console for debugging purposes.
 * 
 * @param error - The error object from Supabase or other sources
 * @param context - Optional context for logging (e.g., "loading clients")
 * @returns A safe, user-friendly error message
 */
export function getUserFriendlyError(error: unknown, context?: string): string {
  // Log full error for debugging (only visible in dev tools)
  if (context) {
    console.error(`Error in ${context}:`, error);
  } else {
    console.error('Error:', error);
  }

  // Handle null/undefined
  if (!error) {
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  const err = error as PostgresError & { code?: string; message?: string };

  // Check for known error codes first
  if (err.code && ERROR_CODE_MESSAGES[err.code]) {
    return ERROR_CODE_MESSAGES[err.code];
  }

  // Check for known message patterns
  const message = err.message || String(error);
  for (const { pattern, message: friendlyMessage } of ERROR_MESSAGE_PATTERNS) {
    if (pattern.test(message)) {
      return friendlyMessage;
    }
  }

  // Default safe message
  return 'Ocorreu um erro. Tente novamente.';
}
