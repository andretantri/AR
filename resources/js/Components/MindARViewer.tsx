import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Camera } from 'lucide-react';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';

interface ArModel {
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
  const [error, setError] = useState<string | null>(null);

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
        });

        const { renderer, scene, camera } = mindarThree;
        
        // Add strong lights so models with PBR materials are bright & visible
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(5, 10, 7.5);
        scene.add(dirLight);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight2.position.set(-5, -5, -5);
        scene.add(dirLight2);

        // Load models and attach to anchor 0 (the first/only image in the mind file)
        const anchor = mindarThree.addAnchor(0);
        
        anchor.onTargetFound = () => {
          console.log("🎯 AR Target Terdeteksi!");
          if (isMounted) setTargetFound(true);
        };
        anchor.onTargetLost = () => {
          console.log("❌ AR Target Hilang dari pandangan");
          if (isMounted) setTargetFound(false);
        };

        const loader = new GLTFLoader();
        const mixers: THREE.AnimationMixer[] = [];
        const clock = new THREE.Clock();

        models.forEach(m => {
          loader.load(
            m.file_url,
            (gltf) => {
              const obj = gltf.scene;
              
              // Calculate geometry size to prevent tiny or gigantic models from being invisible
              const box = new THREE.Box3().setFromObject(obj);
              const size = new THREE.Vector3();
              box.getSize(size);
              const maxDim = Math.max(size.x, size.y, size.z);
              
              let autoScale = 1;
              if (maxDim > 0) {
                // If model max dimension is huge (> 2.5) or tiny (< 0.2), normalize to ~1.0 unit
                if (maxDim > 2.5 || maxDim < 0.2) {
                  autoScale = 1.0 / maxDim;
                }
              }

              obj.position.set(m.position_x, m.position_y, m.position_z);
              obj.rotation.set(
                THREE.MathUtils.degToRad(m.rotation_x),
                THREE.MathUtils.degToRad(m.rotation_y),
                THREE.MathUtils.degToRad(m.rotation_z)
              );
              obj.scale.set(
                m.scale_x * autoScale,
                m.scale_y * autoScale,
                m.scale_z * autoScale
              );
              
              anchor.group.add(obj);

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
              console.error("Gagal memuat GLTF model:", m.file_url, err);
            }
          );
        });

        // Use scene.onBeforeRender so mixers update automatically before MindAR renders each frame
        scene.onBeforeRender = () => {
          const delta = clock.getDelta();
          mixers.forEach(mixer => mixer.update(delta));
        };

        await mindarThree.start();
        if (isMounted) setIsStarting(false);

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

  return (
    <div className="relative w-full h-screen overflow-hidden">
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
        #mindar-container video, #mindar-container canvas {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          margin: 0 !important;
          transform: none !important;
        }
      `}</style>
      <div id="mindar-container" ref={containerRef} className="absolute inset-0 z-0 isolate bg-black" />
      
      {/* Overlay Status Instructions */}
      {!isStarting && !error && (
        <div className="absolute bottom-6 inset-x-0 flex justify-center z-10 pointer-events-none">
          <div className={`px-6 py-3 rounded-full border backdrop-blur-md text-center shadow-2xl transition-all duration-300 ${
            targetFound 
              ? 'bg-emerald-600/90 border-emerald-400/50 text-white animate-bounce' 
              : 'bg-black/70 border-white/20 text-white/90'
          }`}>
            <p className="text-sm font-black flex items-center gap-2">
              {targetFound ? (
                <>✨ Target Terdeteksi! Objek 3D Ditampilkan</>
              ) : (
                <>🔍 Arahkan kamera ke Gambar Target yang Terang</>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
