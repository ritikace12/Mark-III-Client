import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
    return (
        <nav className="bg-black bg-opacity-80 border-b border-red-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-red-500 font-bold text-xl">
                            Jarvis AI
                        </Link>
                    </div>
                    <div className="flex space-x-4">
                        <Link to="/features" className="text-gray-300 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
                            Features
                        </Link>
                        <Link to="/constraints" className="text-gray-300 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
                            Constraints
                        </Link>
                        <Link to="/contact" className="text-gray-300 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
                            Contact
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;