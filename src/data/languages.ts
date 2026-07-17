import type { Language } from '../types';

/**
 * Supported languages for KickMate translation features.
 * Ordered by FIFA World Cup 2026 attendee demographics.
 */
export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English',    nativeName: 'English',    flag: '🇬🇧' },
  { code: 'es', name: 'Spanish',    nativeName: 'Español',    flag: '🇪🇸' },
  { code: 'fr', name: 'French',     nativeName: 'Français',   flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português',  flag: '🇧🇷' },
  { code: 'de', name: 'German',     nativeName: 'Deutsch',    flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic',     nativeName: 'العربية',    flag: '🇸🇦', rtl: true },
  { code: 'zh', name: 'Chinese',    nativeName: '中文',        flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese',   nativeName: '日本語',      flag: '🇯🇵' },
  { code: 'ko', name: 'Korean',     nativeName: '한국어',      flag: '🇰🇷' },
  { code: 'hi', name: 'Hindi',      nativeName: 'हिन्दी',     flag: '🇮🇳' },
  { code: 'ru', name: 'Russian',    nativeName: 'Русский',    flag: '🇷🇺' },
  { code: 'nl', name: 'Dutch',      nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian',    nativeName: 'Italiano',   flag: '🇮🇹' },
  { code: 'tr', name: 'Turkish',    nativeName: 'Türkçe',     flag: '🇹🇷' },
  { code: 'pl', name: 'Polish',     nativeName: 'Polski',     flag: '🇵🇱' },
];

/** Detect preferred language from browser locale */
export function detectBrowserLanguage(): string {
  const locale = navigator.language?.slice(0, 2).toLowerCase() ?? 'en';
  const found = LANGUAGES.find((l) => l.code === locale);
  return found ? locale : 'en';
}

/** Get Language object by code, defaults to English */
export function getLanguageByCode(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

/** Common football phrases pre-translated for offline use */
export const OFFLINE_PHRASES: Record<string, Record<string, string>> = {
  en: {
    where_seat: 'Where is my seat?',
    where_toilet: 'Where is the nearest toilet?',
    where_food: 'Where can I get food?',
    help: 'I need help',
    medical: 'I need medical assistance',
    water: 'Where can I get water?',
    exit: 'Where is the exit?',
  },
  es: {
    where_seat: '¿Dónde está mi asiento?',
    where_toilet: '¿Dónde está el baño más cercano?',
    where_food: '¿Dónde puedo conseguir comida?',
    help: 'Necesito ayuda',
    medical: 'Necesito asistencia médica',
    water: '¿Dónde puedo conseguir agua?',
    exit: '¿Dónde está la salida?',
  },
  fr: {
    where_seat: 'Où est mon siège?',
    where_toilet: 'Où sont les toilettes les plus proches?',
    where_food: 'Où puis-je trouver de la nourriture?',
    help: "J'ai besoin d'aide",
    medical: "J'ai besoin d'assistance médicale",
    water: "Où puis-je trouver de l'eau?",
    exit: 'Où est la sortie?',
  },
  pt: {
    where_seat: 'Onde fica o meu assento?',
    where_toilet: 'Onde fica o banheiro mais próximo?',
    where_food: 'Onde posso encontrar comida?',
    help: 'Preciso de ajuda',
    medical: 'Preciso de assistência médica',
    water: 'Onde posso conseguir água?',
    exit: 'Onde fica a saída?',
  },
  ar: {
    where_seat: 'أين مقعدي؟',
    where_toilet: 'أين أقرب دورة مياه؟',
    where_food: 'أين يمكنني الحصول على طعام؟',
    help: 'أحتاج مساعدة',
    medical: 'أحتاج مساعدة طبية',
    water: 'أين يمكنني الحصول على ماء؟',
    exit: 'أين المخرج؟',
  },
};
