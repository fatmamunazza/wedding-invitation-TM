import { Output, Mp4OutputFormat, BufferTarget, CanvasSource, AudioBufferSource, Input, BlobSource, ALL_FORMATS, AudioBufferSink, canEncodeVideo, canEncodeAudio } from 'mediabunny';
import { assets, assetUrl, createInvitation, settings } from '../data/index.js';
import { preparePortraitRenderer } from './portraitRenderer.js';

const yieldToBrowser = () => new Promise(resolve => setTimeout(resolve, 0));

export async function exportPortraitVideo({ canvas, signal, onProgress, guest = null }) {
  const config = settings.download;
  const invitation = createInvitation(guest && config.scope !== 'guest' ? { ...guest, name: '' } : guest);
  const duration = invitation.totalDuration;
  let renderer, output, input;
  let cancelling = false;
  const cancel = () => { cancelling = true; output?.cancel().catch(() => {}); };
  signal.addEventListener('abort', cancel, { once: true });
  try {
    onProgress({ phase: 'Preparing your video…', progress: 0 });
    const [videoSupported, audioSupported] = await Promise.all([
      canEncodeVideo('avc', { width: config.width, height: config.height, bitrate: config.bitrate, frameRate: config.fps }),
      canEncodeAudio('aac', { numberOfChannels: 2, sampleRate: 48000, bitrate: config.audioBitrate }),
    ]);
    signal.throwIfAborted();
    if (!videoSupported || !audioSupported) throw new Error('This browser cannot create an MP4 with sound. Please try an updated Chrome or Safari browser on your computer.');
    renderer = await preparePortraitRenderer(invitation, canvas, signal);
    renderer.draw(0);
    const response = await fetch(assetUrl(assets.music), { signal });
    if (!response.ok) throw new Error('The invitation music could not load. Please try again.');
    input = new Input({ source: new BlobSource(await response.blob()), formats: ALL_FORMATS });
    const track = await input.getPrimaryAudioTrack();
    if (!track || !await track.canDecode()) throw new Error('This browser could not read the invitation music. Please try another browser.');
    const target = new BufferTarget();
    output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target });
    const video = new CanvasSource(canvas, { codec: 'avc', bitrate: config.bitrate, keyFrameInterval: 2, latencyMode: 'quality' });
    const audio = new AudioBufferSource({ codec: 'aac', bitrate: config.audioBitrate });
    output.addVideoTrack(video, { frameRate: config.fps });
    output.addAudioTrack(audio);
    await output.start();
    const frames = Math.round(duration * config.fps);
    async function renderVideo() {
      for (let frame = 0; frame < frames; frame++) {
        signal.throwIfAborted();
        renderer.draw(frame / config.fps);
        await video.add(frame / config.fps, 1 / config.fps);
        if (frame % 6 === 0) {
          onProgress({ phase: 'Creating your portrait invitation…', progress: Math.round(frame / frames * 95) });
          await yieldToBrowser();
        }
      }
      video.close();
    }
    async function renderAudio() {
      const sink = new AudioBufferSink(track), offset = settings.audio.offsetSeconds;
      let written = 0;
      for await (const item of sink.buffers(offset, offset + duration)) {
        signal.throwIfAborted();
        const buffer = item.buffer, rate = buffer.sampleRate;
        const from = Math.max(0, Math.round((offset - item.timestamp) * rate));
        const to = Math.min(buffer.length, Math.round((offset + duration - item.timestamp) * rate));
        if (to <= from) continue;
        const trimmed = new AudioBuffer({ length: to - from, sampleRate: rate, numberOfChannels: buffer.numberOfChannels });
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const samples = trimmed.getChannelData(channel), source = buffer.getChannelData(channel);
          for (let i = 0; i < samples.length; i++) {
            const time = written / rate + i / rate;
            const gain = Math.max(0, Math.min(1, time / settings.audio.fadeInSeconds, (duration - time) / settings.audio.fadeOutSeconds));
            samples[i] = source[from + i] * settings.audio.volume * gain;
          }
        }
        await audio.add(trimmed);
        written += trimmed.length;
      }
      if (written === 0) throw new Error('There is no music at the configured start time.');
      audio.close();
    }
    const results = await Promise.allSettled([renderVideo().catch(error => { cancel(); throw error; }), renderAudio().catch(error => { cancel(); throw error; })]);
    const failed = results.find(result => result.status === 'rejected');
    if (failed) throw failed.reason;
    signal.throwIfAborted();
    onProgress({ phase: 'Finishing your MP4…', progress: 98 });
    await output.finalize();
    signal.throwIfAborted();
    return new Blob([target.buffer], { type: 'video/mp4' });
  } catch (error) {
    if (!cancelling) await output?.cancel().catch(() => {});
    if (signal.aborted) throw new DOMException('Video creation cancelled.', 'AbortError');
    throw error;
  } finally {
    signal.removeEventListener('abort', cancel);
    input?.dispose(); renderer?.dispose();
  }
}
