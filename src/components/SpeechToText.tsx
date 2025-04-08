import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { API_CONFIG } from '../config/api';

// Define the SpeechRecognition interface
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    error: any;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onstart: (() => void) | null;
    onerror: ((event: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

// Extend the Window interface
declare global {
    interface Window {
        SpeechRecognition?: new () => SpeechRecognition;
        webkitSpeechRecognition?: new () => SpeechRecognition;
    }
}

interface SpeechToTextProps {
    onTranscriptReceived: (transcript: string) => void;
    isDisabled?: boolean;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({ onTranscriptReceived, isDisabled = false }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                try {
                    const transcript = await uploadAudio(audioBlob);
                    onTranscriptReceived(transcript);
                } catch (error) {
                    const errorMessage = error instanceof Error 
                        ? error.message 
                        : 'Failed to process audio. Please try again.';
                    setError(errorMessage);
                    console.error('Audio processing error:', error);
                }
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Failed to access microphone. Please check your browser permissions.';
            setError(errorMessage);
            console.error('Recording error:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const uploadAudio = async (audioBlob: Blob) => {
        try {
            // Check if the audio blob is empty
            if (audioBlob.size === 0) {
                throw new Error('No audio was recorded. Please try again.');
            }
            
            // Check if the audio blob is too small (less than 1KB)
            if (audioBlob.size < 1024) {
                throw new Error('Audio recording is too short. Please speak for at least a few seconds.');
            }

            // Try a direct upload with explicit content type
            const uploadResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSCRIBE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'audio/webm'
                },
                body: audioBlob
            });

            if (!uploadResponse.ok) {
                // Retry with a different content type
                const retryResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSCRIBE}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'audio/mp4'
                    },
                    body: audioBlob
                });

                if (!retryResponse.ok) {
                    throw new Error('Failed to upload audio. Please try again.');
                }

                const retryData = await retryResponse.json();
                return retryData.transcript;
            }

            const data = await uploadResponse.json();
            return data.transcript;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    return (
        <div className="relative">
            <div className="flex items-center space-x-2">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isDisabled}
                    className={`flex items-center justify-center p-3 rounded-lg w-40 h-12 ${
                        isRecording 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-red-500 hover:bg-red-600'
                    } text-white transition-colors duration-200 whitespace-nowrap shadow-md`}
                >
                    {isRecording ? (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                            <span>Stop</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            <span>Speak</span>
                        </>
                    )}
                </motion.button>
            </div>
            
            {error && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-900 text-red-200 rounded-md text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};

export default SpeechToText; 