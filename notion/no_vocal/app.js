function init() {

    document.querySelector('title').textContent = title;
    document.querySelector('h1').textContent    = title;

    const playBtn = document.getElementById('playBtn');
    const switchBtn = document.getElementById('switchBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const progressBar = document.getElementById('progressBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationTimeDisplay = document.getElementById('durationTime');
    const trackNameDisplay = document.getElementById('currentTrack');

    const audioContext = new(window.AudioContext || window.webkitAudioContext)();
    let buffer1, buffer2;
    let source1, source2;
    let gainNode1 = audioContext.createGain();
    let gainNode2 = audioContext.createGain();
    let isTrack1Active = true;
    let isPlaying = false;
    let startTime = 0;
    let pausedAt = 0;
    let animationFrameId = null;
    let duration = 0;
    let isSeeking = false;

    async function fetchAndDecode(fileName) {
        const response = await fetch(fileName + '.mp3');
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);

        return buffer;
    }

    async function preloadTracks() {
        [buffer1, buffer2] = await Promise.all([
            fetchAndDecode('mix'),
            fetchAndDecode('original')
        ]);

        trackNameDisplay.textContent = `🎵 Lecture : mix`;

        duration = Math.min(buffer1.duration, buffer2.duration);
        progressBar.max = duration;
        durationTimeDisplay.textContent = formatTime(duration);
        playBtn.disabled = false;
    }

    function createSources(offset = 0) {
        source1 = audioContext.createBufferSource();
        source2 = audioContext.createBufferSource();
        source1.buffer = buffer1;
        source2.buffer = buffer2;
        source1.loop = true;
        source2.loop = true;

        source1.connect(gainNode1).connect(audioContext.destination);
        source2.connect(gainNode2).connect(audioContext.destination);

        gainNode1.gain.value = isTrack1Active ? 1 : 0;
        gainNode2.gain.value = isTrack1Active ? 0 : 1;

        const now = audioContext.currentTime;
        startTime = now - offset;

        source1.start(now, offset % buffer1.duration);
        source2.start(now, offset % buffer2.duration);

        // Met à jour le nom du morceau actif
        trackNameDisplay.textContent = `🎵 Lecture : ${isTrack1Active ? 'mix' : 'original'}`;
    }

    function stopSources() {
        if (source1) source1.stop();
        if (source2) source2.stop();
    }

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${min}:${sec}`;
    }

    function updateProgress() {
        if (!isPlaying || isSeeking) return;

        const currentTime = (audioContext.currentTime - startTime) % duration;
        progressBar.value = currentTime;
        currentTimeDisplay.textContent = formatTime(currentTime);

        const percent = (currentTime / duration) * 100;
        progressBar.style.background = `linear-gradient(to right, #4caf50 ${percent}%, #ccc ${percent}%)`;

        animationFrameId = requestAnimationFrame(updateProgress);
    }

    function startProgressUpdates() {
        cancelAnimationFrame(animationFrameId);
        updateProgress();
    }

    playBtn.addEventListener('click', async () => {
        await audioContext.resume();
        isPlaying = true;
        pausedAt = 0;
        createSources();
        startProgressUpdates();

        playBtn.disabled = true;
        switchBtn.disabled = false;
        pauseBtn.disabled = false;
        progressBar.disabled = false;
    });

    switchBtn.addEventListener('click', () => {
        isTrack1Active = !isTrack1Active;
        gainNode1.gain.value = isTrack1Active ? 1 : 0;
        gainNode2.gain.value = isTrack1Active ? 0 : 1;
        trackNameDisplay.textContent = `🎵 Lecture : ${isTrack1Active ? 'mix' : 'original'}`;
    });

    pauseBtn.addEventListener('click', () => {

        if (isPlaying) {
            pausedAt = audioContext.currentTime - startTime;
            stopSources();
            isPlaying = false;
            pauseBtn.textContent = '▶️ Reprendre';
        }
        else {
            createSources(pausedAt);
            isPlaying = true;
            pauseBtn.textContent = '⏸ Pause';
        }

        startProgressUpdates();
    });

    progressBar.addEventListener('input', () => {
        isSeeking = true;
    });

    progressBar.addEventListener('change', () => {
        const seekTime = parseFloat(progressBar.value);
        pausedAt = seekTime;
        currentTimeDisplay.textContent = formatTime(seekTime);
        if (isPlaying) {
            stopSources();
            createSources(pausedAt);
            startProgressUpdates();
        }
        isSeeking = false;

        updateProgress();
    });

    window.addEventListener('load', preloadTracks);

}