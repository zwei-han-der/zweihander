import * as THREE from "three";

// ── Math helpers ─────────────────────────────────────────────────────────────

export const run = (fn) => fn();
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const lerp = (a, b, t) => a + (b - a) * t;

export const seededRandom = (seed) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

export const hashString = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++)
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

// ── Constants ─────────────────────────────────────────────────────────────────

export const CHUNK_SIZE = 110;
export const RENDER_DISTANCE = 2;
export const CHUNK_FADE_MARGIN = 1;
export const MAX_VELOCITY = 3.2;
export const DEPTH_FADE_START = 140;
export const DEPTH_FADE_END = 260;
export const INVIS_THRESHOLD = 0.01;
export const KEYBOARD_SPEED = 0.18;
export const VELOCITY_LERP = 0.16;
export const VELOCITY_DECAY = 0.9;
export const INITIAL_CAMERA_Z = 50;

export const CHUNK_OFFSETS = run(() => {
  const maxDist = RENDER_DISTANCE + CHUNK_FADE_MARGIN;
  const offsets = [];
  for (let dx = -maxDist; dx <= maxDist; dx++) {
    for (let dy = -maxDist; dy <= maxDist; dy++) {
      for (let dz = -maxDist; dz <= maxDist; dz++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
        if (dist > maxDist) continue;
        offsets.push({ dx, dy, dz, dist });
      }
    }
  }
  return offsets;
});

// ── Chunk plane generation ───────────────────────────────────────────────────

const MAX_PLANE_CACHE = 256;
const planeCache = new Map();

const touchPlaneCache = (key) => {
  const v = planeCache.get(key);
  if (!v) return;
  planeCache.delete(key);
  planeCache.set(key, v);
};

const evictPlaneCache = () => {
  while (planeCache.size > MAX_PLANE_CACHE) {
    const firstKey = planeCache.keys().next().value;
    if (!firstKey) break;
    planeCache.delete(firstKey);
  }
};

export const generateChunkPlanes = (cx, cy, cz) => {
  const planes = [];
  const seed = hashString(`${cx},${cy},${cz}`);
  for (let i = 0; i < 5; i++) {
    const s = seed + i * 1000;
    const r = (n) => seededRandom(s + n);
    const size = 12 + r(4) * 8;
    planes.push({
      id: `${cx}-${cy}-${cz}-${i}`,
      position: new THREE.Vector3(
        cx * CHUNK_SIZE + r(0) * CHUNK_SIZE,
        cy * CHUNK_SIZE + r(1) * CHUNK_SIZE,
        cz * CHUNK_SIZE + r(2) * CHUNK_SIZE,
      ),
      scale: new THREE.Vector3(size, size, 1),
      mediaIndex: Math.floor(r(5) * 1_000_000),
    });
  }
  return planes;
};

export const generateChunkPlanesCached = (cx, cy, cz) => {
  const key = `${cx},${cy},${cz}`;
  const cached = planeCache.get(key);
  if (cached) {
    touchPlaneCache(key);
    return cached;
  }
  const planes = generateChunkPlanes(cx, cy, cz);
  planeCache.set(key, planes);
  evictPlaneCache();
  return planes;
};

export const getChunkUpdateThrottleMs = (isZooming, zoomSpeed) => {
  if (zoomSpeed > 1.0) return 500;
  if (isZooming) return 400;
  return 100;
};

export const shouldThrottleUpdate = (lastUpdateTime, throttleMs, currentTime) =>
  currentTime - lastUpdateTime >= throttleMs;

// ── Texture manager ───────────────────────────────────────────────────────────

const textureCache = new Map();
const loadCallbacks = new Map();
const loader = new THREE.TextureLoader();

const isTextureLoaded = (tex) => {
  const img = tex.image;
  return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
};

export const getTexture = (item, onLoad) => {
  const key = item.url;
  const existing = textureCache.get(key);

  if (existing) {
    if (onLoad) {
      if (isTextureLoaded(existing)) {
        onLoad(existing);
      } else {
        loadCallbacks.get(key)?.add(onLoad);
      }
    }
    return existing;
  }

  const callbacks = new Set();
  if (onLoad) callbacks.add(onLoad);
  loadCallbacks.set(key, callbacks);

  const texture = loader.load(
    key,
    (tex) => {
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.anisotropy = 4;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      loadCallbacks.get(key)?.forEach((cb) => {
        try {
          cb(tex);
        } catch (err) {
          console.error("Texture callback failed:", err);
        }
      });
      loadCallbacks.delete(key);
    },
    undefined,
    (err) => console.error("Texture load failed:", key, err),
  );

  textureCache.set(key, texture);
  return texture;
};
