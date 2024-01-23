import React, { useState, useEffect, useRef } from 'react';
import { ReactMic } from 'react-mic';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import debounce from 'lodash/debounce';
import './audioRecorder.css';
import { initiateConversation, updateEvent }from './questions.js'
const apiKey = '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';

const AudioRecorder = () => {
  const [isRecording, setRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const transcriptionBoxRef = useRef(null);

  const timeoutIdRef = useRef(null);

  // Debounce the transcribeAudio function
  const debouncedTranscribeAudio = debounce(async (audioBlob) => {
    try {

      const formData = new FormData();
      formData.append('file', new File([audioBlob], 'audio.mp3'));
      formData.append('model', 'whisper-1');

      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'multipart/form-data',
      };

      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, { headers });
      const transcriptionText = response.data.text;

      setTranscriptions((prevTranscriptions) => [
        ...prevTranscriptions,
        {
          text: transcriptionText,
          isApiResponse: false,
        },
      ]);

      setTimeout(async () => {
        try {
          const questionsResponse = await updateEvent(transcriptionText);
          setTranscriptions((prevTranscriptions) => [
            ...prevTranscriptions,
            {
              text: questionsResponse,
              isApiResponse: true,
            },
          ]);
        } catch (error) {
          console.error('Error processing questions response', error);
        }
      }, 2000);


    } catch (error) {
      console.error('Error transcribing audio', error);
    }
  }, 100);

  const onData = (recordedBlob) => {
    debouncedTranscribeAudio(recordedBlob.blob);
  };

  useEffect(() => {
    const initialTranscriptionTimeout = setTimeout(async () => {
      const response = await initiateConversation();
      setTranscriptions([
        {
          text: response.message,
          isApiResponse: true,
        },
      ]);
    }, 3000);

    return () => clearTimeout(initialTranscriptionTimeout);
  }, []);

  useEffect(() => {
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

  useEffect(() => {
    if (transcriptionBoxRef.current) {
      transcriptionBoxRef.current.scrollTop = transcriptionBoxRef.current.scrollHeight;
    }
  }, [transcriptions]);

  return (
    <div className="center-container">
      <div className="life-event-text">
        <h2>Life Event</h2>
      </div>
      <div className="transcription-box" ref={transcriptionBoxRef}>
        {transcriptions.map((entry, index) => (
          <div
            key={index}
            className={`transcription-text-box ${entry.isApiResponse ? 'api-response-box' : 'whisper-response-box'
              }`}
          >
            {entry.text}
          </div>
        ))}
      </div>

      <ReactMic
        record={isRecording}
        className="sound-wave"
        onStop={onData}
        onData={onData}
        strokeColor="#000000"
        backgroundColor="#FF4081"
      />

      {/* Microphone icon button using FontAwesome */}
      <button onClick={() => setRecording(!isRecording)} className="mic-button" type="button">
        <FontAwesomeIcon
          icon={isRecording ? faMicrophone : faMicrophoneSlash}
          size="2x"
          className={isRecording ? 'mic-icon-active' : 'mic-icon-inactive'}
        />
      </button>
    </div>
  );
};

export default AudioRecorder;
