/**
 * Helper utilities for Tiscolly Transfer
 */

export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatItalianDate(dateInput: string | number | Date): string {
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return String(dateInput);
  }
}

export function formatRemainingTime(seconds: number): string {
  if (!seconds || seconds <= 0 || !isFinite(seconds)) return 'Calcolo tempo...';
  if (seconds < 60) {
    return `${Math.round(seconds)}s rimanenti`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSecs = Math.round(seconds % 60);
  if (minutes < 60) {
    return `${minutes}m ${remainingSecs > 0 ? `${remainingSecs}s ` : ''}rimanenti`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours}h ${remainingMins}m rimanenti`;
}
