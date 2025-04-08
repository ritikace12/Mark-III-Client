import { motion } from 'framer-motion';

const Features = () => {
    return (
        <div className="min-h-screen bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h1 className="text-4xl font-bold text-red-500 mb-8">Features</h1>
                    <p className="text-xl text-gray-300 mb-12">Discover what Jarvis AI can do for you</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-gray-900 p-6 rounded-lg border border-red-600"
                    >
                        <h3 className="text-xl font-semibold text-red-500 mb-4">Natural Language Processing</h3>
                        <p className="text-gray-300">Advanced NLP capabilities for understanding and responding to human language.</p>
                    </motion.div>

                    {/* Feature 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-gray-900 p-6 rounded-lg border border-red-600"
                    >
                        <h3 className="text-xl font-semibold text-red-500 mb-4">Real-time Responses</h3>
                        <p className="text-gray-300">Quick and accurate responses to your queries and commands.</p>
                    </motion.div>

                    {/* Feature 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-gray-900 p-6 rounded-lg border border-red-600"
                    >
                        <h3 className="text-xl font-semibold text-red-500 mb-4">Context Awareness</h3>
                        <p className="text-gray-300">Maintains context throughout conversations for more natural interactions.</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Features;
