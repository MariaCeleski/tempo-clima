import { useTranslation } from 'react-i18next';

const LANG_KEY = 'temperatura-local-lang';

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const currentLang = i18n.language?.startsWith('pt') ? 'pt-BR' : 'en';

  function changeLanguage(lang: string) {
    i18n.changeLanguage(lang);
    localStorage.setItem(LANG_KEY, lang);
  }

  return (
    <div className="fixed top-16 right-4 z-50 flex gap-1 rounded-full border border-slate-200 dark:border-white/20 bg-white/80 dark:bg-white/10 p-1 shadow-lg backdrop-blur-sm" role="group" aria-label="Language selector">
      <button
        onClick={() => changeLanguage('pt-BR')}
        aria-pressed={currentLang === 'pt-BR'}
        className={`rounded-full px-2 py-0.5 text-xs font-medium transition-all ${
          currentLang === 'pt-BR'
            ? 'bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white'
            : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80'
        }`}
      >
        PT
      </button>
      <button
        onClick={() => changeLanguage('en')}
        aria-pressed={currentLang === 'en'}
        className={`rounded-full px-2 py-0.5 text-xs font-medium transition-all ${
          currentLang === 'en'
            ? 'bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white'
            : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80'
        }`}
      >
        EN
      </button>
    </div>
  );
}
