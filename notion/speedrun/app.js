import { SoundTouch, SimpleFilter } from 'https://cdn.jsdelivr.net/npm/soundtouchjs/dist/soundtouch.min.js';

document.querySelector('title').textContent = title;
document.querySelector('h1').textContent    = title;

(async () => {
  const playBtn = document.getElementById('playBtn');
  const rateSlider = document.getElementById('rateSlider');
  const rateVal = document.getElementById('rateVal');
  const progressSlider = document.getElementById('progressSlider');
  const currentTimeLabel = document.getElementById('currentTime');

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();

  let audioBuffer;
  let player;

  // Variables playback
  let isPlaying = false;
  let position = 0; // en secondes
  let tempoPitch = 1.0;

  // Charge le fichier audio
  async function loadAudio() {
    const response = await fetch('audio.mp3');
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    progressSlider.max = audioBuffer.duration.toFixed(2);
    playBtn.disabled = false;
  }

  // Formatage temps mm:ss
  function formatTime(t) {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2,'0')}`;
  }

  class SoundTouchPlayer {
    constructor(audioCtx, audioBuffer, rate) {
      this.audioCtx = audioCtx;
      this.audioBuffer = audioBuffer;
      this.rate = rate;

      this.soundTouch = new SoundTouch(audioBuffer.sampleRate);
      this.soundTouch.tempo = rate;
      this.soundTouch.pitch = rate;

      this.bufferSize = 4096;
      this.isPlaying = false;

      this.scriptNode = this.audioCtx.createScriptProcessor(this.bufferSize, 2, 2);
      this.scriptNode.onaudioprocess = this.process.bind(this);

      this.buffer = new Float32Array(this.bufferSize * 2);

      // Position interne en frames dans le buffer audio
      this.sourcePosition = 0;

      // Source personnalisée avec extract() qui utilise sourcePosition
      this.source = {
        extract: (target, numFrames) => {
          const left = this.audioBuffer.getChannelData(0);
          const right = this.audioBuffer.numberOfChannels > 1 ? this.audioBuffer.getChannelData(1) : left;
          let i = 0;
          while (i < numFrames && this.sourcePosition + i < left.length) {
            target[i * 2] = left[this.sourcePosition + i];
            target[i * 2 + 1] = right[this.sourcePosition + i];
            i++;
          }
          this.sourcePosition += i;  // mise à jour position ici !
          return i;
        }
      };

      this.soundTouchSource = new SimpleFilter(this.source, this.soundTouch);
    }

    setRate(rate) {
      this.rate = rate;
      this.soundTouch.tempo = rate;
      this.soundTouch.pitch = rate;
    }

    start(startTimeSec = 0) {
      this.sourcePosition = Math.floor(startTimeSec * this.audioBuffer.sampleRate);
      this.isPlaying = true;
      this.scriptNode.connect(this.audioCtx.destination);
    }

    stop() {
      this.isPlaying = false;
      this.scriptNode.disconnect();
    }

    process(event) {
      if (!this.isPlaying) {
        for (let ch = 0; ch < event.outputBuffer.numberOfChannels; ch++) {
          event.outputBuffer.getChannelData(ch).fill(0);
        }
        return;
      }

      const framesExtracted = this.soundTouchSource.extract(this.buffer, this.bufferSize);

      if (framesExtracted === 0) {
        this.stop();
        isPlaying = false;
        playBtn.textContent = 'Lecture';
        return;
      }

      const outputL = event.outputBuffer.getChannelData(0);
      const outputR = event.outputBuffer.numberOfChannels > 1 ? event.outputBuffer.getChannelData(1) : null;

      for (let i = 0; i < framesExtracted; i++) {
        outputL[i] = this.buffer[i * 2];
        if (outputR) outputR[i] = this.buffer[i * 2 + 1];
      }

      for (let i = framesExtracted; i < outputL.length; i++) {
        outputL[i] = 0;
        if (outputR) outputR[i] = 0;
      }

      // Position globale à afficher en secondes : attention au facteur tempo
      position = this.sourcePosition / this.audioBuffer.sampleRate;

      progressSlider.value = position;
      currentTimeLabel.textContent = formatTime(position);
    }
  }


  playBtn.addEventListener('click', () => {
    if (!audioBuffer) return;
    if (!isPlaying) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (!player) {
        player = new SoundTouchPlayer(audioCtx, audioBuffer, tempoPitch);
        player.start(position);
      } else {
        player.start(position);
      }
      isPlaying = true;
      playBtn.textContent = 'Pause';
    } else {
      player.stop();
      isPlaying = false;
      playBtn.textContent = 'Lecture';
    }
  });

  rateSlider.addEventListener('input', () => {
    tempoPitch = parseFloat(rateSlider.value);
    rateVal.textContent = tempoPitch.toFixed(2) + 'x';
    if (player) {
      player.setRate(tempoPitch);
    }
  });

  progressSlider.addEventListener('input', () => {
    position = parseFloat(progressSlider.value);
    currentTimeLabel.textContent = formatTime(position);
    if (player && isPlaying) {
      player.stop();
      player = new SoundTouchPlayer(audioCtx, audioBuffer, tempoPitch);
      player.start(position);
    }
  });

  await loadAudio();

})();