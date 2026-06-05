import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const TARGET_SIZE = 4;

// ── Exported types ────────────────────────────────────────────────────────────

export type WrapConfig =
  | { type: 'solid';    color: string }
  | { type: 'metallic'; color: string }
  | { type: 'carbon' }
  | { type: 'reset' };

export type ThreeSceneHandle = {
  applyWrap:     (config: WrapConfig) => void;
  loadCar:       (path: string, onDone?: () => void) => void;
  setPickMode:   (on: boolean) => void;
  clearPaintSet: () => void;
};

// ── Internal types ────────────────────────────────────────────────────────────

type OriginalMatSnapshot = {
  color:             THREE.Color;
  metalness:         number;
  roughness:         number;
  map:               THREE.Texture | null;
  emissive:          THREE.Color;
  emissiveIntensity: number;
};

type PaintEntry = {
  mesh:             THREE.Mesh;
  originalSnapshot: OriginalMatSnapshot;
};

// Persists across car switches so returning to a car restores its selection + wrap
type CarSavedState = {
  meshNames:  string[];
  lastConfig: WrapConfig | null;
};

export interface ThreeSceneProps {
  onPaintSetChange?: (count: number) => void;
}

// ── Module-level helpers ──────────────────────────────────────────────────────

// Material names containing any of these keywords are excluded from auto-detection
const BODY_EXCLUDE = [
  'wheel', 'tire', 'tyre', 'rubber', 'brake', 'caliper', 'rotor',
  'glass', 'window', 'windshield', 'windscreen',
  'chrome', 'mirror', 'light', 'lamp', 'headlight', 'taillight',
  'disk', 'disc', 'exhaust', 'pipe', 'muffler',
  'badge', 'logo', 'emblem', 'decal', 'plate', 'number',
  'shadow', 'floor', 'ground', 'carpet', 'interior', 'seat', 'dash',
  'underbody', 'frame', 'chassis',
];

function disposeModel(root: THREE.Group): void {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    obj.geometry.dispose();
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of mats) {
      for (const val of Object.values(mat as object)) {
        if (val instanceof THREE.Texture) val.dispose();
      }
      mat.dispose();
    }
  });
}

function makeCarbonFiberTexture(): THREE.CanvasTexture {
  const SIZE = 256, CELL = 16;
  const cv = document.createElement('canvas');
  cv.width = cv.height = SIZE;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let r = 0; r < SIZE / CELL; r++) {
    for (let c = 0; c < SIZE / CELL; c++) {
      const x = c * CELL, y = r * CELL;
      const h = (r + c) % 2 === 0;
      const g = ctx.createLinearGradient(x, y, h ? x + CELL : x, h ? y : y + CELL);
      g.addColorStop(0.00, '#1c1c1c'); g.addColorStop(0.35, '#313131');
      g.addColorStop(0.50, '#161616'); g.addColorStop(0.65, '#313131');
      g.addColorStop(1.00, '#1c1c1c');
      ctx.fillStyle = g;
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(x + 1, y + 1, CELL - 2, Math.floor(CELL / 3));
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}

// ── Component ─────────────────────────────────────────────────────────────────

const ThreeScene = forwardRef<ThreeSceneHandle, ThreeSceneProps>(({ onPaintSetChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Paint set — survives re-renders
  const paintSetRef       = useRef<Map<string, PaintEntry>>(new Map());
  const carbonTexRef      = useRef<THREE.CanvasTexture | null>(null);
  const lastConfigRef     = useRef<WrapConfig | null>(null);

  // Car state
  const currentCarPathRef  = useRef('/coupe/911.glb');
  const carSavedStatesRef  = useRef<Map<string, CarSavedState>>(new Map());
  const currentModelRef    = useRef<THREE.Group | null>(null);

  // Keep callback stable inside effect closures
  const onPaintSetChangeRef = useRef(onPaintSetChange);
  onPaintSetChangeRef.current = onPaintSetChange;

  // Effect → handle bridges
  const loadModelRef       = useRef<((path: string, onDone?: () => void) => void) | null>(null);
  const applyWrapRef       = useRef<((config: WrapConfig) => void) | null>(null);
  const pickModeActionsRef = useRef<{ setPickMode: (on: boolean) => void; clearPaintSet: () => void } | null>(null);

  // ── Imperative handle ──────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    applyWrap:     (cfg)         => applyWrapRef.current?.(cfg),
    loadCar:       (path, done)  => loadModelRef.current?.(path, done),
    setPickMode:   (on)          => pickModeActionsRef.current?.setPickMode(on),
    clearPaintSet: ()            => pickModeActionsRef.current?.clearPaintSet(),
  }), []);

  // ── Three.js setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    let mounted = true;
    let loadToken = 0;
    let pickModeActive = false;

    // Core objects
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f0f);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(6, 10, 6);
    keyLight.castShadow = true;
    keyLight.shadow.camera.near = 0.1; keyLight.shadow.camera.far  = 50;
    keyLight.shadow.camera.left = -10; keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top  =  10; keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.mapSize.set(2048, 2048);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-6, 4, -4);
    scene.add(fillLight);

    scene.add(new THREE.GridHelper(20, 20, 0x444444, 0x222222));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance   = 2;
    controls.maxDistance   = 20;

    const loader    = new GLTFLoader();
    const raycaster = new THREE.Raycaster();

    // ── Paint-set helpers ────────────────────────────────────────────────────

    const addToPaintSet = (mesh: THREE.Mesh): void => {
      if (paintSetRef.current.has(mesh.uuid)) return;
      // Clone so this mesh gets its own material instance — avoids affecting
      // other meshes that share the same material object in the GLB.
      const raw     = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const cloned  = (raw as THREE.MeshStandardMaterial).clone();
      mesh.material = cloned;
      paintSetRef.current.set(mesh.uuid, {
        mesh,
        originalSnapshot: {
          color:             cloned.color.clone(),
          metalness:         cloned.metalness,
          roughness:         cloned.roughness,
          map:               cloned.map,
          emissive:          cloned.emissive.clone(),
          emissiveIntensity: cloned.emissiveIntensity,
        },
      });
    };

    const removeFromPaintSet = (uuid: string): void => {
      const entry = paintSetRef.current.get(uuid);
      if (!entry) return;
      const mat = entry.mesh.material as THREE.MeshStandardMaterial;
      const o   = entry.originalSnapshot;
      mat.color.copy(o.color);
      mat.metalness         = o.metalness;
      mat.roughness         = o.roughness;
      mat.map               = o.map;
      mat.emissive.copy(o.emissive);
      mat.emissiveIntensity = o.emissiveIntensity;
      mat.needsUpdate       = true;
      paintSetRef.current.delete(uuid);
    };

    // Clears refs without restoring materials — used just before model disposal.
    const wipePaintSet = (): void => {
      paintSetRef.current.clear();
      carbonTexRef.current?.dispose();
      carbonTexRef.current = null;
      lastConfigRef.current = null;
      onPaintSetChangeRef.current?.(0);
    };

    const saveCarState = (): void => {
      carSavedStatesRef.current.set(currentCarPathRef.current, {
        meshNames:  Array.from(paintSetRef.current.values()).map(e => e.mesh.name),
        lastConfig: lastConfigRef.current,
      });
    };

    const clearPaintSet = (): void => {
      for (const uuid of Array.from(paintSetRef.current.keys())) removeFromPaintSet(uuid);
      onPaintSetChangeRef.current?.(0);
      saveCarState();
    };

    // ── Wrap application ─────────────────────────────────────────────────────

    const applyWrapToPaintSet = (config: WrapConfig): void => {
      if (paintSetRef.current.size === 0) return;

      // Dispose any previous shared carbon texture
      carbonTexRef.current?.dispose();
      carbonTexRef.current = null;

      // Create carbon texture once, shared across all paint meshes
      const newCarbonTex = config.type === 'carbon' ? makeCarbonFiberTexture() : null;
      if (newCarbonTex) carbonTexRef.current = newCarbonTex;

      for (const [, entry] of paintSetRef.current) {
        const mat = entry.mesh.material as THREE.MeshStandardMaterial;
        mat.map = null; // always clear before re-assigning

        switch (config.type) {
          case 'solid':
            mat.color.set(config.color); mat.metalness = 0.0; mat.roughness = 0.85;
            break;
          case 'metallic':
            mat.color.set(config.color); mat.metalness = 0.92; mat.roughness = 0.12;
            break;
          case 'carbon':
            mat.color.set('#111111'); mat.metalness = 0.4; mat.roughness = 0.5;
            mat.map = newCarbonTex!;
            break;
          case 'reset': {
            const o = entry.originalSnapshot;
            mat.color.copy(o.color); mat.metalness = o.metalness;
            mat.roughness = o.roughness; mat.map = o.map;
            // emissive intentionally NOT touched here — managed by setPickModeActive
            break;
          }
        }
        mat.needsUpdate = true;
      }

      lastConfigRef.current = config.type === 'reset' ? null : config;
      saveCarState();
    };

    applyWrapRef.current = applyWrapToPaintSet;

    // ── Auto-detection ───────────────────────────────────────────────────────

    const autoDetectPaintSet = (model: THREE.Group): void => {
      // Group every mesh by its material name; accumulate bounding-box volume.
      // Volume is a reasonable body-size proxy: the body is the largest solid,
      // while wheels/glass are compact or thin.
      const groups = new Map<string, { meshes: THREE.Mesh[]; volume: number }>();

      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const raw     = Array.isArray(child.material) ? child.material[0] : child.material;
        const matName = raw.name || `__unnamed_${child.uuid.slice(0, 8)}`;
        const g       = groups.get(matName) ?? { meshes: [], volume: 0 };
        const s       = new THREE.Box3().setFromObject(child).getSize(new THREE.Vector3());
        g.volume += s.x * s.y * s.z;
        g.meshes.push(child);
        groups.set(matName, g);
      });

      const sorted = Array.from(groups.entries()).sort((a, b) => b[1].volume - a[1].volume);

      console.log('── Material group analysis ──────────────────────────');
      for (const [name, { meshes, volume }] of sorted) {
        const hit = BODY_EXCLUDE.find(kw => name.toLowerCase().includes(kw));
        console.log(
          `  "${name}"  meshes:${meshes.length}  vol:${volume.toFixed(4)}` +
          (hit ? `  ✗ (${hit})` : ''),
        );
      }

      const candidates = sorted.filter(([name]) =>
        !BODY_EXCLUDE.some(kw => name.toLowerCase().includes(kw)),
      );

      if (candidates.length === 0) {
        console.warn('[ThreeScene] No candidates passed filter — selecting all meshes');
        model.traverse((child) => { if (child instanceof THREE.Mesh) addToPaintSet(child); });
        console.log('─────────────────────────────────────────────────────');
        return;
      }

      // Top group + any within 80 % of its volume (catches split body panels),
      // capped at 3 to avoid over-selection.
      const topVol   = candidates[0][1].volume;
      const selected = candidates.filter(([, g]) => g.volume >= topVol * 0.8).slice(0, 3);

      console.log(`── Auto-selected: ${selected.map(([n]) => `"${n}"`).join(', ')}`);
      console.log('─────────────────────────────────────────────────────');

      for (const [, { meshes }] of selected) {
        for (const mesh of meshes) addToPaintSet(mesh);
      }
    };

    // ── Pick-mode ────────────────────────────────────────────────────────────

    const setPickModeActive = (on: boolean): void => {
      pickModeActive          = on;
      canvas.style.cursor     = on ? 'crosshair' : 'default';

      // Apply or remove the blue selection highlight on every paint-set member
      for (const [, entry] of paintSetRef.current) {
        const mat = entry.mesh.material as THREE.MeshStandardMaterial;
        if (on) {
          mat.emissive.set(0x1a44cc);
          mat.emissiveIntensity = 0.4;
        } else {
          mat.emissive.copy(entry.originalSnapshot.emissive);
          mat.emissiveIntensity = entry.originalSnapshot.emissiveIntensity;
        }
        mat.needsUpdate = true;
      }
    };

    pickModeActionsRef.current = { setPickMode: setPickModeActive, clearPaintSet };

    // ── Model loading ────────────────────────────────────────────────────────

    const loadModel = (path: string, onDone?: () => void): void => {
      const token = ++loadToken;

      if (currentModelRef.current) saveCarState();   // persist outgoing car
      wipePaintSet();                                  // clear refs (no material restore)

      if (currentModelRef.current) {
        disposeModel(currentModelRef.current);
        scene.remove(currentModelRef.current);
        currentModelRef.current = null;
      }

      currentCarPathRef.current = path;

      loader.load(
        path,

        (gltf) => {
          if (!mounted || token !== loadToken) return;

          const model = gltf.scene;

          // Scale longest axis to TARGET_SIZE
          const box    = new THREE.Box3().setFromObject(model);
          const size   = box.getSize(new THREE.Vector3());
          model.scale.setScalar(TARGET_SIZE / Math.max(size.x, size.y, size.z));

          // Center on X/Z, sit bottom at y=0 (grid plane)
          box.setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.set(-center.x, -box.min.y, -center.z);

          // Camera auto-fit from fitted bounding box
          box.setFromObject(model);
          const fitted  = box.getSize(new THREE.Vector3());
          const fov     = camera.fov * (Math.PI / 180);
          const camDist = (Math.max(fitted.x, fitted.z) / 2 / Math.tan(fov / 2)) * 1.8;
          camera.position.set(0, fitted.y * 0.8, camDist);
          controls.target.set(0, fitted.y * 0.4, 0);
          controls.update();

          model.traverse((child) => {
            if (child instanceof THREE.Mesh) child.castShadow = child.receiveShadow = true;
          });

          scene.add(model);
          currentModelRef.current = model;

          // ── Build paint set ──────────────────────────────────────────────
          const saved = carSavedStatesRef.current.get(path);

          if (saved && saved.meshNames.length > 0) {
            // Restore saved selection by mesh name
            const nameSet = new Set(saved.meshNames);
            model.traverse((child) => {
              if (child instanceof THREE.Mesh && nameSet.has(child.name)) addToPaintSet(child);
            });
            console.log(`[ThreeScene] Restored ${paintSetRef.current.size} mesh(es) for ${path}`);
          } else {
            // First visit — auto-detect
            console.log(`[ThreeScene] Auto-detecting paint set for ${path}`);
            autoDetectPaintSet(model);
          }

          // Re-apply last wrap (skip 'reset' — nothing to re-apply)
          if (saved?.lastConfig && saved.lastConfig.type !== 'reset') {
            applyWrapToPaintSet(saved.lastConfig);
          }

          // Re-apply pick highlights if mode was left on
          if (pickModeActive) setPickModeActive(true);

          onPaintSetChangeRef.current?.(paintSetRef.current.size);

          // Mesh inventory log — ✓ marks paint-set members
          console.log('── Mesh inventory ───────────────────────────────────');
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const matName = Array.isArray(child.material)
                ? child.material.map(m => m.name).join(', ')
                : (child.material as THREE.Material).name;
              const tag = paintSetRef.current.has(child.uuid) ? '  ✓ wrap target' : '';
              console.log(`  "${child.name}"  mat:"${matName}"${tag}`);
            }
          });
          console.log('─────────────────────────────────────────────────────');

          onDone?.();
        },

        (xhr) => {
          if (xhr.total > 0) console.log(`[ThreeScene] ${path} ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
        },

        (error) => {
          console.error(`[ThreeScene] Failed: ${path}`, error);
          if (mounted && token === loadToken) onDone?.();
        },
      );
    };

    loadModelRef.current = loadModel;

    // ── Raycast click-to-paint ───────────────────────────────────────────────

    let mouseDownX = 0, mouseDownY = 0;

    const onMouseDown = (e: MouseEvent) => { mouseDownX = e.clientX; mouseDownY = e.clientY; };

    const onClick = (e: MouseEvent) => {
      if (!pickModeActive || !currentModelRef.current) return;
      // Ignore if pointer moved > 5 px — that was a drag, not a click
      if (Math.hypot(e.clientX - mouseDownX, e.clientY - mouseDownY) > 5) return;

      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width)  *  2 - 1,
          ((e.clientY - rect.top)  / rect.height) * -2 + 1,
        ),
        camera,
      );

      const meshes: THREE.Mesh[] = [];
      currentModelRef.current.traverse((c) => { if (c instanceof THREE.Mesh) meshes.push(c); });

      const hits = raycaster.intersectObjects(meshes);
      if (hits.length === 0) return;

      const hit = hits[0].object as THREE.Mesh;

      if (paintSetRef.current.has(hit.uuid)) {
        // Deselect: restore original material (incl. emissive)
        removeFromPaintSet(hit.uuid);
      } else {
        // Select: clone material, save snapshot, apply highlight
        addToPaintSet(hit);
        const mat = hit.material as THREE.MeshStandardMaterial;
        mat.emissive.set(0x1a44cc);
        mat.emissiveIntensity = 0.4;
        mat.needsUpdate = true;

        // Propagate any active wrap to the newly selected mesh
        if (lastConfigRef.current) {
          applyWrapToPaintSet(lastConfigRef.current);
          // applyWrap doesn't touch emissive, so highlight survives
        }
      }

      onPaintSetChangeRef.current?.(paintSetRef.current.size);
      saveCarState();
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('click', onClick);

    // ── Resize + animate ─────────────────────────────────────────────────────

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Initial car
    loadModel('/coupe/911.glb');

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      mounted = false;
      loadModelRef.current = applyWrapRef.current = pickModeActionsRef.current = null;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('click', onClick);
      controls.dispose();
      renderer.dispose();
      carbonTexRef.current?.dispose();
      if (currentModelRef.current) disposeModel(currentModelRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100vh' }} />;
});

ThreeScene.displayName = 'ThreeScene';
export default ThreeScene;
