import React, { useState, useEffect } from 'react';
import { ReactMic } from 'react-mic';
import axios from 'axios';

const AudioRecorder = () => {
  const [isRecording, setRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [timeoutId, setTimeoutId] = useState(null);

  const onData = (recordedBlob) => {
    transcribeAudio(recordedBlob.blob);
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      const apiKey = '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';

      const formData = new FormData();
      formData.append('file', new File([audioBlob], 'audio.mp3'));
      formData.append('model', 'whisper-1');

      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'multipart/form-data',
      };

      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, { headers });
      const transcriptionText = response.data.text;

      setTranscription(transcriptionText);
    } catch (error) {
      console.error('Error transcribing audio', error);
    }
  };

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      // stopRecording();
    }
  }, [isRecording]);

  const startRecording = () => {
    setTranscription('');
    setTimeoutId(setTimeout(() => setRecording(false), 5000)); // Adjust the duration as needed
  };

  const stopRecording = () => {
    // Optionally handle any cleanup or finalize actions here
    clearTimeout(timeoutId);
  };

  return (
    <div>
      <ReactMic
        record={isRecording}
        className="sound-wave"
        onStop={onData}
        onData={onData}
        strokeColor="#000000"
        backgroundColor="#FF4081"
      />
      <button onClick={() => setRecording(true)} type="button">Start Recording</button>
      
      {transcription && (
        <div>
          <h3>Transcription:</h3>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
