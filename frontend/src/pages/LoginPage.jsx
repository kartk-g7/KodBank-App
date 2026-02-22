import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Landmark, Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const successMessage = location.state?.message;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', formData);
            login(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] -z-10"></div>

            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:scale-105 transition-transform">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Landmark className="text-white" size={28} />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Welcome back
                    </h1>
                    <p className="text-slate-400 mt-2">Sign in to your KodBank account</p>
                </div>

                <div className="glass p-8 rounded-2xl relative">
                    {successMessage && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-6">
                            {successMessage}
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="w-full">
                            <label className="block text-sm mb-2 text-gray-300">Email Address</label>
                            <input
                                type="email" name="email" required
                                value={formData.email} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="w-full">
                            <label className="block text-sm mb-2 text-gray-300">Password</label>
                            <input
                                type="password" name="password" required
                                value={formData.password} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                            <div className="text-right mt-2">
                                <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className={`glass-button mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                <>Sign In <LogIn className="ml-2" size={20} /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-400 mt-6 text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
