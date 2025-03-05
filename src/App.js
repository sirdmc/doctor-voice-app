import { useState } from "react";

export default function App() {
    const [recording, setRecording] = useState(false);
    const [transcription, setTranscription] = useState("");

    let recognition;

    const startRecording = () => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Tu navegador no soporta reconocimiento de voz.");
            return;
        }

        recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setRecording(true);
        };

        recognition.onresult = (event) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript + " ";
            }
            setTranscription(transcript);
        };

        recognition.onend = () => {
            setRecording(false);
        };

        recognition.start();
    };

    const stopRecording = () => {
        if (recognition) {
            recognition.stop();
        }
    };

    return (
        <div>
            <h1>Transcripción Médica en Vivo</h1>
            <button onClick={startRecording} disabled={recording}>🎤 Iniciar</button>
            <button onClick={stopRecording} disabled={!recording}>⏹️ Detener</button>
            <h2>Transcripción:</h2>
            <textarea value={transcription} readOnly rows="10" cols="50"></textarea>
        </div>
    );
}
