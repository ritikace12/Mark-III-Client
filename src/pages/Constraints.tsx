import { motion } from 'framer-motion';

const Constraints = () => {
    return (
        <div className="min-h-screen bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h1 className="text-4xl font-bold text-red-500 mb-8">Constraints</h1>
                    <p className="text-xl text-gray-300 mb-12">Understanding the limitations of Jarvis AI</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Constraint 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-gray-900 p-6 rounded-lg border border-red-600"
                    >
                        <h3 className="text-xl font-semibold text-red-500 mb-4">Knowledge Cutoff</h3>
                        <p className="text-gray-300">My knowledge is limited to my training data, which has a cutoff date.</p>
                    </motion.div>

                    {/* Constraint 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-gray-900 p-6 rounded-lg border border-red-600"
                    >
                        <h3 className="text-xl font-semibold text-red-500 mb-4">No Internet Access</h3>
                        <p className="text-gray-300">I cannot access the internet or real-time information.</p>
                    </motion.div>

                    {/* Constraint 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-gray-900 p-6 rounded-lg border border-red-600"
                    >
                        <h3 className="text-xl font-semibold text-red-500 mb-4">No File Access</h3>
                        <p className="text-gray-300">I cannot access or modify files on your system.</p>
                    </motion.div>

                    {/* Constraint 4 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-gray-900 p-6 rounded-lg border border-red-600"
                    >
                        <h3 className="text-xl font-semibold text-red-500 mb-4">No Memory Between Sessions</h3>
                        <p className="text-gray-300">Each conversation starts fresh, without memory of previous interactions.</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Constraints;
