import React, { useState, Suspense, useRef, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Grid, Environment, Html, TransformControls } from '@react-three/drei';
import { Button } from '@/Components/ui/button';
import { X, Save, BoxSelect, Hand, Move, RotateCw, Maximize2, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { router } from '@inertiajs/react';
import * as THREE from 'three';

interface ArModel {
  id: number;
  name: string;
  file_url: string;
  position_x: number;
  position_y: number;
  position_z: number;
  rotation_x: number;
  rotation_y: number;
  rotation_z: number;
  scale_x: number;
  scale_y: number;
  scale_z: number;
}

interface VisualEditorProps {
  contentId: number;
  initialModels: ArModel[];
  thumbnailUrl?: string | null;
  onClose: () => void;
}

type TransformMode = 'translate' | 'rotate' | 'scale';

// TargetImagePlane — Renders the scan target card image under the 3D models as a guide plane
function TargetImagePlane({ url }: { url?: string | null }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) return;
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      (err) => console.warn('Gagal memuat thumbnail target:', err)
    );
  }, [url]);

  if (!texture) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[3, 3]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent opacity={0.9} />
    </mesh>
  );
}

// Using drei's TransformControls natively in the scene

// -----------------------------------------------------------------------
// SceneModel — one GLB object in the canvas
// It watches the model data and updates its 3D transform accordingly (two-way)
// -----------------------------------------------------------------------
function SceneModel({
  model,
  isSelected,
  onSelect,
  mode,
  onTransform,
}: {
  model: ArModel;
  isSelected: boolean;
  onSelect: () => void;
  mode: TransformMode;
  onTransform: (obj: THREE.Object3D) => void;
}) {
  const { scene } = useGLTF(model.file_url);
  const cloned = useRef<THREE.Group>(scene.clone(true));
  const [groupObj, setGroupObj] = useState<THREE.Group | null>(null);

  // Sync 3D transform whenever model state changes (from input OR drag)
  useEffect(() => {
    if (!groupObj) return;
    groupObj.position.set(model.position_x, model.position_y, model.position_z);
    groupObj.rotation.set(
      THREE.MathUtils.degToRad(model.rotation_x),
      THREE.MathUtils.degToRad(model.rotation_y),
      THREE.MathUtils.degToRad(model.rotation_z),
    );
    groupObj.scale.set(model.scale_x, model.scale_y, model.scale_z);
  }, [
    groupObj,
    model.position_x, model.position_y, model.position_z,
    model.rotation_x, model.rotation_y, model.rotation_z,
    model.scale_x, model.scale_y, model.scale_z,
  ]);

  // Calculate the actual center and top of the model's geometry
  const htmlPos = React.useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    if (box.isEmpty()) return [0, 1.8, 0] as [number, number, number];
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    const padding = size.y * 0.05; 
    return [center.x, box.max.y + padding, center.z] as [number, number, number];
  }, [scene]);

  return (
    <>
      <group ref={setGroupObj} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <primitive object={cloned.current} />
        {isSelected && (
          <Html position={htmlPos} center distanceFactor={5}>
            <div className="bg-violet-600 text-white text-xs font-black px-2 py-1 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
              {model.name}
            </div>
          </Html>
        )}
      </group>
      {isSelected && groupObj && (
        <TransformControls
          object={groupObj}
          mode={mode}
          onObjectChange={(e: any) => {
            if (e?.target?.object) {
              onTransform(e.target.object);
            }
          }}
        />
      )}
    </>
  );
}

// -----------------------------------------------------------------------
// CoordInput — small number input with axis label
// -----------------------------------------------------------------------
function CoordInput({ axis, value, onChange, color }: {
  axis: string; value: number; onChange: (v: number) => void; color: string;
}) {
  const [raw, setRaw] = useState(String(value));

  // When value changes from drag, sync display if it doesn't match
  useEffect(() => { 
    if (parseFloat(raw) !== value && raw !== '-' && raw !== '-0' && !raw.endsWith('.')) {
      setRaw(String(value)); 
    }
  }, [value, raw]);

  return (
    <div className="flex flex-col items-center">
      <span className={`text-[10px] font-black mb-0.5 ${color}`}>{axis}</span>
      <input
        type="text"
        value={raw}
        onChange={(e) => {
          let val = e.target.value.replace(/[^0-9.-]/g, '');
          // prevent multiple minus or dots if needed, but simple replace is fine for now
          setRaw(val);
          
          if (val === '' || val === '-' || val === '-.' || val === '-0') return;
          const parsed = parseFloat(val);
          if (!isNaN(parsed)) onChange(parsed);
        }}
        onBlur={() => {
          const parsed = parseFloat(raw);
          if (isNaN(parsed)) setRaw(String(value));
          else setRaw(String(parsed));
        }}
        className="w-full text-center text-xs font-black text-slate-700 bg-white border border-slate-200 rounded-lg py-1 px-0.5 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
        style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
      />
    </div>
  );
}

// -----------------------------------------------------------------------
// Main VisualEditor component
// -----------------------------------------------------------------------
export default function VisualEditor({ contentId, initialModels, thumbnailUrl, onClose }: VisualEditorProps) {
  const [models, setModels] = useState<ArModel[]>(initialModels.map(m => ({ ...m })));
  const [selectedId, setSelectedId] = useState<number | null>(initialModels[0]?.id ?? null);
  const [mode, setMode] = useState<TransformMode>('translate');
  const [showTargetCard, setShowTargetCard] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Called when user drags in canvas
  const handleTransformDrag = useCallback((obj: THREE.Object3D) => {
    const id = selectedId;
    if (id === null) return;
    setModels(prev => prev.map(m => m.id !== id ? m : {
      ...m,
      position_x: Number(obj.position.x.toFixed(3)),
      position_y: Number(obj.position.y.toFixed(3)),
      position_z: Number(obj.position.z.toFixed(3)),
      rotation_x: Number(THREE.MathUtils.radToDeg(obj.rotation.x).toFixed(2)),
      rotation_y: Number(THREE.MathUtils.radToDeg(obj.rotation.y).toFixed(2)),
      rotation_z: Number(THREE.MathUtils.radToDeg(obj.rotation.z).toFixed(2)),
      scale_x: Number(obj.scale.x.toFixed(3)),
      scale_y: Number(obj.scale.y.toFixed(3)),
      scale_z: Number(obj.scale.z.toFixed(3)),
    }));
  }, [selectedId]);

  // Called when user edits a coordinate input
  const updateCoord = useCallback((id: number, field: keyof ArModel, value: number) => {
    setModels(prev => prev.map(m => m.id !== id ? m : { ...m, [field]: value }));
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    router.put(`/admin/ar-contents/${contentId}/models/bulk`, {
      models: models.map(m => ({
        id: m.id,
        position_x: m.position_x, position_y: m.position_y, position_z: m.position_z,
        rotation_x: m.rotation_x, rotation_y: m.rotation_y, rotation_z: m.rotation_z,
        scale_x: m.scale_x, scale_y: m.scale_y, scale_z: m.scale_z,
      }))
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => { setIsSaving(false); onClose(); },
      onError: () => setIsSaving(false),
    });
  };

  const selectedModel = models.find(m => m.id === selectedId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-7xl h-[92vh] flex flex-col bg-white border-0 shadow-2xl overflow-hidden rounded-2xl">

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <BoxSelect className="w-5 h-5 text-violet-500" /> Visual Editor 3D
              </h2>
              <p className="text-xs text-slate-400 font-medium">Klik model → drag sumbu warna, atau edit koordinat di panel kiri</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {([
                { m: 'translate' as const, icon: <Move className="w-3.5 h-3.5" />, label: 'Geser' },
                { m: 'rotate' as const, icon: <RotateCw className="w-3.5 h-3.5" />, label: 'Putar' },
                { m: 'scale' as const, icon: <Maximize2 className="w-3.5 h-3.5" />, label: 'Skala' },
              ]).map(({ m, icon, label }) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === m ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  {icon} {label}
                </button>
              ))}
            </div>
            {thumbnailUrl && (
              <button
                type="button"
                onClick={() => setShowTargetCard(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                  showTargetCard 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm' 
                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Gambar Target: {showTargetCard ? 'Tampil' : 'Sembunyi'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSaving} className="gap-2">
              <X className="w-4 h-4" /> Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving}
              className="gap-2 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/30">
              <Save className="w-4 h-4" /> {isSaving ? 'Menyimpan...' : 'Simpan Tata Letak'}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* ── Left sidebar ── */}
          <div className="w-56 border-r border-slate-100 bg-slate-50 flex flex-col flex-shrink-0 overflow-y-auto">
            <div className="px-4 py-2.5 border-b border-slate-100 bg-white">
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Model</p>
            </div>

            {/* Model list */}
            <div className="p-2 space-y-1">
              {models.map(m => (
                <button key={m.id}
                  onClick={() => setSelectedId(m.id === selectedId ? null : m.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    m.id === selectedId
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                      : 'text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200'
                  }`}>
                  <BoxSelect className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{m.name}</span>
                  {m.id === selectedId && <ChevronRight className="w-3 h-3 ml-auto" />}
                </button>
              ))}
            </div>

            {/* Coordinate editor for selected model */}
            {selectedModel && (
              <div className="flex-1 p-3 space-y-4 border-t border-slate-200 mt-1">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Koordinat</p>

                {/* Position */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Move className="w-3 h-3 text-violet-500" />
                    <p className="text-xs font-black text-slate-600">Posisi</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <CoordInput axis="X" color="text-red-500" value={selectedModel.position_x}
                      onChange={v => updateCoord(selectedModel.id, 'position_x', v)} />
                    <CoordInput axis="Y" color="text-green-600" value={selectedModel.position_y}
                      onChange={v => updateCoord(selectedModel.id, 'position_y', v)} />
                    <CoordInput axis="Z" color="text-blue-500" value={selectedModel.position_z}
                      onChange={v => updateCoord(selectedModel.id, 'position_z', v)} />
                  </div>
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <RotateCw className="w-3 h-3 text-amber-500" />
                    <p className="text-xs font-black text-slate-600">Rotasi (°)</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <CoordInput axis="X" color="text-red-500" value={selectedModel.rotation_x}
                      onChange={v => updateCoord(selectedModel.id, 'rotation_x', v)} />
                    <CoordInput axis="Y" color="text-green-600" value={selectedModel.rotation_y}
                      onChange={v => updateCoord(selectedModel.id, 'rotation_y', v)} />
                    <CoordInput axis="Z" color="text-blue-500" value={selectedModel.rotation_z}
                      onChange={v => updateCoord(selectedModel.id, 'rotation_z', v)} />
                  </div>
                </div>

                {/* Scale */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Maximize2 className="w-3 h-3 text-indigo-500" />
                    <p className="text-xs font-black text-slate-600">Skala</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <CoordInput axis="X" color="text-red-500" value={selectedModel.scale_x}
                      onChange={v => updateCoord(selectedModel.id, 'scale_x', v)} />
                    <CoordInput axis="Y" color="text-green-600" value={selectedModel.scale_y}
                      onChange={v => updateCoord(selectedModel.id, 'scale_y', v)} />
                    <CoordInput axis="Z" color="text-blue-500" value={selectedModel.scale_z}
                      onChange={v => updateCoord(selectedModel.id, 'scale_z', v)} />
                  </div>
                  {/* Uniform scale shortcut */}
                  <button
                    onClick={() => {
                      const avg = (selectedModel.scale_x + selectedModel.scale_y + selectedModel.scale_z) / 3;
                      updateCoord(selectedModel.id, 'scale_x', avg);
                      updateCoord(selectedModel.id, 'scale_y', avg);
                      updateCoord(selectedModel.id, 'scale_z', avg);
                    }}
                    className="mt-2 w-full text-xs font-bold text-violet-600 hover:text-violet-700 py-1 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors">
                    Samakan X=Y=Z
                  </button>
                </div>

                {/* Reset */}
                <button
                  onClick={() => setModels(prev => prev.map(m => m.id !== selectedModel.id ? m : {
                    ...m,
                    position_x: 0, position_y: 0, position_z: 0,
                    rotation_x: 0, rotation_y: 0, rotation_z: 0,
                    scale_x: 1, scale_y: 1, scale_z: 1,
                  }))}
                  className="w-full text-xs font-bold text-slate-500 hover:text-red-500 py-1.5 border border-dashed border-slate-300 hover:border-red-300 rounded-lg transition-colors">
                  Reset Transform
                </button>
              </div>
            )}
          </div>

          {/* ── 3D Canvas ── */}
          <div className="flex-1 relative bg-gradient-to-b from-slate-100 to-slate-200">
            <Canvas
              camera={{ position: [0, 3, 7], fov: 50 }}
              onPointerMissed={() => setSelectedId(null)}
              gl={{ antialias: true }}
            >
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
              <Environment preset="city" />

              <Suspense fallback={null}>
                {showTargetCard && <TargetImagePlane url={thumbnailUrl} />}
                {models.map(m => (
                  <SceneModel
                    key={m.id}
                    model={m}
                    isSelected={selectedId === m.id}
                    onSelect={() => setSelectedId(prev => prev === m.id ? null : m.id)}
                    mode={mode}
                    onTransform={handleTransformDrag}
                  />
                ))}
              </Suspense>

              <Grid infiniteGrid fadeDistance={25} fadeStrength={1}
                sectionColor="#94a3b8" cellColor="#cbd5e1" />

              <OrbitControls makeDefault />
            </Canvas>

            {/* Camera controls hint */}
            <div className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-md pointer-events-none">
              <p className="font-bold text-slate-600 text-xs mb-1.5 flex items-center gap-1.5">
                <Hand className="w-3.5 h-3.5 text-violet-500" /> Kamera
              </p>
              <ul className="text-xs text-slate-500 space-y-0.5 font-medium">
                <li>🖱 <b>Kiri</b> — Putar</li>
                <li>🖱 <b>Kanan</b> — Geser</li>
                <li>🖱 <b>Scroll</b> — Zoom</li>
              </ul>
            </div>

            {/* No model selected hint */}
            {!selectedId && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-slate-200 text-center">
                  <BoxSelect className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                  <p className="text-sm font-black text-slate-600">Pilih model di panel kiri</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">atau klik langsung pada objek di canvas</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
