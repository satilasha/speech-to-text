import React, { useState, useEffect, useRef  } from 'react';
import { ReactMic } from 'react-mic';
import axios from 'axios';
import debounce from 'lodash/debounce';
import './audioRecorder.css';

const AudioRecorder = () => {
  const [isRecording, setRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const timeoutIdRef = useRef(null);

  // Debounce the transcribeAudio function
  const debouncedTranscribeAudio = debounce(async (audioBlob) => {
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

      // Append the new transcription to the existing text
      setTranscription((prevTranscription) => prevTranscription + '\n' + transcriptionText);
    } catch (error) {
      console.error('Error transcribing audio', error);
    }
  }, 500); // Adjust the debounce time as needed

  const onData = (recordedBlob) => {
    debouncedTranscribeAudio(recordedBlob.blob);
  };

  useEffect(() => {
    // Cleanup function to clear the timeout when the component unmounts or when isRecording changes
    return () => clearTimeout(timeoutIdRef.current);
  }, []);


  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      clearTimeout(timeoutIdRef.current);
    }
  }, [isRecording]);

  const startRecording = () => {
    // Use a functional update to avoid dependency on previous state
    timeoutIdRef.current = setTimeout(() => {
      setRecording(false);
    }, 3000);
  };

  return (
    <div className="center-container">
      <div className="transcription-box">
        <div className="transcription-text">{transcription}</div>
      </div>

      <ReactMic
        record={isRecording}
        className="sound-wave"
        onStop={onData}
        onData={onData}
        strokeColor="#000000"
        backgroundColor="#FF4081"
      />

      <button onClick={() => setRecording(true)} className="start-button" type="button">
        Start Recording
      </button>
    </div>
  );
};

export default AudioRecorder;
