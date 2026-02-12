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
    ChevronLeft, ChevronRight, ExternalLink
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
            attributes: { class: 'prose prose-lg max-w-none text-gray-800' },
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
        <div className="fixed bottom-24 right-6 bg-gray-900 p-4 rounded-2xl shadow-2xl w-64 border border-gray-700 z-50">
            <div className="flex justify-between mb-2">
                <span className="text-white text-xs font-bold">Calculator</span>
                <button onClick={onClose}><X size={14} className="text-gray-400" /></button>
            </div>
            <div className="bg-gray-100 p-2 rounded mb-2 text-right font-mono text-xl overflow-hidden h-10 flex items-center justify-end">{input || '0'}</div>
            <div className="grid grid-cols-4 gap-1">
                {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C'].map(btn => (
                    <button key={btn}
                        onClick={() => btn === '=' ? calculate() : btn === 'C' ? setInput('') : handleClick(btn)}
                        className={`p-2 rounded font-bold text-sm ${btn === '=' ? 'bg-teal-600 text-white col-span-2' : btn === 'C' ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    >{btn}</button>
                ))}
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
                {/* Back button */}
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium mb-6 transition">
                    <ChevronLeft size={18} /> Back to Sections
                </button>

                {/* Section Header */}
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100 text-center mb-6">
                    <span className="text-xs font-bold text-teal-600 bg-teal-100 px-3 py-1 rounded-full uppercase tracking-wider">
                        Section {(section.order ?? 0) + 1}
                    </span>
                    <h2 className="text-2xl font-black text-gray-900 mt-3 uppercase">{section.sectionName}</h2>
                    <p className="text-sm text-gray-500 mt-1">Complete all activities below to finish this mission</p>
                </div>

                {/* Activity List */}
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
                                    <div className="text-xs text-gray-400 uppercase font-bold">Activity {idx + 1}</div>
                                    <h4 className="font-bold text-gray-900 truncate">{act.title}</h4>
                                </div>
                                {!locked && !passed && <ArrowRight size={18} className="text-gray-300 flex-shrink-0" />}
                            </div>
                        );
                    })}
                </div>

                {/* Progress */}
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
    const [gradingResult, setGradingResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const questions = activity.practiceData?.questions || [];
    const totalQ = questions.length;
    const currentQ = questions[currentQuestionIdx];
    const progress = totalQ > 0 ? ((currentQuestionIdx + 1) / totalQ) * 100 : 0;

    const handleAnswerChange = (val) => {
        setAnswers(prev => ({ ...prev, [currentQuestionIdx]: val }));
    };

    const checkAnswerFormat = (q, ans) => {
        if (!q) return false;
        if (q.qType === 'mcq' || q.qType === 'single_input' || q.qType === 'fact_trick') return !!ans;
        if (q.qType === 'msq') return ans && ans.length > 0;
        if (q.qType === 'fill_blanks') {
            if (Array.isArray(ans)) return ans.some(v => !!v);
            return !!ans;
        }
        if (q.qType === 'multi_input') {
            if (typeof ans === 'object' && !Array.isArray(ans)) return Object.values(ans).some(v => !!v);
            return !!ans;
        }
        return false;
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
                setGradingResult(res.data?.grade);
                onUpdateResponses(activity._id, { grade: res.data?.grade });
            } else {
                alert("Submission failed: " + res.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error submitting.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        setGradingResult(null);
        setCurrentQuestionIdx(0);
        setAnswers({});
    };

    const handleNextActivity = () => {
        const idx = allActivities.findIndex(a => a._id === activity._id);
        if (idx < allActivities.length - 1) {
            // Go back to activity list, the parent will handle selection
            onBack();
        } else {
            alert("All activities completed!");
            navigate(-1);
        }
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
                                        handleNextActivity();
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
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-5">
                <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-2 transition">
                    <ChevronLeft size={18} /> Back
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white/70 bg-white/20 px-3 py-1 rounded-full">🎯 practice</span>
                    {activity.allowCalculator && (
                        <button onClick={() => setShowCalculator(!showCalculator)}
                            className="text-xs font-bold text-white/70 bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition flex items-center gap-1">
                            <CalcIcon size={12} /> Calculator
                        </button>
                    )}
                </div>
                <h1 className="text-xl font-black text-white mt-2">{activity.title}</h1>
            </div>

            {/* Question Navigation */}
            <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
                <button
                    onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
                    disabled={currentQuestionIdx === 0}
                    className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 transition text-gray-500"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold text-gray-700">Question {currentQuestionIdx + 1} of {totalQ}</span>
                <button
                    onClick={() => setCurrentQuestionIdx(Math.min(totalQ - 1, currentQuestionIdx + 1))}
                    disabled={currentQuestionIdx === totalQ - 1}
                    className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 transition text-teal-600"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Question Dots */}
            <div className="bg-white pb-3 px-6 flex items-center justify-center gap-1.5">
                {questions.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentQuestionIdx(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentQuestionIdx ? 'bg-teal-500 scale-125'
                                : answers[idx] !== undefined ? 'bg-teal-200' : 'bg-gray-200'
                            }`}
                    />
                ))}
            </div>

            {/* Question Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-36">
                <div className="max-w-2xl mx-auto">
                    {currentQ && (
                        <div className="space-y-6">
                            {/* Question Card */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-base font-bold text-gray-900 mb-3">
                                    Activity {allActivities.findIndex(a => a._id === activity._id) + 1}: {activity.title}
                                </h3>
                                <div className="text-gray-700 leading-relaxed">
                                    <ReadOnlyEditor content={currentQ.prompt} />
                                </div>

                                {/* Media */}
                                {currentQ.media && currentQ.media.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                        {currentQ.media.map((m, mIdx) => (
                                            <div key={mIdx} className="rounded-xl overflow-hidden bg-gray-100">
                                                {m.mediaType === 'image' && m.url && (
                                                    <img src={m.url} alt="Question media" className="w-full h-auto max-h-80 object-contain" />
                                                )}
                                                {m.mediaType === 'video' && m.url && (
                                                    <video src={m.url} controls className="w-full max-h-80" />
                                                )}
                                                {m.mediaType === 'embed' && m.url && (
                                                    <iframe src={m.url} className="w-full h-72 border-0" allowFullScreen title={`embed-${mIdx}`} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* YouTube Embed (activity level) */}
                                {activity.youtubeEmbedUrl && currentQuestionIdx === 0 && (
                                    <div className="mt-4 rounded-xl overflow-hidden">
                                        <iframe
                                            src={activity.youtubeEmbedUrl}
                                            className="w-full h-72 border-0"
                                            allowFullScreen
                                            title="YouTube video"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Playground Link */}
                            {activity.playgroundUrl && currentQuestionIdx === 0 && (
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
                                    <h4 className="text-xs font-bold text-indigo-600 uppercase mb-2">🔗 Playground</h4>
                                    <iframe
                                        src={activity.playgroundUrl}
                                        className="w-full h-64 rounded-xl border border-indigo-200"
                                        title="Playground"
                                    />
                                    <a href={activity.playgroundUrl} target="_blank" rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium mt-2 hover:underline">
                                        Open in new tab <ExternalLink size={14} />
                                    </a>
                                </div>
                            )}

                            {/* Answer Section */}
                            <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm">
                                <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-4">Write your ans here</h4>

                                {/* MCQ */}
                                {currentQ.qType === 'mcq' && (
                                    <div className="space-y-3">
                                        {(currentQ.options || []).map(opt => (
                                            <button key={opt} onClick={() => handleAnswerChange(opt)}
                                                className={`w-full p-4 rounded-xl text-left border-2 transition-all font-medium ${answers[currentQuestionIdx] === opt
                                                        ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-md'
                                                        : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >{opt}</button>
                                        ))}
                                    </div>
                                )}

                                {/* MSQ */}
                                {currentQ.qType === 'msq' && (
                                    <div className="space-y-3">
                                        <p className="text-xs text-gray-400 mb-1">Select all that apply</p>
                                        {(currentQ.options || []).map(opt => {
                                            const current = answers[currentQuestionIdx] || [];
                                            const isSelected = current.includes(opt);
                                            return (
                                                <button key={opt}
                                                    onClick={() => handleAnswerChange(isSelected ? current.filter(x => x !== opt) : [...current, opt])}
                                                    className={`w-full p-4 rounded-xl text-left border-2 transition-all font-medium flex items-center justify-between ${isSelected
                                                            ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-md'
                                                            : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {opt}
                                                    {isSelected && <CheckCircle size={20} className="text-teal-500" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Single Input */}
                                {currentQ.qType === 'single_input' && (
                                    <div>
                                        {currentQ.inputLabel && <label className="text-sm text-gray-600 font-medium mb-2 block">{currentQ.inputLabel}</label>}
                                        <textarea
                                            autoFocus
                                            className="w-full p-4 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition"
                                            placeholder="Type your answer here..."
                                            rows={4}
                                            maxLength={currentQ.maxChars || 500}
                                            value={answers[currentQuestionIdx] || ''}
                                            onChange={e => handleAnswerChange(e.target.value)}
                                        />
                                        <p className="text-xs text-gray-400 text-right mt-1">
                                            {(answers[currentQuestionIdx] || '').length} / {currentQ.maxChars || 500}
                                        </p>
                                    </div>
                                )}

                                {/* Multi Input */}
                                {currentQ.qType === 'multi_input' && (
                                    <div className="space-y-4">
                                        {(currentQ.multiFields || []).map((field, fIdx) => (
                                            <div key={fIdx}>
                                                <label className="text-sm text-gray-600 font-medium mb-1.5 block">{field.label || `Field ${fIdx + 1}`}</label>
                                                <textarea
                                                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition"
                                                    placeholder={`Enter ${field.label || 'your answer'}...`}
                                                    rows={2}
                                                    maxLength={field.maxChars || 100}
                                                    value={(answers[currentQuestionIdx] || {})[fIdx] || ''}
                                                    onChange={e => {
                                                        const prev = answers[currentQuestionIdx] || {};
                                                        handleAnswerChange({ ...prev, [fIdx]: e.target.value });
                                                    }}
                                                />
                                                <p className="text-xs text-gray-400 text-right mt-0.5">
                                                    {((answers[currentQuestionIdx] || {})[fIdx] || '').length} / {field.maxChars || 100}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Fill in the Blanks */}
                                {currentQ.qType === 'fill_blanks' && (
                                    <div className="leading-[3.5rem] text-lg text-gray-700 font-medium">
                                        {(currentQ.fillBlankText || '').split(/(\[\$\d+\])/).map((part, i, arr) => {
                                            const match = part.match(/\[\$(\d+)\]/);
                                            if (match) {
                                                const max = parseInt(match[1], 10);
                                                const prevBlanks = arr.slice(0, i).filter(p => /\[\$\d+\]/.test(p)).length;
                                                const blanks = Array.isArray(answers[currentQuestionIdx]) ? answers[currentQuestionIdx] : [];
                                                const val = blanks[prevBlanks] || '';
                                                return (
                                                    <input
                                                        key={i}
                                                        maxLength={max}
                                                        value={val}
                                                        onChange={e => {
                                                            const updated = [...blanks];
                                                            updated[prevBlanks] = e.target.value;
                                                            handleAnswerChange(updated);
                                                        }}
                                                        className="inline-block border-b-4 w-40 mx-2 px-3 text-center outline-none rounded-t-lg font-bold transition-colors border-teal-300 bg-teal-50 text-teal-900 focus:bg-teal-100 focus:border-teal-600"
                                                    />
                                                );
                                            }
                                            return <span key={i}>{part}</span>;
                                        })}
                                    </div>
                                )}

                                {/* Fact / Trick */}
                                {currentQ.qType === 'fact_trick' && (
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Fact', 'Trick', 'Opinion'].map(opt => (
                                            <button key={opt}
                                                onClick={() => handleAnswerChange(opt)}
                                                className={`p-4 rounded-xl text-center border-2 transition-all font-bold ${answers[currentQuestionIdx] === opt
                                                        ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-md'
                                                        : 'border-gray-100 hover:border-gray-300 text-gray-600'
                                                    }`}
                                            >
                                                {opt === 'Fact' && '📘'}
                                                {opt === 'Trick' && '🎩'}
                                                {opt === 'Opinion' && '💭'}
                                                <div className="mt-1 text-sm">{opt}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t px-6 py-4 z-10">
                <div className="max-w-2xl mx-auto">
                    {currentQuestionIdx === totalQ - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !checkAnswerFormat(currentQ, answers[currentQuestionIdx])}
                            className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 transition shadow-lg shadow-teal-200"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                            disabled={!checkAnswerFormat(currentQ, answers[currentQuestionIdx])}
                            className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 transition shadow-lg shadow-teal-200"
                        >
                            Next Question
                        </button>
                    )}
                </div>
            </div>

            {/* Calculator */}
            {showCalculator && <SimpleCalculator onClose={() => setShowCalculator(false)} />}

            {/* Grading Modal */}
            {gradingResult && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-fadeIn">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-xl ${gradingResult.score >= 5 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                            }`}>
                            {gradingResult.score}
                        </div>
                        <h2 className="text-2xl font-black text-center mb-2">
                            {gradingResult.score >= 5 ? 'Nice Work! 🎉' : 'Almost There...'}
                        </h2>
                        <p className="text-center text-gray-500 mb-6 font-medium">
                            {gradingResult.score >= 5 ? 'You mastered this concept.' : "Let's review and try again."}
                        </p>
                        <div className="bg-gray-50 p-5 rounded-2xl mb-6 border border-gray-100 space-y-4">
                            <div className="flex items-start gap-3">
                                <MessageSquare className="text-blue-500 min-w-[20px] mt-1" size={18} />
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 mb-1">Feedback</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{gradingResult.feedback}</p>
                                </div>
                            </div>
                            {gradingResult.tip && (
                                <div className="flex items-start gap-3">
                                    <div className="text-amber-500 font-black min-w-[20px] mt-1">💡</div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900 mb-1">Coach Tip</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">{gradingResult.tip}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {gradingResult.score < 5 ? (
                                <button onClick={handleRetry}
                                    className="flex-1 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2">
                                    <RotateCcw size={18} /> Try Again
                                </button>
                            ) : (
                                <button
                                    onClick={() => { setGradingResult(null); handleNextActivity(); }}
                                    className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold hover:from-teal-600 hover:to-emerald-600 transition flex items-center justify-center gap-2 shadow-lg shadow-teal-200">
                                    Continue <ArrowRight size={18} />
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

    // Data
    const [sections, setSections] = useState([]);
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(true);

    // Navigation state: 'sections' | 'activities' | 'question'
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
