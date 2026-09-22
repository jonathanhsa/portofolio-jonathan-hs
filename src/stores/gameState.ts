import { atom } from 'nanostores';

export type SceneId = 'hero' | 'about' | 'skills' | 'projects' | 'experience' | 'certificates' | 'contact';

export const activeScene = atom<SceneId>('hero');
export const hasBooted = atom<boolean>(false);
export const playerLevel = atom<number>(1);
export const playerXp = atom<number>(0);

export const unlockAchievement = (id: string, name: string) => {
  // TODO: Implement achievement toaster and localStorage persistence
  console.log(`Achievement unlocked: ${name}`);
};

export const setScene = (scene: SceneId) => {
  activeScene.set(scene);
};
