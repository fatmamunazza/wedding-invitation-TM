import { useCallback, useEffect, useRef, useState } from 'react';
import { settings } from '../data/index.js';

export function usePlayer(timeline, totalDuration) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);
  const timeRef = useRef(time);
  const playingRef = useRef(playing);
  timeRef.current = time;
  playingRef.current = playing;

  const syncAudio = useCallback((position, force = false) => {
    const audio = audioRef.current;
    if (!audio || audio.readyState < 1) return;
    const desired = settings.audio.offsetSeconds + position;
    if (force || Math.abs(audio.currentTime - desired) > 0.5) audio.currentTime = desired;
  }, []);
  const seek = useCallback(position => {
    const next = Math.max(0, Math.min(totalDuration, position));
    timeRef.current = next;
    setTime(next);
    syncAudio(next, true);
  }, [syncAudio, totalDuration]);
  const play = useCallback((restart = false) => {
    const next = restart || timeRef.current >= totalDuration ? 0 : timeRef.current;
    if (next !== timeRef.current) seek(next);
    syncAudio(next, true);
    setAudioError(false);
    setStarted(true);
    setPlaying(true);
    // Called from the user's click so mobile browsers can authorize audio.
    const promise = audioRef.current?.play();
    promise?.catch(() => setAudioError(true));
  }, [seek, syncAudio, totalDuration]);
  const pause = useCallback(() => {
    setPlaying(false);
    audioRef.current?.pause();
  }, []);
  const goTo = useCallback(id => {
    const page = timeline.find(p => p.id === id);
    if (!page) return;
    seek(page.start + (page.id === 'opening' || playingRef.current ? 0 : Math.min(page.duration - 0.5, page.settleAt)));
  }, [seek, timeline]);

  useEffect(() => {
    if (!playing) return;
    let frame, previous = performance.now(), lastPaint = previous;
    const tick = now => {
      const elapsed = Math.min((now - previous) / 1000, 0.1);
      previous = now;
      timeRef.current = Math.min(totalDuration, timeRef.current + elapsed);
      if (now - lastPaint >= 1000 / 30 || timeRef.current >= totalDuration) {
        setTime(timeRef.current);
        lastPaint = now;
      }
      if (timeRef.current >= totalDuration) {
        setPlaying(false);
        audioRef.current?.pause();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, totalDuration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    const fadeIn = Math.min(1, time / settings.audio.fadeInSeconds);
    const fadeOut = Math.min(1, (totalDuration - time) / settings.audio.fadeOutSeconds);
    audio.volume = settings.audio.volume * Math.max(0, Math.min(fadeIn, fadeOut));
    if (playing) syncAudio(time);
    else audio.pause();
  }, [playing, muted, time, syncAudio, totalDuration]);

  useEffect(() => {
    const hide = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, [pause]);

  return { time, playing, started, muted, audioError, audioRef, seek, play, pause, goTo, syncAudio,
    toggleMusic: () => {
      setMuted(value => !value);
      if (playingRef.current) audioRef.current?.play().then(() => setAudioError(false)).catch(() => setAudioError(true));
    },
  };
}
