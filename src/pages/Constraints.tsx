import { motion } from 'framer-motion';

const Constraints = () => {
    const constraints = [
        {
            category: 'Model Constraints',
            description: 'Limitations of the AI models used by Jarvis',
            items: [
                { name: 'LangChain', impact: 'High', description: 'Requires proper configuration and API keys' },
                { name: 'Gemini', impact: 'Medium', description: 'Limited to text-based interactions' },
                { name: 'SepAPI', impact: 'Low', description: 'Custom API may have rate limits' }
            ]
        },
        {
            category: 'API Limitations',
            description: 'Restrictions on API usage and functionality',
            items: [
                { name: 'Rate Limits', impact: 'High', description: 'API calls may be throttled under heavy usage' },
                { name: 'Token Limits', impact: 'Medium', description: 'Responses may be truncated for very long inputs' },
                { name: 'Timeout', impact: 'Low', description: 'Requests may time out after extended periods' }
            ]
        },
        {
            category: 'Performance Constraints',
            description: 'Limitations affecting system performance',
            items: [
                { name: 'Response Time', impact: 'High', description: 'Complex queries may take longer to process' },
                { name: 'Memory Usage', impact: 'Medium', description: 'Large conversations may consume more memory' },
                { name: 'Concurrent Requests', impact: 'Low', description: 'Limited number of simultaneous requests' }
            ]
        },
        {
            category: 'Tool Limitations',
            description: 'Restrictions on available tools and features',
            items: [
                { name: 'Calculator', impact: 'Low', description: 'Limited to basic mathematical operations' },
                { name: 'DateTime', impact: 'Low', description: 'Basic date and time operations only' },
                { name: 'Web Search', impact: 'Medium', description: 'Results may be limited by search API' }
            ]
        },
        {
            category: 'Security Constraints',
            description: 'Security-related limitations and considerations',
            items: [
                { name: 'Data Privacy', impact: 'High', description: 'Sensitive information should not be shared' },
                { name: 'API Keys', impact: 'High', description: 'Secure storage of API credentials required' },
                { name: 'User Authentication', impact: 'Medium', description: 'Limited authentication options' }
            ]
        },
        {
            category: 'Browser Limitations',
            description: 'Constraints related to browser compatibility',
            items: [
                { name: 'Browser Support', impact: 'Medium', description: 'May not work in older browsers' },
                { name: 'JavaScript', impact: 'High', description: 'Requires JavaScript to be enabled' },
                { name: 'Screen Size', impact: 'Low', description: 'Optimized for modern screen resolutions' }
            ]
        }
    ];

    const getImpactColor = (impact: string) => {
        switch (impact.toLowerCase()) {
            case 'high':
                return 'bg-red-900 text-red-200';
            case 'medium':
                return 'bg-yellow-900 text-yellow-200';
            case 'low':
                return 'bg-green-900 text-green-200';
            default:
                return 'bg-gray-900 text-gray-200';
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
                className="z-10 text-4xl font-extrabold text-red-500 drop-shadow-md mt-24 text-center"
            >
                Constraints & Limitations
            </motion.h1>

            <p className="text-yellow-400 text-lg text-center mt-2 drop-shadow-lg max-w-lg">
                Understanding the boundaries of <span className="text-red-500 font-bold">Jarvis</span>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 z-10 max-w-6xl w-full">
                {constraints.map((constraint, index) => (
                    <motion.div
                        key={constraint.category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-black bg-opacity-80 p-6 rounded-lg shadow-lg border border-red-600 h-[400px] flex flex-col"
                    >
                        <div className="flex-none">
                            <h2 className="text-2xl font-bold text-red-500 mb-2">{constraint.category}</h2>
                            <p className="text-gray-300 mb-4">{constraint.description}</p>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            <ul className="space-y-3">
                                {constraint.items.map((item) => (
                                    <li key={item.name} className="bg-gray-900 bg-opacity-50 p-3 rounded-md">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="text-lg font-semibold text-yellow-400">{item.name}</h3>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(item.impact)}`}>
                                                {item.impact}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-sm">{item.description}</p>
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

export default Constraints;
