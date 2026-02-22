import React, { useState, useContext, useEffect } from 'react';
import {
    Landmark, CreditCard, ArrowDownToLine, ArrowUpFromLine,
    Send, History, User, Settings, LogOut, Wallet
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('balance');
    const [balance, setBalance] = useState(user?.balance || 0);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const fetchBalance = async () => {
        try {
            const res = await api.get('/banking/balance');
            setBalance(res.data.balance);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (activeTab === 'balance') fetchBalance();
    }, [activeTab]);

    const navItems = [
        { id: 'balance', label: 'Check Balance', icon: Wallet },
        { id: 'deposit', label: 'Deposit', icon: ArrowDownToLine },
        { id: 'withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
        { id: 'transfer', label: 'Transfer', icon: Send },
        { id: 'transactions', label: 'Transactions', icon: History },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'balance':
                return <BalanceView balance={balance} />;
            case 'deposit':
                return <DepositView onComplete={fetchBalance} />;
            case 'withdraw':
                return <WithdrawView onComplete={fetchBalance} />;
            case 'transfer':
                return <TransferView onComplete={fetchBalance} />;
            case 'transactions':
                return <TransactionsView />;
            case 'profile':
                return <ProfileView user={user} />;
            case 'settings':
                return <SettingsView />;
            default:
                return <BalanceView balance={balance} />;
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 glass border-r border-white/10 flex flex-col hidden md:flex z-10">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Landmark className="text-white" size={20} />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        KodBank
                    </span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 mt-auto">
                    <div className="glass p-4 rounded-xl mb-4 text-sm text-center">
                        <p className="text-slate-400">Logged in as</p>
                        <p className="font-semibold text-white truncate">{user?.customerName}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-y-auto">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <header className="px-8 py-6 flex items-center justify-between z-10 sticky top-0 bg-slate-900/50 backdrop-blur-md border-b border-white/5">
                    <h2 className="text-2xl font-bold capitalize">{activeTab.replace('-', ' ')}</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-slate-300">Customer ID</p>
                            <p className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-md">{user?.customerId}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                            {user?.customerName?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-8 z-10 w-full max-w-5xl mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

// Sub-components for views

const BalanceView = ({ balance }) => (
    <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
            <Wallet className="text-blue-400" size={40} />
        </div>
        <h3 className="text-slate-400 text-lg mb-2">Available Balance</h3>
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            ${balance?.toFixed(2) || '0.00'}
        </h1>
    </div>
);

const DepositView = ({ onComplete }) => {
    const [amount, setAmount] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDeposit = async (e) => {
        e.preventDefault();
        setLoading(true); setMsg(''); setError('');
        try {
            const res = await api.post('/banking/deposit', { amount: parseFloat(amount) });
            setMsg(res.data.message);
            setAmount('');
            onComplete();
        } catch (err) {
            setError(err.response?.data?.error || 'Deposit failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass p-8 rounded-2xl max-w-lg mx-auto">
            <h3 className="text-2xl font-bold mb-6">Deposit Funds</h3>
            {msg && <div className="bg-green-500/10 text-green-400 p-3 rounded-lg mb-4 text-center">{msg}</div>}
            {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-center">{error}</div>}
            <form onSubmit={handleDeposit} className="space-y-6">
                <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Amount to Deposit ($)</label>
                    <input type="number" min="0.01" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className="glass-input text-2xl font-semibold py-4" placeholder="0.00" />
                </div>
                <button type="submit" disabled={loading} className="glass-button">
                    {loading ? 'Processing...' : 'Confirm Deposit'}
                </button>
            </form>
        </div>
    );
};

const WithdrawView = ({ onComplete }) => {
    const [amount, setAmount] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setLoading(true); setMsg(''); setError('');
        try {
            const res = await api.post('/banking/withdraw', { amount: parseFloat(amount) });
            setMsg(res.data.message);
            setAmount('');
            onComplete();
        } catch (err) {
            setError(err.response?.data?.error || 'Withdrawal failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass p-8 rounded-2xl max-w-lg mx-auto">
            <h3 className="text-2xl font-bold mb-6">Withdraw Funds</h3>
            {msg && <div className="bg-green-500/10 text-green-400 p-3 rounded-lg mb-4 text-center">{msg}</div>}
            {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-center">{error}</div>}
            <form onSubmit={handleWithdraw} className="space-y-6">
                <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Amount to Withdraw ($)</label>
                    <input type="number" min="0.01" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className="glass-input text-2xl font-semibold py-4" placeholder="0.00" />
                </div>
                <button type="submit" disabled={loading} className="glass-button">
                    {loading ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
            </form>
        </div>
    );
};

const TransferView = ({ onComplete }) => {
    const [formData, setFormData] = useState({ recipientCustomerId: '', amount: '' });
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setMsg(''); setError('');
        try {
            const res = await api.post('/banking/transfer', {
                recipientCustomerId: formData.recipientCustomerId,
                amount: parseFloat(formData.amount)
            });
            setMsg(res.data.message);
            setFormData({ recipientCustomerId: '', amount: '' });
            onComplete();
        } catch (err) {
            setError(err.response?.data?.error || 'Transfer failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass p-8 rounded-2xl max-w-lg mx-auto">
            <h3 className="text-2xl font-bold mb-6">Transfer to Account</h3>
            {msg && <div className="bg-green-500/10 text-green-400 p-3 rounded-lg mb-4 text-center">{msg}</div>}
            {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-center">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Recipient Customer ID</label>
                    <input type="text" required value={formData.recipientCustomerId} onChange={e => setFormData({ ...formData, recipientCustomerId: e.target.value })} className="glass-input py-3 uppercase" placeholder="e.g. A1B2C3D4" />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Amount</label>
                    <input type="number" min="0.01" step="0.01" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="glass-input text-2xl font-semibold py-4" placeholder="0.00" />
                </div>
                <button type="submit" disabled={loading} className="glass-button">
                    {loading ? 'Processing...' : 'Send Money'}
                </button>
            </form>
        </div>
    );
};

const TransactionsView = () => {
    const [transactions, setTransactions] = useState([]);

    // Mock fetching transactions
    useEffect(() => {
        api.get('/banking/transactions').then(res => setTransactions(res.data.transactions || []));
    }, []);

    return (
        <div className="glass p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-6">Transaction History</h3>
            {transactions.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                    <History size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No recent transactions found.</p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {/* List items if database logic is added */}
                </ul>
            )}
        </div>
    );
};

const ProfileView = ({ user }) => (
    <div className="glass p-8 rounded-2xl max-w-2xl mx-auto">
        <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-4xl shadow-lg shadow-blue-500/20">
                {user?.customerName?.charAt(0).toUpperCase()}
            </div>
            <div>
                <h2 className="text-3xl font-bold">{user?.customerName}</h2>
                <p className="text-slate-400 flex items-center gap-2 mt-1"><CreditCard size={16} /> {user?.customerId}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-sm text-slate-400 mb-1">Email Address</p>
                <p className="font-medium">{user?.email}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-sm text-slate-400 mb-1">Phone Number</p>
                <p className="font-medium">{user?.phoneNumber || 'N/A'}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-sm text-slate-400 mb-1">Account Created</p>
                <p className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
        </div>
    </div>
);

const SettingsView = () => (
    <div className="glass p-8 rounded-2xl max-w-2xl mx-auto text-center">
        <Settings size={48} className="mx-auto mb-4 text-slate-400 opacity-50" />
        <h3 className="text-2xl font-bold mb-2">Account Settings</h3>
        <p className="text-slate-400">Settings functionality coming soon.</p>
    </div>
);
