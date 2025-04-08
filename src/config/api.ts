// API Configuration
export const API_CONFIG = {
    // Use environment variable if available, otherwise use the live server URL
    BASE_URL: import.meta.env.VITE_API_URL || 'https://mark-iii-server.onrender.com',
    ENDPOINTS: {
        CHAT: '/api/chat',
        TRANSCRIBE: '/api/transcribe'
    }
}; 