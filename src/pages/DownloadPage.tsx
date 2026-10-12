import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { 
  Download, 
  Clock, 
  File, 
  FileVideo, 
  FileArchive, 
  FileAudio, 
  FileImage, 
  AlertTriangle, 
  ShieldCheck, 
  HardDrive, 
  ArrowLeft,
  Calendar,
  Sparkles
} from 'lucide-react';
import { API_BASE } from '../config';
import { formatBytes, formatItalianDate } from '../utils/transfer';

interface FileMetadata {
  id: string;
  filename: string;
  size: number;
  contentType?: string;
  uploadedAt?: string;
  expiresAt?: string;
}

export default function DownloadPage() {
  const { id } = useParams<{ id: string }>();
  const [fileData, setFileData] = useState<FileMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpiredOrNotFound, setIsExpiredOrNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsExpiredOrNotFound(true);
      setLoading(false);
      return;
    }

    const fetchFileInfo = async () => {
      setLoading(true);
      setIsExpiredOrNotFound(false);
      setErrorMessage(null);

      try {
        const res = await fetch(`${API_BASE}/api/file/${encodeURIComponent(id)}`);
        
        if (res.status === 404 || res.status === 410) {
          setIsExpiredOrNotFound(true);
        } else if (!res.ok) {
          setErrorMessage(`Errore nel caricamento del file (${res.status})`);
        } else {
          const data: FileMetadata = await res.json();
          setFileData(data);
        }
      } catch (err) {
        console.error('Error fetching file info:', err);
        setErrorMessage('Impossibile verificare i dettagli del trasferimento. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchFileInfo();
  }, [id]);

  // Determine file icon
  const getFileIcon = (filename?: string, contentType?: string) => {
    const ext = filename?.split('.').pop()?.toLowerCase() || '';
    const mime = contentType?.toLowerCase() || '';

    if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'prores'].includes(ext) || mime.startsWith('video/')) {
      return <FileVideo size={40} className="text-red-400" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) {
      return <FileArchive size={40} className="text-amber-400" />;
    }
    if (['mp3', 'wav', 'aac', 'flac', 'm4a'].includes(ext) || mime.startsWith('audio/')) {
      return <FileAudio size={40} className="text-emerald-400" />;
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff', 'exr', 'dng', 'cr3'].includes(ext) || mime.startsWith('image/')) {
      return <FileImage size={40} className="text-sky-400" />;
    }
    return <File size={40} className="text-white/80" />;
  };

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 md:px-12 flex flex-col justify-between relative overflow-hidden bg-dark">
      <Helmet>
        <title>{fileData ? `${fileData.filename} • Il tuo progetto è pronto | Tiscolly Transfer` : 'Ecco a te il tuo nuovo progetto | Tiscolly Transfer'}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Atmospheric lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/5 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-white/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="container mx-auto max-w-xl relative z-10 my-auto">
        {/* Header Branding */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border-white/10 mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/70 hover:text-white transition-colors">
            <Sparkles size={12} className="text-amber-400" />
            <span>Tiscolly Productions • Consegna Progetto</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-white">
            Ecco a te il tuo <br className="hidden sm:inline" />
            <span className="italic font-light">nuovo progetto</span>
          </h1>
          <p className="text-white/60 text-sm md:text-base mt-3 max-w-lg mx-auto leading-relaxed">
            Grazie per averci scelto! Il tuo lavoro è pronto per il download ad altissima qualità.
          </p>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass backdrop-blur-2xl p-12 rounded-[32px] border border-white/10 shadow-2xl text-center space-y-6"
          >
            <div className="w-14 h-14 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto" />
            <div>
              <p className="text-white font-display uppercase tracking-widest text-sm font-semibold">
                Verifica file in corso...
              </p>
              <p className="text-white/40 text-xs mt-1">
                Connessione ai nodi di archiviazione globale
              </p>
            </div>
          </motion.div>
        )}

        {/* 404 OR 410 EXPIRED / NOT FOUND STATE */}
        {!loading && isExpiredOrNotFound && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass backdrop-blur-2xl p-8 md:p-12 rounded-[32px] border border-white/10 shadow-2xl text-center relative overflow-hidden"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto mb-6">
              <AlertTriangle size={28} />
            </div>

            <h2 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight text-white mb-3">
              Questo transfer è scaduto o non esiste
            </h2>

            <p className="text-white/50 text-sm max-w-md mx-auto leading-relaxed mb-8">
              Il link potrebbe aver superato la data di validità (i file vengono cancellati automaticamente per sicurezza) oppure l'indirizzo inserito non è corretto.
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-dark rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg shadow-white/5"
            >
              <ArrowLeft size={16} />
              <span>Torna al sito principale</span>
            </Link>
          </motion.div>
        )}

        {/* GENERIC ERROR STATE */}
        {!loading && !isExpiredOrNotFound && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass backdrop-blur-2xl p-8 rounded-[32px] border border-white/10 shadow-2xl text-center space-y-6"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white mb-2">Attenzione</h3>
              <p className="text-white/50 text-xs">{errorMessage}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-dark rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-opacity-90 transition-all"
            >
              Riprova
            </button>
          </motion.div>
        )}

        {/* ACTIVE FILE AVAILABLE FOR DOWNLOAD */}
        {!loading && !isExpiredOrNotFound && fileData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass backdrop-blur-2xl p-8 md:p-10 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden"
          >
            {/* File Showcase Card */}
            <div className="flex flex-col items-center text-center p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/10 mb-8 relative overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[11px] font-semibold mb-5">
                <Sparkles size={12} className="shrink-0" />
                <span>File pronto per il download</span>
              </div>

              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 shadow-xl">
                {getFileIcon(fileData.filename, fileData.contentType)}
              </div>

              <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight break-all max-w-full mb-2">
                {fileData.filename}
              </h2>

              <div className="flex items-center gap-3 text-white/50 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white font-semibold">
                  {formatBytes(fileData.size)}
                </span>
                {fileData.contentType && (
                  <span className="hidden sm:inline-block text-white/40 truncate max-w-[200px]">
                    {fileData.contentType}
                  </span>
                )}
              </div>
            </div>

            {/* Availability details */}
            {fileData.expiresAt && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-8 text-xs">
                <div className="flex items-center gap-2.5 text-white/40">
                  <Clock size={16} className="text-amber-400" />
                  <span className="uppercase tracking-wider font-bold text-[10px]">Scadenza</span>
                </div>
                <div className="text-white font-medium">
                  Disponibile fino al <span className="font-semibold text-white">{formatItalianDate(fileData.expiresAt)}</span>
                </div>
              </div>
            )}

            {/* Large DIRECT DOWNLOAD button (normal link, NOT fetch/blob) */}
            <div className="space-y-4">
              <a
                href={`${API_BASE}/d/${encodeURIComponent(fileData.id)}`}
                className="w-full py-5 bg-white text-dark rounded-2xl font-display font-bold text-sm uppercase tracking-widest hover:bg-opacity-90 active:scale-[0.99] transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 group"
              >
                <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                <span>Scarica il tuo progetto</span>
              </a>

              <p className="text-center text-[11px] text-white/30 flex items-center justify-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Download diretto ad alta velocità senza limiti di banda</span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-2 text-white/30 text-xs text-center">
          <span>Tiscolly Productions • Servizio di trasferimento dedicato</span>
        </div>
      </div>
    </div>
  );
}
