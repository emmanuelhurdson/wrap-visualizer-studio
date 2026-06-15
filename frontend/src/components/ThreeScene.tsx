import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

// ── Tuning constants ──────────────────────────────────────────────────────────
// Change these to dial the garage look without touching logic.

const TARGET_SIZE             = 4;      // longest car axis is scaled to this (world units)

const BACKGROUND_BLURRINESS   = 0.4;   // [0–1]  how much the HDRI backdrop blurs
const TONE_MAPPING_GARAGE     = 0.85;  // exposure for garage HDRI
const TONE_MAPPING_STUDIO     = 1.0;   // exposure for studio / solid

// Concrete floor opacity above the Reflector:
//   1.0 = fully opaque concrete, no car reflection visible
//   0.0 = fully transparent, perfect mirror
// The radial alphaMap already fades the reflection outward; this scales the peak strength.
// Effective center-reflection strength ≈ (1 - FLOOR_OPACITY_CENTER) × REFLECTOR_BLEND_CENTER
// where REFLECTOR_BLEND_CENTER is the darkest value in the alphaMap (~0.70 = 30% transparent).
// At FLOOR_OPACITY_CENTER = 1.0 the alphaMap alone governs transparency.
const FLOOR_OPACITY_CENTER    = 1.0;  // leave at 1 — alphaMap already targets ~25–30 % at peak

// Reflector color tint: 0x7f7f7f = neutral pass-through, darker = dimmer reflection
const REFLECTOR_TINT          = 0x7f7f7f;

// Contact shadow strength (blob multiplied over floor under the car)
const CONTACT_SHADOW_OPACITY  = 0.55; // [0–1]

// ── Exported types ────────────────────────────────────────────────────────────

export type WrapConfig =
  | { type: 'solid';    color: string }
  | { type: 'metallic'; color: string }
  | { type: 'carbon' }
  | { type: 'reset' };

export type EnvironmentMode = 'garage' | 'studio' | 'solid';

// Result of a 360 turntable capture: a single JPEG sprite sheet plus the grid
// metadata the Sprite360Viewer needs to slice it back into frames.
export type Sprite360Result = {
  dataUrl: string;  // image/jpeg data URL of the full sprite sheet
  frames:  number;  // total angle frames captured
  cols:    number;  // tiles per row
  rows:    number;  // tile rows
  tile:    number;  // pixel size of each square tile
};

export type Sprite360Options = {
  frames?: number;  // angles around the car (default 36 → 10° steps)
  cols?:   number;  // sheet columns (default 6)
  tile?:   number;  // square tile size in px (default 320)
};

export type ThreeSceneHandle = {
  applyWrap:       (config: WrapConfig) => void;
  loadCar:         (path: string, onDone?: () => void) => void;
  setPickMode:     (on: boolean) => void;
  clearPaintSet:   () => void;
  setEnvironment:  (env: EnvironmentMode) => void;
  captureSprite360: (opts?: Sprite360Options) => Sprite360Result | null;
};

// ── Internal types ────────────────────────────────────────────────────────────

type OriginalMatSnapshot = {
  color:             THREE.Color;
  metalness:         number;
  roughness:         number;
  map:               THREE.Texture | null;
  emissive:          THREE.Color;
  emissiveIntensity: number;
  envMapIntensity:   number;
};

type PaintEntry = { mesh: THREE.Mesh; originalSnapshot: OriginalMatSnapshot };

type CarSavedState = { meshNames: string[]; lastConfig: WrapConfig | null };

export interface ThreeSceneProps {
  onPaintSetChange?: (count: number) => void;
}

// ── Module-level helpers ──────────────────────────────────────────────────────

const BODY_EXCLUDE = [
  'wheel', 'tire', 'tyre', 'rubber', 'brake', 'caliper', 'rotor',
  'glass', 'window', 'windshield', 'windscreen',
  'chrome', 'mirror', 'light', 'lamp', 'headlight', 'taillight',
  'disk', 'disc', 'exhaust', 'pipe', 'muffler',
  'badge', 'logo', 'emblem', 'decal', 'plate', 'number',
  'shadow', 'floor', 'ground', 'carpet',
  // interior geometry — mesh names, material names, and parent-node names are all checked
  'interior', 'inner', 'inside', 'seat', 'dash', 'dashboard',
  'cabin', 'cockpit', 'steer', 'steering', 'pedal', 'console',
  'gauges', 'cluster', 'headrest', 'seatbelt', 'armrest',
  'door_int', 'inner_door', 'door_panel',
  'underbody', 'frame', 'chassis',
  'headliner', 'lining',
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

// Samples up to maxSamples vertex normals (world space) and checks what fraction
// point AWAY from carCenter. Ratio ≥ threshold → exterior surface; below → interior.
// Threshold of 0.40 is conservative: only meshes where fewer than 40 % of normals
// face outward (seats, dashboards, door liners, …) get excluded.
const OUTWARD_RATIO_THRESHOLD = 0.40;

function isOutwardFacingMesh(mesh: THREE.Mesh, carCenter: THREE.Vector3, maxSamples = 200): boolean {
  const posAttr  = mesh.geometry.attributes.position;
  const normAttr = mesh.geometry.attributes.normal;
  if (!posAttr || !normAttr) return true;

  const wp   = new THREE.Vector3();
  const wn   = new THREE.Vector3();
  const toC  = new THREE.Vector3();
  const step = Math.max(1, Math.floor(posAttr.count / maxSamples));
  let outward = 0, total = 0;

  for (let i = 0; i < posAttr.count; i += step) {
    wp.fromBufferAttribute(posAttr, i).applyMatrix4(mesh.matrixWorld);
    wn.fromBufferAttribute(normAttr, i).transformDirection(mesh.matrixWorld).normalize();
    toC.subVectors(carCenter, wp).normalize();
    if (wn.dot(toC) < 0) outward++;
    total++;
  }

  return total === 0 || (outward / total) >= OUTWARD_RATIO_THRESHOLD;
}

// Radial gradient used as alphaMap on the concrete floor.
// Black center → concrete transparent → Reflector shows through (~30 %).
// White edges  → concrete fully opaque → Reflector hidden.
// This produces the "reflection fades with distance" effect without any shader work.
function makeFloorAlphaMap(): THREE.CanvasTexture {
  const SIZE = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = SIZE;
  const ctx = cv.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Gradient covers roughly the Reflector footprint (16 ÷ 40 = 0.4 of floor width)
  const r = SIZE * 0.40;
  const cx = SIZE / 2, cy = SIZE / 2;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0.00, '#b3b3b3'); // center:      0.70 alpha → 30 % transparent
  g.addColorStop(0.40, '#cccccc'); // inner zone:  0.80 alpha → 20 % transparent
  g.addColorStop(0.75, '#e6e6e6'); // outer zone:  0.90 alpha → 10 % transparent
  g.addColorStop(1.00, '#ffffff'); // at r:         1.00 alpha → 0 % transparent

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);

  return new THREE.CanvasTexture(cv);
}

// Radial gradient "shadow blob" painted directly under the car.
// Used with MultiplyBlending so it darkens the floor without needing a dedicated shadow map.
function makeContactShadowTexture(): THREE.CanvasTexture {
  const SIZE = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = SIZE;
  const ctx = cv.getContext('2d')!;

  ctx.clearRect(0, 0, SIZE, SIZE);

  const cx = SIZE / 2, cy = SIZE / 2;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, SIZE / 2);
  g.addColorStop(0.00, `rgba(0,0,0,${CONTACT_SHADOW_OPACITY})`);  // darkest at chassis
  g.addColorStop(0.25, `rgba(0,0,0,${CONTACT_SHADOW_OPACITY * 0.65})`);
  g.addColorStop(0.55, `rgba(0,0,0,${CONTACT_SHADOW_OPACITY * 0.3})`);
  g.addColorStop(1.00, 'rgba(0,0,0,0)');                           // transparent at edge

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);

  return new THREE.CanvasTexture(cv);
}

// ── Component ─────────────────────────────────────────────────────────────────

const ThreeScene = forwardRef<ThreeSceneHandle, ThreeSceneProps>(({ onPaintSetChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const paintSetRef        = useRef<Map<string, PaintEntry>>(new Map());
  const carbonTexRef       = useRef<THREE.CanvasTexture | null>(null);
  const lastConfigRef      = useRef<WrapConfig | null>(null);
  const currentCarPathRef  = useRef('/coupe/911.glb');
  const carSavedStatesRef  = useRef<Map<string, CarSavedState>>(new Map());
  const currentModelRef    = useRef<THREE.Group | null>(null);

  const onPaintSetChangeRef = useRef(onPaintSetChange);
  onPaintSetChangeRef.current = onPaintSetChange;

  const loadModelRef       = useRef<((path: string, onDone?: () => void) => void) | null>(null);
  const applyWrapRef       = useRef<((config: WrapConfig) => void) | null>(null);
  const pickModeActionsRef = useRef<{ setPickMode: (on: boolean) => void; clearPaintSet: () => void } | null>(null);
  const envActionsRef      = useRef<{ setEnvironment: (env: EnvironmentMode) => void } | null>(null);
  const captureRef         = useRef<((opts?: Sprite360Options) => Sprite360Result | null) | null>(null);

  // ── Imperative handle ──────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    applyWrap:        (cfg)        => applyWrapRef.current?.(cfg),
    loadCar:          (path, done) => loadModelRef.current?.(path, done),
    setPickMode:      (on)         => pickModeActionsRef.current?.setPickMode(on),
    clearPaintSet:    ()           => pickModeActionsRef.current?.clearPaintSet(),
    setEnvironment:   (env)        => envActionsRef.current?.setEnvironment(env),
    captureSprite360: (opts)       => captureRef.current?.(opts) ?? null,
  }), []);

  // ── Three.js setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    let mounted        = true;
    let loadToken      = 0;
    let envToken       = 0;
    let pickModeActive = false;

    let currentEnvMap: THREE.Texture | null          = null;
    let currentEnvRT:  THREE.WebGLRenderTarget | null = null;

    // ── Renderer ──────────────────────────────────────────────────────────────
    // preserveDrawingBuffer keeps the WebGL backbuffer readable after render so
    // captureSprite360 can drawImage() the canvas into a 2D sprite sheet.
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = TONE_MAPPING_GARAGE;

    // ── PMREM generator ────────────────────────────────────────────────────────
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();

    // ── Scene ─────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // placeholder until HDRI loads

    // ── Camera ────────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      60,
      (canvas.clientWidth || window.innerWidth) / (canvas.clientHeight || window.innerHeight),
      0.1, 200,
    );

    // ── Lights ────────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffe8cc, 0.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e0, 1.4);
    keyLight.position.set(6, 10, 6);
    keyLight.castShadow = true;
    keyLight.shadow.camera.near = 0.1; keyLight.shadow.camera.far  = 50;
    keyLight.shadow.camera.left = -8;  keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top  =  8;  keyLight.shadow.camera.bottom = -8;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias       = -0.0005;
    keyLight.shadow.normalBias =  0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffd8aa, 0.4);
    fillLight.position.set(-6, 4, -4);
    scene.add(fillLight);

    // Warm ceiling spot — only active in Garage mode
    const garageSpot = new THREE.SpotLight(0xfff0cc, 4.0);
    garageSpot.position.set(0, 6, 1);
    garageSpot.angle    = Math.PI / 5;
    garageSpot.penumbra = 0.5;
    garageSpot.decay    = 1.5;
    garageSpot.distance = 15;
    garageSpot.castShadow = true;
    garageSpot.shadow.mapSize.set(1024, 1024);
    garageSpot.shadow.bias = -0.001;
    garageSpot.visible = false;
    scene.add(garageSpot);
    scene.add(garageSpot.target);

    // ── Floor ─────────────────────────────────────────────────────────────────
    // Layer 0 (y = 0):     Reflector — actual planar car reflection
    // Layer 1 (y = 0.001): Concrete MeshStandardMaterial — shadow reception,
    //                       HDRI reflections, radial alphaMap for fade effect
    // Layer 2 (y = 0.005): Contact shadow blob — grounding darkening

    const floorAlphaMap = makeFloorAlphaMap();

    // The Reflector covers the car zone; the concrete floor extends further.
    const reflector = new Reflector(new THREE.PlaneGeometry(16, 16), {
      color:        new THREE.Color(REFLECTOR_TINT),
      textureWidth:  512,
      textureHeight: 512,
      clipBias:      0.003,
      multisample:   4,
    });
    reflector.rotation.x = -Math.PI / 2;
    reflector.position.y = 0;
    scene.add(reflector);

    const floorMat = new THREE.MeshStandardMaterial({
      color:       new THREE.Color(0x1a1a1a),
      roughness:   0.25,
      metalness:   0.18,
      transparent: true,
      opacity:     FLOOR_OPACITY_CENTER,
      alphaMap:    floorAlphaMap,
      // polygonOffset pushes the concrete slightly toward the camera in depth so it
      // doesn't z-fight with the Reflector sitting at the exact same y position.
      polygonOffset:       true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits:  -1,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat);
    floor.rotation.x  = -Math.PI / 2;
    floor.position.y  =  0.001;
    floor.receiveShadow = true;
    scene.add(floor);

    // Contact shadow blob: a radial gradient painted under the car using
    // MultiplyBlending to darken the floor without any shadow-map overhead.
    const contactShadowTex = makeContactShadowTexture();
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map:        contactShadowTex,
      transparent: true,
      depthWrite:  false,
      depthTest:   true,
      blending:    THREE.MultiplyBlending,
    });
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1), // scaled per car in loadModel
      contactShadowMat,
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y =  0.005;
    contactShadow.renderOrder = 1;
    scene.add(contactShadow);

    // ── OrbitControls ─────────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance   = 2;
    controls.maxDistance   = 20;

    const loader    = new GLTFLoader();
    const raycaster = new THREE.Raycaster();

    // ── Env-map helpers ───────────────────────────────────────────────────────

    const disposeEnvMap = (): void => {
      scene.environment = null;
      scene.background  = null;
      if (currentEnvMap) { currentEnvMap.dispose(); currentEnvMap = null; }
      if (currentEnvRT)  { currentEnvRT.dispose();  currentEnvRT  = null; }
    };

    // ── Environment switching ─────────────────────────────────────────────────

    const setEnvModeActive = (mode: EnvironmentMode): void => {
      const token = ++envToken;

      disposeEnvMap();
      scene.background = new THREE.Color(0x1a1a1a);
      scene.backgroundBlurriness = 0;

      switch (mode) {
        case 'garage': {
          renderer.toneMappingExposure = TONE_MAPPING_GARAGE;
          ambientLight.color.set(0xffe8cc); ambientLight.intensity = 0.35;
          keyLight.color.set(0xfff4e0);     keyLight.intensity = 1.4;
          fillLight.color.set(0xffd8aa);    fillLight.intensity = 0.4;
          garageSpot.visible = true;

          floorMat.color.set(0x1a1a1a); floorMat.roughness = 0.25; floorMat.metalness = 0.18;
          floorMat.transparent = true;   floorMat.opacity = FLOOR_OPACITY_CENTER;
          floorMat.needsUpdate = true;
          reflector.visible = true;

          new RGBELoader().load(
            '/hdri/garage.hdr',
            (hdrTex) => {
              if (!mounted || token !== envToken) { hdrTex.dispose(); return; }
              const rt     = pmrem.fromEquirectangular(hdrTex);
              hdrTex.dispose();
              currentEnvMap = rt.texture;
              currentEnvRT  = rt;
              scene.environment = rt.texture;
              scene.background  = rt.texture;
              scene.backgroundBlurriness = BACKGROUND_BLURRINESS;
            },
            undefined,
            () => {
              if (!mounted || token !== envToken) return;
              console.warn(
                '[ThreeScene] /hdri/garage.hdr not found. ' +
                'Place a garage HDR at frontend/public/hdri/garage.hdr. ' +
                'Free source: Poly Haven → search "garage" or "workshop".',
              );
              scene.background = new THREE.Color(0x1a1818);
            },
          );
          break;
        }

        case 'studio': {
          renderer.toneMappingExposure = TONE_MAPPING_STUDIO;
          ambientLight.color.set(0xf0f4ff); ambientLight.intensity = 0.6;
          keyLight.color.set(0xf5f5ff);     keyLight.intensity = 2.0;
          fillLight.color.set(0xffffff);    fillLight.intensity = 0.6;
          garageSpot.visible = false;

          floorMat.color.set(0x2a2a2a); floorMat.roughness = 0.40; floorMat.metalness = 0.05;
          floorMat.transparent = true;   floorMat.opacity = FLOOR_OPACITY_CENTER;
          floorMat.needsUpdate = true;
          reflector.visible = true;

          const roomEnv = new RoomEnvironment();
          const rt      = pmrem.fromScene(roomEnv, 0.04);
          roomEnv.dispose();
          currentEnvMap     = rt.texture;
          currentEnvRT      = rt;
          scene.environment = rt.texture;
          scene.background  = new THREE.Color(0x2a2a2a);
          break;
        }

        case 'solid': {
          renderer.toneMappingExposure = TONE_MAPPING_STUDIO;
          ambientLight.color.set(0xffffff); ambientLight.intensity = 0.5;
          keyLight.color.set(0xffffff);     keyLight.intensity = 2.0;
          fillLight.color.set(0xffffff);    fillLight.intensity = 0.5;
          garageSpot.visible = false;

          // Fully opaque in solid mode — reflector hidden, no transparent bleed
          floorMat.color.set(0x111111); floorMat.roughness = 0.85; floorMat.metalness = 0;
          floorMat.transparent = false;  floorMat.opacity = 1.0;
          floorMat.needsUpdate = true;
          reflector.visible = false;

          scene.environment = null;
          scene.background  = new THREE.Color(0x0f0f0f);
          break;
        }
      }
    };

    envActionsRef.current = { setEnvironment: setEnvModeActive };

    // ── Paint-set helpers ─────────────────────────────────────────────────────

    const addToPaintSet = (mesh: THREE.Mesh): void => {
      if (paintSetRef.current.has(mesh.uuid)) return;
      const raw    = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const cloned = (raw as THREE.MeshStandardMaterial).clone();
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
          envMapIntensity:   cloned.envMapIntensity,
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
      mat.envMapIntensity   = o.envMapIntensity;
      mat.needsUpdate       = true;
      paintSetRef.current.delete(uuid);
    };

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

    // ── Wrap application ──────────────────────────────────────────────────────

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
            mat.color.set(config.color); mat.metalness = 0.0;  mat.roughness = 0.85;
            mat.envMapIntensity = 0.3;  // matte — minimal reflections
            break;
          case 'metallic':
            mat.color.set(config.color); mat.metalness = 0.92; mat.roughness = 0.12;
            mat.envMapIntensity = 2.0;  // chrome — strong env reflections
            break;
          case 'carbon':
            mat.color.set('#111111');   mat.metalness = 0.4;  mat.roughness = 0.5;
            mat.envMapIntensity = 0.8;  // semi-gloss
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

    // ── Auto-detection ────────────────────────────────────────────────────────

    const autoDetectPaintSet = (model: THREE.Group): void => {
      model.updateMatrixWorld(true);
      const carBBox   = new THREE.Box3().setFromObject(model);
      const carCenter = carBBox.getCenter(new THREE.Vector3());

      type Group = { meshes: THREE.Mesh[]; volume: number; hasAlbedoTex: boolean };
      const groups = new Map<string, Group>();

      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const raw     = (Array.isArray(child.material) ? child.material[0] : child.material) as THREE.MeshStandardMaterial;
        const matName = raw.name || `__unnamed_${child.uuid.slice(0, 8)}`;
        const g       = groups.get(matName) ?? { meshes: [], volume: 0, hasAlbedoTex: false };
        const s       = new THREE.Box3().setFromObject(child).getSize(new THREE.Vector3());
        g.volume += s.x * s.y * s.z;
        g.meshes.push(child);
        // Albedo texture = interior fabric/leather; exterior car paint is textureless.
        if (raw.map) g.hasAlbedoTex = true;
        groups.set(matName, g);
      });

      const sorted = Array.from(groups.entries()).sort((a, b) => b[1].volume - a[1].volume);

      // Checks the mesh's OWN name AND its per-mesh material name against the exclude list.
      // This is separate from the group-level material-name check and the hierarchy walk.
      const meshDirectHit = (mesh: THREE.Mesh): string | undefined => {
        const meshN = mesh.name.toLowerCase();
        const mat   = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        const matN  = (mat as THREE.MeshStandardMaterial).name.toLowerCase();
        return BODY_EXCLUDE.find(kw => meshN.includes(kw) || matN.includes(kw));
      };

      // Walks the full parent-node chain (mesh name + every ancestor's name).
      const isExcludedByHierarchy = (mesh: THREE.Mesh): boolean => {
        let node: THREE.Object3D | null = mesh;
        while (node) {
          if (BODY_EXCLUDE.some(kw => node!.name.toLowerCase().includes(kw))) return true;
          node = node.parent;
        }
        return false;
      };

      console.log('── Material group analysis ──────────────────────────');
      for (const [matName, { meshes, volume, hasAlbedoTex }] of sorted) {
        const matHit   = BODY_EXCLUDE.find(kw => matName.toLowerCase().includes(kw));
        const meshHit  = meshes.map(meshDirectHit).find(Boolean);   // first mesh-name hit
        const hierHit  = !matHit && !meshHit && meshes.some(isExcludedByHierarchy);
        const names    = meshes.map(m => `"${m.name}"`).join(', ');
        console.log(
          `  mat:"${matName}"  meshes:[${names}]  vol:${volume.toFixed(2)}` +
          (hasAlbedoTex ? '  [tex]'                    : '') +
          (matHit       ? `  ✗ mat(${matHit})`         : '') +
          (meshHit      ? `  ✗ mesh(${meshHit})`       : '') +
          (hierHit      ? '  ✗ hier'                   : ''),
        );
      }

      // A group is a body-paint candidate if ALL of:
      //   • Material name has no excluded keyword
      //   • No mesh in the group has an excluded name or per-mesh material name
      //   • No mesh has an ancestor node with an excluded name
      //   • No mesh uses a diffuse (albedo) texture — car paint is plain colour;
      //     interior fabric/leather always has a texture map
      const isBodyCandidate = ([name, g]: [string, Group]) =>
        !BODY_EXCLUDE.some(kw => name.toLowerCase().includes(kw)) &&
        !g.meshes.some(m => meshDirectHit(m) !== undefined) &&
        !g.meshes.some(isExcludedByHierarchy) &&
        !g.hasAlbedoTex;

      let candidates = sorted.filter(isBodyCandidate);

      // Fallback: all groups have albedo textures (uncommon — some exports bake paint).
      // Relax the texture filter but keep all name/hierarchy filters.
      if (candidates.length === 0) {
        candidates = sorted.filter(([name, g]) =>
          !BODY_EXCLUDE.some(kw => name.toLowerCase().includes(kw)) &&
          !g.meshes.some(m => meshDirectHit(m) !== undefined) &&
          !g.meshes.some(isExcludedByHierarchy),
        );
        if (candidates.length > 0) {
          console.log('[ThreeScene] All groups have textures — relaxed texture filter (fallback)');
        }
      }

      if (candidates.length === 0) {
        console.warn('[ThreeScene] No candidates passed filter — applying name-filtered fallback');
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          const meshN = child.name.toLowerCase();
          const mat   = (Array.isArray(child.material) ? child.material[0] : child.material) as THREE.MeshStandardMaterial;
          const matN  = mat.name.toLowerCase();
          if (BODY_EXCLUDE.some(kw => meshN.includes(kw) || matN.includes(kw))) return;
          let node: THREE.Object3D | null = child;
          while (node) {
            if (BODY_EXCLUDE.some(kw => node!.name.toLowerCase().includes(kw))) return;
            node = node.parent;
          }
          if (isOutwardFacingMesh(child, carCenter)) addToPaintSet(child);
        });
        console.log('─────────────────────────────────────────────────────');
        return;
      }

      // Take groups within 85 % of the largest volume, capped at 2 groups.
      const topVol   = candidates[0][1].volume;
      const selected = candidates.filter(([, g]) => g.volume >= topVol * 0.85).slice(0, 2);

      // ── Merged-mesh heuristic ────────────────────────────────────────────────
      // If the model has NO separately-named interior meshes, body+interior may be
      // merged into one object. Flag any selected mesh whose bounding volume
      // exceeds 55 % of the whole model's bounding volume as a likely merged mesh.
      const INTERIOR_KWS = [
        'interior', 'seat', 'dash', 'cabin', 'cockpit', 'carpet', 'headrest',
      ];
      let modelHasInteriorMeshes = false;
      model.traverse((c) => {
        if (!(c instanceof THREE.Mesh) || modelHasInteriorMeshes) return;
        const n  = c.name.toLowerCase();
        const mn = ((Array.isArray(c.material) ? c.material[0] : c.material) as THREE.MeshStandardMaterial).name.toLowerCase();
        if (INTERIOR_KWS.some(kw => n.includes(kw) || mn.includes(kw))) modelHasInteriorMeshes = true;
      });

      if (!modelHasInteriorMeshes) {
        const modelBbox = new THREE.Box3().setFromObject(model);
        const ms        = modelBbox.getSize(new THREE.Vector3());
        const modelVol  = ms.x * ms.y * ms.z;
        for (const [, { meshes }] of selected) {
          for (const mesh of meshes) {
            const mb  = new THREE.Box3().setFromObject(mesh);
            const mbs = mb.getSize(new THREE.Vector3());
            const ratio = modelVol > 0 ? (mbs.x * mbs.y * mbs.z) / modelVol : 0;
            if (ratio > 0.55) {
              console.warn(
                `%c[ThreeScene] ⚠ MERGED MESH: "${mesh.name}" ` +
                `(mat:"${(mesh.material as THREE.MeshStandardMaterial).name}") ` +
                `covers ${(ratio * 100).toFixed(0)}% of model bbox — no separate interior meshes found.\n` +
                `  If interior surfaces bleed color this GLB merges body+interior geometry. Fix: separate in Blender.`,
                'color:#f97316;font-weight:bold',
              );
            }
          }
        }
      }
      // ────────────────────────────────────────────────────────────────────────

      console.log(`── Auto-selected: ${selected.map(([n]) => `"${n}"`).join(', ')}`);
      console.log('─────────────────────────────────────────────────────');

      for (const [, { meshes }] of selected) {
        for (const mesh of meshes) {
          if (isOutwardFacingMesh(mesh, carCenter)) {
            addToPaintSet(mesh);
          } else {
            console.log(`  [ThreeScene] normal-check excluded "${mesh.name}" (mat:"${(mesh.material as THREE.MeshStandardMaterial).name}") — interior-facing normals`);
          }
        }
      }
    };

    // ── Pick-mode ─────────────────────────────────────────────────────────────

    const setPickModeActive = (on: boolean): void => {
      pickModeActive      = on;
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

    // ── Model loading ─────────────────────────────────────────────────────────

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

          // ── Scale to TARGET_SIZE ─────────────────────────────────────────────
          let box  = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          model.scale.setScalar(TARGET_SIZE / Math.max(size.x, size.y, size.z));

          // ── Ground the car: move lowest bounding-box point to y = 0 ──────────
          box = new THREE.Box3().setFromObject(model);
          const center  = box.getCenter(new THREE.Vector3());
          const yOffset = -box.min.y;
          model.position.set(-center.x, yOffset, -center.z);

          console.log(
            `[ThreeScene] ${path} — grounding Y offset: ${yOffset.toFixed(4)} ` +
            `(box.min.y was ${box.min.y.toFixed(4)}, tires now at y=0)`,
          );

          // ── Recompute world box for camera fit + shadow blob sizing ──────────
          box = new THREE.Box3().setFromObject(model);
          const fitted  = box.getSize(new THREE.Vector3());

          const fov     = camera.fov * (Math.PI / 180);
          const camDist = (Math.max(fitted.x, fitted.z) / 2 / Math.tan(fov / 2)) * 1.8;
          camera.position.set(0, fitted.y * 0.8, camDist);
          controls.target.set(0, fitted.y * 0.4, 0);
          controls.update();

          // ── Contact shadow blob: fit to car footprint ───────────────────────
          // 1.15× gives a slight "halo" beyond the tire edges.
          contactShadow.scale.set(fitted.x * 1.15, fitted.z * 1.15, 1);
          contactShadow.position.set(
            (box.max.x + box.min.x) / 2,
            0.005,
            (box.max.z + box.min.z) / 2,
          );

          // ── Shadows ──────────────────────────────────────────────────────────
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) child.castShadow = child.receiveShadow = true;
          });

          scene.add(model);
          currentModelRef.current = model;

          // ── Restore or auto-detect paint set ─────────────────────────────────
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

          onPaintSetChangeRef.current?.(paintSetRef.current.size);

          // ── Selected-mesh diagnostic (world-space bbox + material isolation) ──
          if (paintSetRef.current.size > 0) {
            console.groupCollapsed(
              `%c[ThreeScene] ${paintSetRef.current.size} wrap target(s) — world bbox`,
              'color:#60a5fa;font-weight:700',
            );
            for (const [, entry] of paintSetRef.current) {
              const m   = entry.mesh;
              const mat = m.material as THREE.MeshStandardMaterial;
              const b   = new THREE.Box3().setFromObject(m);
              const sz  = b.getSize(new THREE.Vector3());
              const ct  = b.getCenter(new THREE.Vector3());
              console.log(
                `  mesh:"${m.name}"  mat:"${mat.name}" [own clone ✓]` +
                `  centre(${ct.x.toFixed(2)}, ${ct.y.toFixed(2)}, ${ct.z.toFixed(2)})` +
                `  size(${sz.x.toFixed(2)} × ${sz.y.toFixed(2)} × ${sz.z.toFixed(2)})`,
              );
            }
            console.groupEnd();
          }

          // ── Full mesh inventory ──────────────────────────────────────────────
          // Shows every mesh in the loaded model; ✓ means it is a wrap target.
          console.log('── Mesh inventory ───────────────────────────────────');
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const matName = Array.isArray(child.material)
                ? child.material.map(m => m.name).join(', ')
                : (child.material as THREE.Material).name;
              const tag = paintSetRef.current.has(child.uuid) ? '  ✓ wrap target' : '';
              console.log(`  mesh:"${child.name}"  mat:"${matName}"${tag}`);
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

    // ── 360 turntable capture ───────────────────────────────────────────────────
    // Orbits the camera a full circle around the current target, rendering each
    // angle into one square tile of a JPEG sprite sheet. The current camera
    // elevation and distance are preserved, then fully restored afterwards, so the
    // live view is unchanged once capture finishes.

    const captureSprite360 = (opts?: Sprite360Options): Sprite360Result | null => {
      if (!currentModelRef.current) return null;

      const frames = Math.max(1, opts?.frames ?? 36);
      const cols   = Math.max(1, opts?.cols   ?? 6);
      const tile   = Math.max(16, opts?.tile  ?? 320);
      const rows   = Math.ceil(frames / cols);

      // Snapshot live renderer/camera/controls state so we can restore it.
      const prevSize   = renderer.getSize(new THREE.Vector2());
      const prevPixel  = renderer.getPixelRatio();
      const prevAspect = camera.aspect;
      const prevCamPos = camera.position.clone();
      const prevTarget = controls.target.clone();

      // Build the 2D sprite sheet canvas.
      const sheet = document.createElement('canvas');
      sheet.width  = cols * tile;
      sheet.height = rows * tile;
      const sctx = sheet.getContext('2d')!;
      sctx.fillStyle = '#1a1a1a';
      sctx.fillRect(0, 0, sheet.width, sheet.height);

      // Render square tiles at 1:1 pixel ratio for crisp, undistorted frames.
      renderer.setPixelRatio(1);
      renderer.setSize(tile, tile, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();

      // Decompose the current camera offset into a horizontal radius + fixed
      // height, so every captured frame keeps the same pitch as the live view.
      const target  = prevTarget.clone();
      const offset  = prevCamPos.clone().sub(target);
      const radius  = offset.length() || 1;
      const yHeight = offset.y;
      const horiz   = Math.sqrt(Math.max(0, radius * radius - yHeight * yHeight));
      const startTheta = Math.atan2(offset.x, offset.z);

      for (let i = 0; i < frames; i++) {
        const theta = startTheta + (i / frames) * Math.PI * 2;
        camera.position.set(
          target.x + horiz * Math.sin(theta),
          target.y + yHeight,
          target.z + horiz * Math.cos(theta),
        );
        camera.lookAt(target);
        renderer.render(scene, camera);

        const col = i % cols;
        const row = Math.floor(i / cols);
        sctx.drawImage(renderer.domElement, col * tile, row * tile, tile, tile);
      }

      // Restore the live view exactly as it was.
      renderer.setPixelRatio(prevPixel);
      renderer.setSize(prevSize.x, prevSize.y, false);
      camera.aspect = prevAspect;
      camera.updateProjectionMatrix();
      camera.position.copy(prevCamPos);
      controls.target.copy(prevTarget);
      controls.update();
      renderer.render(scene, camera);

      return { dataUrl: sheet.toDataURL('image/jpeg', 0.9), frames, cols, rows, tile };
    };

    captureRef.current = captureSprite360;

    // ── Click-to-paint ────────────────────────────────────────────────────────

    let mouseDownX = 0, mouseDownY = 0;

    const onMouseDown = (e: MouseEvent) => { mouseDownX = e.clientX; mouseDownY = e.clientY; };

    const onClick = (e: MouseEvent) => {
      if (!pickModeActive || !currentModelRef.current) return;
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
        removeFromPaintSet(hit.uuid);
      } else {
        addToPaintSet(hit);
        const mat = hit.material as THREE.MeshStandardMaterial;
        mat.emissive.set(0x1a44cc);
        mat.emissiveIntensity = 0.4;
        mat.needsUpdate = true;
        if (lastConfigRef.current) applyWrapToPaintSet(lastConfigRef.current);
      }

      onPaintSetChangeRef.current?.(paintSetRef.current.size);
      saveCarState();
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('click', onClick);

    // ── Resize + animate ──────────────────────────────────────────────────────

    // ResizeObserver makes the canvas size-aware of its CSS container so ThreeScene
    // works both full-page (ThreeDemo, height:100vh) and embedded (Visualizer, fixed-height div).
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

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      mounted = false;
      loadModelRef.current = applyWrapRef.current = pickModeActionsRef.current = envActionsRef.current = captureRef.current = null;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('click', onClick);
      controls.dispose();
      carbonTexRef.current?.dispose();
      disposeEnvMap();
      pmrem.dispose();
      // Floor resources
      reflector.dispose();        // disposes render target + material
      reflector.geometry.dispose();
      floorMat.dispose();
      floorAlphaMap.dispose();
      floor.geometry.dispose();
      // Contact shadow resources
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
