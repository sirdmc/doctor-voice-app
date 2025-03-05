import { useState, useRef } from "react";

export default function App() {
  const [recording, setRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const recognitionRef = useRef(null);

  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onstart = () => {
      setRecording(true);
    };

    recognitionRef.current.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setTranscription(transcript);
    };

    recognitionRef.current.onend = () => {
      setRecording(false);
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div>
      <h1>Transcripción Médica en Vivo</h1>
      <button onClick={startRecording} disabled={recording}>
        Iniciar
      </button>
      <button onClick={stopRecording} disabled={!recording}>
         Detener
      </button>
      <h2>Transcripción:</h2>
      <textarea value={transcription} readOnly rows="10" cols="50"></textarea>
    </div>
  );
}