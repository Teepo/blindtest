const synth = window.speechSynthesis;

let speecher;
let voice = getVoiceFR();

function getVoiceFR() {
    voices = synth.getVoices().find(function (voice) {
        return voice.lang === 'fr-FR';
    });
}

window.onload = () => {

    document.querySelector("#play").addEventListener("click", () => {

        speecher.voice = voice;

        synth.speak(speecher);
    });

    const pauseNode = document.querySelector("#pause");
    pauseNode.addEventListener("click", () => {

        if (synth.paused) {
            pauseNode.textContent = "Pause";
            synth.resume();
        } else if (synth.speaking) {
            pauseNode.textContent = "Resume";
            synth.pause();
        }
    });

    document.querySelector("#stop").addEventListener("click", () => {
        synth.cancel();
    });

    
};

function init() {

    document.querySelector('title').textContent = title;
    document.querySelector('h1').textContent    = title;

    document.querySelector("pre").textContent = words;

    speecher = new SpeechSynthesisUtterance(words);

    speecher.pitch = 1;
    speecher.rate = 1;
}