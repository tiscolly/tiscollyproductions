import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, 
  Lock, 
  File, 
  Check, 
  Copy, 
  X, 
  AlertCircle, 
  Clock, 
  Zap, 
  ShieldCheck, 
  FileArchive, 
  ArrowRight, 
  RotateCcw,
  Eye,
  EyeOff,
  Edit3
} from 'lucide-react';
import { API_BASE } from '../config';
import { formatBytes, formatItalianDate, formatRemainingTime } from '../utils/transfer';

const CHUNK_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_CONCURRENT_PARTS = 3;
const RETRY_DELAYS = [2000, 4000, 8000]; // 2s, 4s, 8s

interface CompletedPart {
  partNumber: number;
  etag: string;
}

interface UploadResult {
  id: string;
  fileId?: string;
  size: number;
  expiresAt: string;
}

// Helper to sanitize name into slug: lowercase, no accents, spaces and symbols replaced by hyphens
export const cleanLinkName = (input: string): string => {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default function TransferPage() {
  // Password kept exclusively in React state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Link name state - kept in state and ref so upload completion reads current value
  const [linkName, setLinkName] = useState('');
  const linkNameRef = useRef('');

  // Post-upload "Cambia nome" state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editLinkName, setEditLinkName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [editNameError, setEditNameError] = useState<string | null>(null);

  // Origin for preview
  const [origin, setOrigin] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileWarning, setFileWarning] = useState<string | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // 0 to 100
  const [uploadSpeedMBs, setUploadSpeedMBs] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Completed transfer result
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // References for active upload control
  const activeXhrsRef = useRef<Set<XMLHttpRequest>>(new Set());
  const abortControllerRef = useRef<boolean>(false);
  const currentUploadMetaRef = useRef<{ id: string; uploadId: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Speed calculation tracking
  const speedTrackerRef = useRef<{
    lastTime: number;
    lastLoaded: number;
    samples: { time: number; loaded: number }[];
  }>({
    lastTime: 0,
    lastLoaded: 0,
    samples: [],
  });

  // Handle Auth submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setAuthError('Inserisci la password per continuare.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const response = await fetch(`${API_BASE}/api/auth`, {
        method: 'POST',
        headers: {
          'X-Password': password,
        },
      });

      if (response.status === 200) {
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        setAuthError('Password errata');
      } else {
        setAuthError(`Errore di autenticazione (${response.status})`);
      }
    } catch (err) {
      console.error('Auth request failed:', err);
      setAuthError('Impossibile contattare il server. Verifica la connessione e la configurazione.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Drag and drop handlers - upload starts immediately upon selecting a file
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setFileWarning(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length > 1) {
        setFileWarning('È possibile caricare un solo file alla volta. Comprimi più file in un archivio .zip.');
      }
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      startMultipartUpload(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileWarning(null);
    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files.length > 1) {
        setFileWarning('È possibile caricare un solo file alla volta. Comprimi più file in un archivio .zip.');
      }
      const file = e.target.files[0];
      setSelectedFile(file);
      startMultipartUpload(file);
    }
  };

  // Helper sleep for backoff retry
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Single part upload with XHR and retry
  const uploadPartWithRetry = async (
    file: File,
    partNumber: number,
    start: number,
    end: number,
    id: string,
    uploadId: string,
    onPartProgress: (loaded: number) => void
  ): Promise<CompletedPart> => {
    const chunkBlob = file.slice(start, end);

    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
      if (abortControllerRef.current) {
        throw new Error('Upload annullato');
      }

      try {
        const etag = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          activeXhrsRef.current.add(xhr);

          xhr.open('PUT', `${API_BASE}/api/upload/part?id=${encodeURIComponent(id)}&uploadId=${encodeURIComponent(uploadId)}&part=${partNumber}`);
          xhr.setRequestHeader('X-Password', password);

          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
              onPartProgress(evt.loaded);
            }
          };

          xhr.onload = () => {
            activeXhrsRef.current.delete(xhr);
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const json = JSON.parse(xhr.responseText);
                if (json.etag) {
                  resolve(json.etag);
                  return;
                }
              } catch {
                // Non-JSON response, fallback to ETag header
              }
              const headerEtag = xhr.getResponseHeader('ETag') || xhr.getResponseHeader('etag');
              if (headerEtag) {
                resolve(headerEtag.replace(/"/g, ''));
              } else {
                resolve(`part-${partNumber}`);
              }
            } else {
              reject(new Error(`Part ${partNumber} failed with status ${xhr.status}: ${xhr.statusText}`));
            }
          };

          xhr.onerror = () => {
            activeXhrsRef.current.delete(xhr);
            reject(new Error(`Network error on part ${partNumber}`));
          };

          xhr.onabort = () => {
            activeXhrsRef.current.delete(xhr);
            reject(new Error('Upload annullato'));
          };

          xhr.send(chunkBlob);
        });

        // Report full size on complete
        onPartProgress(chunkBlob.size);
        return { partNumber, etag };
      } catch (err) {
        if (abortControllerRef.current) {
          throw new Error('Upload annullato');
        }

        if (attempt < RETRY_DELAYS.length) {
          const delay = RETRY_DELAYS[attempt];
          console.warn(`Part ${partNumber} failed (attempt ${attempt + 1}). Retrying in ${delay}ms...`, err);
          await wait(delay);
        } else {
          throw err;
        }
      }
    }

    throw new Error(`Part ${partNumber} fallita dopo ${RETRY_DELAYS.length + 1} tentativi.`);
  };

  // Perform multipart upload
  const startMultipartUpload = async (fileParam?: File) => {
    const file = fileParam || selectedFile;
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    setUploadSpeedMBs(0);
    setRemainingSeconds(null);
    setUploadedBytes(0);
    abortControllerRef.current = false;
    activeXhrsRef.current.clear();
    currentUploadMetaRef.current = null;

    const totalSize = file.size;
    const partCount = Math.max(1, Math.ceil(totalSize / CHUNK_SIZE));

    // Progress tracking structures
    const partProgressMap: { [partNumber: number]: number } = {};
    for (let i = 1; i <= partCount; i++) {
      partProgressMap[i] = 0;
    }

    // Initialize speed tracking
    const startTime = Date.now();
    speedTrackerRef.current = {
      lastTime: startTime,
      lastLoaded: 0,
      samples: [{ time: startTime, loaded: 0 }],
    };

    const updateAggregatedProgress = () => {
      let currentTotalLoaded = 0;
      for (let i = 1; i <= partCount; i++) {
        currentTotalLoaded += partProgressMap[i] || 0;
      }
      currentTotalLoaded = Math.min(currentTotalLoaded, totalSize);
      setUploadedBytes(currentTotalLoaded);

      const percent = totalSize > 0 ? (currentTotalLoaded / totalSize) * 100 : 100;
      setUploadProgress(Math.min(99.5, percent));

      // Calculate speed and ETA
      const now = Date.now();
      const tracker = speedTrackerRef.current;
      tracker.samples.push({ time: now, loaded: currentTotalLoaded });

      // Keep last 3 seconds of samples
      tracker.samples = tracker.samples.filter((s) => now - s.time <= 3000);

      if (tracker.samples.length >= 2) {
        const oldest = tracker.samples[0];
        const timeDiffSec = (now - oldest.time) / 1000;
        const loadedDiff = currentTotalLoaded - oldest.loaded;

        if (timeDiffSec > 0.4 && loadedDiff > 0) {
          const speedBps = loadedDiff / timeDiffSec;
          const speedMBps = speedBps / (1024 * 1024);
          setUploadSpeedMBs(parseFloat(speedMBps.toFixed(1)));

          const bytesLeft = totalSize - currentTotalLoaded;
          if (speedBps > 0 && bytesLeft > 0) {
            setRemainingSeconds(bytesLeft / speedBps);
          }
        }
      }
    };

    try {
      // 1. POST /api/upload/start (body SOLO { filename, contentType })
      const startRes = await fetch(`${API_BASE}/api/upload/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password,
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
        }),
      });

      if (!startRes.ok) {
        const errorText = await startRes.text().catch(() => '');
        throw new Error(`Inizializzazione upload fallita (${startRes.status}): ${errorText || startRes.statusText}`);
      }

      const { id, uploadId } = await startRes.json();
      currentUploadMetaRef.current = { id, uploadId };

      if (abortControllerRef.current) {
        throw new Error('Upload annullato');
      }

      // 2. Queue parts with max 3 concurrency
      const completedParts: CompletedPart[] = [];
      const partsToUpload: { partNumber: number; start: number; end: number }[] = [];

      for (let i = 1; i <= partCount; i++) {
        const start = (i - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, totalSize);
        partsToUpload.push({ partNumber: i, start, end });
      }

      let currentIndex = 0;
      let activeWorkers = 0;
      let workerError: Error | null = null;

      await new Promise<void>((resolve, reject) => {
        const runNext = () => {
          if (workerError) {
            reject(workerError);
            return;
          }

          if (abortControllerRef.current) {
            reject(new Error('Upload annullato'));
            return;
          }

          if (currentIndex >= partsToUpload.length && activeWorkers === 0) {
            resolve();
            return;
          }

          while (activeWorkers < MAX_CONCURRENT_PARTS && currentIndex < partsToUpload.length) {
            const partInfo = partsToUpload[currentIndex++];
            activeWorkers++;

            uploadPartWithRetry(
              file,
              partInfo.partNumber,
              partInfo.start,
              partInfo.end,
              id,
              uploadId,
              (chunkLoaded) => {
                partProgressMap[partInfo.partNumber] = chunkLoaded;
                updateAggregatedProgress();
              }
            )
              .then((result) => {
                completedParts.push(result);
                activeWorkers--;
                runNext();
              })
              .catch((err) => {
                activeWorkers--;
                if (!workerError) {
                  workerError = err;
                }
                runNext();
              });
          }
        };

        runNext();
      });

      if (abortControllerRef.current) {
        throw new Error('Upload annullato');
      }

      // Sort parts by partNumber
      completedParts.sort((a, b) => a.partNumber - b.partNumber);

      // 3. POST /api/upload/complete (con name al momento del completamento, se presente)
      const currentNameVal = linkNameRef.current.trim();
      const completeBody: Record<string, any> = {
        id,
        uploadId,
        parts: completedParts.map((p) => ({ partNumber: p.partNumber, etag: p.etag })),
      };
      if (currentNameVal) {
        completeBody.name = currentNameVal;
      }

      const completeRes = await fetch(`${API_BASE}/api/upload/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password,
        },
        body: JSON.stringify(completeBody),
      });

      if (!completeRes.ok) {
        const errText = await completeRes.text().catch(() => '');
        throw new Error(`Completamento upload fallito (${completeRes.status}): ${errText || completeRes.statusText}`);
      }

      const completeData = await completeRes.json();
      setUploadProgress(100);
      setUploadResult({
        id: completeData.id || id,
        fileId: completeData.fileId,
        size: completeData.size || totalSize,
        expiresAt: completeData.expiresAt,
      });
      setIsUploading(false);
    } catch (err: any) {
      console.error('Upload failed or aborted:', err);
      const isAbort = abortControllerRef.current || err?.message === 'Upload annullato';

      // 4. Abort call to backend
      if (currentUploadMetaRef.current) {
        const { id, uploadId } = currentUploadMetaRef.current;
        try {
          await fetch(`${API_BASE}/api/upload/abort`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Password': password,
            },
            body: JSON.stringify({ id, uploadId }),
          });
        } catch (abortErr) {
          console.warn('Abort notification failed:', abortErr);
        }
      }

      setIsUploading(false);
      if (!isAbort) {
        setUploadError(err?.message || 'Si è verificato un errore durante il caricamento.');
      }
    }
  };

  // Cancel upload action
  const handleCancelUpload = () => {
    abortControllerRef.current = true;
    activeXhrsRef.current.forEach((xhr) => {
      try {
        xhr.abort();
      } catch (e) {
        console.warn('Error aborting xhr:', e);
      }
    });
    activeXhrsRef.current.clear();
    setIsUploading(false);
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadSpeedMBs(0);
    setRemainingSeconds(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyLink = () => {
    if (!uploadResult) return;
    const shareUrl = `${origin || window.location.origin}/t/${uploadResult.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  // 4. Cambia nome submit: POST {API_BASE}/api/link con header X-Password e body { fileId, name }
  const handleChangeNameSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!uploadResult?.fileId) {
      setEditNameError('Identificativo file mancante.');
      return;
    }
    const nameToSave = editLinkName.trim();
    if (!nameToSave) {
      setEditNameError('Inserisci un nome per il link.');
      return;
    }

    setIsSavingName(true);
    setEditNameError(null);

    try {
      const res = await fetch(`${API_BASE}/api/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password,
        },
        body: JSON.stringify({
          fileId: uploadResult.fileId,
          name: nameToSave,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Aggiornamento link fallito (${res.status}): ${errText || res.statusText}`);
      }

      const data = await res.json();
      setUploadResult((prev) =>
        prev
          ? {
              ...prev,
              id: data.id,
              expiresAt: data.expiresAt || prev.expiresAt,
            }
          : null
      );
      setLinkName(nameToSave);
      linkNameRef.current = nameToSave;
      setIsEditingName(false);
    } catch (err: any) {
      console.error('Error changing link name:', err);
      setEditNameError(err?.message || 'Errore durante la modifica del nome.');
    } finally {
      setIsSavingName(false);
    }
  };

  // 5. "Carica un altro file" svuota il campo nome
  const handleUploadAnother = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadProgress(0);
    setUploadError(null);
    setFileWarning(null);
    setLinkName('');
    linkNameRef.current = '';
    setEditLinkName('');
    setIsEditingName(false);
    setEditNameError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentWindowOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const cleanCurrentSlug = cleanLinkName(linkName);
  const cleanEditSlug = cleanLinkName(editLinkName);

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 md:px-12 flex flex-col justify-between relative overflow-hidden bg-dark">
      <Helmet>
        <title>Tiscolly Transfer | File Transfer Personale</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Atmospheric background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="container mx-auto max-w-2xl relative z-10 my-auto">
        {/* Brand header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/10 mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Tiscolly Transfer
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-white">
            Send Big <span className="italic font-light">Files</span>
          </h1>
          <p className="text-white/40 text-sm mt-3 max-w-md mx-auto leading-relaxed">
            Trasferimento diretto di file multimediali, master e archivi cinematografici ad alta velocità.
          </p>
        </div>

        {/* ======================================================== */}
        {/* SCREEN 1: LOGIN (PASSWORD VERIFICATION)                 */}
        {/* ======================================================== */}
        {!isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass backdrop-blur-2xl p-8 md:p-10 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mx-auto mb-6 text-white/80">
              <Lock size={24} />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-white mb-2">
                Accesso Riservato
              </h2>
              <p className="text-xs text-white/40 max-w-xs mx-auto">
                Inserisci la password di amministrazione per abilitare i trasferimenti.
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-5">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="Inserisci la password"
                  autoFocus
                  className="w-full px-5 py-4 pr-12 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-white/40 focus:outline-none text-white text-sm tracking-wider placeholder:text-white/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                >
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{authError}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isAuthenticating || !password}
                className="w-full py-4 bg-white text-dark rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-2"
              >
                {isAuthenticating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                    <span>Verifica in corso...</span>
                  </>
                ) : (
                  <>
                    <span>Entra</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : uploadResult ? (
          /* ======================================================== */
          /* SCREEN 3: UPLOAD COMPLETED (SHARE LINK)                  */
          /* ======================================================== */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass backdrop-blur-2xl p-8 md:p-10 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto mb-6">
              <Check size={28} />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-white mb-2">
                Trasferimento Pronto!
              </h2>
              <p className="text-xs text-white/50">
                Il tuo file è stato caricato e rimarrà disponibile per il download.
              </p>
            </div>

            <div className="space-y-6">
              {/* Share link box */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/40 mb-3 font-bold">
                  <span>Link di condivisione</span>
                  <span className="text-emerald-400 font-sans normal-case tracking-normal text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Attivo
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${currentWindowOrigin}/t/${uploadResult.id}`}
                    className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl text-white font-mono text-xs px-3.5 py-3 outline-none select-all"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleCopyLink}
                      className={`flex-1 sm:flex-none px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        copiedLink
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white text-dark hover:bg-opacity-90'
                      }`}
                    >
                      {copiedLink ? (
                        <>
                          <Check size={14} />
                          <span>Copiato!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copia link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditLinkName(linkName || '');
                        setEditNameError(null);
                        setIsEditingName(!isEditingName);
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-white/10 hover:border-white/30 text-white hover:bg-white/5"
                    >
                      <Edit3 size={13} />
                      <span>Cambia nome</span>
                    </button>
                  </div>
                </div>

                {/* Inline form to change link name */}
                {isEditingName && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                        Nuovo nome del link
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsEditingName(false)}
                        className="text-white/40 hover:text-white text-xs"
                      >
                        Annulla
                      </button>
                    </div>

                    <form onSubmit={handleChangeNameSubmit} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={editLinkName}
                        onChange={(e) => setEditLinkName(e.target.value)}
                        placeholder="es. fincantieri-explora"
                        autoFocus
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-white/40 focus:outline-none text-white text-xs tracking-wide placeholder:text-white/20 transition-all font-mono"
                      />
                      <button
                        type="submit"
                        disabled={isSavingName || !editLinkName.trim()}
                        className="px-5 py-2.5 bg-white text-dark rounded-xl font-display font-bold text-xs uppercase tracking-wider hover:bg-opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shrink-0"
                      >
                        {isSavingName ? (
                          <>
                            <div className="w-3 h-3 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                            <span>Salvataggio...</span>
                          </>
                        ) : (
                          <span>Salva</span>
                        )}
                      </button>
                    </form>

                    <div className="text-[11px] font-mono text-white/40 flex items-center gap-1.5 break-all">
                      <span className="text-white/25 select-none">Anteprima:</span>
                      <span className="text-white/70">
                        {currentWindowOrigin}/t/{cleanEditSlug ? `${cleanEditSlug}-xxxx` : '<nome-pulito>-xxxx'}
                      </span>
                    </div>

                    {editNameError && (
                      <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-1.5">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{editNameError}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Expiration and metadata details */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">
                    <Clock size={12} />
                    <span>Scadenza</span>
                  </div>
                  <p className="text-white text-xs font-medium">
                    {uploadResult.expiresAt ? formatItalianDate(uploadResult.expiresAt) : 'Non impostata'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">
                    <File size={12} />
                    <span>Dimensione</span>
                  </div>
                  <p className="text-white text-xs font-medium">
                    {formatBytes(uploadResult.size)}
                  </p>
                </div>
              </div>

              {/* Action: Upload another file */}
              <button
                onClick={handleUploadAnother}
                className="w-full py-4 border border-white/10 hover:border-white/30 text-white rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={15} />
                <span>Carica un altro file</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* ======================================================== */
          /* SCREEN 2: UPLOAD (DROPZONE & PROGRESS)                   */
          /* ======================================================== */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass backdrop-blur-2xl p-8 md:p-10 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden"
          >
            {/* Note banner for zip multiple files */}
            <div className="flex items-start gap-3 p-3.5 mb-5 rounded-2xl bg-white/[0.02] border border-white/5 text-white/50 text-xs">
              <FileArchive size={16} className="text-white/70 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="text-white font-medium">Più file o cartelle?</span> Se devi inviare più elementi, <strong className="text-white/80">comprimi in uno .zip</strong> prima di caricarli.
              </div>
            </div>

            {/* 1. Campo "Nome del link" - SEMPRE visibile e modificabile anche mentre l'upload è in corso */}
            <div className="mb-6 p-4 md:p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-2">
                Nome del link <span className="text-white/30 font-normal lowercase tracking-normal">(opzionale)</span>
              </label>
              <input
                type="text"
                value={linkName}
                onChange={(e) => {
                  setLinkName(e.target.value);
                  linkNameRef.current = e.target.value;
                }}
                placeholder="es. fincantieri-explora"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-white/40 focus:outline-none text-white text-xs tracking-wide placeholder:text-white/20 transition-all font-mono"
              />
              <div className="mt-2 text-[11px] font-mono text-white/40 flex items-center gap-1.5 break-all">
                <span className="text-white/25 select-none">Anteprima:</span>
                <span className="text-white/70">
                  {currentWindowOrigin}/t/{cleanCurrentSlug ? `${cleanCurrentSlug}-xxxx` : '<nome-pulito>-xxxx'}
                </span>
              </div>
            </div>

            {/* Error banner if upload failed */}
            {uploadError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold mb-0.5">Errore di trasferimento</p>
                  <p className="text-red-400/90 leading-relaxed">{uploadError}</p>
                </div>
                <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-white">
                  <X size={15} />
                </button>
              </motion.div>
            )}

            {/* Warning if multi files dropped */}
            {fileWarning && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3.5 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs"
              >
                <AlertCircle size={15} className="shrink-0" />
                <span>{fileWarning}</span>
              </motion.div>
            )}

            {isUploading ? (
              /* Uploading progress panel */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                      <Zap size={20} className="text-amber-400 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white truncate max-w-[220px] md:max-w-[320px]">
                        {selectedFile?.name}
                      </p>
                      <p className="text-xs text-white/40">
                        {formatBytes(uploadedBytes)} di {selectedFile ? formatBytes(selectedFile.size) : '0 B'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-display font-bold text-white">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative w-full h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-white rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                {/* Stats: Speed & Remaining Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5">
                    <Zap size={14} className="text-amber-400 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Velocità</div>
                      <div className="text-xs font-mono font-medium text-white">
                        {uploadSpeedMBs > 0 ? `${uploadSpeedMBs} MB/s` : 'Avvio...'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5">
                    <Clock size={14} className="text-white/60 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Tempo Rimanente</div>
                      <div className="text-xs font-mono font-medium text-white">
                        {remainingSeconds !== null ? formatRemainingTime(remainingSeconds) : 'Calcolo...'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancel button */}
                <button
                  type="button"
                  onClick={handleCancelUpload}
                  className="w-full py-3.5 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-2xl font-display font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Annulla Trasferimento
                </button>
              </div>
            ) : (
              /* Dropzone - upload starts immediately upon drop or file pick */
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative p-10 md:p-14 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center ${
                    isDragging
                      ? 'border-white bg-white/10 scale-[1.01]'
                      : 'border-white/15 bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 mb-5 group-hover:scale-110 group-hover:text-white transition-all">
                    <UploadCloud size={30} />
                  </div>

                  <h3 className="text-lg font-display font-bold uppercase tracking-tight text-white mb-2">
                    Trascina qui il file
                  </h3>
                  <p className="text-xs text-white/40 max-w-xs leading-relaxed mb-6">
                    oppure clicca per selezionare dal tuo computer. L'upload partirà immediatamente.
                  </p>

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-dark text-[11px] font-bold uppercase tracking-wider group-hover:bg-opacity-90 transition-all">
                    Seleziona file
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Security and privacy footer note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-white/30 text-xs">
          <ShieldCheck size={14} />
          <span>Upload diretto multipart a blocchi di 50 MB con crittografia end-to-end</span>
        </div>
      </div>
    </div>
  );
}
