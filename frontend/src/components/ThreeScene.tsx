import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const TARGET_SIZE = 4;

// ── Shared types ──────────────────────────────────────────────────────────────
// WrapConfig is the contract between the React UI and the Three.js scene.
// Discriminated union: each type carries exactly the data it needs.
export type WrapConfig =
  | { type: 'solid';    color: string }  // hex color string, matte finish
  | { type: 'metallic'; color: string }  // hex color string, metallic finish
  | { type: 'carbon' }                   // no color — texture drives the look
  | { type: 'reset' };                   // restore original GLB material values

// What the parent gets back when it holds a ref to <ThreeScene>
export type ThreeSceneHandle = {
  applyWrap: (config: WrapConfig) => void;
};

// ── Carbon fiber texture (procedural, no external file needed) ────────────────
// Draws a 256×256 woven grid onto an off-screen canvas, then wraps it as a
// tiled Three.js texture. Every 16×16 cell alternates horizontal/vertical
// gradient to simulate woven fiber bundles.
function makeCarbonFiberTexture(): THREE.CanvasTexture {
  const SIZE = 256;
  const CELL = 16;
  const cv = document.createElement('canvas');
  cv.width = SIZE;
  cv.height = SIZE;
  const ctx = cv.getContext('2d')!;

  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, SIZE, SIZE);

  for (let r = 0; r < SIZE / CELL; r++) {
    for (let c = 0; c < SIZE / CELL; c++) {
      const x = c * CELL;
      const y = r * CELL;
      const horizontal = (r + c) % 2 === 0;

      // Gradient direction alternates to mimic the weave
      const grad = ctx.createLinearGradient(
        x, y,
        horizontal ? x + CELL : x,
        horizontal ? y : y + CELL,
      );
      grad.addColorStop(0.00, '#1c1c1c');
      grad.addColorStop(0.35, '#313131');
      grad.addColorStop(0.50, '#161616');
      grad.addColorStop(0.65, '#313131');
      grad.addColorStop(1.00, '#1c1c1c');

      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);

      // Faint gloss strip on the top third of each cell
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(x + 1, y + 1, CELL - 2, Math.floor(CELL / 3));
    }
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8); // tile many times so the weave looks fine-grained on a car
  return tex;
}

// ── Saved snapshot of the original body material ──────────────────────────────
// We store only the properties we'll modify so we can restore them on reset.
// Storing the full material clone would work too, but this is lighter.
type OriginalMatSnapshot = {
  color:     THREE.Color;
  metalness: number;
  roughness: number;
  map:       THREE.Texture | null;
};

// ── Component ─────────────────────────────────────────────────────────────────
const ThreeScene = forwardRef<ThreeSceneHandle, object>((_, ref) => {
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  // Persists across renders; populated once the GLB finishes loading
  const bodyMeshRef     = useRef<THREE.Mesh | null>(null);
  const originalMatRef  = useRef<OriginalMatSnapshot | null>(null);
  const carbonTexRef    = useRef<THREE.CanvasTexture | null>(null);

  // ── Imperative API exposed to the parent via ref ──────────────────────────
  // The parent never touches Three.js internals — it only calls applyWrap().
  useImperativeHandle(ref, () => ({
    applyWrap(config: WrapConfig) {
      const mesh = bodyMeshRef.current;
      if (!mesh) return; // model not loaded yet — silently ignore

      // Materials from GLB files are often shared across meshes.
      // We cloned the body material during load (see onLoad below) so mutating
      // it here won't affect other meshes that originally shared the same material.
      const mat = mesh.material as THREE.MeshStandardMaterial;

      // Dispose and detach the carbon texture before every switch so we don't
      // leak GPU memory when the user cycles between wraps.
      if (carbonTexRef.current) {
        carbonTexRef.current.dispose();
        carbonTexRef.current = null;
      }
      mat.map = null; // always clear the map slot first

      switch (config.type) {
        case 'solid':
          // Matte: minimal reflectivity, high diffuse roughness
          mat.color.set(config.color);
          mat.metalness = 0.0;
          mat.roughness = 0.85;
          break;

        case 'metallic':
          // Metallic: near-mirror reflectivity, very smooth surface
          mat.color.set(config.color);
          mat.metalness = 0.92;
          mat.roughness = 0.12;
          break;

        case 'carbon':
          // Carbon fiber: dark base + woven texture, mid metalness/roughness
          mat.color.set('#111111');
          mat.metalness = 0.4;
          mat.roughness = 0.5;
          carbonTexRef.current = makeCarbonFiberTexture();
          mat.map = carbonTexRef.current;
          break;

        case 'reset':
          if (originalMatRef.current) {
            const o = originalMatRef.current;
            mat.color.copy(o.color);
            mat.metalness = o.metalness;
            mat.roughness = o.roughness;
            mat.map       = o.map;
          }
          break;
      }

      mat.needsUpdate = true; // tells Three.js to re-upload material data to the GPU
    },
  }), []);

  // ── Three.js scene setup ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    let mounted  = true;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f0f);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      200,
    );
    camera.position.set(0, 2, 7);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(6, 10, 6);
    keyLight.castShadow = true;
    keyLight.shadow.camera.near   = 0.1;
    keyLight.shadow.camera.far    = 50;
    keyLight.shadow.camera.left   = -10;
    keyLight.shadow.camera.right  = 10;
    keyLight.shadow.camera.top    = 10;
    keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.mapSize.set(2048, 2048);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-6, 4, -4);
    scene.add(fillLight);

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(grid);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.05;
    controls.minDistance    = 2;
    controls.maxDistance    = 20;
    controls.target.set(0, 0.8, 0);

    // GLTFLoader
    const loader = new GLTFLoader();
    loader.load(
      '/models/car.glb',

      (gltf) => {
        if (!mounted) return;

        const model = gltf.scene;

        // Scale to TARGET_SIZE
        const box    = new THREE.Box3().setFromObject(model);
        const size   = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        model.scale.setScalar(TARGET_SIZE / maxDim);

        // Center and ground
        box.setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.set(-center.x, -box.min.y, -center.z);

        // Shadows
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow    = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);

        // ── Find the body paint mesh ──────────────────────────────────────
        // Search by name (case-insensitive). Most car GLBs from Sketchfab
        // name the body mesh something like "Body", "Car_Paint", or "Paint".
        // If nothing matches, fall back to the first mesh in the hierarchy.
        let bodyMesh: THREE.Mesh | null = null;
        model.traverse((child) => {
          if (child instanceof THREE.Mesh && !bodyMesh) {
            const n = child.name.toLowerCase();
            if (n.includes('body') || n.includes('paint') || n.includes('car_paint')) {
              bodyMesh = child;
            }
          }
        });
        if (!bodyMesh) {
          model.traverse((child) => {
            if (child instanceof THREE.Mesh && !bodyMesh) bodyMesh = child;
          });
        }

        if (bodyMesh) {
          const bm = bodyMesh as THREE.Mesh;

          // Clone the material so mutations don't affect other meshes that
          // share the same material object in the original GLB.
          const rawMat = Array.isArray(bm.material) ? bm.material[0] : bm.material;
          bm.material  = rawMat.clone();

          const mat = bm.material as THREE.MeshStandardMaterial;

          // Save a snapshot of the original values for the reset button
          originalMatRef.current = {
            color:     mat.color.clone(),
            metalness: mat.metalness,
            roughness: mat.roughness,
            map:       mat.map,
          };

          bodyMeshRef.current = bm;
          console.log(`Body mesh locked on: "${bm.name}"`);
        }

        // Log full mesh inventory to console so you can verify which mesh
        // was selected and find the exact names for future targeting.
        console.log('=== Car model mesh inventory ===');
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const matNames = Array.isArray(child.material)
              ? child.material.map((m) => `"${m.name}"`).join(', ')
              : `"${(child.material as THREE.Material).name}"`;
            const marker = child === bodyMesh ? '  ← body mesh (wrap target)' : '';
            console.log(`  "${child.name}"  |  material: ${matNames}${marker}`);
          }
        });
        console.log('================================');
      },

      (xhr) => {
        if (xhr.total > 0) {
          console.log(`Loading: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
        }
      },

      (error) => {
        console.error('GLTFLoader failed:', error);
      },
    );

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Animate
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      mounted = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      carbonTexRef.current?.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100vh' }}
    />
  );
});

ThreeScene.displayName = 'ThreeScene';

export default ThreeScene;
