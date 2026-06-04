'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, CameraOff, Search, Scan, Loader2 } from 'lucide-react';

interface Props {
  onClose: () => void;
  /** Called with the scanned/entered tracking ID */
  onResult: (id: string) => void;
  title?: string;
}

export default function QRScannerModal({ onClose, onResult, title = 'Scan Tracking ID' }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [cameraError, setCameraError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  const [flash, setFlash] = useState(false);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const handleResult = useCallback((raw: string) => {
    // Extract TS-XXXX or TS-XXXXX style IDs from a URL or plain string
    const match = raw.match(/TS-\d+/i) || raw.match(/QT-\d+/i);
    const id = match ? match[0].toUpperCase() : raw.trim().toUpperCase();
    setFlash(true);
    setTimeout(() => setFlash(false), 400);
    stopCamera();
    setTimeout(() => onResult(id), 350);
  }, [onResult, stopCamera]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setScanning(true);
        startDetecting();
      } catch {
        setCameraError('Camera access denied or not available.');
      }
    };

    const startDetecting = () => {
      const hasBD = 'BarcodeDetector' in window;
      if (!hasBD) {
        setCameraError('Live scan not supported in this browser — use manual entry below.');
        return;
      }
      // @ts-ignore — BarcodeDetector is not in TS lib yet
      const detector = new window.BarcodeDetector({
        formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'data_matrix'],
      });
      const tick = async () => {
        const v = videoRef.current;
        if (v && v.readyState >= 2) {
          try {
            const results = await detector.detect(v);
            if (results.length > 0) {
              handleResult(results[0].rawValue);
              return; // stop loop after first hit
            }
          } catch {}
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    startCamera();
    return () => stopCamera();
  }, [handleResult, stopCamera]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) { stopCamera(); onClose(); } }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 text-[var(--brand-orange)] rounded-2xl flex items-center justify-center">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm uppercase italic tracking-tight">{title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">QR · Barcode · Manual</p>
            </div>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="w-10 h-10 bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-2xl flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera viewport */}
        <div className="relative mx-6 rounded-[2rem] overflow-hidden bg-slate-900" style={{ aspectRatio: '1/1' }}>
          {/* Flash overlay on scan */}
          <AnimatePresence>
            {flash && (
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 bg-emerald-400 z-20 rounded-[2rem]"
              />
            )}
          </AnimatePresence>

          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Scanning aimer overlay */}
          {scanning && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-48 h-48">
                {/* Corner brackets */}
                {[
                  'top-0 left-0 border-t-4 border-l-4',
                  'top-0 right-0 border-t-4 border-r-4',
                  'bottom-0 left-0 border-b-4 border-l-4',
                  'bottom-0 right-0 border-b-4 border-r-4',
                ].map((cls, i) => (
                  <div key={i} className={`absolute w-8 h-8 border-[var(--brand-orange)] rounded-sm ${cls}`} />
                ))}
                {/* Scan line animation */}
                <motion.div
                  initial={{ top: '10%' }}
                  animate={{ top: '90%' }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                  className="absolute left-0 right-0 h-0.5 bg-[var(--brand-orange)] opacity-80"
                />
              </div>
            </div>
          )}

          {/* No camera state */}
          {!scanning && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <p className="text-white text-xs font-bold uppercase tracking-widest">Starting camera...</p>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <CameraOff className="w-10 h-10 text-slate-400" />
              <p className="text-slate-300 text-xs font-bold leading-relaxed">{cameraError}</p>
            </div>
          )}
        </div>

        {/* Manual entry */}
        <div className="px-6 py-6 space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">— or enter ID manually —</p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="TS-0000 · QT-0000 ..."
              value={manualId}
              onChange={e => setManualId(e.target.value.toUpperCase())}
              onKeyDown={e => { if (e.key === 'Enter' && manualId.trim()) handleResult(manualId); }}
              className="flex-1 bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500/20 uppercase tracking-wider"
              autoFocus={!!cameraError}
            />
            <button
              onClick={() => manualId.trim() && handleResult(manualId)}
              disabled={!manualId.trim()}
              className="px-6 py-4 bg-[var(--brand-orange)] text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-40 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center">
            Point camera at a QR code or barcode on the shipping label
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
