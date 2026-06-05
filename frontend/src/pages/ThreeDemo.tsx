import { useRef } from 'react';
import ThreeScene, { type ThreeSceneHandle } from '@/components/ThreeScene';
import WrapPanel from '@/components/WrapPanel';

// ThreeDemo owns the ref that bridges React UI → Three.js scene.
// Neither child knows about the other — they communicate only through
// the applyWrap() method on ThreeSceneHandle.
const ThreeDemo = () => {
  const sceneRef = useRef<ThreeSceneHandle>(null);

  return (
    // position:relative so the WrapPanel (position:fixed) stacks above the canvas
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ThreeScene ref={sceneRef} />
      <WrapPanel
        onApplyWrap={(config) => sceneRef.current?.applyWrap(config)}
      />
    </div>
  );
};

export default ThreeDemo;
