export const settings = {
  canvas: { width: 1080, height: 1920 },
  // Reorder these IDs to change the invitation sequence.
  pageOrder: ['opening', 'greeting', 'blessings', 'family', 'save-dates', 'haldi', 'nikaah', 'farewell'],
  transitionSeconds: 0.75,
  download: { enabled: false, filename: 'Munazza-and-Tajdar-Mobile-Invitation.mp4', scope: 'generic', width: 1080, height: 1920, fps: 24, bitrate: 2500000, audioBitrate: 192000 },
  audio: { offsetSeconds: 72, volume: 0.65, fadeInSeconds: 0.5, fadeOutSeconds: 2 },
  effects: { sparkles: true, floatingPetals: true, pastelPetals: true, nikaahRosePetals: true },
  calendarHearts: { drawStart: 3.8, stagger: 1.35, drawSeconds: 1.15, pulseSeconds: 2, shimmerSeconds: 2.8 },
  opening: { holdSeconds: 1.25, slideSeconds: 3.1, crestFadeStart: 1, crestFadeSeconds: 0.5, crestCenterY: 880, crestWidth: 180 },
  couple: { introWidth: 560, restingWidth: 225, restingTop: 1360, rightMargin: 20, moveStart: 2.7, moveSeconds: 2.0 },
  typography: {
    body: '"Baskerville", "Cormorant Garamond", "Palatino Linotype", serif',
    script: '"Snell Roundhand", "Pinyon Script", cursive',
    arabic: '"Geeza Pro", "Amiri", serif',
  },
  labels: {
    downloadVideo: 'Download invitation video',
    open: 'Open invitation', start: 'Start', play: 'Play', pause: 'Pause', replay: 'Replay',
    previous: 'Previous page', next: 'Next page', musicOn: 'Mute music', musicOff: 'Enable music',
    fullScreen: 'Full screen', leaveFullScreen: 'Exit full screen',
    pages: 'Invitation pages', seek: 'Invitation progress', loading: 'Preparing your invitation…',
    failed: 'Some artwork could not load. Please check public/assests and reload.',
    retry: 'Reload invitation', audioUnavailable: 'Music could not start. Pause and tap Start to try again.',
    finished: 'Invitation complete', ready: 'Open your invitation',
  },
};
