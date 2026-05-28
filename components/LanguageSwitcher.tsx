'use client';

import { useLanguage, type Lang } from './LanguageProvider';

const languages: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' }
];

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="lang-switch" aria-label="Dil seçimi">
      {languages.map(item => (
        <button key={item.code} type="button" className={lang === item.code ? 'active' : ''} onClick={() => setLang(item.code)}>
          {item.label}
        </button>
      ))}
    </div>
  );
}
