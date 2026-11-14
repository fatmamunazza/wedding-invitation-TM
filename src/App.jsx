import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { assets, assetUrl, settings, createInvitation, weddingDetails } from './data/index.js';
import { artworkPaths, layoutPage, responsive } from './data/responsive.js';
import { Scene } from './components/Scene.jsx';
import { VideoExport } from './components/VideoExport.jsx';
import { Controls } from './components/Controls.jsx';
import { guestFromPath } from './data/guest.js';
import { usePlayer } from './hooks/usePlayer.js';

function useArtwork(mode) {
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    let live = true;
    setStatus('loading');
    const images = artworkPaths(mode).map(file => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => image.decode().then(resolve).catch(reject);
      image.onerror = reject;
      image.src = assetUrl(file);
    }));
    const fonts = ['40px "Cormorant Garamond"', '80px "Pinyon Script"', '80px "Amiri"'].map(font => document.fonts.load(font));
    Promise.all([...images, ...fonts]).then(() => { if (live) setStatus('ready'); }).catch(() => { if (live) setStatus('error'); });
    return () => { live = false; };
  }, [mode]);
  return status;
}

export default function App() {
  const guest = useMemo(() => guestFromPath(location.pathname, import.meta.env.BASE_URL), []);
  const { timeline, totalDuration } = useMemo(() => createInvitation(guest || null), [guest]);
  const player = usePlayer(timeline, totalDuration);
  const [exporting, setExporting] = useState(false);
  const [mode, setMode] = useState(() => matchMedia(responsive.desktopMedia).matches ? 'desktop' : 'mobile');
  const status = useArtwork(mode);
  const stage = useRef(null);
  const [scale, setScale] = useState(0.3);
  const canvas = mode === 'desktop' ? responsive.desktopCanvas : responsive.mobileCanvas;
  const scenes = useMemo(() => timeline.map(page => layoutPage(page, mode)), [mode, timeline]);
  const active = [...scenes].reverse().find(page => player.time >= page.start) || scenes[0];
  const previous = scenes[active.index - 1];
  const crossfade = active.index ? Math.min(1, (player.time - active.start) / settings.transitionSeconds) : 1;

  useEffect(() => {
    const query = matchMedia(responsive.desktopMedia);
    const change = () => setMode(query.matches ? 'desktop' : 'mobile');
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  useLayoutEffect(() => {
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setScale(Math.max(width / canvas.width, height / canvas.height));
    });
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, [canvas.width, canvas.height]);
  useEffect(() => {
    document.title = weddingDetails.shortNames + ' · Wedding Invitation';
    // Keep scene navigation inside React state and clear links from older versions.
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }, []);
  useEffect(() => {
    const onKey = event => {
      if (exporting || status !== 'ready' || /INPUT|SELECT|TEXTAREA|BUTTON|A/.test(event.target.tagName)) return;
      if (event.code === 'Space') {
        event.preventDefault();
        player.playing ? player.pause() : player.play();
      } else if (event.key === 'ArrowRight') player.goTo(timeline[Math.min(active.index + 1, timeline.length - 1)].id);
      else if (event.key === 'ArrowLeft') player.goTo(timeline[Math.max(0, active.index - 1)].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [player.playing, player.pause, player.play, player.goTo, active.index, status, exporting]);

  if (guest === undefined) return <main className="loading-state"><p>Invitation not found. Please check your invitation link.</p></main>;

  return <main className={'invitation-app layout-' + mode}
    style={{ '--body-font': settings.typography.body, '--script-font': settings.typography.script }}>
    <div className="stage" ref={stage} inert={exporting ? true : undefined} aria-label={weddingDetails.shortNames + ' wedding invitation'}>
      {status === 'ready' && <>
        <div className="design-canvas" style={{ width: canvas.width, height: canvas.height, transform: 'translate(-50%, -50%) scale(' + scale + ')' }}>
          {crossfade < 1 && previous && <div className="scene-layer" aria-hidden="true" inert>
            <Scene key={previous.id} page={previous} time={player.time - previous.start} />
          </div>}
          <div className="scene-layer" style={{ opacity: crossfade }}>
            <Scene key={active.id} page={active} time={player.time - active.start} />
          </div>
        </div>
        {active.id === 'opening' && !player.playing && player.time === 0 &&
          <button className="envelope-hit-target" aria-label={settings.labels.open} onClick={() => player.play()} />}
        {player.started && <Controls player={player} active={active} timeline={timeline} totalDuration={totalDuration} onExport={() => { player.pause(); setExporting(true); }} />}
        {player.audioError && <p className="sr-only" role="status">{settings.labels.audioUnavailable}</p>}
      </>}
      {status !== 'ready' && <div className="loading-state" role="status">
        <img src={assetUrl(assets.crest)} alt="" />
        <p>{status === 'error' ? settings.labels.failed : settings.labels.loading}</p>
        {status === 'error' && <button onClick={() => location.reload()}>{settings.labels.retry}</button>}
      </div>}
    </div>
    {exporting && <VideoExport guest={guest} onClose={() => { setExporting(false); requestAnimationFrame(() => document.querySelector('.download-control')?.focus()); }} />}
    <audio ref={player.audioRef} src={assetUrl(assets.music)} preload="metadata"
      onLoadedMetadata={() => player.syncAudio(player.time, true)} />
  </main>;
}
