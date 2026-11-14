import { settings } from '../data/index.js';

function Icon({ name }) {
  const paths = {
    play: <path d="m9 5 11 7-11 7z" />,
    pause: <path d="M8 5v14M16 5v14" />,
    previous: <path d="m15 5-7 7 7 7" />,
    next: <path d="m9 5 7 7-7 7" />,
  };
  return <svg width="21" height="21" viewBox="0 0 24 24" fill={name === 'play' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function Controls({ player, active, timeline, totalDuration, onExport }) {
  const l = settings.labels;
  const musicPlaying = player.playing && !player.muted && !player.audioError;
  return <>
    <button className="music-control arrow-control" aria-label={player.muted ? l.musicOff : l.musicOn}
      aria-pressed={!player.muted} onClick={player.toggleMusic}>
      <svg className={musicPlaying ? "music-note running" : "music-note"} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 17V6l11-2v11M9 8l11-2" />
        <ellipse cx="6" cy="17" rx="3" ry="2.5" /><ellipse cx="17" cy="15" rx="3" ry="2.5" />
        {player.muted && <path d="m3 3 18 18" strokeWidth="2.2" />}
      </svg>
    </button>
    {settings.download.enabled && <button className="download-control arrow-control" onClick={onExport}
      aria-label={l.downloadVideo} title={l.downloadVideo}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5" />
      </svg>
    </button>}
    <div className={'overlay-controls'} aria-label="Invitation playback controls">
      <button className="arrow-control" aria-label={l.previous} onClick={() => player.goTo(timeline[Math.max(0, active.index - 1)].id)} disabled={active.index === 0}>
        <Icon name="previous" />
      </button>
      <button className="play-control" aria-label={player.playing ? l.pause : l.start}
        onClick={() => player.playing ? player.pause() : player.play(player.time >= totalDuration)}>
        <Icon name={player.playing ? 'pause' : 'play'} />
      </button>
      <button className="arrow-control" aria-label={l.next} onClick={() => player.goTo(timeline[Math.min(timeline.length - 1, active.index + 1)].id)} disabled={active.index === timeline.length - 1}>
        <Icon name="next" />
      </button>
    </div>
  </>;
}
