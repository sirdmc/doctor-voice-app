import React, { useState, useRef, useEffect } from "react";

export default function App() {
  // Almacenamos el texto final y el interino para mostrar en tiempo real.
  const [finalTranscription, setFinalTranscription] = useState("");
  const [interimTranscription, setInterimTranscription] = useState("");
  // Estado de grabación para habilitar/deshabilitar botones.
  const [recording, setRecording] = useState(false);

  // Referencia al objeto de reconocimiento
  const recognitionRef = useRef(null);
  // Bandera para indicar si la parada es manual
  const manualStopRef = useRef(false);
  // Referencia al <textarea> para hacer autoscroll
  const textAreaRef = useRef(null);

  // Autoscroll cuando cambia el texto
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [finalTranscription, interimTranscription]);

  const startRecording = () => {
    // Si el navegador no soporta webkitSpeechRecognition
    if (!("webkitSpeechRecognition" in window)) {
      alert("Tu navegador no soporta reconocimiento de voz (Chrome/Edge).");
      return;
    }

    // Marcar que NO es una parada manual
    manualStopRef.current = false;

    // Crear el objeto de reconocimiento
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;      // Permite pausas largas
    recognitionRef.current.interimResults = true;  // Muestra resultados parciales

    // Al iniciar la grabación
    recognitionRef.current.onstart = () => {
      setRecording(true);
    };

    // Cada vez que haya resultados (finales o parciales)
    recognitionRef.current.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          // Agregamos los resultados finales a finalTranscription
          setFinalTranscription((prev) => prev + event.results[i][0].transcript + " ");
        } else {
          // Mostramos los resultados parciales en interimTranscription
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscription(interim);
    };

    // Cuando el reconocimiento se detiene (por silencio o stop())
    recognitionRef.current.onend = () => {
      setRecording(false);
      setInterimTranscription("");
      if (!manualStopRef.current) {
        // Se detuvo por silencio (no manual), reiniciamos
        recognitionRef.current.start();
        setRecording(true);
      } else {
        // Fue parada manual, limpiamos para poder iniciar de nuevo
        recognitionRef.current = null;
        manualStopRef.current = false;
      }
    };

    // Iniciar reconocimiento
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    // Indicar que la parada es manual para que no se reinicie
    manualStopRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const clearTranscription = () => {
    setFinalTranscription("");
    setInterimTranscription("");
  };

  // La transcripción mostrada es la suma de final + interino (tiempo real)
  const displayedText = finalTranscription + interimTranscription;

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