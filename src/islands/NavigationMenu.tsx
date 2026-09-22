import React from 'react';
import { useStore } from '@nanostores/react';
import { activeScene, setScene, SceneId } from '../stores/gameState';

const scenes: { id: SceneId; label: string }[] = [
  { id: 'hero', label: 'Start' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'certificates', label: 'Badges' },
  { id: 'contact', label: 'Contact' },
];

export const NavigationMenu: React.FC = () => {
  const current = useStore(activeScene);

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="pixel-corners bg-white border-4 border-[var(--color-ink)] p-2 pixel-shadow flex gap-2 overflow-x-auto max-w-[90vw]">
        {scenes.map(s => (
          <button
            key={s.id}
            onClick={() => {
              setScene(s.id);
              window.location.hash = s.id;
            }}
            className={`pixel-corners px-3 py-2 text-sm whitespace-nowrap transition-transform pixel-focus
              ${current === s.id 
                ? 'bg-[var(--color-blue-deep)] text-white translate-y-[var(--px)]' 
                : 'bg-[var(--color-sun)] text-[var(--color-ink)] hover:bg-[var(--color-cyan)] border-2 border-[var(--color-ink)]'
              }
            `}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};
