import { useRef, useState } from 'react';
import ThreeScene, { type ThreeSceneHandle } from '@/components/ThreeScene';
import WrapPanel from '@/components/WrapPanel';
import type { CarModel } from '@/data/cars';

const ThreeDemo = () => {
  const sceneRef = useRef<ThreeSceneHandle>(null);
  const [loading,    setLoading]    = useState(false);
  const [pickMode,   setPickMode]   = useState(false);
  const [paintCount, setPaintCount] = useState(0);

  const handleSelectCar = (car: CarModel) => {
    // Exit pick mode on car switch — avoids stale crosshair cursor
    if (pickMode) {
      setPickMode(false);
      sceneRef.current?.setPickMode(false);
    }
    setLoading(true);
    sceneRef.current?.loadCar(car.path, () => setLoading(false));
  };

  const togglePickMode = () => {
    const next = !pickMode;
    setPickMode(next);
    sceneRef.current?.setPickMode(next);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ThreeScene ref={sceneRef} onPaintSetChange={setPaintCount} />
      <WrapPanel
        loading={loading}
        pickMode={pickMode}
        paintCount={paintCount}
        onSelectCar={handleSelectCar}
        onApplyWrap={cfg => sceneRef.current?.applyWrap(cfg)}
        onTogglePickMode={togglePickMode}
        onClearPaintSet={() => sceneRef.current?.clearPaintSet()}
      />
    </div>
  );
};

export default ThreeDemo;
