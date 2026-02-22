import { useState, useContext, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const ChatWidget = () => {
    const { user } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm KodBank AI. How can I help you?" },
    ]);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!user) return null;

    const send = async () => {
        const msg = input.trim();
        if (!msg || loading) return;

        const updated = [...messages, { role: 'user', content: msg }];
        setMessages(updated);
        setInput('');
        setLoading(true);

        // placeholder for assistant reply
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        try {
            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ messages: updated }),
            });

            if (!res.ok) throw new Error(`Error ${res.status}`);

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const lines = decoder.decode(value).split('\n');
                for (const line of lines) {
                    if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
                    try {
                        const { content } = JSON.parse(line.slice(6));
                        if (content) {
                            setMessages(prev => {
                                const copy = [...prev];
                                copy[copy.length - 1] = {
                                    ...copy[copy.length - 1],
                                    content: copy[copy.length - 1].content + content,
                                };
                                return copy;
                            });
                        }
                    } catch { }
                }
            }
        } catch (err) {
            setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'assistant', content: `⚠️ ${err.message}` };
                return copy;
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {open && (
                <div className="fixed bottom-24 right-6 w-[360px] h-[480px] rounded-2xl glass border border-white/10 flex flex-col z-[9998] shadow-2xl">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <Bot size={16} color="#fff" />
                            </div>
                            <span className="font-semibold text-sm text-white">KodBank AI</span>
                        </div>
                        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-3 py-2 rounded-xl whitespace-pre-wrap ${m.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-white/5 text-slate-200 border border-white/10 rounded-bl-sm'
                                    }`}>
                                    {m.content || '...'}
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    <div className="flex items-center gap-2 p-3 border-t border-white/10">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && send()}
                            placeholder="Type a message…"
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                        />
                        <button onClick={send} disabled={!input.trim() || loading}
                            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white disabled:opacity-30 hover:bg-blue-500">
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            )}

            <button onClick={() => setOpen(p => !p)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 z-[9999] hover:scale-105 transition-transform">
                {open ? <X size={22} /> : <MessageCircle size={22} />}
            </button>
        </>
    );
};

export default ChatWidget;
