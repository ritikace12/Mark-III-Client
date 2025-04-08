import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SpeechToText from './SpeechToText';
import { API_CONFIG } from '../config/api';

const Home = () => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'assistant', content: 'Hello! I\'m Jarvis, your AI assistant. How can I help you today?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [sessionId, setSessionId] = useState(Date.now().toString());

    // Function to start a new session
    const startNewSession = () => {
        setSessionId(Date.now().toString());
        setChatHistory([
            { role: 'assistant', content: 'Hello! I\'m Jarvis, your AI assistant. How can I help you today?' }
        ]);
    };

    const handleTranscriptReceived = (transcript: string) => {
        setMessage(transcript);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Add user message to chat
        const userMessage = { role: 'user', content: message };
        setChatHistory(prev => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);
        setError('');

        try {
            // Make API call to backend using the configured URL
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: userMessage.content,
                    sessionId: sessionId
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            const assistantMessage = { 
                role: 'assistant', 
                content: data.response 
            };
            setChatHistory(prev => [...prev, assistantMessage]);
        } catch (err) {
            setError('Failed to process your request. Please try again.');
            console.error('API Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-black text-white overflow-hidden px-4 sm:px-8 pb-24">
            {/* Background Animation */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
                className="absolute inset-0 bg-gradient-to-br from-red-800 via-black to-yellow-500 opacity-90 blur-3xl"
            />

            {/* Title */}
            <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="z-10 text-3xl sm:text-4xl font-extrabold text-red-500 drop-shadow-md mt-16 sm:mt-24 text-center"
            >
                Jarvis <span className="text-yellow-400">AI</span> 
            </motion.h1>

            <p className="text-yellow-400 text-base sm:text-lg text-center mt-2 drop-shadow-lg max-w-lg">
               System is Online 
            </p>

            {/* New Session Button */}
            <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                onClick={startNewSession}
                className="mt-4 px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm sm:text-base font-medium rounded-md transition-colors duration-200"
            >
                Start New Session
            </motion.button>

            {/* Chat Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-4xl mt-12 bg-black bg-opacity-80 rounded-lg shadow-lg border border-red-600 p-4 sm:p-6 z-10 flex-grow flex flex-col"
            >
                <div className="flex-grow overflow-y-auto mb-6 space-y-4">
                    {chatHistory.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-3 sm:p-4 rounded-lg ${
                                msg.role === 'user' 
                                    ? 'bg-red-900 bg-opacity-30 ml-auto max-w-[90%] sm:max-w-[80%]' 
                                    : 'bg-gray-900 bg-opacity-50 mr-auto max-w-[90%] sm:max-w-[80%]'
                            }`}
                        >
                            <p className="text-xs sm:text-sm font-medium mb-1 text-yellow-400">
                                {msg.role === 'user' ? 'You' : 'Jarvis'}
                            </p>
                            <p className="text-sm sm:text-base text-gray-200">{msg.content}</p>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="bg-gray-900 bg-opacity-50 p-3 sm:p-4 rounded-lg mr-auto max-w-[90%] sm:max-w-[80%]">
                            <p className="text-xs sm:text-sm font-medium mb-1 text-yellow-400">Jarvis</p>
                            <p className="text-sm sm:text-base text-gray-200">Thinking...</p>
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-900 bg-opacity-30 p-3 sm:p-4 rounded-lg">
                            <p className="text-sm sm:text-base text-red-300">{error}</p>
                        </div>
                    )}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="mt-auto">
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full sm:flex-grow px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                            {/* SpeechToText button temporarily hidden
                            <SpeechToText 
                                onTranscriptReceived={handleTranscriptReceived} 
                                isDisabled={isLoading}
                            />
                            */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={isLoading || !message.trim()}
                                className={`px-4 py-2 rounded-md ${
                                    isLoading || !message.trim()
                                        ? 'bg-gray-700 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                } text-white transition-colors duration-200`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Processing</span>
                                    </div>
                                ) : (
                                    'Send'
                                )}
                            </motion.button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Home;