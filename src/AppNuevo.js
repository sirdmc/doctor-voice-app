import React, { useState, useRef } from "react";

export default function App() {
  const [recording, setRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const recognitionRef = useRef(null);

  // Inicia la grabación
  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Tu navegador no soporta reconocimiento de voz (solo Chrome/Edge).");
      return;
    }

    // Creamos el objeto de reconocimiento y lo guardamos en ref
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;       // Permite pausas largas
    recognitionRef.current.interimResults = true;   // Muestra resultados parciales

    // Cuando empieza a grabar
    recognitionRef.current.onstart = () => {
      setRecording(true);
    };

    // Cuando llega un resultado de audio a texto
    recognitionRef.current.onresult = (event) => {
      let newChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        newChunk += event.results[i][0].transcript + " ";
      }
      // Concatenamos lo nuevo a lo que ya teníamos
      setTranscription((prev) => prev + newChunk);
    };

    // Cuando se detiene el reconocimiento (por pausa larga u otra razón)
    recognitionRef.current.onend = () => {
      setRecording(false);
      // 🔹 Opción: Re-iniciar automáticamente si quieres grabar indefinidamente:
      // if (recognitionRef.current) {
      //   recognitionRef.current.start();
      //   setRecording(true);
      // }
    };

    // Arrancamos el reconocimiento
    recognitionRef.current.start();
  };

  // Detiene la grabación y envía el texto a la base de datos
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop(); // Detiene la captura de audio
    }
    // Aquí hacemos el POST a tu backend para guardar la transcripción
    fetch("https://tu-servidor.com/api/transcriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: transcription }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Transcripción guardada en BD:", data);
        // Opcional: Limpia el texto o muestra un mensaje
        // setTranscription("");
      })
      .catch((err) => console.error("Error al guardar transcripción:", err));
  };

  return (
    <div>
      <h1>Transcripción Médica en Vivo</h1>
      <button onClick={startRecording} disabled={recording}>
        🎤 Iniciar
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        ⏹️ Detener
      </button>
      <h2>Transcripción:</h2>
      <textarea value={transcription} readOnly rows="10" cols="50"></textarea>
    </div>
  );
}