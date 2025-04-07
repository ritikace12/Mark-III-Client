import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs';

const Contact = () => {
    const formRef = useRef<HTMLFormElement>(null);
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const result = await emailjs.sendForm(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                formRef.current as HTMLFormElement,
                EMAILJS_CONFIG.PUBLIC_KEY
            );

            if (result.text === 'OK') {
                setSuccess(true);
                setForm({
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                });
            } else {
                setError('Failed to send message. Please try again.');
            }
        } catch (err) {
            console.error('Error sending email:', err);
            setError('An error occurred while sending your message. Please try again.');
        } finally {
            setLoading(false);
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
                Contact Us
            </motion.h1>

            <p className="text-yellow-400 text-lg text-center mt-2 drop-shadow-lg max-w-lg">
                Get in touch with the <span className="text-red-500 font-bold">Jarvis</span> team.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 z-10 max-w-6xl w-full">
                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-black bg-opacity-80 p-8 rounded-lg shadow-lg border border-red-600"
                >
                    <h2 className="text-2xl font-bold mb-6 text-red-500">Send us a message</h2>
                    
                    {success && (
                        <div className="mb-6 p-4 bg-green-900 text-green-200 rounded-md">
                            Your message has been sent successfully! We'll get back to you soon.
                        </div>
                    )}
                    
                    {error && (
                        <div className="mb-6 p-4 bg-red-900 text-red-200 rounded-md">
                            {error}
                        </div>
                    )}
                    
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                                placeholder="your.email@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                                Subject
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                                placeholder="What's this about?"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                                placeholder="Your message here..."
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </motion.div>

                {/* About Box */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-black bg-opacity-80 p-8 rounded-lg shadow-lg border border-red-600"
                >
                    <h2 className="text-2xl font-bold mb-6 text-red-500">About Jarvis</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold mb-2 text-yellow-400">Our Mission</h3>
                            <p className="text-gray-300">
                                Jarvis is an AI assistant built by Ritik Meena using the Gemini Model, dedicated to providing powerful AI assistance through advanced language models and specialized tools. We aim to make AI technology accessible and useful for everyone.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2 text-yellow-400">Our Technology</h3>
                            <p className="text-gray-300">
                                Built on cutting-edge AI technologies including LangChain, Gemini, and SepAPI, Jarvis offers a comprehensive suite of tools designed to enhance productivity and problem-solving capabilities.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2 text-yellow-400">Our Creator</h3>
                            <p className="text-gray-300">
                                Jarvis was created by Ritik Meena, a passionate developer with expertise in AI and web technologies. The goal was to create an intelligent assistant that could help users accomplish tasks efficiently.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2 text-yellow-400">Connect With Us</h3>
                            <div className="space-y-2">
                                <p className="text-gray-300 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    ritikace12@gmail.com
                                </p>
                                <p className="text-gray-300 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                    </svg>
                                    Discord: Jarvis Community
                                </p>
                                <p className="text-gray-300 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Documentation
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
