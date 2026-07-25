import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Camera } from 'lucide-react';
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

export default function MindARViewer({ mindFileUrl, models }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [targetFound, setTargetFound] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ArModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const anchorRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let mindarThree: any;
    let isMounted = true;

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

        // Ensure WebGL Canvas renderer background is 100% transparent (chroma key cleared)
        renderer.setClearColor(0x000000, 0);
        scene.background = null;
        if (renderer.domElement) {
          renderer.domElement.style.background = 'transparent';
        }

        // Add strong lights so models with PBR materials are bright & visible
        const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
        dirLight.position.set(5, 10, 7.5);
        scene.add(dirLight);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight2.position.set(-5, -5, -5);
        scene.add(dirLight2);

        // Load models and attach to anchor 0 (the first/only image in the mind file)
        const anchor = mindarThree.addAnchor(0);
        anchorRef.current = anchor;
        
        anchor.onTargetFound = () => {
          console.log("🎯 AR Target Terdeteksi!");
          if (isMounted) setTargetFound(true);
        };
        anchor.onTargetLost = () => {
          console.log("❌ AR Target Hilang dari pandangan");
          if (isMounted) {
            setTargetFound(false);
            setSelectedModel(null); // Automatically hide model info popup when target is lost
          }
        };

        const loader = new GLTFLoader();
        const mixers: THREE.AnimationMixer[] = [];
        const clock = new THREE.Clock();

        models.forEach(m => {
          loader.load(
            m.file_url,
            (gltf) => {
              console.log("📦 Berhasil memuat GLTF model:", m.file_url);
              const obj = gltf.scene;
              
              // Store metadata on the THREE object for raycasting click detection
              obj.userData = { modelData: m };
              obj.traverse((child) => {
                child.userData = { modelData: m };
                if ((child as THREE.Mesh).isMesh) {
                  const mesh = child as THREE.Mesh;
                  mesh.frustumCulled = false; // Prevent frustum culling from hiding mesh
                  if (mesh.material) {
                    if (Array.isArray(mesh.material)) {
                      mesh.material.forEach(mat => {
                        mat.side = THREE.DoubleSide; // Render both front & back faces!
                        mat.needsUpdate = true;
                      });
                    } else {
                      mesh.material.side = THREE.DoubleSide; // Render both front & back faces!
                      mesh.material.needsUpdate = true;
                    }
                  }
                }
              });
              
              // Calculate geometry bounding box and center point
              const box = new THREE.Box3().setFromObject(obj);
              const center = new THREE.Vector3();
              box.getCenter(center);
              const size = new THREE.Vector3();
              box.getSize(size);
              
              // Center the inner geometry so its center is exactly at origin (0,0,0)
              obj.position.sub(center);

              // Container group for transformation
              const container = new THREE.Group();
              container.add(obj);

              const maxDim = Math.max(size.x, size.y, size.z);
              let autoScale = 1;
              if (Number.isFinite(maxDim) && maxDim > 0) {
                // Normalize model size to ~1.0 unit if it is too huge (> 1.5) or tiny (< 0.1)
                if (maxDim > 1.5 || maxDim < 0.1) {
                  autoScale = 1.0 / maxDim;
                }
              }
              if (!Number.isFinite(autoScale) || autoScale <= 0) {
                autoScale = 1;
              }

              const numScaleX = Number(m.scale_x);
              const numScaleY = Number(m.scale_y);
              const numScaleZ = Number(m.scale_z);

              const scaleX = (Number.isFinite(numScaleX) && numScaleX > 0) ? numScaleX : 1;
              const scaleY = (Number.isFinite(numScaleY) && numScaleY > 0) ? numScaleY : 1;
              const scaleZ = (Number.isFinite(numScaleZ) && numScaleZ > 0) ? numScaleZ : 1;

              // Clamp large position offsets (e.g. > 1.5 units) so model is guaranteed to stay directly on the thumbnail
              const rawX = Number(m.position_x) || 0;
              const rawY = Number(m.position_y) || 0;
              const rawZ = Number(m.position_z) || 0;

              const posX = Math.abs(rawX) > 1.5 ? 0 : rawX;
              const posY = Math.abs(rawY) > 1.5 ? 0 : rawY;
              const posZ = Math.abs(rawZ) > 1.5 ? 0.2 : (rawZ + 0.2);

              console.log(`📍 Model ${m.name || ''} diletakkan di koordinat AR: (${posX}, ${posY}, ${posZ}) dengan skala: ${scaleX * autoScale}`);

              container.position.set(posX, posY, posZ);
              container.rotation.set(
                THREE.MathUtils.degToRad(Number(m.rotation_x) || 0) + Math.PI / 2,
                THREE.MathUtils.degToRad(Number(m.rotation_y) || 0),
                THREE.MathUtils.degToRad(Number(m.rotation_z) || 0)
              );
              container.scale.set(
                scaleX * autoScale,
                scaleY * autoScale,
                scaleZ * autoScale
              );

              anchor.group.add(container);

              // Play animation if available
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

        // Click / Touch Raycaster listener for selecting 3D models interactively
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
              setSelectedModel(modelData);
            }
          }
        };

        const domElement = renderer.domElement;
        domElement.addEventListener('click', handlePointerDown);

        await mindarThree.start();
        if (isMounted) setIsStarting(false);

        // Mandatory Official MindAR Three.js Animation Render Loop
        renderer.setAnimationLoop(() => {
          const delta = clock.getDelta();
          mixers.forEach(mixer => mixer.update(delta));
          renderer.render(scene, camera);
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
    e.preventDefault(); // Stop mobile browser pull-to-refresh reload!
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
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm text-white">
          <Camera className="w-12 h-12 mb-4 animate-pulse text-violet-400" />
          <p className="font-bold">Membuka Kamera AR...</p>
          <p className="text-xs text-white/60 mt-2">Mohon berikan izin kamera jika diminta</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-900/90 text-white p-6 text-center">
          <p className="font-bold mb-2">Oops!</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* MindAR will inject the video and canvas elements here */}
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
          <div className={`px-5 py-2.5 rounded-full border backdrop-blur-xl text-center shadow-2xl transition-all duration-300 pointer-events-auto ${targetFound
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

      {/* Selected Model Detail Modal Overlay */}
      {selectedModel && targetFound && (
        <div className="absolute top-32 inset-x-4 z-40 bg-white/95 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 font-extrabold text-[10px] uppercase tracking-wider">
                Model 3D Terpilih
              </span>
              <h3 className="font-black text-slate-800 text-lg mt-1">{selectedModel.name || 'Model 3D'}</h3>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                {selectedModel.description || 'Tidak ada deskripsi tambahan untuk objek ini.'}
              </p>
            </div>
            <button
              onClick={() => setSelectedModel(null)}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
