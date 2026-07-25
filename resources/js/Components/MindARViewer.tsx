import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Camera } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    let mindarThree: any;
    let isMounted = true;
    
    const init = async () => {
      try {
        if (!(window as any).MINDAR) {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js';
            document.head.appendChild(script);
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
        }
        if (!isMounted) return;

        const { MindARThree } = (window as any).MINDAR.IMAGE;
        
        mindarThree = new MindARThree({
          container: containerRef.current,
          imageTargetSrc: mindFileUrl,
          uiLoading: 'yes',
          uiScanning: 'yes',
          uiError: 'yes',
        });

        const { renderer, scene, camera } = mindarThree;
        
        // Add light
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(0, 10, 5);
        scene.add(dirLight);

        // Load models and attach to anchor 0 (the first/only image in the mind file)
        const anchor = mindarThree.addAnchor(0);
        const loader = new GLTFLoader();
        
        models.forEach(m => {
          loader.load(m.file_url, (gltf) => {
            const obj = gltf.scene;
            obj.position.set(m.position_x, m.position_y, m.position_z);
            obj.rotation.set(
              THREE.MathUtils.degToRad(m.rotation_x),
              THREE.MathUtils.degToRad(m.rotation_y),
              THREE.MathUtils.degToRad(m.rotation_z)
            );
            obj.scale.set(m.scale_x, m.scale_y, m.scale_z);
            anchor.group.add(obj);
          });
        });

        await mindarThree.start();
        setIsStarting(false);
        
        // Setup render loop manually because MindAR doesn't automatically loop in custom integration
        renderer.setAnimationLoop(() => {
          renderer.render(scene, camera);
        });

      } catch (err: any) {
        console.error("Gagal memulai AR", err);
        setError("Gagal mengakses kamera atau memuat file AR. " + (err?.message || String(err)));
        setIsStarting(false);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (mindarThree) {
        mindarThree.stop();
        mindarThree.renderer.setAnimationLoop(null);
      }
    };
  }, [mindFileUrl, models]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
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
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Overlay Instructions */}
      {!isStarting && !error && (
        <div className="absolute bottom-6 inset-x-0 flex justify-center z-10 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-center shadow-lg">
            <p className="text-sm font-bold text-white">Arahkan kamera ke Target Gambar</p>
          </div>
        </div>
      )}
    </div>
  );
}
