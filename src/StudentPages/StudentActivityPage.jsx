import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import ListItem from '@tiptap/extension-list-item';
import {
    ArrowLeft, ArrowRight, CheckCircle, Lock, Play, RotateCcw,
    Calculator as CalcIcon, MessageSquare, X, GraduationCap,
    ChevronLeft, ChevronRight, ExternalLink, Check, AlertTriangle,
    HelpCircle, Image as ImageIcon, Video, Monitor
} from 'lucide-react';
import {
    listStudentBatchSections, listStudentBatchActivities,
    getMySessionResponses, submitActivityResponse
} from "../api.js";

// ──────────────────────────────────────────
//  Utility Components
// ──────────────────────────────────────────

const ReadOnlyEditor = ({ content }) => {
    const editor = useEditor({
        extensions: [StarterKit, TextStyle, Color, ListItem],
        content: content || '',
        editable: false,
        editorProps: {
            attributes: { class: 'prose prose-lg max-w-none text-gray-800 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:my-1' },
        },
    });
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '');
        }
    }, [content, editor]);
    return <EditorContent editor={editor} />;
};

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
//  Per-Question Media Carousel (Exact Port)
// ──────────────────────────────────────────

const MediaCarousel = ({ mediaItems }) => {
    const [mediaIndex, setMediaIndex] = useState(0);
    if (!mediaItems || mediaItems.length === 0) return null;

    const hasMultiple = mediaItems.length > 1;
    const current = mediaItems[mediaIndex];

    const renderMedia = () => {
        if (!current?.url) return null;

        // YouTube detection
        const isYouTube = current.url.includes('youtu');

        if (current.mediaType === 'image') {
            return <img src={current.url} className="w-full h-auto max-h-[400px] object-contain" alt="question media" />;
        }
        if (current.mediaType === 'video' && !isYouTube) {
            return <video src={current.url} controls className="w-full h-auto max-h-[400px]" />;
        }
        // embed, youtube, or anything else → iframe
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

                {/* Navigation Arrows */}
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

            {/* Dot Indicators */}
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
//  Question Block Renderer (Faithful Prototype Port)
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
            {/* Question Prompt */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="prose prose-lg max-w-none text-gray-800 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:my-1"
                    dangerouslySetInnerHTML={{ __html: qData.prompt || '<p>Question...</p>' }}
                />
            </div>

            {/* Per-Question Media Carousel */}
            <MediaCarousel mediaItems={mediaItems} />

            {/* Answer Section */}
            <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm">
                <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-4">Write your answer here</h4>

                {/* MCQ - Single correct */}
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

                {/* MSQ - Multiple correct with checkboxes */}
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
                        <p className="text-center text-xs font-bold text-blue-400 uppercase tracking-widest mt-2">Select all that apply</p>
                    </div>
                )}

                {/* Fact / Trick / Opinion */}
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

                {/* Single Input */}
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
                                style={{ minHeight: (qData.maxChars || 500) <= 100 ? '80px' : `${80 + Math.ceil(((qData.maxChars || 500) - 100) / 100) * 40}px` }}
                            />
                        </div>
                        <div className="text-right text-xs font-bold text-gray-300">{(response || '').length} / {qData.maxChars || 500}</div>
                    </div>
                )}

                {/* Multi-Step Input */}
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
                                        style={{ minHeight: (field.maxChars || 100) <= 100 ? '80px' : `${80 + Math.ceil(((field.maxChars || 100) - 100) / 100) * 40}px` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Fill in the Blanks — exact prototype regex */}
                {qData.qType === 'fill_blanks' && (
                    <div className="leading-[3.5rem] text-xl text-gray-700 font-medium">
                        {(qData.fillBlankText || '').split(/(\[\$.*?\])/).map((part, i, arr) => {
                            if (part.startsWith('[$')) {
                                const max = part.match(/\d+/)?.[0] || '10';
                                const idx = arr.slice(0, i).filter(p => p.startsWith('[$')).length;
                                const val = response ? response[idx] : '';
                                return (
                                    <input
                                        key={i}
                                        maxLength={parseInt(max, 10)}
                                        disabled={readOnly}
                                        value={val || ''}
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
        </div>
    );
};

// ──────────────────────────────────────────
//  Step 1: Section Cards
// ──────────────────────────────────────────

const SectionCardsView = ({ sections, responses, onSelectSection }) => {
    const getSectionStatus = (section) => {
        const acts = section.activities || [];
        if (acts.length === 0) return { label: 'No activities', color: 'text-gray-400' };
        const completed = acts.filter(a => responses[a._id]?.grade?.score >= 5).length;
        if (completed === acts.length) return { label: 'Completed', color: 'text-emerald-600' };
        if (completed > 0) return { label: 'In Progress', color: 'text-amber-600' };
        return { label: 'Tap to start', color: 'text-gray-400' };
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="max-w-5xl mx-auto w-full px-6 pt-10 pb-4">
                <h1 className="text-2xl font-black text-gray-900">Session Activities</h1>
                <p className="text-sm text-gray-500 mt-1">Select a section to begin working</p>
            </div>
            <div className="max-w-5xl mx-auto w-full px-6 pb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sections.map((section, idx) => {
                        const status = getSectionStatus(section);
                        const acts = section.activities || [];
                        const completed = acts.filter(a => responses[a._id]?.grade?.score >= 5).length;
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

const ActivityListView = ({ section, responses, allActivities, onSelectActivity, onBack }) => {
    const acts = section.activities || [];
    const completedCount = acts.filter(a => responses[a._id]?.grade?.score >= 5).length;

    const isLocked = (act) => {
        const idx = allActivities.findIndex(a => a._id === act._id);
        if (idx <= 0) return false;
        const prevAct = allActivities[idx - 1];
        const prevResp = responses[prevAct._id];
        return !prevResp || (prevResp.grade?.score || 0) < 5;
    };

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
                    <p className="text-sm text-gray-500 mt-1">Complete all activities below to finish this mission</p>
                </div>

                <div className="space-y-3">
                    {acts.map((act, idx) => {
                        const locked = isLocked(act);
                        const resp = responses[act._id];
                        const passed = resp && resp.grade?.score >= 5;

                        return (
                            <div
                                key={act._id}
                                onClick={() => !locked && onSelectActivity(act)}
                                className={`bg-white rounded-xl p-4 border flex items-center gap-4 transition-all ${locked
                                    ? 'border-gray-100 opacity-50 cursor-not-allowed'
                                    : 'border-gray-100 cursor-pointer hover:shadow-md hover:border-teal-200'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${passed ? 'bg-teal-500 text-white'
                                    : locked ? 'bg-gray-100 text-gray-400'
                                        : 'bg-teal-50 text-teal-600'
                                    }`}>
                                    {passed ? <CheckCircle size={20} /> : locked ? <Lock size={16} /> : <Play size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-gray-400 uppercase font-bold flex items-center gap-2">
                                        Activity {idx + 1}
                                        {!locked && !passed && <span className="bg-pink-500 text-white px-2 py-0.5 rounded text-[8px]">NEXT</span>}
                                    </div>
                                    <h4 className="font-bold text-gray-900 truncate">{act.title}</h4>
                                </div>
                                {!locked && !passed && <ArrowRight size={18} className="text-gray-300 flex-shrink-0" />}
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-100 mt-6">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900">Progress</h4>
                        <span className="text-sm text-gray-400">{completedCount} / {acts.length} completed</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                            className="bg-gradient-to-r from-teal-400 to-emerald-500 h-2.5 rounded-full transition-all duration-700"
                            style={{ width: `${acts.length > 0 ? (completedCount / acts.length) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────
//  Step 3: Question View (Full Prototype Port)
// ──────────────────────────────────────────

const QuestionView = ({
    activity, section, responses, allActivities, sections,
    effectiveSessionId, onBack, onUpdateResponses
}) => {
    const navigate = useNavigate();
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showCalculator, setShowCalculator] = useState(false);
    const [gradingResult, setGradingResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAI, setShowAI] = useState(false);

    const questions = activity.practiceData?.questions || [];
    const totalQ = questions.length;
    const currentQ = questions[currentQuestionIdx];
    const progress = totalQ > 0 ? ((currentQuestionIdx + 1) / totalQ) * 100 : 0;

    const handleInput = (val, qIdx) => {
        if (typeof qIdx === 'number') {
            setAnswers(prev => ({
                ...prev,
                [qIdx]: val
            }));
        }
    };

    const hasAnswer = (idx) => {
        const ans = answers[idx];
        if (!ans) return false;
        if (Array.isArray(ans)) return ans.some(v => !!v);
        if (typeof ans === 'object') return Object.values(ans).some(v => !!v);
        return !!ans;
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const responseData = questions.map((q, idx) => answers[idx] ?? null);
            const res = await submitActivityResponse({
                batchActivity_obj_id: activity._id,
                batchSession_obj_id: effectiveSessionId,
                responses: responseData,
                questionIndex: currentQuestionIdx
            });
            if (res.success) {
                const grade = res.data?.grade;
                setGradingResult(grade);
                setShowAI(true);
                onUpdateResponses(activity._id, { grade });
            } else {
                alert("Submission failed: " + res.message);
            }
        } catch (err) {
            console.error(err);
            setGradingResult({ score: 0, feedback: "Error submitting.", tip: "Please try again." });
            setShowAI(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContinue = () => {
        setShowAI(false);
        setGradingResult(null);
        if (currentQuestionIdx < totalQ - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
        } else {
            // All questions done → back to activity list
            onBack();
        }
    };

    const handleRetry = () => {
        setShowAI(false);
        setGradingResult(null);
        // Keep current question, let them re-answer
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
                                        onUpdateResponses(activity._id, { grade: { score: 10 } });
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
            {/* Teal Header */}
            <div className="bg-gradient-to-r from-teal-500 to-teal-400 px-6 py-5">
                <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-2 transition">
                    <ChevronLeft size={18} /> Back to Mission
                </button>
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded">🧩 {activity.type || 'Activity'}</span>
                </div>
                <h1 className="text-xl font-bold text-white">{activity.title}</h1>
            </div>

            {/* Question Navigation */}
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
                                if (hasAnswer(currentQuestionIdx) && currentQuestionIdx < totalQ - 1) {
                                    setCurrentQuestionIdx(currentQuestionIdx + 1);
                                }
                            }}
                            disabled={!hasAnswer(currentQuestionIdx) || currentQuestionIdx >= totalQ - 1}
                            className={`p-2 rounded-lg transition-all ${hasAnswer(currentQuestionIdx) && currentQuestionIdx < totalQ - 1
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


                </div>
            </div>

            {/* Footer: Submit / Next */}
            {!showAI && !isSubmitting && (
                <div className="fixed bottom-0 left-0 w-full bg-white border-t px-6 py-4 z-10">
                    <div className="max-w-2xl mx-auto">
                        <button
                            onClick={handleSubmit}
                            disabled={!hasAnswer(currentQuestionIdx)}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${hasAnswer(currentQuestionIdx)
                                ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Submit Answer
                        </button>
                    </div>
                </div>
            )}

            {/* Grading Spinner */}
            {isSubmitting && (
                <div className="fixed bottom-0 left-0 w-full bg-white border-t px-6 py-4 z-10">
                    <div className="max-w-2xl mx-auto flex items-center justify-center gap-4 py-4">
                        <div className="w-6 h-6 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
                        <span className="font-bold text-gray-600">AI is grading your answer...</span>
                    </div>
                </div>
            )}

            {/* Calculator */}
            {showCalculator && <SimpleCalculator onClose={() => setShowCalculator(false)} />}

            {/* Floating Tool Buttons */}
            <div className="fixed bottom-24 right-6 z-40 flex gap-3">
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

            {/* AI Grading Modal (Exact Prototype Style) */}
            {showAI && gradingResult && (
                <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-500 to-teal-400 p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl"><GraduationCap size={24} /></div>
                                <div>
                                    <h3 className="font-bold text-lg">AI Evaluation</h3>
                                    <p className="text-teal-100 text-xs">Analysis Complete</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black">{gradingResult.score}</span>
                                <span className="text-teal-200 text-lg">/10</span>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
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

                            {gradingResult.score < 5 ? (
                                <button
                                    onClick={handleRetry}
                                    className="w-full bg-red-500 text-white py-4 rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={20} /> Try Again
                                </button>
                            ) : (
                                <button
                                    onClick={handleContinue}
                                    className="w-full bg-teal-500 text-white py-4 rounded-xl font-bold hover:bg-teal-600 transition-all"
                                >
                                    {currentQuestionIdx < totalQ - 1 ? 'Next Question →' : 'Complete Activity ✓'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ──────────────────────────────────────────
//  Main Container with 3-Step Flow
// ──────────────────────────────────────────

const StudentActivityPage = () => {
    const { batchId, sessionId, batchSessionId } = useParams();
    const effectiveSessionId = batchSessionId || sessionId;
    const navigate = useNavigate();

    const [sections, setSections] = useState([]);
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(true);

    const [step, setStep] = useState('sections');
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);

    useEffect(() => {
        fetchSessionData();
    }, [effectiveSessionId]);

    const fetchSessionData = async () => {
        setLoading(true);
        try {
            const sectRes = await listStudentBatchSections(effectiveSessionId);
            if (!sectRes.success) throw new Error("Failed to load sections");

            const respRes = await getMySessionResponses(effectiveSessionId);
            const respMap = {};
            if (respRes.success && respRes.data?.responses) {
                respRes.data.responses.forEach(r => {
                    const actId = r.batchActivity_obj_id?._id || r.batchActivity_obj_id;
                    respMap[actId] = r;
                });
            }
            setResponses(respMap);

            const sectionsWithActs = await Promise.all((sectRes.data?.sections || []).map(async (sec) => {
                const actRes = await listStudentBatchActivities(sec._id);
                return {
                    ...sec,
                    activities: actRes.success ? (actRes.data?.activities || []) : []
                };
            }));
            setSections(sectionsWithActs);
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
        setResponses(prev => ({ ...prev, [activityId]: data }));
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
            />
        );
    }

    return (
        <SectionCardsView
            sections={sections}
            responses={responses}
            onSelectSection={handleSelectSection}
        />
    );
};

export default StudentActivityPage;
