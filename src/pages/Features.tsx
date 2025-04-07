import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
    const features = [
        {
            title: 'AI Models',
            description: 'Jarvis leverages powerful AI models to provide intelligent assistance.',
            tools: [
                { name: 'LangChain', description: 'Advanced language model integration for natural conversations' },
                { name: 'Gemini', description: 'Google\'s powerful AI model for enhanced capabilities' },
                { name: 'SepAPI', description: 'Specialized API for custom functionality' }
            ]
        },
        {
            title: 'Utility Tools',
            description: 'Built-in tools to help you accomplish tasks efficiently.',
            tools: [
                { name: 'Calculator', description: 'Perform mathematical calculations' },
                { name: 'DateTime', description: 'Handle date and time operations' },
                { name: 'Web Search', description: 'Search the web for information' }
            ]
        },
        {
            title: 'User Experience',
            description: 'Designed for simplicity and effectiveness.',
            tools: [
                { name: 'Responsive Design', description: 'Works seamlessly on all devices' },
                { name: 'Dark Theme', description: 'Easy on the eyes with a modern dark interface' },
                { name: 'Real-time Responses', description: 'Get immediate assistance when you need it' }
            ]
        }
    ];

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
                className="z-10 text-4xl font-extrabold text-red-500 drop-shadow-md mt-24 text-center"
            >
                Features & Capabilities
            </motion.h1>

            <p className="text-yellow-400 text-lg text-center mt-2 drop-shadow-lg max-w-lg">
                Discover what <span className="text-red-500 font-bold">Jarvis</span> can do for you.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 z-10 max-w-6xl w-full">
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-black bg-opacity-80 p-6 rounded-lg shadow-lg border border-red-600 h-[400px] flex flex-col"
                    >
                        <div className="flex-none">
                            <h2 className="text-2xl font-bold text-red-500 mb-2">{feature.title}</h2>
                            <p className="text-gray-300 mb-4">{feature.description}</p>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            <ul className="space-y-3">
                                {feature.tools.map((tool) => (
                                    <li key={tool.name} className="bg-gray-900 bg-opacity-50 p-3 rounded-md">
                                        <h3 className="text-lg font-semibold text-yellow-400">{tool.name}</h3>
                                        <p className="text-gray-300 text-sm">{tool.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Features;
