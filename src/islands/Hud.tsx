import React from 'react';
import { useStore } from '@nanostores/react';
import { activeScene, setScene, SceneId } from '../stores/gameState';

const scenes: { id: SceneId; label: string }[] = [
  { id: 'hero', label: 'Start' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' }
];

export const Hud: React.FC = () => {
  const current = useStore(activeScene);
  const isId = typeof window !== 'undefined' && window.location.pathname.startsWith('/id');

  const toggleLang = () => {
    if (isId) {
      window.location.href = window.location.pathname.replace('/id', '') || '/';
    } else {
      window.location.href = '/id' + window.location.pathname;
    }
  };

  return (
    <header className="fixed top-0 w-full h-[60px] z-50 flex items-center justify-between px-8 bg-[var(--color-sun)] border-b-4 border-[var(--color-ink)] pointer-events-auto">
      {/* Left side: Avatar + Name (Circle + Squiggly text in wireframe) */}
      <div className="flex items-center gap-4 cursor-pointer hover:translate-y-[2px]" onClick={() => setScene('hero')}>
        <div className="w-10 h-10 bg-white border-4 border-[var(--color-ink)] rounded-full overflow-hidden flex items-center justify-center">
          <span className="text-xl">🧑</span>
        </div>
        <div className="font-bold text-lg text-[var(--color-blue-deep)]">
          Jonathan
        </div>
      </div>
      
      {/* Right side: Nav Links + Lang */}
      <nav className="flex items-center gap-6">
        {scenes.map(s => (
          <button
            key={s.id}
            onClick={() => {
              setScene(s.id);
              window.location.hash = s.id;
            }}
            className={`font-bold hover:text-[var(--color-blue-mid)] transition-colors ${current === s.id ? 'text-[var(--color-blue-deep)] underline decoration-4 underline-offset-4' : 'text-[var(--color-ink)]'}`}
          >
            {s.label}
          </button>
        ))}
        <button 
          onClick={toggleLang}
          className="pixel-corners bg-[var(--color-blue-deep)] text-white px-2 py-1 pixel-shadow hover:translate-y-[var(--px)] font-bold ml-4"
        >
          {isId ? 'ID' : 'EN'}
        </button>
      </nav>
    </header>
  );
};
