const BACKEND_ERROR_TRANSLATIONS = {
  'Email already in use': "L'email è già in uso.",
  'Invalid credentials': 'Credenziali non valide.',
  'refreshToken required': 'Refresh token obbligatorio.',
  'Invalid refresh token': 'Refresh token non valido.',
  'Refresh token revoked or expired': 'Refresh token revocato o scaduto.',
  'User not found': 'Utente non trovato.',
  'Project not found': 'Progetto non trovato.',
  'project_id is required': 'project_id è obbligatorio.',
  'Both prospetto and location images are required': "Sono richieste sia l'immagine del prospetto sia quella della location.",
  'Files not uploaded yet': 'I file non sono ancora stati caricati.',
  'Compositing failed': 'Composizione non riuscita.',
  'Render not found': 'Render non trovato.',
  'Prospetto not uploaded yet': 'Il prospetto non è ancora stato caricato.',
  'Composite not ready. Run /composite first.': 'Il composito non è pronto. Esegui prima la composizione.',
  'Render already in progress': 'Il render è già in corso.',
  'Prepared overlay not found': 'Overlay preparato non trovato.',
  'Invalid prepared overlay path': "Percorso dell'overlay preparato non valido.",
  'Validation error': 'Errore di validazione.',
  'File too large': 'File troppo grande.',
  'Forbidden': 'Accesso negato.',
  'Missing or invalid Authorization header': 'Autorizzazione mancante o non valida.',
  'Invalid or expired token': 'Token non valido o scaduto.',
  'At least one admin user must remain': 'Deve rimanere almeno un utente admin.',
  'You cannot delete your own account': 'Non puoi eliminare il tuo account.',
  'Invalid default material for element "': 'Materiale di default non valido per un elemento del catalog.',
  'Invalid default application for element "': 'Applicazione di default non valida per un elemento del catalog.',
  'Internal server error': 'Errore interno del server.',
};

const RENDER_PARAM_LABELS = {
  'Modern Contemporary': 'Moderno contemporaneo',
  Minimalist: 'Minimalista',
  Brutalist: 'Brutalista',
  'Art Deco': 'Art déco',
  Industrial: 'Industriale',
  Scandinavian: 'Scandinavo',
  Mediterranean: 'Mediterraneo',
  Neoclassical: 'Neoclassico',
  'Concrete & Glass': 'Calcestruzzo e vetro',
  'Brick & Steel': 'Mattone e acciaio',
  'Wood & Stone': 'Legno e pietra',
  'Marble & Brass': 'Marmo e ottone',
  'Weathered Steel': 'Acciaio corten',
  'White Render': 'Intonaco bianco',
  'Exposed Concrete': 'Calcestruzzo a vista',
  'Timber Frame': 'Telaio in legno',
  'White Plaster': 'Intonaco bianco',
  'Brick Masonry': 'Muratura in mattoni',
  'Natural Wood Cladding': 'Rivestimento in legno naturale',
  'Painted Wood': 'Legno verniciato',
  'Stone Cladding': 'Rivestimento in pietra',
  'Marble Panels': 'Pannelli in marmo',
  'Corten Steel': 'Acciaio corten',
  'Painted Steel': 'Acciaio verniciato',
  'Black Metal': 'Metallo nero',
  Brass: 'Ottone',
  Glass: 'Vetro',
  Plaster: 'Intonaco',
  Concrete: 'Calcestruzzo',
  Brick: 'Mattone',
  Wood: 'Legno',
  Stone: 'Pietra',
  Marble: 'Marmo',
  Steel: 'Acciaio',
  'Custom Elements': 'Elementi personalizzati',
  'Golden Hour': "Ora d'oro",
  'Blue Hour': 'Ora blu',
  'Midday Sun': 'Sole di mezzogiorno',
  Overcast: 'Cielo coperto',
  'Night with Lighting': 'Notte con illuminazione',
  'Dramatic Sunset': 'Tramonto drammatico',
  'Soft Morning': 'Mattina morbida',
  Summer: 'Estate',
  Autumn: 'Autunno',
  Winter: 'Inverno',
  Spring: 'Primavera',
};

export function translateBackendMessage(message, fallback = 'Si è verificato un errore.') {
  if (!message || typeof message !== 'string') return fallback;
  const normalized = message.trim();
  if (BACKEND_ERROR_TRANSLATIONS[normalized]) return BACKEND_ERROR_TRANSLATIONS[normalized];

  const lowered = normalized.toLowerCase();
  if (lowered.includes('fal.ai') || lowered.includes('replicate')) {
    return 'Errore del servizio AI durante il rendering.';
  }
  if (normalized.startsWith('Invalid default material for element')) {
    return 'Materiale di default non valido per un elemento del catalog.';
  }
  if (normalized.startsWith('Invalid default application for element')) {
    return 'Applicazione di default non valida per un elemento del catalog.';
  }
  if (normalized.startsWith('Invalid element relation')) {
    return 'Relazione non valida tra elementi del catalog.';
  }
  if (normalized.startsWith('Invalid material relation')) {
    return 'Relazione non valida per un materiale del catalog.';
  }
  if (normalized.startsWith('Invalid application relation')) {
    return 'Relazione non valida per un\'applicazione del catalog.';
  }

  return fallback;
}

export function getApiErrorMessage(err, fallback = 'Si è verificato un errore.') {
  const message = err?.response?.data?.error;
  return translateBackendMessage(message, fallback);
}

export function getRenderParamLabel(value) {
  if (!value) return '';
  if (typeof value === 'string' && value.includes(',')) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => RENDER_PARAM_LABELS[item] || item)
      .join(', ');
  }
  return RENDER_PARAM_LABELS[value] || value;
}
