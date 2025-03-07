import React, { useState, useRef, useEffect } from "react";

export default function App() {
  const [finalTranscription, setFinalTranscription] = useState("");
  const [interimTranscription, setInterimTranscription] = useState("");
  const [recording, setRecording] = useState(false);

  const recognitionRef = useRef(null);
  const manualStopRef = useRef(false);
  const textAreaRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [finalTranscription, interimTranscription]);

  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Tu navegador no soporta reconocimiento de voz (Chrome/Edge).");
      return;
    }

    manualStopRef.current = false;

    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onstart = () => {
      setRecording(true);
    };

    recognitionRef.current.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          setFinalTranscription(prev => prev + event.results[i][0].transcript + " ");
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscription(interim);
    };

    recognitionRef.current.onend = () => {
      setRecording(false);
      setInterimTranscription("");
      if (!manualStopRef.current) {
        recognitionRef.current.start();
        setRecording(true);
      } else {
        recognitionRef.current = null;
        manualStopRef.current = false;
      }
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    manualStopRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Función para borrar todo el texto
  const clearTranscription = () => {
    setFinalTranscription("");
    setInterimTranscription("");
  };

  // Aquí formamos el texto que se ve en pantalla
  const displayedText = finalTranscription + interimTranscription;

  // 🔹 2. Función para enviar el texto a n8n
  const handleSave = async () => {
    try {
      // Reemplaza con tu URL de n8n (ej: "https://tuservidor.com/webhook/xxxx")
      const n8nUrl = "https://novaris.app.n8n.cloud/webhook/118ad6ff-c064-478b-b0a3-3c95cc237137"; 
      //const n8nUrl = "https://novaris.app.n8n.cloud/webhook-test/118ad6ff-c064-478b-b0a3-3c95cc237137"; 
      const response = await fetch(n8nUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: displayedText })
      });

      if (!response.ok) {
        throw new Error("Error al enviar a n8n");
      }

      // Si tu webhook devuelve JSON, lo leemos aquí
      const data = await response.json();
      console.log("Respuesta de n8n:", data);
      alert("Texto enviado a n8n con éxito!");
    } catch (error) {
      console.error("Error enviando a n8n:", error);
      alert("Error enviando a n8n");
    }
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
      <button onClick={clearTranscription}>
        🗑️ Borrar Todo
      </button>
      {/* 🔹 1. Botón “Guardar” que llama a handleSave */}
      <button onClick={handleSave}>
        💾 Guardar
      </button>

      <h2>Transcripción:</h2>
      <textarea
        ref={textAreaRef}
        value={displayedText}
        readOnly
        rows="10"
        cols="50"
      />
    </div>
  );
}