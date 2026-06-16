import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

const TARGET_SIZE = 4;
const BACKGROUND_BLURRINESS = 0.4;
const TONE_MAPPING_GARAGE = 0.85;
const TONE_MAPPING_STUDIO = 1.0;
const FLOOR_OPACITY_CENTER = 1.0;
const REFLECTOR_TINT = 0x7f7f7f;
const CONTACT_SHADOW_OPACITY = 0.55;

export type WrapConfig =
  | { type: 'solid'; color: string }
  | { type: 'metallic'; color: string }
  | { type: 'carbon' }
  | { type: 'reset' };

export interface ThreeSceneProps {
  onPaintSetChange?: (count: number) => void;
  customTexture?: THREE.CanvasTexture | null;
}

export type EnvironmentMode = 'garage' | 'studio' | 'solid';

export type ThreeSceneHandle = {
  applyWrap: (config: WrapConfig) => void;
  loadCar: (path: string, onDone?: () => void) => void;
  setPickMode: (on: boolean) => void;
  clearPaintSet: () => void;
  setEnvironment: (env: EnvironmentMode) => void;
};

type OriginalMatSnapshot = {
  color: THREE.Color;
  metalness: number;
  roughness: number;
  map: THREE.Texture | null;
  emissive: THREE.Color;
  emissiveIntensity: number;
  envMapIntensity: number;
};

type PaintEntry = { mesh: THREE.Mesh; originalSnapshot: OriginalMatSnapshot };
type CarSavedState = { meshNames: string[]; lastConfig: WrapConfig | null };

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
      const x = c * CELL, y = r * CELL, h = (r + c) % 2 === 0;
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

function makeFloorAlphaMap(): THREE.CanvasTexture {
  const SIZE = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = SIZE;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SIZE, SIZE);
  const r = SIZE * 0.40;
  const cx = SIZE / 2, cy = SIZE / 2;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0.00, '#b3b3b3');
  g.addColorStop(0.40, '#cccccc');
  g.addColorStop(0.75, '#e6e6e6');
  g.addColorStop(1.00, '#ffffff');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
  return new THREE.CanvasTexture(cv);
}

function makeContactShadowTexture(): THREE.CanvasTexture {
  const SIZE = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = SIZE;
  const ctx = cv.getContext('2d')!;
  ctx.clearRect(0, 0, SIZE, SIZE);
  const cx = SIZE / 2, cy = SIZE / 2;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, SIZE / 2);
  g.addColorStop(0.00, `rgba(0,0,0,${CONTACT_SHADOW_OPACITY})`);
  g.addColorStop(0.25, `rgba(0,0,0,${CONTACT_SHADOW_OPACITY * 0.65})`);
  g.addColorStop(0.55, `rgba(0,0,0,${CONTACT_SHADOW_OPACITY * 0.3})`);
  g.addColorStop(1.00, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
  return new THREE.CanvasTexture(cv);
}

const ThreeScene = forwardRef<ThreeSceneHandle, ThreeSceneProps>(({ onPaintSetChange, customTexture }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paintSetSize, setPaintSetSize] = useState(0);

  const paintSetRef = useRef<Map<string, PaintEntry>>(new Map());
  const carbonTexRef = useRef<THREE.CanvasTexture | null>(null);
  const lastConfigRef = useRef<WrapConfig | null>(null);
  const currentCarPathRef = useRef('/coupe/911.glb');
  const carSavedStatesRef = useRef<Map<string, CarSavedState>>(new Map());
  const currentModelRef = useRef<THREE.Group | null>(null);

  const onPaintSetChangeRef = useRef(onPaintSetChange);
  onPaintSetChangeRef.current = onPaintSetChange;

  const loadModelRef = useRef<((path: string, onDone?: () => void) => void) | null>(null);
  const applyWrapRef = useRef<((config: WrapConfig) => void) | null>(null);
  const pickModeActionsRef = useRef<{ setPickMode: (on: boolean) => void; clearPaintSet: () => void } | null>(null);
  const envActionsRef = useRef<{ setEnvironment: (env: EnvironmentMode) => void } | null>(null);

  // ── Custom texture application with debug logs ──────────────────────────────
  const applyCustomTextureToPaintSet = (texture: THREE.CanvasTexture | null) => {
    console.log(`[ThreeScene] applyCustomTexture called, texture = ${texture ? 'yes' : 'null'}, paintSet size = ${paintSetRef.current.size}`);
    if (paintSetRef.current.size === 0) {
      console.warn('[ThreeScene] No meshes in paint set, skipping texture application');
      return;
    }
    if (texture) {
      console.log('[ThreeScene] Applying custom texture to', paintSetRef.current.size, 'meshes');
      for (const [uuid, entry] of paintSetRef.current) {
        const mat = entry.mesh.material as THREE.MeshStandardMaterial;
        mat.map = texture;
        mat.color.setHex(0xffffff);
        mat.needsUpdate = true;
        if (mat.map) mat.map.needsUpdate = true;
        console.log(`  - Applied texture to mesh "${entry.mesh.name}" (${uuid.slice(0,6)})`);
      }
    } else {
      console.log('[ThreeScene] No custom texture, reverting to preset or original');
      if (lastConfigRef.current && lastConfigRef.current.type !== 'reset') {
        applyWrapToPaintSet(lastConfigRef.current);
      } else {
        for (const [, entry] of paintSetRef.current) {
          const mat = entry.mesh.material as THREE.MeshStandardMaterial;
          const o = entry.originalSnapshot;
          mat.color.copy(o.color);
          mat.metalness = o.metalness;
          mat.roughness = o.roughness;
          mat.map = o.map;
          mat.emissive.copy(o.emissive);
          mat.emissiveIntensity = o.emissiveIntensity;
          mat.envMapIntensity = o.envMapIntensity;
          mat.needsUpdate = true;
        }
      }
    }
  };

  useEffect(() => {
    console.log('[ThreeScene] useEffect triggered, customTexture changed or paintSetSize =', paintSetSize);
    applyCustomTextureToPaintSet(customTexture ?? null);
  }, [customTexture, paintSetSize]);

  useImperativeHandle(ref, () => ({
    applyWrap: (cfg) => applyWrapRef.current?.(cfg),
    loadCar: (path, done) => loadModelRef.current?.(path, done),
    setPickMode: (on) => pickModeActionsRef.current?.setPickMode(on),
    clearPaintSet: () => pickModeActionsRef.current?.clearPaintSet(),
    setEnvironment: (env) => envActionsRef.current?.setEnvironment(env),
  }), []);

  // ── Three.js setup (unchanged except paintSetSize updates) ──────────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    let mounted = true;
    let loadToken = 0;
    let envToken = 0;
    let pickModeActive = false;

    let currentEnvMap: THREE.Texture | null = null;
    let currentEnvRT: THREE.WebGLRenderTarget | null = null;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = TONE_MAPPING_GARAGE;

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    const camera = new THREE.PerspectiveCamera(
      60,
      (canvas.clientWidth || window.innerWidth) / (canvas.clientHeight || window.innerHeight),
      0.1, 200,
    );

    const ambientLight = new THREE.AmbientLight(0xffe8cc, 0.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e0, 1.4);
    keyLight.position.set(6, 10, 6);
    keyLight.castShadow = true;
    keyLight.shadow.camera.near = 0.1; keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -8; keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8; keyLight.shadow.camera.bottom = -8;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffd8aa, 0.4);
    fillLight.position.set(-6, 4, -4);
    scene.add(fillLight);

    const garageSpot = new THREE.SpotLight(0xfff0cc, 4.0);
    garageSpot.position.set(0, 6, 1);
    garageSpot.angle = Math.PI / 5;
    garageSpot.penumbra = 0.5;
    garageSpot.decay = 1.5;
    garageSpot.distance = 15;
    garageSpot.castShadow = true;
    garageSpot.shadow.mapSize.set(1024, 1024);
    garageSpot.shadow.bias = -0.001;
    garageSpot.visible = false;
    scene.add(garageSpot);
    scene.add(garageSpot.target);

    const floorAlphaMap = makeFloorAlphaMap();
    const reflector = new Reflector(new THREE.PlaneGeometry(16, 16), {
      color: new THREE.Color(REFLECTOR_TINT),
      textureWidth: 512,
      textureHeight: 512,
      clipBias: 0.003,
      multisample: 4,
    });
    reflector.rotation.x = -Math.PI / 2;
    reflector.position.y = 0;
    scene.add(reflector);

    const floorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a1a1a),
      roughness: 0.25,
      metalness: 0.18,
      transparent: true,
      opacity: FLOOR_OPACITY_CENTER,
      alphaMap: floorAlphaMap,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.001;
    floor.receiveShadow = true;
    scene.add(floor);

    const contactShadowTex = makeContactShadowTexture();
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.MultiplyBlending,
      renderOrder: 1,
    });
    const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), contactShadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.005;
    contactShadow.renderOrder = 1;
    scene.add(contactShadow);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 20;

    const loader = new GLTFLoader();
    const raycaster = new THREE.Raycaster();

    const disposeEnvMap = (): void => {
      scene.environment = null;
      scene.background = null;
      if (currentEnvMap) { currentEnvMap.dispose(); currentEnvMap = null; }
      if (currentEnvRT) { currentEnvRT.dispose(); currentEnvRT = null; }
    };

    const setEnvModeActive = (mode: EnvironmentMode): void => {
      const token = ++envToken;
      disposeEnvMap();
      scene.background = new THREE.Color(0x1a1a1a);
      scene.backgroundBlurriness = 0;
      switch (mode) {
        case 'garage':
          renderer.toneMappingExposure = TONE_MAPPING_GARAGE;
          ambientLight.color.set(0xffe8cc); ambientLight.intensity = 0.35;
          keyLight.color.set(0xfff4e0); keyLight.intensity = 1.4;
          fillLight.color.set(0xffd8aa); fillLight.intensity = 0.4;
          garageSpot.visible = true;
          floorMat.color.set(0x1a1a1a); floorMat.roughness = 0.25; floorMat.metalness = 0.18;
          floorMat.transparent = true; floorMat.opacity = FLOOR_OPACITY_CENTER;
          floorMat.needsUpdate = true;
          reflector.visible = true;
          new RGBELoader().load(
            '/hdri/garage.hdr',
            (hdrTex) => {
              if (!mounted || token !== envToken) { hdrTex.dispose(); return; }
              const rt = pmrem.fromEquirectangular(hdrTex);
              hdrTex.dispose();
              currentEnvMap = rt.texture;
              currentEnvRT = rt;
              scene.environment = rt.texture;
              scene.background = rt.texture;
              scene.backgroundBlurriness = BACKGROUND_BLURRINESS;
            },
            undefined,
            () => {
              if (!mounted || token !== envToken) return;
              console.warn('[ThreeScene] /hdri/garage.hdr not found.');
              scene.background = new THREE.Color(0x1a1818);
            }
          );
          break;
        case 'studio':
          renderer.toneMappingExposure = TONE_MAPPING_STUDIO;
          ambientLight.color.set(0xf0f4ff); ambientLight.intensity = 0.6;
          keyLight.color.set(0xf5f5ff); keyLight.intensity = 2.0;
          fillLight.color.set(0xffffff); fillLight.intensity = 0.6;
          garageSpot.visible = false;
          floorMat.color.set(0x2a2a2a); floorMat.roughness = 0.40; floorMat.metalness = 0.05;
          floorMat.transparent = true; floorMat.opacity = FLOOR_OPACITY_CENTER;
          floorMat.needsUpdate = true;
          reflector.visible = true;
          const roomEnv = new RoomEnvironment();
          const rt = pmrem.fromScene(roomEnv, 0.04);
          roomEnv.dispose();
          currentEnvMap = rt.texture;
          currentEnvRT = rt;
          scene.environment = rt.texture;
          scene.background = new THREE.Color(0x2a2a2a);
          break;
        case 'solid':
          renderer.toneMappingExposure = TONE_MAPPING_STUDIO;
          ambientLight.color.set(0xffffff); ambientLight.intensity = 0.5;
          keyLight.color.set(0xffffff); keyLight.intensity = 2.0;
          fillLight.color.set(0xffffff); fillLight.intensity = 0.5;
          garageSpot.visible = false;
          floorMat.color.set(0x111111); floorMat.roughness = 0.85; floorMat.metalness = 0;
          floorMat.transparent = false; floorMat.opacity = 1.0;
          floorMat.needsUpdate = true;
          reflector.visible = false;
          scene.environment = null;
          scene.background = new THREE.Color(0x0f0f0f);
          break;
      }
    };
    envActionsRef.current = { setEnvironment: setEnvModeActive };

    const addToPaintSet = (mesh: THREE.Mesh): void => {
      if (paintSetRef.current.has(mesh.uuid)) return;
      const raw = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const cloned = (raw as THREE.MeshStandardMaterial).clone();
      mesh.material = cloned;
      paintSetRef.current.set(mesh.uuid, {
        mesh,
        originalSnapshot: {
          color: cloned.color.clone(),
          metalness: cloned.metalness,
          roughness: cloned.roughness,
          map: cloned.map,
          emissive: cloned.emissive.clone(),
          emissiveIntensity: cloned.emissiveIntensity,
          envMapIntensity: cloned.envMapIntensity,
        },
      });
      console.log(`[PaintSet] Added mesh "${mesh.name}" (${mesh.uuid.slice(0,6)})`);
    };

    const removeFromPaintSet = (uuid: string): void => {
      const entry = paintSetRef.current.get(uuid);
      if (!entry) return;
      const mat = entry.mesh.material as THREE.MeshStandardMaterial;
      const o = entry.originalSnapshot;
      mat.color.copy(o.color);
      mat.metalness = o.metalness;
      mat.roughness = o.roughness;
      mat.map = o.map;
      mat.emissive.copy(o.emissive);
      mat.emissiveIntensity = o.emissiveIntensity;
      mat.envMapIntensity = o.envMapIntensity;
      mat.needsUpdate = true;
      paintSetRef.current.delete(uuid);
      console.log(`[PaintSet] Removed mesh "${entry.mesh.name}"`);
    };

    const wipePaintSet = (): void => {
      paintSetRef.current.clear();
      carbonTexRef.current?.dispose();
      carbonTexRef.current = null;
      lastConfigRef.current = null;
      const newSize = paintSetRef.current.size;
      onPaintSetChangeRef.current?.(newSize);
      setPaintSetSize(newSize);
    };

    const saveCarState = (): void => {
      carSavedStatesRef.current.set(currentCarPathRef.current, {
        meshNames: Array.from(paintSetRef.current.values()).map(e => e.mesh.name),
        lastConfig: lastConfigRef.current,
      });
    };

    const clearPaintSet = (): void => {
      for (const uuid of Array.from(paintSetRef.current.keys())) removeFromPaintSet(uuid);
      const newSize = paintSetRef.current.size;
      onPaintSetChangeRef.current?.(newSize);
      setPaintSetSize(newSize);
      saveCarState();
    };

    const applyWrapToPaintSet = (config: WrapConfig): void => {
      if (paintSetRef.current.size === 0) return;
      carbonTexRef.current?.dispose();
      carbonTexRef.current = null;
      const newCarbonTex = config.type === 'carbon' ? makeCarbonFiberTexture() : null;
      if (newCarbonTex) carbonTexRef.current = newCarbonTex;
      for (const [, entry] of paintSetRef.current) {
        const mat = entry.mesh.material as THREE.MeshStandardMaterial;
        mat.map = null;
        switch (config.type) {
          case 'solid':
            mat.color.set(config.color); mat.metalness = 0.0; mat.roughness = 0.85;
            mat.envMapIntensity = 0.3;
            break;
          case 'metallic':
            mat.color.set(config.color); mat.metalness = 0.92; mat.roughness = 0.12;
            mat.envMapIntensity = 2.0;
            break;
          case 'carbon':
            mat.color.set('#111111'); mat.metalness = 0.4; mat.roughness = 0.5;
            mat.envMapIntensity = 0.8;
            mat.map = newCarbonTex!;
            break;
          case 'reset': {
            const o = entry.originalSnapshot;
            mat.color.copy(o.color); mat.metalness = o.metalness;
            mat.roughness = o.roughness; mat.map = o.map;
            mat.envMapIntensity = o.envMapIntensity;
            break;
          }
        }
        mat.needsUpdate = true;
      }
      lastConfigRef.current = config.type === 'reset' ? null : config;
      saveCarState();
    };
    applyWrapRef.current = applyWrapToPaintSet;

    const autoDetectPaintSet = (model: THREE.Group): void => {
      const groups = new Map<string, { meshes: THREE.Mesh[]; volume: number }>();
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const raw = Array.isArray(child.material) ? child.material[0] : child.material;
        const matName = raw.name || `__unnamed_${child.uuid.slice(0, 8)}`;
        const g = groups.get(matName) ?? { meshes: [], volume: 0 };
        const s = new THREE.Box3().setFromObject(child).getSize(new THREE.Vector3());
        g.volume += s.x * s.y * s.z;
        g.meshes.push(child);
        groups.set(matName, g);
      });
      const sorted = Array.from(groups.entries()).sort((a, b) => b[1].volume - a[1].volume);
      console.log('── Material group analysis ──────────────────────────');
      for (const [name, { meshes, volume }] of sorted) {
        const hit = BODY_EXCLUDE.find(kw => name.toLowerCase().includes(kw));
        console.log(`  "${name}"  meshes:${meshes.length}  vol:${volume.toFixed(4)}${hit ? `  ✗ (${hit})` : ''}`);
      }
      const candidates = sorted.filter(([name]) => !BODY_EXCLUDE.some(kw => name.toLowerCase().includes(kw)));
      if (candidates.length === 0) {
        console.warn('[ThreeScene] No candidates passed filter — selecting all meshes');
        model.traverse((child) => { if (child instanceof THREE.Mesh) addToPaintSet(child); });
        console.log('─────────────────────────────────────────────────────');
        return;
      }
      const topVol = candidates[0][1].volume;
      const selected = candidates.filter(([, g]) => g.volume >= topVol * 0.8).slice(0, 3);
      console.log(`── Auto-selected: ${selected.map(([n]) => `"${n}"`).join(', ')}`);
      console.log('─────────────────────────────────────────────────────');
      for (const [, { meshes }] of selected) {
        for (const mesh of meshes) addToPaintSet(mesh);
      }
    };

    const setPickModeActive = (on: boolean): void => {
      pickModeActive = on;
      canvas.style.cursor = on ? 'crosshair' : 'default';
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

    const loadModel = (path: string, onDone?: () => void): void => {
      const token = ++loadToken;
      if (currentModelRef.current) saveCarState();
      wipePaintSet();
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
          let box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          model.scale.setScalar(TARGET_SIZE / Math.max(size.x, size.y, size.z));
          box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const yOffset = -box.min.y;
          model.position.set(-center.x, yOffset, -center.z);
          box = new THREE.Box3().setFromObject(model);
          const fitted = box.getSize(new THREE.Vector3());
          const fov = camera.fov * (Math.PI / 180);
          const camDist = (Math.max(fitted.x, fitted.z) / 2 / Math.tan(fov / 2)) * 1.8;
          camera.position.set(0, fitted.y * 0.8, camDist);
          controls.target.set(0, fitted.y * 0.4, 0);
          controls.update();
          contactShadow.scale.set(fitted.x * 1.15, fitted.z * 1.15, 1);
          contactShadow.position.set((box.max.x + box.min.x) / 2, 0.005, (box.max.z + box.min.z) / 2);
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) child.castShadow = child.receiveShadow = true;
          });
          scene.add(model);
          currentModelRef.current = model;
          const saved = carSavedStatesRef.current.get(path);
          if (saved && saved.meshNames.length > 0) {
            const nameSet = new Set(saved.meshNames);
            model.traverse((child) => {
              if (child instanceof THREE.Mesh && nameSet.has(child.name)) addToPaintSet(child);
            });
            console.log(`[ThreeScene] Restored ${paintSetRef.current.size} mesh(es) for ${path}`);
          } else {
            console.log(`[ThreeScene] Auto-detecting paint set for ${path}`);
            autoDetectPaintSet(model);
          }
          if (saved?.lastConfig && saved.lastConfig.type !== 'reset') {
            applyWrapToPaintSet(saved.lastConfig);
          }
          if (pickModeActive) setPickModeActive(true);
          const finalSize = paintSetRef.current.size;
          onPaintSetChangeRef.current?.(finalSize);
          setPaintSetSize(finalSize);
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
        (xhr) => { if (xhr.total > 0) console.log(`[ThreeScene] ${path} ${Math.round((xhr.loaded / xhr.total) * 100)}%`); },
        (error) => { console.error(`[ThreeScene] Failed: ${path}`, error); if (mounted && token === loadToken) onDone?.(); }
      );
    };
    loadModelRef.current = loadModel;

    let mouseDownX = 0, mouseDownY = 0;
    const onMouseDown = (e: MouseEvent) => { mouseDownX = e.clientX; mouseDownY = e.clientY; };
    const onClick = (e: MouseEvent) => {
      if (!pickModeActive || !currentModelRef.current) return;
      if (Math.hypot(e.clientX - mouseDownX, e.clientY - mouseDownY) > 5) return;
      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, ((e.clientY - rect.top) / rect.height) * -2 + 1),
        camera,
      );
      const meshes: THREE.Mesh[] = [];
      currentModelRef.current.traverse((c) => { if (c instanceof THREE.Mesh) meshes.push(c); });
      const hits = raycaster.intersectObjects(meshes);
      if (hits.length === 0) return;
      const hit = hits[0].object as THREE.Mesh;
      if (paintSetRef.current.has(hit.uuid)) {
        removeFromPaintSet(hit.uuid);
      } else {
        addToPaintSet(hit);
        const mat = hit.material as THREE.MeshStandardMaterial;
        mat.emissive.set(0x1a44cc);
        mat.emissiveIntensity = 0.4;
        mat.needsUpdate = true;
        if (lastConfigRef.current) applyWrapToPaintSet(lastConfigRef.current);
      }
      const newSize = paintSetRef.current.size;
      onPaintSetChangeRef.current?.(newSize);
      setPaintSetSize(newSize);
      saveCarState();
    };
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('click', onClick);

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width < 1 || height < 1) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    });
    observer.observe(canvas);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    setEnvModeActive('garage');
    loadModel('/coupe/911.glb');

    return () => {
      mounted = false;
      loadModelRef.current = applyWrapRef.current = pickModeActionsRef.current = envActionsRef.current = null;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('click', onClick);
      controls.dispose();
      carbonTexRef.current?.dispose();
      disposeEnvMap();
      pmrem.dispose();
      reflector.dispose();
      reflector.geometry.dispose();
      floorMat.dispose();
      floorAlphaMap.dispose();
      floor.geometry.dispose();
      contactShadowTex.dispose();
      contactShadowMat.dispose();
      contactShadow.geometry.dispose();
      renderer.dispose();
      if (currentModelRef.current) disposeModel(currentModelRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
});

ThreeScene.displayName = 'ThreeScene';
export default ThreeScene;
