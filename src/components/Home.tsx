import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Home = () => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'assistant', content: 'Hello! I\'m Jarvis, your AI assistant. How can I help you today?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [sessionId, setSessionId] = useState(Date.now().toString());
    const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [statusMessage, setStatusMessage] = useState('Checking server status...');
    
    // Add a ref to store the abort controller
    const abortControllerRef = useRef<AbortController | null>(null);

    // Function to check server status
    const checkServerStatus = async () => {
        setServerStatus('checking');
        setStatusMessage('Checking server status...');
        
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            
            // Add a timeout to the fetch request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            // First check the health endpoint
            const healthResponse = await fetch(`${apiUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (healthResponse.ok) {
                // If health check passes, do a quick chat test to ensure the server is fully operational
                // Try up to 3 times with a delay between attempts
                let chatTestSuccess = false;
                let retryCount = 0;
                const maxRetries = 3;
                
                while (!chatTestSuccess && retryCount < maxRetries) {
                    try {
                        const chatController = new AbortController();
                        const chatTimeoutId = setTimeout(() => chatController.abort(), 5000);
                        
                        console.log(`Chat test attempt ${retryCount + 1} of ${maxRetries}`);
                        
                        const chatResponse = await fetch(`${apiUrl}/api/chat`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ 
                                message: "test",
                                sessionId: "test-session"
                            }),
                            signal: chatController.signal
                        });
                        
                        clearTimeout(chatTimeoutId);
                        
                        if (chatResponse.ok) {
                            chatTestSuccess = true;
                            setServerStatus('online');
                            setStatusMessage('System is Online');
                            break;
                        } else {
                            console.log(`Chat test failed with status: ${chatResponse.status}`);
                            retryCount++;
                            if (retryCount < maxRetries) {
                                // Wait 2 seconds before retrying
                                await new Promise(resolve => setTimeout(resolve, 2000));
                            }
                        }
                    } catch (chatErr) {
                        console.error(`Chat test error on attempt ${retryCount + 1}:`, chatErr);
                        retryCount++;
                        if (retryCount < maxRetries) {
                            // Wait 2 seconds before retrying
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    }
                }
                
                if (!chatTestSuccess) {
                    setServerStatus('offline');
                    setStatusMessage('System is Partially Online - Chat may not work');
                }
            } else {
                setServerStatus('offline');
                setStatusMessage('System is Offline - Please wait a few seconds and try again');
            }
        } catch (err) {
            setServerStatus('offline');
            setStatusMessage('System is Offline - Please wait a few seconds and try again');
            console.error('Server status check error:', err);
        }
    };

    // Check server status on component mount and periodically
    useEffect(() => {
        checkServerStatus();
        
        // Check status every 30 seconds
        const intervalId = setInterval(checkServerStatus, 30000);
        
        return () => {
            clearInterval(intervalId);
            // Cancel any ongoing request when component unmounts
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Function to cancel ongoing request
    const cancelRequest = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
            setError('Request cancelled. The server might be starting up. Please try again in a few seconds.');
            // Check server status after cancellation
            checkServerStatus();
        }
    };

    // Function to start a new session
    const startNewSession = () => {
        setSessionId(Date.now().toString());
        setChatHistory([
            { role: 'assistant', content: 'Hello! I\'m Jarvis, your AI assistant. How can I help you today?' }
        ]);
    };

    // Function to force server status to online
    const forceServerOnline = () => {
        setServerStatus('online');
        setStatusMessage('System is Online (Manually Overridden)');
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        
        // Check server status before sending message
        if (serverStatus !== 'online') {
            setError('Server is currently offline. Please wait a few seconds and try again.');
            return;
        }

        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create a new abort controller for this request
        abortControllerRef.current = new AbortController();

        // Add user message to chat
        const userMessage = { role: 'user', content: message };
        setChatHistory(prev => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);
        setError('');

        try {
            // Get API URL from environment variable or use default
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            
            console.log(`Sending request to ${apiUrl}/api/chat`);
            
            // Add a timeout to the fetch request
            const timeoutId = setTimeout(() => {
                if (abortControllerRef.current) {
                    console.log('Request timed out after 30 seconds');
                    abortControllerRef.current.abort();
                    abortControllerRef.current = null;
                    setIsLoading(false);
                    setError('Request timed out. The server might be starting up. Please try again in a few seconds.');
                    // Check server status after timeout
                    checkServerStatus();
                }
            }, 30000); // 30 second timeout
            
            // Make actual API call to backend
            const response = await fetch(`${apiUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: userMessage.content,
                    sessionId: sessionId
                }),
                signal: abortControllerRef.current.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log(`Response status: ${response.status}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error response:', errorData);
                
                // Check if the error response includes a user-friendly message
                if (errorData.response) {
                    setError(errorData.response);
                    // Add the error message to the chat history
                    setChatHistory(prev => [...prev, { role: 'assistant', content: errorData.response }]);
                } else {
                    throw new Error(`Failed to get response: ${response.status} ${response.statusText}`);
                }
                return;
            }

            const data = await response.json();
            console.log('Response data:', data);
            
            const assistantMessage = { 
                role: 'assistant', 
                content: data.response 
            };
            setChatHistory(prev => [...prev, assistantMessage]);
        } catch (err) {
            console.error('Error in handleSubmit:', err);
            
            if (err instanceof Error && err.name === 'AbortError') {
                // This is already handled by the timeout or cancel button
                return;
            }
            
            setError(`Failed to process your request: ${err instanceof Error ? err.message : 'Unknown error'}`);
            // Check server status after error
            checkServerStatus();
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
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

            <p className={`text-base sm:text-lg text-center mt-2 drop-shadow-lg max-w-lg ${
                serverStatus === 'online' ? 'text-green-400' : 
                serverStatus === 'offline' ? 'text-red-400' : 'text-yellow-400'
            }`}>
                {statusMessage}
            </p>

            {/* Server Status Refresh Button */}
            <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onClick={checkServerStatus}
                className="mt-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-md transition-colors duration-200"
                disabled={serverStatus === 'checking'}
            >
                {serverStatus === 'checking' ? 'Checking...' : 'Refresh Status'}
            </motion.button>

            {/* Force Online Button */}
            <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                onClick={forceServerOnline}
                className="mt-4 px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm sm:text-base font-medium rounded-md transition-colors duration-200"
            >
                Force Online
            </motion.button>

            {/* New Session Button */}
            <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                onClick={startNewSession}
                className="mt-4 px-3 sm:px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm sm:text-base font-medium rounded-md transition-colors duration-200"
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
                {/* Chat Messages */}
                <div className="w-full max-w-3xl mt-8 mb-4 overflow-y-auto max-h-[60vh] bg-black/50 rounded-lg p-4">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-3 rounded-lg ${
                                msg.role === 'user' ? 'bg-red-600 text-white' : 'bg-gray-700 text-white'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    
                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="text-center p-4">
                            <div className="inline-block animate-pulse">
                                <div className="h-2 w-2 bg-yellow-400 rounded-full mx-1 inline-block"></div>
                                <div className="h-2 w-2 bg-yellow-400 rounded-full mx-1 inline-block"></div>
                                <div className="h-2 w-2 bg-yellow-400 rounded-full mx-1 inline-block"></div>
                            </div>
                            <p className="text-yellow-400 mt-2">Processing your request...</p>
                            <button 
                                onClick={cancelRequest}
                                className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors duration-200"
                            >
                                Cancel Request
                            </button>
                        </div>
                    )}
                    
                    {/* Error Message */}
                    {error && (
                        <div className="text-center p-4 text-red-400">
                            <p>{error}</p>
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