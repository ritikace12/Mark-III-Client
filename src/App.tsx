import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Features from './pages/Features';
import Contact from './pages/Contact';
import Navbar from './components/Navbar';
import Constraints from './pages/Constraints';
import './App.css';
import Footer from './components/Footer';

const App = () => {
    return (
        <Router>
            <div className="flex flex-col min-h-screen bg-black text-white">
                <Navbar />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/features" element={<Features />} />
                        <Route path="/constraints" element={<Constraints />} />
                        <Route path="/contact" element={<Contact />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
