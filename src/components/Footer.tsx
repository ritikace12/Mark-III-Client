
import { motion } from 'framer-motion';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="bg-black bg-opacity-90 border-t border-red-600 py-6"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-8">
                <div className="flex justify-center items-center">
                    <p className="text-gray-400 text-sm">
                        © {currentYear} <span className="text-red-500"> JARVIS </span> - Powered by PORTGAS <span className="text-red-500"> U! </span>
                    </p>
                </div>
            </div>
        </motion.footer>
    );
};

export default Footer;