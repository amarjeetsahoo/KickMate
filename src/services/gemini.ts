import type { GeminiRequest, GeminiResponse } from '../types';
import { OFFLINE_PHRASES } from '../data/languages';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemma-4-31b-it';
const CHAT_MODEL = 'gemma-4-31b-it'; // Free open-weight model via AI Studio
const TRANSLATE_MODEL = 'gemini-3.5-flash';

/** Simple rate limiter: max 10 requests per minute per session */
const requestTimestamps: number[] = [];
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(): boolean {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;
  const recent = requestTimestamps.filter((t) => t > windowStart);
  requestTimestamps.length = 0;
  requestTimestamps.push(...recent);
  if (recent.length >= RATE_LIMIT) return false;
  requestTimestamps.push(now);
  return true;
}

/** Response cache: key = prompt hash, value = { text, expiresAt } */
const responseCache = new Map<string, { text: string; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60_000; // 5 minutes

function cacheKey(req: GeminiRequest): string {
  return `${req.prompt}|${req.systemPrompt ?? ''}`.slice(0, 200);
}

/**
 * Call Gemini API with rate limiting and response caching.
 * Falls back to a helpful error message when the API is unavailable.
 */
export async function callGemini(req: GeminiRequest): Promise<GeminiResponse> {
  // Validate API key
  if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
    return { text: getDemoFallback(req.prompt), error: 'no_api_key' };
  }

  // Check cache
  const key = cacheKey(req);
  const cached = responseCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return { text: cached.text };
  }

  // Rate limit check
  if (!checkRateLimit()) {
    return { text: 'AI assistant is busy. Please try again in a moment. 🔄', error: 'rate_limited' };
  }

  try {
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    if (req.systemPrompt) {
      parts.push({ text: req.systemPrompt });
    }
    parts.push({ text: req.prompt });

    if (req.imageBase64) {
      parts.push({
        inlineData: { mimeType: 'image/jpeg', data: req.imageBase64 },
      });
    }

    const targetModel = req.model || DEFAULT_MODEL;

    const response = await fetch(
      `${API_BASE}/${targetModel}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] }),
        signal: AbortSignal.timeout(15_000),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const rawParts: Array<{ text?: string; thought?: boolean }> = data?.candidates?.[0]?.content?.parts ?? [];
    const textParts = rawParts.filter((p) => !p.thought).map((p) => p.text ?? '');
    const text = textParts.join('\n').trim() || rawParts[0]?.text || 'No response received.';

    // Cache the result
    responseCache.set(key, { text, expiresAt: Date.now() + CACHE_TTL_MS });

    return { text };
  } catch (err) {
    console.error('[Gemini] Request failed:', err);
    return {
      text: getDemoFallback(req.prompt),
      error: err instanceof Error ? err.message : 'unknown_error',
    };
  }
}

/**
 * Translate text using Gemini.
 * Returns only the translated text, no explanations.
 */
export async function translateText(
  text: string,
  fromLang: string,
  toLang: string
): Promise<string> {
  const { text: result } = await callGemini({
    prompt: `Translate the following text from ${fromLang} to ${toLang}. Return ONLY the translation, no explanations or additional text:\n\n"${text}"`,
    systemPrompt: 'You are a professional translator. Return only the translated text without any preamble.',
    model: TRANSLATE_MODEL,
  });
  return result;
}

/**
 * Extract and translate text from an image using Gemini Vision.
 */
export async function translateImageText(
  imageBase64: string,
  targetLang: string
): Promise<{ extracted: string; translated: string }> {
  const { text } = await callGemini({
    prompt: `Look at this image. Find any text in it. Return a JSON object with two fields:\n- "extracted": the exact text you found in the image\n- "translated": that text translated to ${targetLang}\n\nIf no text is found, return {"extracted": "", "translated": "No text detected in image."}`,
    imageBase64,
    systemPrompt: 'You are an OCR and translation assistant. Return only valid JSON.',
    model: TRANSLATE_MODEL,
  });

  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { extracted: text, translated: text };
  }
}

/**
 * Get AI stadium assistant response for fan queries.
 */
export async function askStadiumAssistant(
  question: string,
  stadium: string,
  language: string
): Promise<string> {
  const { text } = await callGemini({
    prompt: question,
    model: CHAT_MODEL,
    systemPrompt: `You are KickMate, a helpful AI fan companion for FIFA World Cup 2026 at ${stadium}. 
Answer in ${language}. Keep responses concise (2-3 sentences max). 
Focus on: navigation, food, amenities, transport, match info, safety.
If asked about directions, give clear step-by-step guidance.
Always be friendly and enthusiastic about football! ⚽`,
  });
  return text;
}

/** Fallback responses for demo mode (no API key) */
function getDemoFallback(prompt: string): string {
  const lower = prompt.toLowerCase();

  // Check if it is a translation request
  if (lower.includes('translate') && lower.includes('from') && lower.includes('to')) {
    // Try to extract the text inside double quotes at the end of the prompt
    const textMatch = prompt.match(/"([^"]+)"$/);
    const sourceText = textMatch ? textMatch[1] : '';

    // Resolve target language code
    let targetLangCode = 'en';
    if (lower.includes('to spanish')) targetLangCode = 'es';
    else if (lower.includes('to french')) targetLangCode = 'fr';
    else if (lower.includes('to portuguese')) targetLangCode = 'pt';
    else if (lower.includes('to arabic')) targetLangCode = 'ar';

    if (sourceText) {
      // Find which offline phrase this belongs to
      let foundKey: string | null = null;
      const dicts = ['en', 'es', 'fr', 'pt', 'ar'] as const;
      for (const code of dicts) {
        const phrases = OFFLINE_PHRASES[code];
        if (phrases) {
          const entry = Object.entries(phrases).find(
            ([_, val]) => val.toLowerCase() === sourceText.toLowerCase()
          );
          if (entry) {
            foundKey = entry[0];
            break;
          }
        }
      }

      // If we found the phrase key, return the pre-translated offline value
      if (foundKey) {
        const targetPhrases = OFFLINE_PHRASES[targetLangCode] || OFFLINE_PHRASES.en;
        return targetPhrases[foundKey] || sourceText;
      }

      // Fallback for default helper welcomes
      const cleanSource = sourceText.trim().toLowerCase();
      if (cleanSource.includes('welcome to kickmate')) {
        if (targetLangCode === 'es') return '⚽ ¡Bienvenido a KickMate! Puedo ayudarte a navegar, encontrar servicios, traducir y más. ¿Qué necesitas?';
        if (targetLangCode === 'fr') return '⚽ Bienvenue sur KickMate ! Je peux vous aider à naviguer, trouver des commodités, traduire et plus encore. De quoi avez-vous besoin ?';
        if (targetLangCode === 'pt') return '⚽ Bem-vindo ao KickMate! Posso ajudar você a navegar, encontrar comodidades, traduzir e muito mais. O que você precisa?';
        if (targetLangCode === 'ar') return '⚽ مرحبًا بك في KickMate! يمكنني مساعدتك في التنقل والعثور على المرافق والترجمة والمزيد. ماذا تحتاج؟';
      }

      if (cleanSource.includes('medical clinic') || cleanSource.includes('medical assistance')) {
        if (targetLangCode === 'es') return '🩺 Las salas médicas están ubicadas cerca de la Sección 110 y la Sección 320. ¡Para emergencias, presione el botón rojo SOS para asistencia inmediata!';
        if (targetLangCode === 'fr') return "🩺 Les salles médicales sont situées près de la section 110 et de la section 320. Pour les urgences, appuyez sur le bouton rouge SOS pour une assistance immédiate !";
      }

      return sourceText;
    }
  }

  if (lower.includes('look at this image') || lower.includes('json object') || lower.includes('extracted')) {
    return '{"extracted": "Gate A, Section 114, Row C, Seat 22", "translated": "Gate A, Section 114, Row C, Seat 22"}';
  }
  if (lower.includes('seat') || lower.includes('navigate')) {
    return '🧭 To reach your seat: Enter through the nearest gate, follow the level signs, and look for your section number on the overhead displays. Use the Navigator tab for a visual guide!';
  }
  if (lower.includes('toilet') || lower.includes('restroom') || lower.includes('bathroom')) {
    return '🚻 Restrooms are located every 100m around each concourse level. Look for the blue signage or tap the Toilet button in the Navigator!';
  }
  if (lower.includes('food') || lower.includes('eat')) {
    return '🍔 Food courts are at every gate entrance on Level 1 and Level 2. Expect burgers, hot dogs, nachos, and local favorites!';
  }
  if (lower.includes('medical') || lower.includes('help')) {
    return '🩺 Medical rooms are located near Section 110 and Section 320. For emergencies, press the red SOS button for immediate assistance!';
  }
  if (lower.includes('park')) {
    return '🅿️ Check the Parking tab for real-time zone availability. Lot A North currently has the shortest walk to Gate A!';
  }
  return '⚽ Welcome to KickMate! I can help you navigate, find amenities, translate, and more. What do you need?';
}
