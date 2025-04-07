import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

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
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useWebSpeechAPI, setUseWebSpeechAPI] = useState(true);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastSpeechTimeRef = useRef<number>(Date.now());

    const startRecording = async () => {
        try {
            setError(null);
            
            // If Web Speech API is enabled, use it instead
            if (useWebSpeechAPI) {
                startWebSpeechRecording();
                return;
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Try to use the preferred MIME type, fall back to browser default if not supported
            let mediaRecorder;
            try {
                // Try different MIME types in order of preference
                const mimeTypes = [
                    'audio/webm',
                    'audio/webm;codecs=opus',
                    'audio/ogg;codecs=opus',
                    'audio/mp4'
                ];
                
                for (const mimeType of mimeTypes) {
                    try {
                        if (MediaRecorder.isTypeSupported(mimeType)) {
                            console.log(`Using MIME type: ${mimeType}`);
                            mediaRecorder = new MediaRecorder(stream, { mimeType });
                            break;
                        }
                    } catch (e) {
                        console.log(`MIME type ${mimeType} not supported`);
                    }
                }
                
                // If none of the preferred types are supported, use browser default
                if (!mediaRecorder) {
                    console.log('No preferred MIME types supported, using browser default');
                    mediaRecorder = new MediaRecorder(stream);
                }
            } catch (e) {
                console.log('Error setting up MediaRecorder, using browser default');
                mediaRecorder = new MediaRecorder(stream);
            }
            
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                    console.log(`Audio chunk received: ${event.data.size} bytes`);
                }
            };

            mediaRecorder.onstop = async () => {
                // Use the actual MIME type from the recorder
                const mimeType = mediaRecorder.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                console.log(`Recording stopped. Total chunks: ${audioChunksRef.current.length}, Total size: ${audioBlob.size} bytes, MIME type: ${mimeType}`);
                await uploadAudio(audioBlob);
                
                // Stop all tracks to release the microphone
                stream.getTracks().forEach(track => track.stop());
            };

            // Request data every 500ms to ensure we're capturing audio
            mediaRecorder.start(500);
            setIsRecording(true);
            
            console.log(`Recording started with MIME type: ${mediaRecorder.mimeType}`);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (useWebSpeechAPI) {
            stopWebSpeechRecording();
            return;
        }
        
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };
    
    // Web Speech API implementation
    const startWebSpeechRecording = () => {
        try {
            // Check if the browser supports the Web Speech API
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                throw new Error('Web Speech API is not supported in this browser.');
            }
            
            // Create a new speech recognition instance
            const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognitionConstructor) {
                throw new Error('SpeechRecognition constructor not found');
            }
            
            const recognition = new SpeechRecognitionConstructor();
            
            // Configure the recognition
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            
            // Store the recognition instance
            recognitionRef.current = recognition;
            
            // Set up event handlers
            recognition.onstart = () => {
                console.log('Web Speech API started');
                setIsRecording(true);
                // Reset the silence timer
                lastSpeechTimeRef.current = Date.now();
                startSilenceTimer();
            };
            
            recognition.onerror = (event: SpeechRecognitionEvent) => {
                console.error('Web Speech API error:', event.error);
                setError(`Speech recognition error: ${event.error}`);
                setIsRecording(false);
                clearSilenceTimer();
            };
            
            recognition.onend = () => {
                console.log('Web Speech API ended');
                setIsRecording(false);
                clearSilenceTimer();
            };
            
            recognition.onresult = (event: SpeechRecognitionEvent) => {
                // Update the last speech time
                lastSpeechTimeRef.current = Date.now();
                
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                
                if (transcript) {
                    onTranscriptReceived(transcript);
                }
            };
            
            // Start the recognition
            recognition.start();
        } catch (err) {
            console.error('Error starting Web Speech API:', err);
            setError('Could not start speech recognition. Please check browser support.');
        }
    };
    
    // Function to start the silence timer
    const startSilenceTimer = () => {
        // Clear any existing timer
        clearSilenceTimer();
        
        // Set a new timer to check for silence every 100ms
        silenceTimerRef.current = setInterval(() => {
            const silenceDuration = Date.now() - lastSpeechTimeRef.current;
            
            // If silence has been detected for more than 500ms, stop recording
            if (silenceDuration > 500 && isRecording) {
                console.log('Silence detected for 500ms, stopping recording');
                stopWebSpeechRecording();
            }
        }, 100);
    };
    
    // Function to clear the silence timer
    const clearSilenceTimer = () => {
        if (silenceTimerRef.current) {
            clearInterval(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
    };
    
    const stopWebSpeechRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
            clearSilenceTimer();
        }
    };

    const uploadAudio = async (audioBlob: Blob) => {
        setIsProcessing(true);
        setError(null);

        try {
            // Check if the audio blob is empty
            if (audioBlob.size === 0) {
                throw new Error('No audio was recorded. Please try again.');
            }
            
            // Check if the audio blob is too small (less than 1KB)
            if (audioBlob.size < 1024) {
                throw new Error('Audio recording is too short. Please speak for at least a few seconds.');
            }

            console.log(`Uploading audio file: ${audioBlob.size} bytes, type: ${audioBlob.type}`);

            // Try a direct upload with explicit content type
            const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
                method: 'POST',
                headers: {
                    'authorization': 'a37c27a55b944488928a76503c1ed8bb',
                    'content-type': 'audio/webm'
                },
                body: audioBlob
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json().catch(() => ({}));
                console.error('Upload error response:', errorData);
                
                // Try with a different content type
                console.log('Trying with a different content type...');
                const retryResponse = await fetch('https://api.assemblyai.com/v2/upload', {
                    method: 'POST',
                    headers: {
                        'authorization': 'a37c27a55b944488928a76503c1ed8bb',
                        'content-type': 'audio/mp4'
                    },
                    body: audioBlob
                });
                
                if (!retryResponse.ok) {
                    const retryErrorData = await retryResponse.json().catch(() => ({}));
                    console.error('Retry upload error response:', retryErrorData);
                    throw new Error(`Failed to upload audio: ${retryErrorData.error || retryResponse.statusText || 'Unknown error'}`);
                }
                
                const retryResult = await retryResponse.json();
                console.log('Retry upload successful:', retryResult);
                const { upload_url } = retryResult;
                
                // Submit the transcription request
                await submitTranscription(upload_url);
                return;
            }

            const uploadResult = await uploadResponse.json();
            console.log('Upload successful:', uploadResult);
            const { upload_url } = uploadResult;

            // Submit the transcription request
            await submitTranscription(upload_url);
        } catch (err) {
            console.error('Error processing audio:', err);
            setError(err instanceof Error ? err.message : 'Failed to process audio. Please try again.');
            setIsProcessing(false);
        }
    };
    
    const submitTranscription = async (uploadUrl: string) => {
        try {
            // Submit the transcription request
            const transcriptionResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
                method: 'POST',
                headers: {
                    'authorization': 'a37c27a55b944488928a76503c1ed8bb',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    audio_url: uploadUrl,
                    language_detection: true
                })
            });

            if (!transcriptionResponse.ok) {
                const errorData = await transcriptionResponse.json().catch(() => ({}));
                console.error('Transcription request error:', errorData);
                throw new Error(`Failed to submit transcription request: ${errorData.error || transcriptionResponse.statusText || 'Unknown error'}`);
            }

            const transcriptionResult = await transcriptionResponse.json();
            console.log('Transcription request successful:', transcriptionResult);
            const { id } = transcriptionResult;

            // Poll for the transcription result
            await pollTranscription(id);
        } catch (err) {
            console.error('Error submitting transcription:', err);
            setError(err instanceof Error ? err.message : 'Failed to submit transcription. Please try again.');
            setIsProcessing(false);
        }
    };

    const pollTranscription = async (transcriptId: string) => {
        try {
            // Set a timeout to prevent infinite polling
            const timeoutId = setTimeout(() => {
                setError('Transcription timed out. Please try again.');
                setIsProcessing(false);
            }, 60000); // 60 seconds timeout

            console.log(`Starting to poll for transcription with ID: ${transcriptId}`);

            const pollingInterval = setInterval(async () => {
                try {
                    const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
                        headers: {
                            'authorization': 'a37c27a55b944488928a76503c1ed8bb'
                        }
                    });

                    if (!pollingResponse.ok) {
                        clearInterval(pollingInterval);
                        clearTimeout(timeoutId);
                        const errorData = await pollingResponse.json().catch(() => ({}));
                        console.error('Polling error response:', errorData);
                        throw new Error(`Failed to get transcription result: ${errorData.error || pollingResponse.statusText || 'Unknown error'}`);
                    }

                    const transcriptionResult = await pollingResponse.json();
                    console.log(`Transcription status: ${transcriptionResult.status}`, transcriptionResult);

                    if (transcriptionResult.status === 'completed') {
                        clearInterval(pollingInterval);
                        clearTimeout(timeoutId);
                        onTranscriptReceived(transcriptionResult.text);
                        setIsProcessing(false);
                    } else if (transcriptionResult.status === 'error') {
                        clearInterval(pollingInterval);
                        clearTimeout(timeoutId);
                        setError('Transcription failed: ' + (transcriptionResult.error || 'Unknown error'));
                        setIsProcessing(false);
                    }
                } catch (pollingError) {
                    clearInterval(pollingInterval);
                    clearTimeout(timeoutId);
                    console.error('Error during polling:', pollingError);
                    setError('Failed to get transcription result. Please try again.');
                    setIsProcessing(false);
                }
            }, 1000);
        } catch (err) {
            console.error('Error setting up polling:', err);
            setError('Failed to set up transcription polling. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="relative">
            <div className="flex items-center space-x-2">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isDisabled || isProcessing}
                    className={`flex items-center justify-center p-3 rounded-lg w-40 h-12 ${
                        isRecording 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : isProcessing 
                                ? 'bg-gray-600 cursor-not-allowed' 
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
                    ) : isProcessing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Processing</span>
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