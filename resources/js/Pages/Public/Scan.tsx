import React, { useEffect, useState, useRef } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Html5Qrcode } from 'html5-qrcode';
import { ArrowLeft, Camera, RefreshCcw, AlertTriangle } from 'lucide-react';
import { PageProps as BasePageProps } from '@/types';

type PageProps = Omit<BasePageProps, 'auth'> & { auth?: { user?: any } };

export default function Scan() {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Check permissions and get cameras
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        setCameras(devices);
        // Default to the back camera if available
        const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
        setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
      } else {
        setError('Kamera tidak ditemukan pada perangkat ini.');
      }
    }).catch(err => {
      console.error(err);
      setError('Izin kamera ditolak atau kamera tidak dapat diakses.');
    });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (!selectedCamera) return;
    
    setError(null);
    setScanning(true);

    try {
      scannerRef.current = new Html5Qrcode("reader");
      
      await scannerRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        (errorMessage) => {
          // Ignored because this fires on every frame without a QR code
        }
      );
    } catch (err: any) {
      console.error("Error starting scanner", err);
      setError('Gagal memulai kamera: ' + (err?.message || 'Error tidak diketahui'));
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        scannerRef.current?.clear();
      }).catch(console.error);
    }
    setScanning(false);
  };

  const handleScan = (text: string) => {
    stopScanner();
    
    // Check if it's a valid URL pointing to our app
    try {
      const url = new URL(text);
      if (url.pathname.startsWith('/ar/')) {
        router.get(url.pathname);
      } else {
        // Just navigate to whatever it is if they want, but let's restrict to our app
        setError('QR Code bukan berasal dari aplikasi AR Explorer.');
      }
    } catch {
      // If it's just an ID
      if (!isNaN(Number(text))) {
        router.get(`/ar/${text}`);
      } else {
        setError(`QR Code tidak valid: ${text}`);
      }
    }
  };

  const toggleCamera = () => {
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex(c => c.id === selectedCamera);
      const nextIndex = (currentIndex + 1) % cameras.length;
      
      stopScanner();
      setSelectedCamera(cameras[nextIndex].id);
      
      // Small timeout to allow UI/scanner to clean up before restarting
      setTimeout(() => {
        startScanner();
      }, 300);
    }
  };

  return (
    <PublicLayout>
      <Head title="Scan QR Code" />

      <div className="max-w-md mx-auto px-4 py-8 flex flex-col min-h-[80vh]">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white font-bold mb-6 transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Kembali
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/40">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">Scan QR AR</h1>
          <p className="text-white/60 font-medium mt-2">Arahkan kamera ke QR Code materi AR</p>
        </div>

        <div className="glass border border-white/10 rounded-3xl overflow-hidden p-4 relative flex-1 flex flex-col">
          {error && (
            <div className="absolute top-8 left-4 right-4 z-10 bg-red-500/90 backdrop-blur text-white p-4 rounded-xl flex items-start gap-3 shadow-xl">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Terjadi Kesalahan</p>
                <p className="text-xs opacity-90 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div 
            id="reader" 
            className="w-full bg-black/40 rounded-2xl overflow-hidden mb-4 flex-1 flex items-center justify-center"
          >
            {!scanning && (
              <div className="text-white/40 font-bold text-sm">
                Kamera tidak aktif
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {cameras.length > 1 && (
              <button 
                onClick={toggleCamera}
                disabled={!scanning}
                className="w-full px-4 py-3 rounded-xl glass hover:bg-white/10 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" /> Ganti Kamera
              </button>
            )}

            {!scanning ? (
              <button 
                onClick={startScanner}
                className="w-full px-4 py-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black transition-all shadow-lg shadow-violet-500/40 active:scale-95 text-lg"
              >
                Mulai Scan
              </button>
            ) : (
              <button 
                onClick={stopScanner}
                className="w-full px-4 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black transition-all shadow-lg shadow-red-500/40 active:scale-95 text-lg"
              >
                Berhenti
              </button>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
