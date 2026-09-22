import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

// TODO(owner): Update model path once owner supplies the .gltf file
const MODEL_PATH = '/models/retro-pc.gltf';

const RetroPC = () => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(import.meta.env.BASE_URL + 'models/retro-pc.glb', import.meta.env.BASE_URL + 'draco/');
  
  // Set up animations if they exist
  const { actions } = useAnimations(animations, group);
  
  useEffect(() => {
    // Play the first animation found, e.g., 'LSAction'
    const actionName = animations.length > 0 ? animations[0].name : null;
    if (actionName && actions[actionName]) {
      actions[actionName].play();
    }
  }, [actions, animations]);

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} scale={1} />
    </group>
  );
};

export const PcScene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[var(--color-sun)] pointer-events-auto">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 45 }}
        gl={{ antialias: false, powerPreference: 'low-power' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          <group position={[0, -1, 0]}>
            {/* The model */}
            <RetroPC />
          </group>

          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

// Preload the model
useGLTF.preload(import.meta.env.BASE_URL + 'models/retro-pc.glb', import.meta.env.BASE_URL + 'draco/');
