import React, { useEffect, useState } from 'react';
import { Howl, Howler } from 'howler';

// Store audio state in localStorage or a global store if needed.
// For now, we'll manage it locally in this persisted component.

// TODO(owner): Add real audio files or implement Web Audio API synth
const BGM_URL = '/audio/chiptune.mp3';

export const AudioController: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [bgm, setBgm] = useState<Howl | null>(null);

  useEffect(() => {
    // Load mute state from storage
    const storedMute = localStorage.getItem('retro_mute') === 'true';
    setIsMuted(storedMute);
    Howler.mute(storedMute);

    // Initialize BGM
    // We wrap this in a try-catch to not break if the file doesn't exist
    const sound = new Howl({
      src: [import.meta.env.BASE_URL + 'audio/chiptune.mp3'],
      loop: true,
      volume: 0.3,
      onloaderror: () => {
        console.warn('Audio file not found or failed to load. Provide it in public/audio/chiptune.mp3');
      }
    });

    setBgm(sound);

    // Play on first interaction if not muted
    const startAudio = () => {
      if (!sound.playing()) {
        sound.play();
      }
      document.removeEventListener('click', startAudio);
      document.removeEventListener('keydown', startAudio);
    };

    document.addEventListener('click', startAudio);
    document.addEventListener('keydown', startAudio);

    return () => {
      sound.unload();
      document.removeEventListener('click', startAudio);
      document.removeEventListener('keydown', startAudio);
    };
  }, []);

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    Howler.mute(nextMute);
    localStorage.setItem('retro_mute', String(nextMute));
  };

  return (
    <div className="absolute top-4 right-4 z-50 pointer-events-auto">
      <button 
        onClick={toggleMute}
        className="pixel-corners bg-white border-4 border-[var(--color-ink)] p-2 w-12 h-12 flex items-center justify-center pixel-shadow hover:bg-gray-100 hover:translate-y-[var(--px)] transition-transform pixel-focus"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
};
