import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import es from '@/lenguages/es.json';
import en from '@/lenguages/en.json';

type Language = 'es' | 'en';
type Translations = typeof es;

interface LanguageState {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const dictionaries: Record<Language, Translations> = { es, en };

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'es', // Idioma por defecto
      translations: es,
      setLanguage: (lang: Language) => {
        set({ language: lang, translations: dictionaries[lang] });
      },
      
      t: (path: string) => {
        const keys = path.split('.');
        let current: any = get().translations;
        for (const key of keys) {
          if (current[key] === undefined) {
            return path; 
          }
          current = current[key];
        }
        return typeof current === 'string' ? current : path;
      },
    }),
    {
      name: 'cardy-language-storage', 
    }
  )
);