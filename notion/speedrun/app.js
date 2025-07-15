import soundtouch from 'https://cdn.jsdelivr.net/npm/soundtouchjs@0.2.1/dist/soundtouch.min.js';

const fileInput = document.getElementById('fileInput');
const controls = document.getElementById('controls');
const playPause = document.getElementById('playPause');
const pitchSlider = document.getElementById('pitchSlider');
const pitchValue = document.getElementById('pitchValue');

let audioCtx, bufferSource, pitchShifter, gainNode;
let audioBuffer, isPlaying = false;

fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    const arr = await file.arrayBuffer();
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioBuffer = await audioCtx.decodeAudioData(arr);

    // instanciation du PitchShifter de SoundTouchJS
    pitchShifter = new soundtouch.PitchShifter(audioCtx, audioBuffer, 1024);
    gainNode = audioCtx.createGain();
    pitchShifter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    controls.style.display = 'block';
    playPause.textContent = '▶️ Lecture';
    isPlaying = false;
});

function startShifter() {
    pitchShifter.connect(gainNode);
    isPlaying = true;
    playPause.textContent = '⏸️ Pause';
}

function stopShifter() {
    pitchShifter.disconnect();
    isPlaying = false;
    playPause.textContent = '▶️ Lecture';
}

playPause.addEventListener('click', () => {
    if (!isPlaying) {
    audioCtx.resume();
    startShifter();
    } else {
    stopShifter();
    }
});

pitchSlider.addEventListener('input', () => {
    const semis = parseFloat(pitchSlider.value);
    pitchValue.textContent = semis.toFixed(1);
    pitchShifter.pitch = Math.pow(2, semis / 12);
});