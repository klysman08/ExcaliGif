// ExcaliGif Web Audio Synthesizer
// Generates zero-dependency retro 8-bit sound effects in real-time

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play a quick retro hover/select blip
export function playSelect() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle'; // Smooth but retro triangle wave
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.warn("Audio playback blocked or unsupported:", e);
  }
}

// Play a retro power-up (ON) or power-down (OFF) toggle sound
export function playToggle(enabled) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square'; // Classic retro square wave

    if (enabled) {
      // Rising sweep (ON)
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
    } else {
      // Falling sweep (OFF)
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch (e) {
    console.warn("Audio playback blocked or unsupported:", e);
  }
}

// Play a retro coin sound (two-tone rising)
export function playSuccess() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    
    // Mario-like coin sound: B5 (987.77 Hz) for 0.08s, then E6 (1318.51 Hz)
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.setValueAtTime(0.1, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(now + 0.35);
  } catch (e) {
    console.warn("Audio playback blocked or unsupported:", e);
  }
}

// Play a retro error buzzer (descending low frequency buzz)
export function playError() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth'; // Buzzing sawtooth wave
    
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.25);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(now + 0.28);
  } catch (e) {
    console.warn("Audio playback blocked or unsupported:", e);
  }
}
