import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen flex flex-col pt-10 px-4 md:px-20 relative overflow-hidden">
            {/* Navigation */}
            <nav className="flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Landmark className="text-white" size={24} />
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        KodBank
                    </span>
                </div>
                <div className="flex gap-4">
                    <Link to="/login" className="px-6 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-medium">
                        Sign In
                    </Link>
                    <Link to="/register" className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="flex-1 flex flex-col justify-center items-center text-center z-10 mt-10 md:mt-0">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                    The future of <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                        banking simulation
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10">
                    Experience a next-generation banking interface. Send, receive, and track your money with KodBank's state-of-the-art secure platform.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link to="/register" className="glass-button w-full sm:w-auto px-8 py-4 text-lg">
                        Open an Account <ArrowRight className="ml-2" size={20} />
                    </Link>
                    <Link to="/login" className="px-8 py-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-semibold text-white">
                        Access Dashboard
                    </Link>
                </div>
            </div>

            {/* Decorative Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] -z-10"></div>
        </div>
    );
};

export default LandingPage;
