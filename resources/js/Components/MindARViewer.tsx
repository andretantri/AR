import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Camera, Info, X, Sparkles } from 'lucide-react';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';

interface ArModel {
  name?: string;
  description?: string | null;
  file_url: string;
  position_x: number; position_y: number; position_z: number;
  rotation_x: number; rotation_y: number; rotation_z: number;
  scale_x: number; scale_y: number; scale_z: number;
}

interface Props {
  mindFileUrl: string;
  models: ArModel[];
}

interface BadgePosition {
  model: ArModel;
  dotX: number;
  dotY: number;
  badgeX: number;
  badgeY: number;
  color: string;
}

interface ModelContainerMeta {
  container: THREE.Group;
  obj: THREE.Object3D;
  modelData: ArModel;
  baseRotXDeg: number;
  baseRotYDeg: number;
  baseRotZDeg: number;
  spinRemaining?: number;
}

const BADGE_COLORS = [
  '#059669', // Emerald Green (like Kenali Nasi!)
  '#ea580c', // Vibrant Orange (like Kenali Brokoli!)
  '#7c3aed', // Royal Violet
  '#0284c7', // Sky Blue
  '#db2777', // Bright Pink
];

export default function MindARViewer({ mindFileUrl, models }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [targetFound, setTargetFound] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ArModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Orientation State: 'vertically' (standing upright on screen/wall) or 'horizontally' (flat on desk/table)
  const [orientationMode, setOrientationMode] = useState<'vertically' | 'horizontally'>('vertically');
  const [badgePositions, setBadgePositions] = useState<BadgePosition[]>([]);

  const anchorRef = useRef<any>(null);
  const modelContainersRef = useRef<ModelContainerMeta[]>([]);
  const orientationModeRef = useRef<'vertically' | 'horizontally'>('vertically');

  // Trigger 360-degree horizontal spin animation on model & select info
  const handleSelectModel = (model: ArModel) => {
    setSelectedModel(model);
    const meta = modelContainersRef.current.find(
      (item) => item.modelData === model || item.modelData.file_url === model.file_url
    );
    if (meta) {
      meta.spinRemaining = (meta.spinRemaining || 0) + Math.PI * 2;
    }
  };

  // Sync orientation mode ref
  useEffect(() => {
    orientationModeRef.current = orientationMode;
  }, [orientationMode]);

  // Helper to apply orientation rotation to container
  const updateContainerRotation = (
    meta: ModelContainerMeta,
    mode: 'vertically' | 'horizontally'
  ) => {
    const xOffset = mode === 'horizontally' ? Math.PI / 2 : 0;
    meta.container.rotation.set(
      THREE.MathUtils.degToRad(meta.baseRotXDeg) + xOffset,
      THREE.MathUtils.degToRad(meta.baseRotYDeg),
      THREE.MathUtils.degToRad(meta.baseRotZDeg)
    );
  };

  const applyOrientation = (mode: 'vertically' | 'horizontally') => {
    setOrientationMode(mode);
    modelContainersRef.current.forEach((meta) => {
      updateContainerRotation(meta, mode);
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let mindarThree: any;
    let isMounted = true;
    modelContainersRef.current = [];

    const init = async () => {
      try {
        (window as any).THREE = THREE;
        if (!isMounted) return;

        mindarThree = new MindARThree({
          container: containerRef.current,
          imageTargetSrc: mindFileUrl,
          uiLoading: 'yes',
          uiScanning: 'yes',
          uiError: 'yes',
          filterMinCF: 0.0001, // Smooth out jitter/wobble when target is still
          filterBeta: 1.0,      // Stabilize movement during camera pan
          missTolerance: 10,    // Keep tracking steady through micro camera shakes
          warmupTolerance: 5,
        });

        const { renderer, scene, camera } = mindarThree;

        // Ensure WebGL Canvas renderer background is 100% transparent
        renderer.setClearColor(0x000000, 0);
        scene.background = null;
        if (renderer.domElement) {
          renderer.domElement.style.background = 'transparent';
        }

        // Add strong lights so PBR materials are bright & vivid
        const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
        dirLight.position.set(5, 10, 7.5);
        scene.add(dirLight);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight2.position.set(-5, -5, -5);
        scene.add(dirLight2);

        // Load models and attach to anchor 0
        const anchor = mindarThree.addAnchor(0);
        anchorRef.current = anchor;

        anchor.onTargetFound = () => {
          console.log("🎯 AR Target Terdeteksi!");
          if (isMounted) setTargetFound(true);
        };
        anchor.onTargetLost = () => {
          console.log("❌ AR Target Hilang");
          if (isMounted) {
            setTargetFound(false);
            setSelectedModel(null);
            setBadgePositions([]);
          }
        };

        const loader = new GLTFLoader();
        const mixers: THREE.AnimationMixer[] = [];
        const clock = new THREE.Clock();

        models.forEach((m) => {
          loader.load(
            m.file_url,
            (gltf) => {
              console.log("📦 Berhasil memuat GLTF model:", m.file_url);
              const obj = gltf.scene;

              obj.userData = { modelData: m };
              obj.traverse((child) => {
                child.userData = { modelData: m };
                if ((child as THREE.Mesh).isMesh) {
                  const mesh = child as THREE.Mesh;
                  mesh.frustumCulled = false;
                  if (mesh.material) {
                    if (Array.isArray(mesh.material)) {
                      mesh.material.forEach((mat) => {
                        mat.side = THREE.DoubleSide;
                        mat.needsUpdate = true;
                      });
                    } else {
                      mesh.material.side = THREE.DoubleSide;
                      mesh.material.needsUpdate = true;
                    }
                  }
                }
              });

              // Bounding box & centering
              const box = new THREE.Box3().setFromObject(obj);
              const center = new THREE.Vector3();
              box.getCenter(center);
              obj.position.sub(center);

              const container = new THREE.Group();
              container.add(obj);

              const scaleFactor = 1.0 / 3.0;

              const numScaleX = Number(m.scale_x);
              const numScaleY = Number(m.scale_y);
              const numScaleZ = Number(m.scale_z);

              const scaleX = ((Number.isFinite(numScaleX) && numScaleX > 0) ? numScaleX : 1) * scaleFactor;
              const scaleY = ((Number.isFinite(numScaleY) && numScaleY > 0) ? numScaleY : 1) * scaleFactor;
              const scaleZ = ((Number.isFinite(numScaleZ) && numScaleZ > 0) ? numScaleZ : 1) * scaleFactor;

              const rawX = Number(m.position_x) || 0;
              const rawY = Number(m.position_y) || 0;
              const rawZ = Number(m.position_z) || 0;

              const posX = (Math.abs(rawX) > 4.5 ? 0 : rawX) * scaleFactor;
              const posY = (Math.abs(rawZ) > 4.5 ? 0 : -rawZ) * scaleFactor;
              const posZ = Math.abs(rawY) > 4.5 ? 0.05 : (rawY * scaleFactor + 0.05);

              container.position.set(posX, posY, posZ);
              container.scale.set(scaleX, scaleY, scaleZ);

              const meta: ModelContainerMeta = {
                container,
                obj,
                modelData: m,
                baseRotXDeg: Number(m.rotation_x) || 0,
                baseRotYDeg: Number(m.rotation_y) || 0,
                baseRotZDeg: Number(m.rotation_z) || 0,
              };

              updateContainerRotation(meta, orientationModeRef.current);
              modelContainersRef.current.push(meta);

              anchor.group.add(container);

              if (gltf.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(obj);
                gltf.animations.forEach((clip) => {
                  mixer.clipAction(clip).play();
                });
                mixers.push(mixer);
              }
            },
            undefined,
            (err) => {
              console.error("❌ Gagal memuat file 3D:", m.file_url, err);
              if (isMounted) {
                setError(`Gagal memuat file 3D (${m.name || 'Model'}): Periksa koneksi atau berkas di server.`);
              }
            }
          );
        });

        // Click / Touch Raycaster
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
          if (!containerRef.current || !anchor.group.visible) return;
          const rect = containerRef.current.getBoundingClientRect();
          const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
          const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

          mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(anchor.group.children, true);

          if (intersects.length > 0) {
            const hitObj = intersects[0].object;
            const modelData = hitObj.userData?.modelData;
            if (modelData && isMounted) {
              handleSelectModel(modelData);
            }
          }
        };

        const domElement = renderer.domElement;
        domElement.addEventListener('click', handlePointerDown);

        await mindarThree.start();
        if (isMounted) setIsStarting(false);

        // Render loop with 3D to 2D Screen Space Projection for floating callout badges
        renderer.setAnimationLoop(() => {
          const delta = clock.getDelta();
          mixers.forEach((mixer) => mixer.update(delta));

          // Smoothly animate 360-degree horizontal spin rotation for selected/clicked models
          modelContainersRef.current.forEach((meta) => {
            if (meta.spinRemaining && meta.spinRemaining > 0) {
              const spinStep = Math.min(meta.spinRemaining, delta * 6.28);
              meta.container.rotation.y += spinStep;
              meta.spinRemaining -= spinStep;
            }
          });

          renderer.render(scene, camera);

          // Calculate 2D Screen coordinates of 3D models for floating badges
          if (anchor.group.visible && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const width = rect.width || window.innerWidth;
            const height = rect.height || window.innerHeight;

            const newBadgePositions: BadgePosition[] = [];

            modelContainersRef.current.forEach((meta, idx) => {
              const worldVec = new THREE.Vector3();
              meta.obj.getWorldPosition(worldVec);

              const projected = worldVec.clone().project(camera);

              if (projected.z <= 1.0) {
                const dotX = ((projected.x + 1) / 2) * width;
                const dotY = ((-projected.y + 1) / 2) * height;

                // Spread out badges to avoid overlap
                const isEven = idx % 2 === 0;
                const offsetX = isEven ? 50 : -50;
                const badgeX = Math.max(80, Math.min(width - 80, dotX + offsetX));
                const badgeY = Math.max(60, dotY - 70);

                const color = BADGE_COLORS[idx % BADGE_COLORS.length];

                newBadgePositions.push({
                  model: meta.modelData,
                  dotX,
                  dotY,
                  badgeX,
                  badgeY,
                  color,
                });
              }
            });

            if (isMounted) {
              setBadgePositions(newBadgePositions);
            }
          } else if (isMounted && badgePositions.length > 0) {
            setBadgePositions([]);
          }
        });
      } catch (err: any) {
        console.error("Gagal memulai AR", err);
        if (isMounted) {
          setError("Gagal mengakses kamera atau memuat file AR. " + (err?.message || String(err)));
          setIsStarting(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      if (mindarThree) {
        try {
          mindarThree.stop();
          if (mindarThree.renderer) {
            mindarThree.renderer.setAnimationLoop(null);
          }
        } catch (e) {
          console.warn("Cleanup mindar:", e);
        }
      }
    };
  }, [mindFileUrl, models]);

  // Touch Swipe Gesture to Rotate Model in 3D Space
  const touchStartRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchStartRef.current !== null && anchorRef.current?.group && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - touchStartRef.current;
      anchorRef.current.group.rotation.y += deltaX * 0.01;
      touchStartRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden select-none touch-none overscroll-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ overscrollBehavior: 'none', touchAction: 'none' }}
    >
      {isStarting && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm text-white">
          <Camera className="w-12 h-12 mb-4 animate-pulse text-violet-400" />
          <p className="font-bold">Membuka Kamera AR...</p>
          <p className="text-xs text-white/60 mt-2">Mohon berikan izin kamera jika diminta</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-900/90 text-white p-6 text-center">
          <p className="font-bold mb-2">Oops!</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* MindAR Container */}
      <style>{`
        html, body {
          overscroll-behavior: none !important;
          overscroll-behavior-y: none !important;
          touch-action: none !important;
        }
        #mindar-container video, #mindar-container canvas {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          margin: 0 !important;
          padding: 0 !important;
          overscroll-behavior: none !important;
          touch-action: none !important;
        }
        #mindar-container video {
          z-index: 1 !important;
        }
        #mindar-container canvas {
          z-index: 10 !important;
          background: transparent !important;
          background-color: transparent !important;
          pointer-events: auto !important;
        }
      `}</style>
      <div id="mindar-container" ref={containerRef} className="absolute inset-0 z-0 isolate bg-black" />

      {/* Fixed Status Indicator Pill at Top of Screen */}
      {!isStarting && !error && (
        <div className="absolute top-18 inset-x-4 flex justify-center z-30 pointer-events-none">
          <div className={`px-5 py-2.5 rounded-full border backdrop-blur-xl text-center shadow-2xl transition-all duration-300 pointer-events-auto ${
            targetFound
              ? 'bg-emerald-600/90 border-emerald-400/50 text-white scale-105 shadow-emerald-900/40'
              : 'bg-black/75 border-white/20 text-white/90'
          }`}>
            <p className="text-xs sm:text-sm font-black flex items-center gap-2">
              {targetFound ? (
                <>Target Terdeteksi! Putar & Sentuh Objek 3D</>
              ) : (
                <>🔍 Arahkan kamera ke Gambar Thumbnail Target</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Floating 3D Callout Lines SVG Layer */}
      {targetFound && badgePositions.length > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
          {badgePositions.map((badge, idx) => (
            <g key={idx}>
              <line
                x1={badge.dotX}
                y1={badge.dotY}
                x2={badge.badgeX}
                y2={badge.badgeY}
                stroke={badge.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="4 2"
              />
              <circle cx={badge.dotX} cy={badge.dotY} r="7" fill={badge.color} opacity="0.6" className="animate-ping" />
              <circle cx={badge.dotX} cy={badge.dotY} r="5" fill={badge.color} stroke="#ffffff" strokeWidth="2" />
            </g>
          ))}
        </svg>
      )}

      {/* HTML Floating Info Badges with (i) Icon */}
      {targetFound && badgePositions.map((badge, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: `${badge.badgeX}px`,
            top: `${badge.badgeY}px`,
            transform: 'translate(-50%, -50%)',
          }}
          className="z-30 pointer-events-auto transition-all duration-75 ease-out"
        >
          <button
            onClick={() => handleSelectModel(badge.model)}
            className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-white font-extrabold text-xs sm:text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/30 backdrop-blur-md"
            style={{ backgroundColor: badge.color }}
          >
            <span>{badge.model.name ? `Kenali ${badge.model.name}!` : 'Kenali Objek!'}</span>
            <span className="w-5 h-5 rounded-full bg-white text-slate-900 flex items-center justify-center font-black text-xs shadow-inner group-hover:bg-amber-300 transition-colors">
              i
            </span>
          </button>
        </div>
      ))}

      {/* Bottom Orientation Selector Bar Overlay (Matching Screenshot Design) */}
      {!isStarting && !error && (
        <div className="absolute bottom-6 inset-x-4 z-30 flex justify-center pointer-events-none">
          <div className="bg-slate-900/85 backdrop-blur-2xl border border-white/20 p-3.5 rounded-3xl shadow-2xl max-w-sm w-full flex flex-col items-center gap-3 pointer-events-auto">
            {/* Orientation Options Cards */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {/* Horizontally Option */}
              <button
                type="button"
                onClick={() => applyOrientation('horizontally')}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${
                  orientationMode === 'horizontally'
                    ? 'bg-white/15 border-2 border-white text-white shadow-xl scale-[1.02]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {/* Horizontal Icon Graphic */}
                <div className="relative w-16 h-12 mb-1.5 flex items-center justify-center">
                  <div className="absolute bottom-1 w-12 h-3 border-b-2 border-amber-400/80 rounded-sm transform skew-x-12 bg-amber-400/20" />
                  <div className="w-4 h-6 border-2 border-white rounded-sm bg-white/30 transform -skew-x-6 flex items-center justify-center">
                    <div className="w-1 h-3 bg-white rounded-xs" />
                  </div>
                </div>
                <span className="text-xs font-black">Horizontally</span>
              </button>

              {/* Vertically Option */}
              <button
                type="button"
                onClick={() => applyOrientation('vertically')}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${
                  orientationMode === 'vertically'
                    ? 'bg-white/15 border-2 border-white text-white shadow-xl scale-[1.02]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {/* Vertical Icon Graphic */}
                <div className="relative w-16 h-12 mb-1.5 flex items-center justify-center">
                  <div className="absolute left-3 top-1 bottom-1 w-3 border-l-2 border-amber-400/80 rounded-sm transform skew-y-12 bg-amber-400/20" />
                  <div className="w-4 h-6 border-2 border-white rounded-sm bg-white/30 transform skew-y-6 flex items-center justify-center">
                    <div className="w-1 h-3 bg-white rounded-xs" />
                  </div>
                </div>
                <span className="text-xs font-black">Vertically</span>
              </button>
            </div>

            {/* Apply Button */}
            <button
              type="button"
              onClick={() => applyOrientation(orientationMode)}
              className="w-32 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/40 active:scale-95 transition-all"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Selected Model Detailed Info Modal Popup */}
      {selectedModel && targetFound && (
        <div className="absolute top-28 inset-x-4 z-40 bg-white/95 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-4 duration-300 max-w-md mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3 h-3 text-violet-600" /> Detail Informasi Objek
              </span>
              <h3 className="font-black text-slate-800 text-lg mt-2">{selectedModel.name || 'Model 3D'}</h3>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                {selectedModel.description || 'Tidak ada deskripsi tambahan untuk objek ini.'}
              </p>
            </div>
            <button
              onClick={() => setSelectedModel(null)}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm hover:bg-slate-200 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

