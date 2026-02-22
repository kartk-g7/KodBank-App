import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark, User, Mail, Phone, Lock, ArrowRight, Loader2 } from 'lucide-react';
import api from '../utils/api';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        customerName: '',
        phoneNumber: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
            setError('Please enter a valid phone number');
            setLoading(false);
            return;
        }

        try {
            await api.post('/auth/register', formData);
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] -z-10"></div>

            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:scale-105 transition-transform">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Landmark className="text-white" size={28} />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Create your KodBank account
                    </h1>
                    <p className="text-slate-400 mt-2">Join to experience next-gen banking</p>
                </div>

                <div className="glass p-8 rounded-2xl relative">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="w-full">
                            <label className="block text-sm mb-2 text-gray-300">Full Name</label>
                            <input
                                type="text" name="customerName" required
                                value={formData.customerName} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="w-full">
                            <label className="block text-sm mb-2 text-gray-300">Phone Number</label>
                            <PhoneInput
                                country={'in'}
                                onlyCountries={['in', 'us', 'gb', 'ca']}
                                enableSearch={true}
                                value={formData.phoneNumber}
                                onChange={(phone) => setFormData({ ...formData, phoneNumber: phone.startsWith('+') ? phone : '+' + phone })}
                                inputProps={{
                                    name: 'phoneNumber',
                                    required: true,
                                }}
                                containerClass="w-full"
                            />
                        </div>

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
                        </div>

                        <button type="submit" disabled={loading} className={`glass-button mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                <>Sign Up <ArrowRight className="ml-2" size={20} /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-400 mt-6 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
