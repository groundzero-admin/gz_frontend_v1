import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import {
    ArrowLeft, ArrowRight, CheckCircle, Play, RotateCcw,
    Calculator as CalcIcon, MessageSquare, X, GraduationCap,
    ChevronLeft, ChevronRight, ExternalLink, Check, AlertTriangle,
    HelpCircle, Maximize2, Minimize2, Lock, Sparkles
} from 'lucide-react';
import {
    listStudentBatchSections, listStudentBatchActivities,
    getMySessionResponses, submitActivityResponse,
    sendActivityChatMessage, getActivityChatHistory
} from "../api.js";

// ──────────────────────────────────────────
//  HELPER: ID Normalizer (Crucial for Fix)
// ──────────────────────────────────────────
const normalizeId = (id) => {
    if (!id) return null;
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id._id) return id._id.toString();
    return id.toString();
};

// ──────────────────────────────────────────
//  Utility Components
// ──────────────────────────────────────────

const SimpleCalculator = ({ onClose }) => {
    const [input, setInput] = useState('');
    const handleClick = (val) => setInput(prev => prev + val);
    const calculate = () => { try { setInput(eval(input).toString()); } catch { setInput('Error'); } };
    return (
        <div className="fixed bottom-24 right-6 bg-gray-900 p-5 rounded-2xl shadow-2xl w-64 border-2 border-gray-700 z-50">
            <div className="flex justify-between mb-2">
                <span className="text-white text-xs font-bold uppercase tracking-widest">Calculator</span>
                <button onClick={onClose}><X size={14} className="text-gray-400" /></button>
            </div>
            <div className="bg-gray-100 p-3 rounded-xl mb-3 text-right font-mono text-2xl font-bold h-14 overflow-hidden flex items-center justify-end text-gray-800">{input || '0'}</div>
            <div className="grid grid-cols-4 gap-1.5">
                {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map(btn => (
                    <button key={btn}
                        onClick={() => btn === '=' ? calculate() : handleClick(btn)}
                        className={`p-3 rounded-lg font-bold text-lg hover:scale-105 transition-transform ${btn === '=' ? 'bg-teal-500 text-white col-span-2' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                    >{btn}</button>
                ))}
                <button onClick={() => setInput('')} className="col-span-2 bg-red-500 text-white p-2 rounded-lg font-bold mt-1.5">C</button>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────
//  AI Chat Modal (Real, Persistent)
// ──────────────────────────────────────────
const AIChatModal = ({ isOpen, onClose, batchActivityId, questionIndex }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const inputRef = useRef(null);

    // Load initial history when modal opens
    useEffect(() => {
        if (isOpen && batchActivityId) {
            setMessages([]);
            setPage(1);
            setHasMore(false);
            loadHistory(1, true);
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [isOpen, batchActivityId, questionIndex]);

    const loadHistory = async (pageNum, isInitial = false) => {
        setLoadingHistory(true);
        const res = await getActivityChatHistory(batchActivityId, questionIndex, pageNum, 10);
        if (res.success && res.data) {
            if (isInitial) {
                setMessages(res.data.messages || []);
            } else {
                // Prepend older messages
                setMessages(prev => [...(res.data.messages || []), ...prev]);
            }
            setTotalCount(res.data.totalCount || 0);
            setHasMore(res.data.hasMore || false);
            setPage(pageNum);
        }
        setLoadingHistory(false);
        if (isInitial) {
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
        }
    };

    const handleLoadMore = () => {
        if (!loadingHistory && hasMore) {
            loadHistory(page + 1, false);
        }
    };

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || sending) return;

        // Optimistically add student message
        const tempMsg = { role: 'student', message: trimmed, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, tempMsg]);
        setInput('');
        setSending(true);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

        const res = await sendActivityChatMessage(batchActivityId, questionIndex, trimmed);

        if (res.success) {
            if (res.data?.isBad) {
                // Guardrail triggered
                setMessages(prev => [...prev, {
                    role: 'ai',
                    message: '⚠️ Your message was flagged as inappropriate. Please ask a question related to the topic.',
                    createdAt: new Date().toISOString(),
                    isModerated: true
                }]);
            } else if (res.data?.answer) {
                setMessages(prev => [...prev, {
                    role: 'ai',
                    message: res.data.answer,
                    createdAt: new Date().toISOString()
                }]);
            }
        } else {
            setMessages(prev => [...prev, {
                role: 'ai',
                message: '😔 Sorry, I couldn\'t respond right now. Please try again!',
                createdAt: new Date().toISOString(),
                isError: true
            }]);
        }

        setSending(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden bg-white border border-gray-200" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-4 flex items-center gap-3 text-white">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles size={18} />
                </div>
                <div className="flex-grow">
                    <h3 className="font-bold text-sm">AI Companion</h3>
                    <p className="text-white/70 text-[10px]">Ask me anything about this question!</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
                    <X size={18} />
                </button>
            </div>

            {/* Disclaimer */}
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                <p className="text-[10px] text-amber-700">AI responses can make mistakes. Please double-check important information.</p>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {/* Load More */}
                {hasMore && (
                    <div className="text-center">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingHistory}
                            className="text-xs text-teal-600 font-medium px-4 py-1.5 rounded-full bg-teal-50 hover:bg-teal-100 transition"
                        >
                            {loadingHistory ? 'Loading...' : '↑ Load older messages'}
                        </button>
                    </div>
                )}

                {loadingHistory && messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-gray-400">Loading chat...</p>
                        </div>
                    </div>
                )}

                {!loadingHistory && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-teal-200">
                            <Sparkles size={28} className="text-white" />
                        </div>
                        <h4 className="font-black text-gray-800 text-base">Hey! I'm your AI Companion 👋</h4>
                        <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed">Ask me anything about this question — I'll explain, give hints, or walk you through it!</p>
                        <div className="flex gap-2 mt-3">
                            <span className="px-3 py-1 bg-teal-50 text-teal-600 text-[10px] font-bold rounded-full">💡 Hints</span>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full">📖 Explain</span>
                            <span className="px-3 py-1 bg-cyan-50 text-cyan-600 text-[10px] font-bold rounded-full">🧠 Learn</span>
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'ai' && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white mr-2 flex-shrink-0 mt-1">
                                <Sparkles size={12} />
                            </div>
                        )}
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'student'
                            ? 'bg-teal-500 text-white rounded-br-md'
                            : msg.isModerated
                                ? 'bg-amber-50 text-amber-800 border border-amber-200 rounded-bl-md'
                                : msg.isError
                                    ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-md'
                                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                            }`}>
                            <p className="whitespace-pre-line">{msg.message}</p>
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {sending && (
                    <div className="flex justify-start">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white mr-2 flex-shrink-0">
                            <Sparkles size={12} />
                        </div>
                        <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t bg-white">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Ask a question..."
                        disabled={sending}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                        className={`p-2.5 rounded-xl transition-all ${input.trim() && !sending
                            ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-md'
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                    >
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────
//  Per-Question Media Carousel
// ──────────────────────────────────────────
const ACADEMIC_QUOTES = [
    "Education is the most powerful weapon you can use to change the world. — Nelson Mandela",
    "The beautiful thing about learning is that nobody can take it away from you. — B.B. King",
    "Live as if you were to die tomorrow. Learn as if you were to live forever. — Mahatma Gandhi",
    "An investment in knowledge pays the best interest. — Benjamin Franklin",
    "The mind is not a vessel to be filled, but a fire to be kindled. — Plutarch",
    "Tell me and I forget, teach me and I may remember, involve me and I learn. — Benjamin Franklin",
    "The roots of education are bitter, but the fruit is sweet. — Aristotle",
    "Learning is not attained by chance, it must be sought for with ardor. — Abigail Adams",
    "The only thing that interferes with my learning is my education. — Albert Einstein",
    "Knowledge is power. Information is liberating. — Kofi Annan",
];

const MediaCarousel = ({ mediaItems }) => {
    const [mediaIndex, setMediaIndex] = useState(0);
    const [imgLoaded, setImgLoaded] = useState({});
    const [isZoomed, setIsZoomed] = useState(false);
    const quote = useMemo(() => ACADEMIC_QUOTES[Math.floor(Math.random() * ACADEMIC_QUOTES.length)], []);

    if (!mediaItems || mediaItems.length === 0) return null;

    const hasMultiple = mediaItems.length > 1;
    const current = mediaItems[mediaIndex];

    const renderMedia = () => {
        if (!current?.url) return null;
        const isYouTube = current.url.includes('youtu');

        if (current.mediaType === 'image') {
            return (
                <div className="relative">
                    {!imgLoaded[mediaIndex] && (
                        <div className="flex items-center justify-center py-16 px-8 text-center">
                            <div className="space-y-3">
                                <div className="text-4xl animate-pulse">📚</div>
                                <p className="text-sm text-gray-400 italic max-w-md leading-relaxed">"{quote}"</p>
                            </div>
                        </div>
                    )}
                    <img
                        src={current.url}
                        className={`w-full h-auto max-h-[400px] object-contain transition-all duration-300 ${imgLoaded[mediaIndex] ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                        alt="AI-powered learning content"
                        loading="eager"
                        decoding="async"
                        onLoad={() => setImgLoaded(prev => ({ ...prev, [mediaIndex]: true }))}
                    />
                </div>
            );
        }
        if (current.mediaType === 'video' && !isYouTube) {
            return <video src={current.url} controls className="w-full h-auto max-h-[400px]" preload="metadata" />;
        }
        return (
            <div className="aspect-video w-full">
                <iframe src={current.url} className="w-full h-full border-0" title="Interactive learning resource" allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            </div>
        );
    };

    return (
        <div className="mb-5 relative">
            {/* Preload all images in the carousel */}
            {mediaItems.map((m, i) => m.mediaType === 'image' && m.url ? (
                <link key={i} rel="preload" as="image" href={m.url} />
            ) : null)}

            {/* Toolbar — above carousel */}
            {current?.url && (() => {
                // Convert YouTube embed URLs to proper watch URLs
                let openUrl = current.url;
                const embedMatch = current.url.match(/youtube\.com\/embed\/([^?&/]+)/);
                if (embedMatch) openUrl = `https://www.youtube.com/watch?v=${embedMatch[1]}`;
                const shortMatch = current.url.match(/youtu\.be\/([^?&/]+)/);
                if (shortMatch) openUrl = `https://www.youtube.com/watch?v=${shortMatch[1]}`;
                return (
                    <div className="flex items-center justify-end gap-2 mb-2 px-1">
                        <button
                            onClick={() => setIsZoomed(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 transition-all"
                        >
                            <Maximize2 size={13} />
                            Zoom
                        </button>
                        <a
                            href={openUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-all"
                        >
                            <ExternalLink size={13} />
                            Open in New Tab
                        </a>
                    </div>
                );
            })()}

            {/* Normal carousel */}
            <div className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 relative">
                {renderMedia()}
                {hasMultiple && (
                    <>
                        <button
                            onClick={() => setMediaIndex(prev => prev === 0 ? mediaItems.length - 1 : prev - 1)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-teal-600 transition-all hover:scale-110"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <button
                            onClick={() => setMediaIndex(prev => prev === mediaItems.length - 1 ? 0 : prev + 1)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-teal-600 transition-all hover:scale-110"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </>
                )}
            </div>

            {/* Dot indicators — below carousel */}
            {hasMultiple && (
                <div className="flex justify-center gap-1.5 mt-3">
                    {mediaItems.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setMediaIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === mediaIndex ? 'bg-teal-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                        />
                    ))}
                </div>
            )}

            {/* Fullscreen overlay */}
            {isZoomed && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setIsZoomed(false)}>
                    {/* Close button */}
                    <button
                        onClick={() => setIsZoomed(false)}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-xl flex items-center justify-center text-gray-600 hover:text-red-500 transition-all hover:scale-110 z-50"
                    >
                        <X size={20} />
                    </button>

                    {/* Media container */}
                    <div className="max-w-[90vw] max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
                        {current?.mediaType === 'image' && (
                            <img src={current.url} className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl" alt="AI-powered learning content" />
                        )}
                        {current?.mediaType === 'video' && !current.url.includes('youtu') && (
                            <video src={current.url} controls className="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl" />
                        )}
                        {(current?.mediaType === 'embed' || current?.url?.includes('youtu')) && (
                            <div className="w-[80vw] aspect-video">
                                <iframe src={current.url} className="w-full h-full border-0 rounded-xl shadow-2xl" title="Interactive learning resource" allowFullScreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                            </div>
                        )}

                        {/* Overlay navigation arrows */}
                        {hasMultiple && (
                            <>
                                <button
                                    onClick={() => setMediaIndex(prev => prev === 0 ? mediaItems.length - 1 : prev - 1)}
                                    className="absolute left-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:text-teal-600 transition-all hover:scale-110"
                                >
                                    <ArrowLeft size={22} />
                                </button>
                                <button
                                    onClick={() => setMediaIndex(prev => prev === mediaItems.length - 1 ? 0 : prev + 1)}
                                    className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:text-teal-600 transition-all hover:scale-110"
                                >
                                    <ArrowRight size={22} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Overlay bottom bar */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                        {hasMultiple && (
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                {mediaItems.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.stopPropagation(); setMediaIndex(i); }}
                                        className={`w-3 h-3 rounded-full transition-all ${i === mediaIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`}
                                    />
                                ))}
                            </div>
                        )}
                        <button
                            onClick={() => setIsZoomed(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold hover:bg-white/30 transition-all"
                        >
                            <Minimize2 size={14} />
                            Minimize
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ──────────────────────────────────────────
//  Question Block Renderer
// ──────────────────────────────────────────
const QuestionBlock = ({ qData, response, onInput, readOnly, qIndex }) => {
    if (!qData) {
        return <div className="p-6 bg-gray-100 rounded-xl text-gray-400 text-center">No question loaded</div>;
    }

    const update = (val, subIdx = null) => {
        if (readOnly) return;
        if (subIdx !== null) {
            const current = Array.isArray(response) ? [...response] : [];
            current[subIdx] = val;
            onInput(current, qIndex);
        } else {
            onInput(val, qIndex);
        }
    };

    const mediaItems = qData.media || [];

    return (
        <div className="space-y-5">
            {qData.prompt && qData.prompt.replace(/<[^>]*>/g, '').trim() ? (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm border-l-4 border-l-teal-400">
                    <div className="prose prose-lg max-w-none text-gray-800"
                        dangerouslySetInnerHTML={{ __html: qData.prompt }}
                    />
                </div>
            ) : null}

            <MediaCarousel mediaItems={mediaItems} />

            {qData.qType !== 'no_response' && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-5">
                        {qData.qType === 'mcq' ? 'Choose one answer' :
                            qData.qType === 'msq' ? 'Select all that apply' :
                                qData.qType === 'fact_trick' ? 'What do you think?' :
                                    qData.qType === 'fill_blanks' ? 'Fill in the blanks' :
                                        'Your Answer'}
                    </h4>

                    {qData.qType === 'mcq' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(qData.options || []).map((opt, i) => (
                                <button key={i} onClick={() => update(opt)} disabled={readOnly}
                                    className={`group p-4 rounded-xl border-2 font-semibold text-left transition-all flex items-center gap-3 hover:scale-[1.02] ${response === opt
                                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md'
                                        : 'bg-white border-gray-100 text-gray-600 hover:border-teal-200 hover:shadow-sm'
                                        }`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 transition-colors ${response === opt
                                        ? 'bg-teal-500 text-white'
                                        : 'bg-gray-100 text-gray-400 group-hover:bg-teal-100 group-hover:text-teal-600'
                                        }`}>
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                    <span className="leading-snug">{opt}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {qData.qType === 'msq' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(qData.options || []).map((opt, i) => {
                                const selected = Array.isArray(response) ? response.includes(opt) : false;
                                return (
                                    <button key={i} onClick={() => {
                                        if (readOnly) return;
                                        const current = Array.isArray(response) ? [...response] : [];
                                        const newSelection = selected ? current.filter(a => a !== opt) : [...current, opt];
                                        onInput(newSelection, qIndex);
                                    }} disabled={readOnly}
                                        className={`group p-4 rounded-xl border-2 font-semibold text-left transition-all flex items-center gap-3 hover:scale-[1.02] ${selected
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                            : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200 hover:shadow-sm'
                                            }`}>
                                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected
                                            ? 'bg-blue-500 border-blue-500 text-white'
                                            : 'border-gray-300 group-hover:border-blue-300'
                                            }`}>
                                            {selected && <Check size={14} strokeWidth={3} />}
                                        </div>
                                        <span className="leading-snug">{opt}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {qData.qType === 'fact_trick' && (
                        <div className="grid grid-cols-3 gap-4">
                            {(qData.options || ['Fact', 'Trick', 'Opinion']).slice(0, 3).map((opt, i) => {
                                const icons = [<Check size={28} />, <AlertTriangle size={28} />, <HelpCircle size={28} />];
                                const colors = ['bg-green-100 text-green-600', 'bg-red-100 text-red-600', 'bg-blue-100 text-blue-600'];
                                const selectedColors = ['border-green-500 bg-green-50', 'border-red-500 bg-red-50', 'border-blue-500 bg-blue-50'];
                                const isSelected = response === opt;
                                return (
                                    <button key={i} onClick={() => update(opt)} disabled={readOnly}
                                        className={`p-5 rounded-2xl border-3 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.03] ${isSelected
                                            ? `${selectedColors[i % 3]} shadow-lg scale-105`
                                            : 'border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm'
                                            }`}>
                                        <div className={`p-3 rounded-xl ${colors[i % 3]}`}>{icons[i % 3]}</div>
                                        <span className="font-black text-xs text-center uppercase tracking-wide text-gray-700">{opt || 'Option'}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {qData.qType === 'single_input' && (
                        <div className="space-y-2">
                            {qData.inputLabel && <label className="text-sm font-bold text-teal-500 uppercase tracking-wider ml-1">{qData.inputLabel}</label>}
                            <div className={`border-2 rounded-xl overflow-hidden bg-white transition-all ${readOnly ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-gray-200 focus-within:border-teal-400 focus-within:shadow-lg'
                                }`}>
                                <textarea
                                    className="w-full outline-none px-5 py-4 text-gray-800 text-lg leading-relaxed resize-none"
                                    placeholder={readOnly ? "NOT ANSWERED" : "Type your answer here..."}
                                    rows={4}
                                    value={response || ''}
                                    onChange={e => update(e.target.value)}
                                    disabled={readOnly}
                                />
                            </div>
                        </div>
                    )}

                    {qData.qType === 'multi_input' && (
                        <div className="space-y-5">
                            {(qData.multiFields || []).map((field, fIdx) => {
                                const fieldType = field.fieldType || 'input';
                                return (
                                    <div key={fIdx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-lg bg-teal-500 text-white flex items-center justify-center text-[10px] font-black">{fIdx + 1}</span>
                                            {field.label || `Step ${fIdx + 1}`}
                                        </label>
                                        {fieldType === 'input' ? (
                                            <div className={`border-2 rounded-xl overflow-hidden bg-white transition-all ${readOnly ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-gray-200 focus-within:border-teal-400 focus-within:shadow-md'}`}>
                                                <textarea
                                                    className="w-full outline-none px-4 py-3 text-gray-800 text-base leading-relaxed resize-none"
                                                    placeholder={readOnly ? "NOT ANSWERED" : "Type your answer here..."}
                                                    rows={Math.max(2, Math.ceil((field.maxChars || 100) / 50))}
                                                    value={(response && response[fIdx]) || ''}
                                                    onChange={e => update(e.target.value, fIdx)}
                                                    disabled={readOnly}
                                                />
                                            </div>
                                        ) : (
                                            /* MSQ step — multiple selection */
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                                                {(field.options || []).map((opt, oi) => {
                                                    const selections = Array.isArray(response && response[fIdx]) ? response[fIdx] : [];
                                                    const selected = selections.includes(opt);
                                                    return (
                                                        <button key={oi} onClick={() => {
                                                            if (readOnly) return;
                                                            const current = Array.isArray(response && response[fIdx]) ? [...response[fIdx]] : [];
                                                            const newSelection = selected ? current.filter(a => a !== opt) : [...current, opt];
                                                            update(newSelection, fIdx);
                                                        }} disabled={readOnly}
                                                            className={`group p-3 rounded-lg border-2 font-semibold text-left transition-all flex items-center gap-2 text-sm hover:scale-[1.02] ${selected
                                                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                                                : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200'
                                                                }`}>
                                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 group-hover:border-blue-300'}`}>
                                                                {selected && <Check size={12} strokeWidth={3} />}
                                                            </div>
                                                            {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {qData.qType === 'fill_blanks' && (
                        <div className="leading-[3.5rem] text-xl text-gray-700 font-medium">
                            {(qData.fillBlankText || '').split(/(\[\$.*?\])/).map((part, i, arr) => {
                                if (part.startsWith('[$')) {
                                    const max = part.match(/\d+/)?.[0] || '10';
                                    const idx = arr.slice(0, i).filter(p => p.startsWith('[$')).length;
                                    const val = (response && response[idx]) ? response[idx] : '';
                                    return (
                                        <input
                                            key={i}
                                            maxLength={parseInt(max, 10)}
                                            disabled={readOnly}
                                            value={val}
                                            onChange={e => update(e.target.value, idx)}
                                            className={`inline-block border-b-4 w-40 mx-2 px-3 text-center outline-none rounded-t-lg font-bold transition-colors ${readOnly && !val
                                                ? 'border-red-300 bg-red-100/50 text-red-900'
                                                : 'border-teal-300 bg-teal-50 text-teal-900 focus:bg-teal-100 focus:border-teal-600'
                                                }`}
                                        />
                                    );
                                }
                                return <span key={i}>{part}</span>;
                            })}
                        </div>
                    )}
                </div>
            )}

            {qData.answer_embed_url && (
                <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                    <div className="px-4 py-2 bg-gray-50 border-b flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{qData.answer_embed_label || 'Reference'}</span>
                    </div>
                    <iframe
                        src={qData.answer_embed_url}
                        className="w-full h-64 border-0"
                        loading="lazy"
                        allowFullScreen
                        title="Answer Embed"
                    />
                </div>
            )}
        </div>
    );
};

// ──────────────────────────────────────────
//  Step 1: Updated Sections + Activity Cards (Timeline UI)
// ──────────────────────────────────────────
const AllSectionsView = ({ sections, responses, sessionInfo, onSelectActivity, selectedActivityId }) => {

    return (
        <div className="max-w-6xl mx-auto w-full px-6 pt-12 pb-24">
            {/* Session Header */}
            <div className="mb-12">
                <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 inline-block">
                    Student Dashboard
                </span>
                <h1 className="text-4xl font-black text-gray-900 mb-1">
                    {sessionInfo?.title || "Session 1"}
                </h1>
                <p className="text-gray-400 text-sm">
                    {sessionInfo?.description || "this is disc of sessson1"}
                </p>
            </div>

            {/* Timeline Container */}
            <div className="relative space-y-16">
                {/* Vertical Line */}
                <div className="absolute left-5 top-2 bottom-0 w-[2px] bg-indigo-100 -z-0" />

                {sections.map((section, secIdx) => {
                    const acts = section.activities || [];
                    const completedCount = acts.filter(a => {
                        const id = normalizeId(a._id);
                        return !!responses[id]?.grade;
                    }).length;

                    const isFullyDone = completedCount === acts.length && acts.length > 0;

                    return (
                        <div key={section._id} className="relative z-10">
                            {/* Section Header Row */}
                            <div className="flex items-start gap-6 mb-8">
                                {/* Timeline Icon */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-colors duration-300 ${isFullyDone
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-indigo-500 text-white'
                                    }`}>
                                    {isFullyDone ? <Check size={20} strokeWidth={3} /> : <span className="font-bold">{secIdx + 1}</span>}
                                </div>

                                {/* Section Title & Progress Bar */}
                                <div className="flex-1">
                                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                                        {section.sectionName}
                                    </h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                                style={{ width: `${(completedCount / (acts.length || 1)) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                                            {completedCount}/{acts.length} Done
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Cards Row (Horizontal) */}
                            <div className="flex flex-wrap gap-4 ml-16">
                                {acts.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">No activities here</p>
                                ) : (
                                    acts.map((act) => {
                                        const id = normalizeId(act._id);
                                        const resp = responses[id];
                                        const isCompleted = !!resp?.grade;
                                        const totalQ = act.practiceData?.questions?.length || 0;
                                        const totalMaterials = act.readingData?.materials?.length || 0;

                                        return (
                                            <div
                                                key={act._id}
                                                onClick={() => onSelectActivity(act)}
                                                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer w-full sm:w-[220px] group flex flex-col relative"
                                            >
                                                {/* Badge */}
                                                <div className="mb-4">
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${act.type === 'reading'
                                                        ? 'bg-purple-100 text-purple-600'
                                                        : 'bg-emerald-100 text-emerald-600'
                                                        }`}>
                                                        {act.type || 'Practice'}
                                                    </span>
                                                </div>

                                                {/* Title */}
                                                <h4 className="font-bold text-gray-800 text-sm mb-6 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[40px]">
                                                    {act.title}
                                                </h4>

                                                {/* Footer Info */}
                                                <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {act.type === 'reading' ? `${totalMaterials} Material${totalMaterials !== 1 ? 's' : ''}` : `${totalQ} Questions`}
                                                    </span>

                                                    {isCompleted ? (
                                                        <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm shadow-emerald-200">
                                                            <Check size={14} strokeWidth={3} />
                                                        </div>
                                                    ) : (
                                                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                                            <Play size={12} fill="currentColor" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ──────────────────────────────────────────
//  Step 3: Question View
// ──────────────────────────────────────────

const QuestionView = ({
    activity, section, responses, allActivities, sections,
    effectiveSessionId, onBack, onUpdateResponses, onNextActivity, onGoToMenu
}) => {
    const navigate = useNavigate();
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showCalculator, setShowCalculator] = useState(false);
    const [showAgentChat, setShowAgentChat] = useState(false);

    // Core state for UI
    const [gradingResult, setGradingResult] = useState(null);
    const [previousBest, setPreviousBest] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dirtyQuestions, setDirtyQuestions] = useState(new Set());

    // Initial load logic: Hydrate answers, but hide grade card initially
    useEffect(() => {
        const id = normalizeId(activity._id);
        const existingResp = responses[id];

        if (existingResp && Array.isArray(existingResp.responses)) {
            const prefilled = {};
            existingResp.responses.forEach((ans, idx) => {
                if (ans !== null && ans !== undefined) {
                    prefilled[idx] = ans;
                }
            });
            setAnswers(prefilled);

            // Store previous grade for header badge, but force result card closed
            if (existingResp.grade) {
                setPreviousBest(existingResp.grade);
                setGradingResult(null);
            }
        } else {
            setAnswers({});
            setGradingResult(null);
            setPreviousBest(null);
        }
        setCurrentQuestionIdx(0);
        setShowAgentChat(false);
    }, [activity._id]); // Intentionally omitting 'responses' to prevent auto-hiding during updates

    const questions = activity.practiceData?.questions || [];
    const totalQ = questions.length;
    const currentQ = questions[currentQuestionIdx];

    const answeredCount = Object.keys(answers).filter(k => {
        const val = answers[k];
        if (Array.isArray(val)) return val.length > 0;
        return val !== null && val !== undefined && String(val).trim() !== '';
    }).length;

    const progress = totalQ > 0 ? (answeredCount / totalQ) * 100 : 0;

    const handleInput = (val, qIdx) => {
        if (typeof qIdx === 'number') {
            setAnswers(prev => ({
                ...prev,
                [qIdx]: val
            }));
            // Mark this question as modified
            setDirtyQuestions(prev => new Set(prev).add(qIdx));
            // Hide grading result when student changes their answer
            if (gradingResult) setGradingResult(null);
        }
    };

    const gradingRef = useRef(null);

    const hasAnswer = (idx) => {
        const q = questions[idx];
        if (q?.qType === 'no_response') return true;
        const ans = answers[idx];
        if (ans === null || ans === undefined) return false;
        if (Array.isArray(ans)) return ans.some(v => !!v);
        if (typeof ans === 'object') return Object.values(ans).some(v => !!v);
        return String(ans).trim().length > 0;
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const responseData = questions.map((_, idx) => answers[idx] ?? null);

            const res = await submitActivityResponse({
                batchActivity_obj_id: activity._id,
                batchSession_obj_id: effectiveSessionId,
                responses: responseData,
                questionIndex: currentQuestionIdx
            });

            if (res.success) {
                const grade = res.data?.grade;

                // Show grading card immediately
                setGradingResult(grade);
                setPreviousBest(grade);

                // Auto-scroll to grading result
                setTimeout(() => {
                    gradingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);

                // Update parent state safely
                onUpdateResponses(normalizeId(activity._id), {
                    ...responses[normalizeId(activity._id)],
                    responses: responseData,
                    grade
                });
            } else {
                alert("Submission failed: " + res.message);
            }
        } catch (err) {
            console.error(err);
            setGradingResult({ score: 0, feedback: "Error submitting.", tip: "Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Position awareness ───
    const sectionActs = section?.activities || [];
    const actIdxInSection = sectionActs.findIndex(a => a._id === activity._id);
    const isLastActInSection = actIdxInSection === sectionActs.length - 1;
    const sectionIdx = sections?.findIndex(s => s._id === section?._id) ?? -1;
    const isLastSection = sectionIdx === (sections?.length || 0) - 1;
    const isAbsolutelyLast = isLastActInSection && isLastSection;

    const isLastQuestion = currentQuestionIdx >= totalQ - 1;
    const lastQuestionAnswered = isLastQuestion && (gradingResult || hasAnswer(currentQuestionIdx));

    const getContinueLabel = () => {
        if (currentQuestionIdx < totalQ - 1) return 'Next Question 👉';
        if (isAbsolutelyLast) return lastQuestionAnswered ? 'Hurray Finished! 🎊' : 'Submit to Finish ✍️';
        if (isLastActInSection) return 'Next Section 🚀';
        return 'Next Activity →';
    };

    const handleContinue = () => {
        // Auto-save silently if the current question was modified
        if (dirtyQuestions.has(currentQuestionIdx) && hasAnswer(currentQuestionIdx) && !isSubmitting) {
            // Silent save — just persist, no grading card
            const responseData = questions.map((_, idx) => answers[idx] ?? null);
            submitActivityResponse({
                batchActivity_obj_id: activity._id,
                batchSession_obj_id: effectiveSessionId,
                responses: responseData,
                questionIndex: currentQuestionIdx
            }).then(res => {
                if (res.success) {
                    onUpdateResponses(normalizeId(activity._id), {
                        ...responses[normalizeId(activity._id)],
                        responses: responseData,
                        grade: res.data?.grade
                    });
                }
            }).catch(() => { });
            // Clear dirty flag for this question
            setDirtyQuestions(prev => {
                const next = new Set(prev);
                next.delete(currentQuestionIdx);
                return next;
            });
        }

        setGradingResult(null);
        if (currentQuestionIdx < totalQ - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
        } else if (isAbsolutelyLast) {
            onGoToMenu ? onGoToMenu() : onBack();
        } else if (onNextActivity) {
            onNextActivity();
        } else {
            onBack();
        }
    };

    const handleRetry = () => {
        setGradingResult(null);
    };

    // Reading type
    if (activity.type === 'reading') {
        const materials = activity.readingData?.materials || [];
        const tipText = activity.readingData?.tipText || '';
        // Also support legacy single-link reading activities
        const legacyLink = activity.readingData?.link;
        if (legacyLink && materials.length === 0) {
            materials.push({ title: 'Reading Resource', url: legacyLink, mediaType: 'link' });
        }

        const typeIcons = { pdf: '📄', doc: '📝', image: '🖼️', video: '🎬', embed: '🌐', link: '🔗' };

        const ReadingMaterialViewer = () => {
            const [viewingIdx, setViewingIdx] = useState(null);
            const viewing = viewingIdx !== null ? materials[viewingIdx] : null;

            const getViewableUrl = (url, mediaType) => {
                if ((mediaType === 'pdf' || mediaType === 'doc') && url) {
                    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
                }
                // Convert YouTube embed URLs back to watch URLs for "open in new tab"
                if (url) {
                    const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
                    if (embedMatch) return `https://www.youtube.com/watch?v=${embedMatch[1]}`;
                }
                return url;
            };

            const renderViewing = () => {
                if (!viewing) return null;
                const { url, mediaType } = viewing;
                const loadingBg = (
                    <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-white rounded-xl text-gray-400 gap-3">
                        <div className="text-4xl animate-pulse">🧒📚</div>
                        <p className="text-sm font-medium">Loading your learning material...</p>
                        <p className="text-xs opacity-60">AI-powered education for curious minds</p>
                    </div>
                );
                if (mediaType === 'image') return (
                    <div className="relative">
                        {loadingBg}
                        <img src={url} className="relative z-10 max-w-[90vw] max-h-[80vh] object-contain rounded-xl shadow-2xl" alt="AI-powered learning content for kids" />
                    </div>
                );
                if (mediaType === 'video') return <video src={url} controls className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-2xl" />;
                if (mediaType === 'pdf' || mediaType === 'doc') {
                    const viewerUrl = getViewableUrl(url, mediaType);
                    return (
                        <div className="relative w-[85vw] h-[80vh]">
                            {loadingBg}
                            <iframe src={viewerUrl} className="relative z-10 w-full h-full rounded-xl shadow-2xl border-0 bg-white" title="AI-powered education document viewer" />
                        </div>
                    );
                }
                if (mediaType === 'embed') return (
                    <div className="relative w-[80vw] aspect-video">
                        {loadingBg}
                        <iframe src={url} className="relative z-10 w-full h-full border-0 rounded-xl shadow-2xl" title="Interactive AI learning resource" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                    </div>
                );
                // link type
                return (
                    <div className="relative w-[85vw] h-[80vh]">
                        {loadingBg}
                        <iframe src={url} className="relative z-10 w-full h-full rounded-xl shadow-2xl border-0 bg-white" title="AI-powered learning resource" />
                    </div>
                );
            };

            return (
                <>
                    {/* Material Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {materials.map((mat, idx) => (
                            <button key={idx}
                                onClick={() => setViewingIdx(idx)}
                                className="bg-white rounded-2xl border border-gray-200 hover:border-teal-300 hover:shadow-xl transition-all text-left group overflow-hidden flex"
                            >
                                <div className="w-1.5 bg-gradient-to-b from-teal-400 to-emerald-400 flex-shrink-0 group-hover:from-teal-500 group-hover:to-emerald-500 transition-all" />
                                <div className="flex-1 p-5 flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-black flex-shrink-0 group-hover:bg-teal-100 transition">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 truncate group-hover:text-teal-700 transition">{mat.title || `Material ${idx + 1}`}</p>
                                        {mat.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{mat.description}</p>}
                                    </div>
                                    <ExternalLink size={14} className="text-gray-300 group-hover:text-teal-500 transition mt-1 flex-shrink-0" />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Fullscreen Viewer */}
                    {viewing && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setViewingIdx(null)}>
                            {/* Close button */}
                            <button onClick={() => setViewingIdx(null)}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-xl flex items-center justify-center text-gray-600 hover:text-red-500 transition-all hover:scale-110 z-50">
                                <X size={20} />
                            </button>
                            {/* Open in new tab */}
                            <a href={getViewableUrl(viewing.url, viewing.mediaType)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                className="absolute top-6 right-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-xl flex items-center justify-center text-gray-600 hover:text-blue-500 transition-all hover:scale-110 z-50">
                                <ExternalLink size={18} />
                            </a>

                            {/* Content */}
                            <div className="relative" onClick={e => e.stopPropagation()}>
                                {renderViewing()}

                                {/* Nav arrows */}
                                {materials.length > 1 && (
                                    <>
                                        <button onClick={() => setViewingIdx(prev => prev === 0 ? materials.length - 1 : prev - 1)}
                                            className="absolute left-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:text-teal-600 transition-all hover:scale-110">
                                            <ArrowLeft size={22} />
                                        </button>
                                        <button onClick={() => setViewingIdx(prev => prev === materials.length - 1 ? 0 : prev + 1)}
                                            className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:text-teal-600 transition-all hover:scale-110">
                                            <ArrowRight size={22} />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Bottom bar */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                                {materials.length > 1 && (
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                        {materials.map((_, i) => (
                                            <button key={i} onClick={(e) => { e.stopPropagation(); setViewingIdx(i); }}
                                                className={`w-3 h-3 rounded-full transition-all ${i === viewingIdx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`} />
                                        ))}
                                    </div>
                                )}
                                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                                    {viewing.title || `Material ${viewingIdx + 1}`}
                                </span>
                                <button onClick={() => setViewingIdx(null)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold hover:bg-white/30 transition-all">
                                    <X size={14} /> Minimize
                                </button>
                            </div>
                        </div>
                    )}
                </>
            );
        };

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col relative pb-12">
                {/* ─── Header (matches practice page) ─── */}
                <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
                    <div className="max-w-4xl mx-auto px-6 py-3">
                        <div className="flex items-center gap-3">
                            <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-all flex-shrink-0">
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-base font-bold text-gray-900 truncate">{activity.title}</h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full uppercase">
                                        📖 Reading
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium">{materials.length} document{materials.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            {onGoToMenu && (
                                <button
                                    onClick={onGoToMenu}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2 flex-shrink-0"
                                >
                                    <GraduationCap size={14} />
                                    All Activities
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── Content ─── */}
                <div className="max-w-4xl mx-auto w-full px-6 py-8 space-y-6">
                    {/* Tip text from admin */}
                    {tipText && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
                            <span className="text-xl">💡</span>
                            <div className="text-amber-800 text-sm font-medium leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: tipText }} />
                        </div>
                    )}

                    {materials.length > 0 ? (
                        <ReadingMaterialViewer />
                    ) : (
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-400">
                            No reading materials available for this activity.
                        </div>
                    )}

                    <div className="text-center pt-4">
                        <button
                            onClick={() => {
                                submitActivityResponse({
                                    batchActivity_obj_id: activity._id,
                                    batchSession_obj_id: effectiveSessionId,
                                    responses: [{ answer: 'read', isCorrect: true }]
                                }).then(res => {
                                    if (res.success) {
                                        onUpdateResponses(normalizeId(activity._id), { grade: { score: 10 } });
                                        onBack();
                                    }
                                });
                            }}
                            className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition"
                        >
                            ✅ Mark as Completed
                        </button>
                    </div>
                </div>

                {/* Calculator */}
                {activity.allowCalculator && showCalculator && <SimpleCalculator onClose={() => setShowCalculator(false)} />}

                {/* AI Chat Modal */}
                <AIChatModal
                    isOpen={showAgentChat}
                    onClose={() => setShowAgentChat(false)}
                    batchActivityId={activity._id}
                    questionIndex={0}
                />

                {/* Bottom Action Bar */}
                <div className="fixed bottom-24 right-6 z-40 flex flex-col gap-3 items-end">
                    {activity.showAgent && !showAgentChat && (
                        <button
                            onClick={() => setShowAgentChat(true)}
                            className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 transition-all group hover:scale-105"
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Sparkles size={18} className="text-white" />
                                </div>
                                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-teal-500 animate-pulse" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-black text-white">AI Companion</p>
                                <p className="text-[10px] text-white/70 font-medium">Need help? Click here! ✨</p>
                            </div>
                        </button>
                    )}
                    {activity.allowCalculator && (
                        <button
                            onClick={() => setShowCalculator(!showCalculator)}
                            className={`p-4 rounded-full shadow-xl hover:scale-110 transition-all ${showCalculator ? 'bg-teal-600 text-white' : 'bg-white text-teal-600 border-2 border-teal-200'
                                }`}
                        >
                            <CalcIcon size={24} />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Practice type
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            {/* ─── Redesigned Header ─── */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-6 py-3">
                    {/* Top row: back, title, menu */}
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-all flex-shrink-0">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base font-bold text-gray-900 truncate">{activity.title}</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full uppercase">
                                    {activity.type || 'Practice'}
                                </span>
                                {previousBest && (
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <CheckCircle size={10} /> Submitted
                                    </span>
                                )}
                            </div>
                        </div>
                        {onGoToMenu && (
                            <button
                                onClick={onGoToMenu}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2 flex-shrink-0"
                            >
                                <GraduationCap size={14} />
                                All Activities
                            </button>
                        )}
                    </div>

                    {/* Bottom row: question nav */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => currentQuestionIdx > 0 && setCurrentQuestionIdx(currentQuestionIdx - 1)}
                                disabled={currentQuestionIdx === 0}
                                className={`p-1.5 rounded-lg transition-all ${currentQuestionIdx > 0 ? 'bg-teal-50 text-teal-600 hover:bg-teal-100' : 'text-gray-300 cursor-not-allowed'}`}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-sm font-semibold text-gray-700">
                                Q {currentQuestionIdx + 1} <span className="text-gray-400 font-normal">/ {totalQ}</span>
                            </span>
                            <button
                                onClick={() => {
                                    if (currentQuestionIdx < totalQ - 1) {
                                        setCurrentQuestionIdx(currentQuestionIdx + 1);
                                    }
                                }}
                                disabled={currentQuestionIdx >= totalQ - 1}
                                className={`p-1.5 rounded-lg transition-all ${currentQuestionIdx < totalQ - 1 ? 'bg-teal-50 text-teal-600 hover:bg-teal-100' : 'text-gray-300 cursor-not-allowed'}`}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        <div className="flex gap-1">
                            {questions.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentQuestionIdx(i)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${i === currentQuestionIdx ? 'bg-teal-500 scale-125' : hasAnswer(i) ? 'bg-teal-200' : 'bg-gray-200 hover:bg-gray-300'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-36">
                <div className="max-w-4xl mx-auto">
                    {currentQ && (
                        <QuestionBlock
                            qData={currentQ}
                            qIndex={currentQuestionIdx}
                            response={answers[currentQuestionIdx]}
                            onInput={handleInput}
                            readOnly={isSubmitting}
                        />
                    )}

                    {/* Inline Grading Result — Kid Friendly */}
                    {gradingResult && (
                        <div ref={gradingRef} className="mt-6 rounded-2xl border-2 overflow-hidden shadow-lg transition-all duration-500 ease-out animate-[slideUp_0.4s_ease-out]" style={{
                            borderColor: gradingResult.feedback
                                ? (gradingResult.shouldRetry ? '#fb923c' : '#34d399')
                                : '#a78bfa'
                        }}>
                            {/* Fun Header */}
                            <div className={`p-5 ${gradingResult.feedback
                                ? (gradingResult.shouldRetry
                                    ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                                    : 'bg-gradient-to-r from-emerald-400 to-teal-400')
                                : 'bg-gradient-to-r from-violet-400 to-purple-400'
                                }`}>
                                <div className="flex items-center gap-3 text-white">
                                    <span className="text-3xl">
                                        {gradingResult.feedback
                                            ? (gradingResult.shouldRetry ? '💪' : '🎉')
                                            : '✅'
                                        }
                                    </span>
                                    <div>
                                        <h3 className="font-black text-lg">
                                            {gradingResult.feedback
                                                ? (gradingResult.shouldRetry ? 'Almost There!' : 'Amazing Work!')
                                                : 'Answer Saved!'
                                            }
                                        </h3>
                                        <p className="text-white/80 text-xs font-medium">
                                            {gradingResult.feedback
                                                ? (gradingResult.shouldRetry ? 'You can do even better — give it another shot!' : 'You nailed it! Keep up the great work! 🌟')
                                                : 'Your response has been recorded'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 space-y-4 bg-white">
                                {/* Feedback */}
                                {gradingResult.feedback && (
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <span className="text-teal-600 font-bold text-xs uppercase tracking-wide block mb-2 flex items-center gap-1">
                                            💬 {currentQ?.allowAiFeedback ? 'Level Up Tip' : 'Level Up Tip'}
                                        </span>
                                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{gradingResult.feedback}</p>
                                    </div>
                                )}

                                {/* Retry encouragement */}
                                {gradingResult.shouldRetry && (
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-3 items-center">
                                        <span className="text-2xl">🔄</span>
                                        <div>
                                            <span className="text-amber-700 font-bold text-sm block">Don't give up!</span>
                                            <p className="text-amber-600 text-xs">Take another look and try again — you've got this!</p>
                                        </div>
                                    </div>
                                )}

                                {/* Pro Tip */}
                                {(gradingResult.tip || currentQ?.postAnswerTip) && (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-center">
                                        <span className="text-2xl">💡</span>
                                        <div>
                                            <span className="text-blue-700 font-bold text-sm block">PRO TIP?</span>
                                            <p className="text-blue-600 text-xs">{gradingResult.tip || currentQ?.postAnswerTip}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-3 pt-1">
                                    {gradingResult.shouldRetry && (
                                        <button
                                            onClick={handleRetry}
                                            className="flex-1 bg-amber-100 text-amber-700 py-3.5 rounded-xl font-bold hover:bg-amber-200 transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            🔄 Try Again
                                        </button>
                                    )}
                                    <button
                                        onClick={handleContinue}
                                        className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3.5 rounded-xl font-bold hover:from-teal-600 hover:to-emerald-600 transition-all text-sm shadow-md"
                                    >
                                        {getContinueLabel()}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            {!gradingResult && (
                <div className="fixed bottom-0 left-0 w-full bg-white border-t px-6 py-4 z-10">
                    <div className="max-w-4xl mx-auto flex gap-3">
                        {/* Submit button — only for answerable question types */}
                        {currentQ?.qType !== 'no_response' && (
                            <button
                                onClick={handleSubmit}
                                disabled={!hasAnswer(currentQuestionIdx) || isSubmitting}
                                className={`w-[70%] py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isSubmitting
                                    ? 'bg-teal-500 text-white cursor-wait'
                                    : hasAnswer(currentQuestionIdx)
                                        ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-md'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    '✅ Submit Answer'
                                )}
                            </button>
                        )}

                        {/* Always-visible Next button */}
                        <button
                            onClick={handleContinue}
                            className="w-[30%] py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-800 shadow-md"
                        >
                            {getContinueLabel()}
                        </button>
                    </div>
                </div>
            )}

            {/* Calculator */}
            {showCalculator && <SimpleCalculator onClose={() => setShowCalculator(false)} />}

            {/* AI Chat Modal */}
            <AIChatModal
                isOpen={showAgentChat}
                onClose={() => setShowAgentChat(false)}
                batchActivityId={activity._id}
                questionIndex={currentQuestionIdx}
            />

            {/* Bottom Action Bar */}
            <div className="fixed bottom-24 right-6 z-40 flex flex-col gap-3 items-end">
                {/* AI Companion Card */}
                {activity.showAgent && !showAgentChat && (
                    <button
                        onClick={() => setShowAgentChat(true)}
                        className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 transition-all group hover:scale-105"
                    >
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-teal-500 animate-pulse" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black text-white">AI Companion</p>
                            <p className="text-[10px] text-white/70 font-medium">Need help? Click here! ✨</p>
                        </div>
                    </button>
                )}

                {/* Calculator Button */}
                {activity.allowCalculator && (
                    <button
                        onClick={() => setShowCalculator(!showCalculator)}
                        className={`p-4 rounded-full shadow-xl hover:scale-110 transition-all ${showCalculator ? 'bg-teal-600 text-white' : 'bg-white text-teal-600 border-2 border-teal-200'
                            }`}
                    >
                        <CalcIcon size={24} />
                    </button>
                )}
            </div>
        </div>
    );
};

const StudentActivityPage = () => {
    const { batchId, sessionId, batchSessionId } = useParams();
    const effectiveSessionId = batchSessionId || sessionId;

    const [sections, setSections] = useState([]);
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(true);
    const [unauthorized, setUnauthorized] = useState(false);
    const [sessionInfo, setSessionInfo] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);

    useEffect(() => {
        fetchSessionData();
    }, [effectiveSessionId]);

    const fetchSessionData = async () => {
        setLoading(true);

        try {
            const [sectRes, respRes] = await Promise.all([
                listStudentBatchSections(effectiveSessionId),
                getMySessionResponses(effectiveSessionId)
            ]);

            if (!sectRes.success) {
                // Check for unauthorized
                if (sectRes.status === 401 || sectRes.message?.toLowerCase().includes('unauthorized') || sectRes.message?.toLowerCase().includes('not logged in') || sectRes.message?.toLowerCase().includes('token')) {
                    setUnauthorized(true);
                    return;
                }
                throw new Error("Failed to load sections");
            }

            const respMap = {};
            if (respRes.success && respRes.data?.responses) {
                respRes.data.responses.forEach(r => {
                    const id = normalizeId(r.batchActivity_obj_id);
                    if (id) {
                        respMap[id] = r;
                    }
                });
            }

            const sectionsWithActs = await Promise.all(
                (sectRes.data?.sections || []).map(async (sec) => {
                    const actRes = await listStudentBatchActivities(sec._id);
                    return {
                        ...sec,
                        activities: actRes.success ? (actRes.data?.activities || []) : []
                    };
                })
            );

            setResponses(respMap);
            setSections(sectionsWithActs);

            if (sectRes.data?.batchSession) {
                setSessionInfo({
                    title: sectRes.data.batchSession.title || '',
                    description: sectRes.data.batchSession.description || '',
                });
            }

        } catch (err) {
            console.error(err);
            // Also catch network-level 401s
            if (err?.response?.status === 401 || err?.status === 401) {
                setUnauthorized(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const allActivities = useMemo(() => sections.flatMap(s => s.activities), [sections]);

    const handleSelectActivity = (activity) => {
        setSelectedActivity(activity);
        window.scrollTo(0, 0);
    };

    const handleGoToMenu = () => {
        setSelectedActivity(null);
        window.scrollTo(0, 0);
    };

    const handleNextActivity = () => {
        if (!selectedActivity) return;

        // Find current section and activity index
        for (let si = 0; si < sections.length; si++) {
            const acts = sections[si].activities || [];
            const ai = acts.findIndex(a => a._id === selectedActivity._id);
            if (ai !== -1) {
                // Try next activity in same section
                if (ai < acts.length - 1) {
                    setSelectedActivity(acts[ai + 1]);
                    window.scrollTo(0, 0);
                    return;
                }
                // Try first activity in next section
                for (let nsi = si + 1; nsi < sections.length; nsi++) {
                    const nextActs = sections[nsi].activities || [];
                    if (nextActs.length > 0) {
                        setSelectedActivity(nextActs[0]);
                        window.scrollTo(0, 0);
                        return;
                    }
                }
                // No more activities — go back to menu
                handleGoToMenu();
                return;
            }
        }
    };

    const handleUpdateResponses = (activityId, data) => {
        const id = normalizeId(activityId);
        setResponses(prev => ({ ...prev, [id]: data }));
    };

    const navigate = useNavigate();

    if (unauthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4 text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <Lock size={28} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">You are not logged in</h2>
                    <p className="text-gray-500 text-sm max-w-sm">Please log in to access your session activities.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-2 px-8 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-all shadow-lg"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Loading session...</p>
                </div>
            </div>
        );
    }

    // Full-page QuestionView when an activity is selected
    if (selectedActivity) {
        return (
            <QuestionView
                activity={selectedActivity}
                section={sections.find(s => (s.activities || []).some(a => a._id === selectedActivity._id))}
                responses={responses}
                allActivities={allActivities}
                sections={sections}
                effectiveSessionId={effectiveSessionId}
                onBack={handleGoToMenu}
                onUpdateResponses={handleUpdateResponses}
                onNextActivity={handleNextActivity}
                onGoToMenu={handleGoToMenu}
            />
        );
    }

    // All sections + activity cards view
    return (
        <div className="min-h-screen bg-gray-50">
            <AllSectionsView
                sections={sections}
                responses={responses}
                sessionInfo={sessionInfo}
                onSelectActivity={handleSelectActivity}
                selectedActivityId={null}
            />
        </div>
    );
};

export default StudentActivityPage;