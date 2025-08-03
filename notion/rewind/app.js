document.querySelector('title').textContent = title;
document.querySelector('h1').textContent    = title;

const audioCtx = new(window.AudioContext || window.webkitAudioContext)();

const playPauseBtn = document.getElementById("playPauseBtn");
const toggleDirectionBtn = document.getElementById("toggleDirectionBtn");
const progressBar = document.getElementById("progress");

let buffer = null;
let reversedBuffer = null;
let source = null;

let isReverse = true;
let isPlaying = false;
let startTime = 0;
let offset = 0;

function createReversedBuffer(original) {
  const reversed = audioCtx.createBuffer(original.numberOfChannels, original.length, original.sampleRate);
  for (let c = 0; c < original.numberOfChannels; c++) {
    const input = original.getChannelData(c);
    const output = reversed.getChannelData(c);
    for (let i = 0; i < input.length; i++) {
      output[i] = input[input.length - 1 - i];
    }
  }
  return reversed;
}

function stopSource() {
  if (source) {
    try {
      source.stop();
    } catch {}
    source.disconnect();
    source = null;
  }
}

function getCurrentOffset() {
  const elapsed = audioCtx.currentTime - startTime;
  return isReverse ? offset - elapsed : offset + elapsed;
}

function createSource() {
  stopSource();

  const currentBuffer = isReverse ? reversedBuffer : buffer;
  const duration = currentBuffer.duration;

  // Clamp offset
  offset = Math.max(0, Math.min(offset, duration));

  const playTime = isReverse ? offset : duration - offset;

  source = audioCtx.createBufferSource();
  source.buffer = currentBuffer;
  source.connect(audioCtx.destination);

  startTime = audioCtx.currentTime;
  source.start(0, offset, playTime);

  source.onended = () => {
    isPlaying = false;
    playPauseBtn.textContent = "Lecture";
  };

  isPlaying = true;
  playPauseBtn.textContent = "Pause";
  requestAnimationFrame(updateProgress);
}

function togglePlayPause() {
  if (!buffer) return;

  if (isPlaying) {
    offset = getCurrentOffset();
    stopSource();
    isPlaying = false;
    playPauseBtn.textContent = "Lecture";
  } else {
    createSource();
  }
}

function toggleDirection() {
  if (!buffer) return;

  offset = getCurrentOffset();
  offset = buffer.duration - offset; // position équivalente dans l'autre sens
  isReverse = !isReverse;

  toggleDirectionBtn.textContent = "Mode : " + (isReverse ? "Inversé" : "Normal");

  createSource();
}

function updateProgress() {
  if (!isPlaying || !buffer) return;

  const currentOffset = getCurrentOffset();
  const duration = buffer.duration;

  // Toujours afficher dans le même sens pour l'utilisateur
  const visibleOffset = !isReverse ? duration - currentOffset : currentOffset;
  progressBar.value = visibleOffset / duration;

  if (currentOffset <= 0 || currentOffset >= duration) return;

  requestAnimationFrame(updateProgress);
}

progressBar.addEventListener("input", () => {
  if (!buffer) return;

  const duration = buffer.duration;
  const pos = parseFloat(progressBar.value) * duration;

  offset = isReverse ? duration - pos : pos;

  if (isPlaying) createSource();
});

// Chargement du fichier audio
fetch('audio.mp3')
  .then(res => res.arrayBuffer())
  .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
  .then(decoded => {
    buffer = decoded;
    reversedBuffer = createReversedBuffer(buffer);

    offset = buffer.duration / 2; // Démarre au milieu

    playPauseBtn.disabled = false;
    toggleDirectionBtn.disabled = false;
  })
  .catch(err => console.error("Erreur de chargement :", err));

playPauseBtn.addEventListener("click", togglePlayPause);
toggleDirectionBtn.addEventListener("click", toggleDirection);
