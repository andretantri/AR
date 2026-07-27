import React, { Suspense, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import MindARViewer from '@/Components/MindARViewer';
import { ArrowLeft, Share2, Download, Sparkles, Monitor, Info, BoxSelect, Hand, Eye } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface ArModel { 
  id: number; 
  name: string; 
  description: string | null;
  file_url: string; 
  file_type: string; 
  position_x: number; position_y: number; position_z: number;
  rotation_x: number; rotation_y: number; rotation_z: number;
  scale_x: number; scale_y: number; scale_z: number;
}
interface Content {
  id: number; title: string; description: string | null;
  thumbnail_url: string | null; tracking_mode: string; mind_file_url: string | null; models: ArModel[];
  view_count: number;
  category: { name: string; slug: string; icon: string; color: string } | null;
}
interface RelatedContent { id: number; title: string; thumbnail_url: string | null; }
interface Props { content: Content; related: RelatedContent[]; }

// -----------------------------------------------------------------------
// 3D Scene Model Viewer
// -----------------------------------------------------------------------
function SceneModel({ model, isSelected, onClick }: { model: ArModel, isSelected: boolean, onClick: () => void }) {
  const { scene } = useGLTF(model.file_url);
  const cloned = React.useRef(scene.clone(true));
  const groupRef = React.useRef<THREE.Group>(null);

  // Calculate the actual center and top of the model's geometry
  const htmlPos = React.useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    if (box.isEmpty()) return [0, 1.5, 0] as [number, number, number];
    const center = new THREE.Vector3();
    box.getCenter(center);
    // Place HTML slightly above the highest point of the model
    // We adjust the padding proportionally to the object's height
    const size = new THREE.Vector3();
    box.getSize(size);
    const padding = size.y * 0.05; 
    return [center.x, box.max.y + padding, center.z] as [number, number, number];
  }, [scene]);

  React.useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(model.position_x, model.position_y, model.position_z);
    groupRef.current.rotation.set(
      THREE.MathUtils.degToRad(model.rotation_x),
      THREE.MathUtils.degToRad(model.rotation_y),
      THREE.MathUtils.degToRad(model.rotation_z),
    );
    groupRef.current.scale.set(model.scale_x, model.scale_y, model.scale_z);
  }, [model]);

  return (
    <group ref={groupRef} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <primitive object={cloned.current} />
      {isSelected && (
        <Html position={htmlPos} center zIndexRange={[100, 0]}>
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 min-w-[220px] max-w-[280px] text-left transform-gpu animate-in zoom-in-95 duration-200">
            <h4 className="font-black text-slate-800 text-sm mb-1">{model.name}</h4>
            {model.description ? (
              <p className="text-xs font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                {model.description}
              </p>
            ) : (
              <p className="text-xs font-medium text-slate-400 italic">
                Tidak ada deskripsi
              </p>
            )}

          </div>
        </Html>
      )}
    </group>
  );
}

export default function ArViewer({ content, related }: Props) {
  const [activeModelId, setActiveModelId] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(true);
  
  // Check if there are any models that are GLB/GLTF
  const glbModels = content.models.filter(m => ['glb', 'gltf'].includes(m.file_type.toLowerCase()));
  const pblrModels = content.models.filter(m => m.file_type.toLowerCase() === 'pblr');
  
  const hasGlb = glbModels.length > 0;
  const hasPblr = pblrModels.length > 0;

  if (isCameraMode && (content.mind_file_url || content.models.length > 0)) {
    const activeMindUrl = content.mind_file_url || '';
    return (
      <div className="fixed inset-0 z-50 bg-black font-nunito">
        <Head title={`${content.title} - AR Camera`} />
        
        {activeMindUrl ? (
          <MindARViewer mindFileUrl={activeMindUrl} models={glbModels.length > 0 ? glbModels : content.models} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
            <p className="font-bold text-lg mb-2">File Mind Target Belum Diunggah</p>
            <p className="text-sm text-white/70 mb-4">Upload file .mind pada admin panel untuk mengaktifkan pemindaian AR.</p>
            <button onClick={() => setIsCameraMode(false)} className="px-6 py-3 bg-violet-600 rounded-xl font-bold">
              Buka Mode 3D Studio
            </button>
          </div>
        )}
        
        {/* Top Controls */}
        <div className="absolute top-4 inset-x-4 z-50 flex justify-between items-start pointer-events-none">
          <Link href="/" className="pointer-events-auto bg-black/50 text-white p-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex gap-2 pointer-events-auto">
            <button 
              onClick={() => setIsCameraMode(false)} 
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-3 rounded-2xl backdrop-blur-md border border-violet-400/30 shadow-xl flex items-center gap-2 font-bold text-xs"
            >
              <Monitor className="w-4 h-4" /> Mode 3D Studio
            </button>

            <button onClick={() => setShowInfo(!showInfo)} className="bg-black/50 text-white px-4 py-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl flex items-center gap-2 font-bold text-xs">
              <Info className="w-4 h-4" /> Info
            </button>
          </div>
        </div>

        {/* Info Modal */}
        {showInfo && (
          <div className="absolute inset-x-4 bottom-4 z-50 bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-white shadow-2xl">
            <h2 className="text-xl font-black mb-2">{content.title}</h2>
            <p className="text-white/70 text-sm mb-4 leading-relaxed">{content.description || 'Tidak ada deskripsi'}</p>
            <button onClick={() => setShowInfo(false)} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors">Tutup</button>
          </div>
        )}
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: content.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link disalin ke clipboard!');
    }
  };

  return (
    <PublicLayout>
      <Head title={content.title} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white font-bold mb-6 transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Beranda
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Viewer Area */}
          <div className="lg:col-span-2">
            <div className="glass border border-white/10 rounded-3xl overflow-hidden">
              {/* Viewer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center gap-2 text-white/50 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  INTERACTIVE 3D SCENE
                </div>
                <div className="flex gap-2">
                  <button onClick={handleShare} className="p-2 rounded-lg glass hover:bg-white/20 transition-colors" title="Bagikan">
                    <Share2 className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              </div>

              {/* Viewer Content */}
              <div className="p-4 relative">
                {hasGlb ? (
                  <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-300" style={{ height: '500px' }}>
                    <Canvas
                      camera={{ position: [0, 2, 6], fov: 50 }}
                      onPointerMissed={() => setActiveModelId(null)}
                      gl={{ antialias: true }}
                    >
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
                      <Environment preset="city" />

                      <Suspense fallback={null}>
                        {glbModels.map(m => (
                          <SceneModel 
                            key={m.id} 
                            model={m} 
                            isSelected={activeModelId === m.id}
                            onClick={() => setActiveModelId(m.id)}
                          />
                        ))}
                      </Suspense>

                      <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={20} blur={2} far={4} />
                      <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} enableDamping />
                    </Canvas>

                    {/* Instruction Overlay */}
                    <div className="absolute top-4 left-4 p-3 bg-white/90 backdrop-blur-md rounded-xl shadow-lg pointer-events-none">
                      <p className="font-black text-slate-800 text-xs flex items-center gap-2">
                        <Hand className="w-3.5 h-3.5 text-violet-600" /> Putar Objek
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1">Klik pada model untuk info</p>
                    </div>
                    
                  </div>
                ) : hasPblr ? (
                  <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-violet-950 to-indigo-950 flex flex-col items-center justify-center py-16 px-8 text-center" style={{ minHeight: '400px' }}>
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mb-6 float-animation shadow-2xl shadow-violet-500/40">
                      <i className="fa-solid fa-vr-cardboard text-4xl text-white"></i>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">File AR Siap!</h3>
                    <p className="text-white/60 font-medium mb-8 max-w-sm">
                      Konten AR dalam format <strong className="text-violet-400">.PBLR</strong> sudah tersedia.
                      Download dan buka dengan aplikasi AR yang mendukung format ini.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {pblrModels.map(m => (
                        <a
                          key={m.id}
                          href={m.file_url}
                          download
                          className="inline-flex items-center gap-3 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl shadow-xl shadow-violet-500/40 transition-all hover:-translate-y-0.5"
                        >
                          <Download className="w-4 h-4" />
                          Download {m.name}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col items-center justify-center py-16 px-8 text-center" style={{ minHeight: '400px' }}>
                    <Monitor className="w-16 h-16 text-white/20 mb-4" />
                    <p className="text-white/60 font-bold">Format file tidak didukung untuk preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass border border-white/10 rounded-3xl p-6">
              {content.category && (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold mb-4 text-white`} style={{ backgroundColor: content.category.color }}>
                  <i className={content.category.icon}></i>
                  {content.category.name}
                </div>
              )}
              <h1 className="text-2xl font-black text-white mb-3 leading-tight">{content.title}</h1>
              <div className="flex items-center gap-4 text-white/40 text-sm font-medium mb-6">
                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {content.view_count} tayangan</span>
                <span className="flex items-center gap-1.5"><BoxSelect className="w-4 h-4" /> {content.models.length} Model</span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-white/70 leading-relaxed font-medium">
                  {content.description || 'Tidak ada deskripsi.'}
                </p>
              </div>
            </div>

            {/* Related Models List */}
            {glbModels.length > 0 && (
              <div className="glass border border-white/10 rounded-3xl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <BoxSelect className="w-4 h-4 text-violet-400" />
                  Daftar Objek di Scene
                </h3>
                <div className="space-y-2">
                  {glbModels.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setActiveModelId(m.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all border ${
                        activeModelId === m.id 
                          ? 'bg-violet-600/20 border-violet-500 text-white' 
                          : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <p className="font-bold text-sm">{m.name}</p>
                      <p className="text-xs opacity-60 mt-1 line-clamp-1">{m.description || 'Tidak ada info tambahan'}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
