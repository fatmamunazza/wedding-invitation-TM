import { useEffect, useRef, useState } from 'react';
import { settings } from '../data/index.js';

export function VideoExport({ guest, onClose }) {
  const canvasRef = useRef(null), dialogRef = useRef(null);
  const [status, setStatus] = useState({ phase: 'Preparing your video…', progress: 0 });
  const [result, setResult] = useState(null), [error, setError] = useState(null);
  const cancelRef = useRef(null);
  useEffect(() => {
    const controller = new AbortController(); cancelRef.current = controller;
    let live = true, url;
    dialogRef.current?.focus();
    import('../export/exportPortraitVideo.js').then(({ exportPortraitVideo }) => exportPortraitVideo({
      canvas: canvasRef.current, signal: controller.signal, guest,
      onProgress: value => { if (live) setStatus(value); },
    })).then(blob => {
      if (!live) return;
      url = URL.createObjectURL(blob); setResult(url); setStatus({ phase: 'Your video is ready', progress: 100 });
    }).catch(reason => { if (live && reason.name !== 'AbortError') setError(reason.message || 'Video creation failed. Please try again.'); });
    return () => { live = false; controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [guest]);
  const close = () => { cancelRef.current?.abort(); onClose(); };
  return <div className="export-backdrop" onKeyDown={event => {
    if (event.key === 'Escape') { event.stopPropagation(); close(); }
    if (event.key === 'Tab') {
      const controls = [...dialogRef.current.querySelectorAll('a[href],button:not(:disabled)')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }}>
    <section className="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title" tabIndex={-1} ref={dialogRef}>
      <h2 id="export-title">{error ? 'Unable to create video' : status.phase}</h2>
      <p>{error || (result ? 'Portrait MP4 · with music' : 'Please keep this tab open while your video is created.')}</p>
      <canvas ref={canvasRef} className="export-preview" aria-label="Portrait invitation video preview" />
      {!result && !error && <><progress max="100" value={status.progress} aria-label="Video creation progress" /><span role="status" aria-live="polite">{status.progress}%</span></>}
      <div className="export-actions">
        {result && <a className="export-save" href={result} download={settings.download.filename}>Save video</a>}
        <button onClick={close}>{result || error ? 'Close' : 'Cancel'}</button>
      </div>
    </section>
  </div>;
}
