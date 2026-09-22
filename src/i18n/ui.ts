export const languages = {
  en: 'English',
  id: 'Indonesia',
};

export const defaultLang = 'en';

export const ui = {
  en: {
    'nav.hero': 'Start',
    'nav.about': 'About',
    'nav.skills': 'Skills',
    'nav.projects': 'Projects',
    'nav.experience': 'Experience',
    'nav.certificates': 'Badges',
    'nav.contact': 'Contact',
    'hero.pressStart': 'PRESS START',
    'hero.role': 'Frontend Developer | Hardware Tech | Data Entry | Video Editor',
    'hero.downloadCv': 'Download CV',
    // ... more translations
  },
  id: {
    'nav.hero': 'Mulai',
    'nav.about': 'Tentang',
    'nav.skills': 'Keahlian',
    'nav.projects': 'Proyek',
    'nav.experience': 'Pengalaman',
    'nav.certificates': 'Lencana',
    'nav.contact': 'Kontak',
    'hero.pressStart': 'TEKAN MULAI',
    'hero.role': 'Frontend Developer | Teknisi Hardware | Data Entry | Editor Video',
    'hero.downloadCv': 'Unduh CV',
    // ... more translations
  },
} as const;

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}
