import React, { useState, useEffect, useMemo } from 'react';
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
    HelpCircle
} from 'lucide-react';
import {
    listStudentBatchSections, listStudentBatchActivities,
    getMySessionResponses, submitActivityResponse
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

const DummyAIAgent = ({ onClose, shiftLeft }) => {
    return (
        <div className={`fixed bottom-24 z-40 w-80 bg-white rounded-2xl shadow-2xl border overflow-hidden transition-all ${shiftLeft ? 'right-[290px]' : 'right-6'}`}>
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <MessageSquare size={20} />
                    <span className="font-bold">AI Tutor</span>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/20 rounded"><X size={16} /></button>
            </div>
            <div className="p-4 h-64 overflow-y-auto bg-gray-50">
                <div className="bg-white p-3 rounded-xl shadow-sm mb-3">
                    <p className="text-sm text-gray-600">👋 Hi! I'm your AI tutor. How can I help you with this question?</p>
                </div>
                <div className="text-center text-gray-400 text-xs mt-8">
                    <p>Ask me anything about the question!</p>
                </div>
            </div>
            <div className="p-3 border-t bg-white">
                <input type="text" placeholder="Type a message..." className="w-full p-2 border rounded-lg text-sm outline-none focus:border-purple-400" />
            </div>
        </div>
    );
};

// ──────────────────────────────────────────
//  Per-Question Media Carousel
// ──────────────────────────────────────────
const MediaCarousel = ({ mediaItems }) => {
    const [mediaIndex, setMediaIndex] = useState(0);
    if (!mediaItems || mediaItems.length === 0) return null;

    const hasMultiple = mediaItems.length > 1;
    const current = mediaItems[mediaIndex];

    const renderMedia = () => {
        if (!current?.url) return null;
        const isYouTube = current.url.includes('youtu');

        if (current.mediaType === 'image') {
            return <img src={current.url} className="w-full h-auto max-h-[400px] object-contain" alt="question media" />;
        }
        if (current.mediaType === 'video' && !isYouTube) {
            return <video src={current.url} controls className="w-full h-auto max-h-[400px]" />;
        }
        return (
            <div className="aspect-video w-full">
                <iframe src={current.url} className="w-full h-full border-0" title="embed" allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            </div>
        );
    };

    return (
        <div className="mb-6 relative">
            <div className="w-full rounded-2xl overflow-hidden border-4 border-gray-100 shadow-lg bg-black relative">
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
            {hasMultiple && (
                <div className="flex justify-center gap-2 mt-4">
                    {mediaItems.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setMediaIndex(i)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${i === mediaIndex ? 'bg-teal-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                        />
                    ))}
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
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="prose prose-lg max-w-none text-gray-800"
                    dangerouslySetInnerHTML={{ __html: qData.prompt || '<p>Question...</p>' }}
                />
            </div>

            <MediaCarousel mediaItems={mediaItems} />

            {qData.qType !== 'no_response' && (
                <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm">
                    <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-4">Write your answer here</h4>

                    {qData.qType === 'mcq' && (
                        <div className="grid gap-4">
                            {(qData.options || []).map((opt, i) => (
                                <button key={i} onClick={() => update(opt)} disabled={readOnly}
                                    className={`p-6 rounded-2xl border-4 font-bold text-lg text-left transition-all ${response === opt
                                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md'
                                        : 'bg-white border-gray-100 text-gray-500 hover:border-teal-200'
                                        }`}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}

                    {qData.qType === 'msq' && (
                        <div className="grid gap-4">
                            {(qData.options || []).map((opt, i) => {
                                const selected = Array.isArray(response) ? response.includes(opt) : false;
                                return (
                                    <button key={i} onClick={() => {
                                        if (readOnly) return;
                                        const current = Array.isArray(response) ? [...response] : [];
                                        const newSelection = selected ? current.filter(a => a !== opt) : [...current, opt];
                                        onInput(newSelection, qIndex);
                                    }} disabled={readOnly}
                                        className={`p-6 rounded-2xl border-4 font-bold text-lg text-left transition-all flex items-center gap-4 ${selected
                                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                                            : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200'
                                            }`}>
                                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
                                            }`}>
                                            {selected && <Check size={14} strokeWidth={3} />}
                                        </div>
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {qData.qType === 'fact_trick' && (
                        <div className="grid grid-cols-3 gap-4">
                            {(qData.options || ['Fact', 'Trick', 'Opinion']).slice(0, 3).map((opt, i) => {
                                const icons = [<Check size={32} />, <AlertTriangle size={32} />, <HelpCircle size={32} />];
                                const colors = ['bg-green-100 text-green-700', 'bg-red-100 text-red-700', 'bg-blue-100 text-blue-700'];
                                const isSelected = response === opt;
                                return (
                                    <button key={i} onClick={() => update(opt)} disabled={readOnly}
                                        className={`p-6 rounded-[2rem] border-4 flex flex-col items-center justify-center gap-4 transition-all h-48 ${isSelected
                                            ? 'border-teal-500 bg-white shadow-xl scale-105 z-10'
                                            : 'border-gray-100 bg-gray-50 hover:bg-white'
                                            }`}>
                                        <div className={`p-3 rounded-full ${colors[i % 3]}`}>{icons[i % 3]}</div>
                                        <span className="font-black text-sm text-center uppercase leading-tight text-gray-700">{opt || 'Option'}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {qData.qType === 'single_input' && (
                        <div className="space-y-3">
                            <label className="text-sm font-black text-teal-400 uppercase tracking-widest ml-2">{qData.inputLabel}</label>
                            <div className={`border-2 rounded-xl overflow-hidden bg-white transition-all ${readOnly ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-gray-200 focus-within:border-teal-400 focus-within:shadow-lg'
                                }`}>
                                <textarea
                                    className="w-full outline-none px-5 py-4 text-gray-800 text-lg leading-relaxed resize-none"
                                    placeholder={readOnly ? "NOT ANSWERED" : "Type your answer here..."}
                                    rows={Math.max(3, Math.ceil((qData.maxChars || 500) / 100))}
                                    maxLength={qData.maxChars || 500}
                                    value={response || ''}
                                    onChange={e => update(e.target.value)}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="text-right text-xs font-bold text-gray-300">{(response || '').length} / {qData.maxChars || 500}</div>
                        </div>
                    )}

                    {qData.qType === 'multi_input' && (
                        <div className="grid gap-8">
                            {(qData.multiFields || []).map((field, fIdx) => (
                                <div key={fIdx} className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2 flex justify-between">
                                        <span>{field.label || `Step ${fIdx + 1}`}</span>
                                        <span>{(response && response[fIdx]?.length) || 0} / {field.maxChars || 100}</span>
                                    </label>
                                    <div className={`border-2 rounded-xl overflow-hidden bg-white transition-all ${readOnly ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-gray-200 focus-within:border-teal-400 focus-within:shadow-lg'
                                        }`}>
                                        <textarea
                                            className="w-full outline-none px-5 py-4 text-gray-800 text-lg leading-relaxed resize-none"
                                            placeholder={readOnly ? "NOT ANSWERED" : "Type your answer here..."}
                                            maxLength={field.maxChars || 100}
                                            value={(response && response[fIdx]) || ''}
                                            onChange={e => update(e.target.value, fIdx)}
                                            disabled={readOnly}
                                        />
                                    </div>
                                </div>
                            ))}
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
//  Step 1: Section Cards
// ──────────────────────────────────────────

const SectionCardsView = ({ sections, responses, onSelectSection, sessionInfo }) => {
    const getSectionStatus = (section) => {
        const acts = section.activities || [];
        if (acts.length === 0) return { label: 'No activities', color: 'text-gray-400' };
        
        // Count how many activities have a grade score >= 5 using SAFE ID LOOKUP
const completed = acts.filter(a => {
    const id = normalizeId(a._id);
    const score = Number(responses[id]?.grade?.score || 0);
    return score >= 5;
}).length;

        
        if (completed === acts.length) return { label: 'Completed', color: 'text-emerald-600' };
        if (completed > 0) return { label: 'In Progress', color: 'text-amber-600' };
        return { label: 'Tap to start', color: 'text-teal-600' };
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="max-w-5xl mx-auto w-full px-6 pt-10 pb-4">
                {sessionInfo?.title ? (
                    <>
                        <h1 className="text-2xl font-black text-gray-900">{sessionInfo.title}</h1>
                        {sessionInfo.description && (
                            <p className="text-sm text-gray-500 mt-1">{sessionInfo.description}</p>
                        )}
                        <p className="text-xs text-teal-600 font-bold mt-2 uppercase tracking-wider">Select a section to begin working</p>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-black text-gray-900">Session Activities</h1>
                        <p className="text-sm text-gray-500 mt-1">Select a section to begin working</p>
                    </>
                )}
            </div>
            <div className="max-w-5xl mx-auto w-full px-6 pb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sections.map((section, idx) => {
                        const status = getSectionStatus(section);
                        const acts = section.activities || [];
                        const completed = acts.filter(a => {
                            const id = normalizeId(a._id);
                            const r = responses[id];
                          const score = Number(responses[id]?.grade?.score || 0);
return score >= 5;

                        }).length;
                        
                        return (
                            <div
                                key={section._id}
                                onClick={() => onSelectSection(section)}
                                className="bg-white rounded-2xl p-6 border border-gray-100 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg mb-4">
                                    {idx + 1}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{section.sectionName}</h3>
                                <p className={`text-sm ${status.color}`}>{status.label}</p>
                                {acts.length > 0 && (
                                    <div className="mt-4">
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div
                                                className="bg-gradient-to-r from-teal-400 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                                                style={{ width: `${(completed / acts.length) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1.5">{completed}/{acts.length} activities</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────
//  Step 2: Activity List within Section
// ──────────────────────────────────────────

const ActivityListView = ({ section, responses, allActivities, onSelectActivity, onBack, sections, onMoveToNextSection }) => {
    const acts = section.activities || [];
    
    // SAFE COMPLETED COUNT
const completedCount = acts.filter(a => {
    const id = normalizeId(a._id);
    const score = Number(responses[id]?.grade?.score || 0);
    return score >= 5;
}).length;


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="max-w-2xl mx-auto w-full px-6 pt-8 pb-12">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium mb-6 transition">
                    <ChevronLeft size={18} /> Back to Sections
                </button>

                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100 text-center mb-6">
                    <span className="text-xs font-bold text-teal-600 bg-teal-100 px-3 py-1 rounded-full uppercase tracking-wider">
                        Section {(section.order ?? 0) + 1}
                    </span>
                    <h2 className="text-2xl font-black text-gray-900 mt-3 uppercase">{section.sectionName}</h2>
                    <p className="text-sm text-gray-500 mt-1">Complete the activities below</p>
                </div>

                <div className="space-y-3">
                    {acts.map((act, idx) => {
                        const id = normalizeId(act._id);
                        const resp = responses[id];
                  const passed = Number(resp?.grade?.score || 0) >= 5;


                        return (
                            <div
                                key={act._id}
                                onClick={() => onSelectActivity(act)}
                                className={`bg-white rounded-xl p-4 border flex items-center gap-4 transition-all cursor-pointer hover:shadow-md hover:border-teal-200 border-gray-100`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${passed ? 'bg-teal-500 text-white' : 'bg-teal-50 text-teal-600'
                                    }`}>
                                    {passed ? <CheckCircle size={20} /> : <Play size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-gray-400 uppercase font-bold flex items-center gap-2">
                                        Activity {idx + 1}
                                    </div>
                                    <h4 className="font-bold text-gray-900 truncate">{act.title}</h4>
                                </div>
                                {!passed && <ArrowRight size={18} className="text-gray-300 flex-shrink-0" />}
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-100 mt-6">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900">Progress</h4>
                        <span className="text-sm text-gray-400">{completedCount} / {acts.length} completed</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full transition-all duration-700 ${acts.length > 0 && completedCount === acts.length
                                    ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                                    : 'bg-gradient-to-r from-teal-400 to-emerald-500'
                                    }`}
                                style={{ width: `${acts.length > 0 ? (completedCount / acts.length) * 100 : 0}%` }}
                            />
                        </div>
                        {acts.length > 0 && completedCount === acts.length && (() => {
                            const currentIdx = sections?.findIndex(s => s._id === section._id);
                            const hasNext = currentIdx !== -1 && currentIdx < (sections?.length || 0) - 1;
                            return hasNext ? (
                                <button
                                    onClick={() => onMoveToNextSection && onMoveToNextSection(sections[currentIdx + 1])}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm font-bold whitespace-nowrap shadow-md"
                                >
                                    Next Section <ArrowRight size={14} />
                                </button>
                            ) : (
                                <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold whitespace-nowrap">
                                    <CheckCircle size={14} /> All Done!
                                </span>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────
//  Step 3: Question View
// ──────────────────────────────────────────

const QuestionView = ({
    activity, section, responses, allActivities, sections,
    effectiveSessionId, onBack, onUpdateResponses
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
        }
    };

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

    const handleContinue = () => {
        setGradingResult(null); 
        if (currentQuestionIdx < totalQ - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
        } else {
            onBack();
        }
    };

    const handleRetry = () => {
        setGradingResult(null);
    };

    // Reading type
    if (activity.type === 'reading') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-6">
                    <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-3 transition">
                        <ChevronLeft size={18} /> Back
                    </button>
                    <span className="text-xs font-bold text-white/70 bg-white/20 px-3 py-1 rounded-full">📖 reading</span>
                    <h1 className="text-2xl font-black text-white mt-2">{activity.title}</h1>
                </div>
                <div className="max-w-2xl mx-auto w-full px-6 py-8">
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                        <p className="text-gray-600 mb-6">Read the following material:</p>
                        <a href={activity.readingData?.link} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition">
                            Open Resource <ExternalLink size={16} />
                        </a>
                    </div>
                    <div className="mt-6 text-center">
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
                            Mark as Completed
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Practice type
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-teal-400 px-6 py-5">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition">
                        <ChevronLeft size={18} /> Back to Mission
                    </button>
                    {previousBest && (
                        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-white text-xs">
                             <CheckCircle size={12} />
                             <span>Best: {previousBest.score}/10</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded">🧩 {activity.type || 'Activity'}</span>
                </div>
                <h1 className="text-xl font-bold text-white">{activity.title}</h1>
            </div>

            {/* Navigation */}
            <div className="bg-white border-b px-6 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => currentQuestionIdx > 0 && setCurrentQuestionIdx(currentQuestionIdx - 1)}
                            disabled={currentQuestionIdx === 0}
                            className={`p-2 rounded-lg transition-all ${currentQuestionIdx > 0 ? 'bg-teal-100 text-teal-600 hover:bg-teal-200' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-gray-600 font-medium">Question {currentQuestionIdx + 1} of {totalQ}</span>
                        <button
                            onClick={() => {
                                if (currentQuestionIdx < totalQ - 1) {
                                    setCurrentQuestionIdx(currentQuestionIdx + 1);
                                }
                            }}
                            disabled={currentQuestionIdx >= totalQ - 1}
                            className={`p-2 rounded-lg transition-all ${currentQuestionIdx < totalQ - 1
                                ? 'bg-teal-100 text-teal-600 hover:bg-teal-200'
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <div className="flex gap-1">
                        {questions.map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full transition-all ${i === currentQuestionIdx ? 'bg-teal-500' : hasAnswer(i) ? 'bg-teal-200' : 'bg-gray-200'
                                }`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto w-full px-6 mt-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 font-bold">{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-36">
                <div className="max-w-2xl mx-auto">
                    {currentQ && (
                        <QuestionBlock
                            qData={currentQ}
                            qIndex={currentQuestionIdx}
                            response={answers[currentQuestionIdx]}
                            onInput={handleInput}
                            readOnly={isSubmitting} 
                        />
                    )}

                    {/* Inline Grading Result */}
                    {gradingResult && (
                        <div className="mt-6 bg-white rounded-2xl border-2 border-gray-100 shadow-lg overflow-hidden animate-[fadeIn_0.3s_ease-out]">
                            <div className={`p-5 flex items-center justify-between ${currentQ?.showGrade === false
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                                : gradingResult.score >= 5
                                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                                    : 'bg-gradient-to-r from-red-500 to-orange-500'
                                }`}>
                                <div className="flex items-center gap-3 text-white">
                                    <div className="p-2 bg-white/20 rounded-xl"><GraduationCap size={22} /></div>
                                    <div>
                                        <h3 className="font-bold text-base">{currentQ?.showGrade === false ? 'AI Feedback' : 'AI Evaluation'}</h3>
                                        <p className="text-white/70 text-xs">Analysis Complete</p>
                                    </div>
                                </div>
                                {currentQ?.showGrade !== false && (
                                    <div className="text-right text-white">
                                        <span className="text-3xl font-black">{gradingResult.score}</span>
                                        <span className="text-white/60 text-lg">/10</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <span className="text-teal-500 font-bold text-xs uppercase tracking-wide block mb-1">AI Feedback</span>
                                    <p className="text-gray-700 italic">"{gradingResult.feedback}"</p>
                                </div>
                                {(gradingResult.tip || currentQ?.postAnswerTip) && (
                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3">
                                        <div className="p-2 bg-yellow-400 text-white rounded-lg h-fit">💡</div>
                                        <div>
                                            <span className="text-yellow-600 font-bold text-xs uppercase block mb-1">Pro Tip</span>
                                            <p className="text-yellow-800 text-sm">{gradingResult.tip || currentQ?.postAnswerTip}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    {gradingResult.score < 5 && currentQ?.showGrade !== false && (
                                        <button
                                            onClick={handleRetry}
                                            className="flex-1 bg-red-100 text-red-600 py-3 rounded-xl font-bold hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <RotateCcw size={18} /> Retry
                                        </button>
                                    )}
                                    <button
                                        onClick={handleContinue}
                                        className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
                                    >
                                        {currentQuestionIdx < totalQ - 1 ? 'Next Question →' : 'Back to Menu'}
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
                    <div className="max-w-2xl mx-auto">
                        {currentQ?.qType === 'no_response' ? (
                            <button
                                onClick={handleContinue}
                                className="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 bg-teal-500 text-white hover:bg-teal-600 shadow-lg"
                            >
                                {currentQuestionIdx < totalQ - 1 ? 'Next Question →' : 'Complete Activity ✓'}
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!hasAnswer(currentQuestionIdx) || isSubmitting}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${isSubmitting
                                    ? 'bg-teal-500 text-white cursor-wait'
                                    : hasAnswer(currentQuestionIdx)
                                        ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    'Submit Answer'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Calculator & Agent */}
            {showCalculator && <SimpleCalculator onClose={() => setShowCalculator(false)} />}
            {activity.showAgent && showAgentChat && (
                <DummyAIAgent
                    onClose={() => setShowAgentChat(false)}
                    shiftLeft={activity.allowCalculator && showCalculator}
                />
            )}

            <div className="fixed bottom-24 right-6 z-40 flex gap-3">
                {activity.showAgent && (
                    <button
                        onClick={() => setShowAgentChat(!showAgentChat)}
                        className={`p-4 rounded-full shadow-xl hover:scale-110 transition-all ${showAgentChat ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border-2 border-purple-200'
                            }`}
                    >
                        <MessageSquare size={24} />
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
};

// ──────────────────────────────────────────
//  Main Container
// ──────────────────────────────────────────

const StudentActivityPage = () => {
    const { batchId, sessionId, batchSessionId } = useParams();
    const effectiveSessionId = batchSessionId || sessionId;

    const [sections, setSections] = useState([]);
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(true);
    const [sessionInfo, setSessionInfo] = useState(null);

    const [step, setStep] = useState('sections');
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);

    useEffect(() => {
        fetchSessionData();
    }, [effectiveSessionId]);

const fetchSessionData = async () => {
    setLoading(true);

    try {
        // 1️⃣ Fetch sections + responses in parallel
        const [sectRes, respRes] = await Promise.all([
            listStudentBatchSections(effectiveSessionId),
            getMySessionResponses(effectiveSessionId)
        ]);

        if (!sectRes.success) throw new Error("Failed to load sections");

        // 2️⃣ Build response map FIRST
        const respMap = {};
        if (respRes.success && respRes.data?.responses) {
            respRes.data.responses.forEach(r => {
                const id = normalizeId(r.batchActivity_obj_id);
                if (id) {
                    respMap[id] = r;
                }
            });
        }

        // 3️⃣ Fetch activities for all sections in parallel
        const sectionsWithActs = await Promise.all(
            (sectRes.data?.sections || []).map(async (sec) => {
                const actRes = await listStudentBatchActivities(sec._id);
                return {
                    ...sec,
                    activities: actRes.success ? (actRes.data?.activities || []) : []
                };
            })
        );

        // 4️⃣ IMPORTANT: Set responses FIRST, then sections
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
    } finally {
        setLoading(false);
    }
};


    const allActivities = useMemo(() => sections.flatMap(s => s.activities), [sections]);

    const handleSelectSection = (section) => {
        setSelectedSection(section);
        setStep('activities');
    };

    const handleSelectActivity = (activity) => {
        setSelectedActivity(activity);
        setStep('question');
    };

    const handleBackToSections = () => {
        setSelectedSection(null);
        setStep('sections');
    };

    const handleBackToActivities = () => {
        setSelectedActivity(null);
        setStep('activities');
    };

    const handleUpdateResponses = (activityId, data) => {
        const id = normalizeId(activityId);
        setResponses(prev => ({ ...prev, [id]: data }));
    };

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

    if (step === 'question' && selectedActivity) {
        return (
            <QuestionView
                activity={selectedActivity}
                section={selectedSection}
                responses={responses}
                allActivities={allActivities}
                sections={sections}
                effectiveSessionId={effectiveSessionId}
                onBack={handleBackToActivities}
                onUpdateResponses={handleUpdateResponses}
            />
        );
    }

    if (step === 'activities' && selectedSection) {
        return (
            <ActivityListView
                section={selectedSection}
                responses={responses}
                allActivities={allActivities}
                onSelectActivity={handleSelectActivity}
                onBack={handleBackToSections}
                sections={sections}
                onMoveToNextSection={(nextSection) => {
                    setSelectedSection(nextSection);
                }}
            />
        );
    }

    return (
        <SectionCardsView
            sections={sections}
            responses={responses}
            onSelectSection={handleSelectSection}
            sessionInfo={sessionInfo}
        />
    );
};

export default StudentActivityPage;