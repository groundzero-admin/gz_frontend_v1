import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    ArrowLeft, ArrowRight, Image as ImageIcon, Video, Monitor, ChevronRight,
    User, Settings, Layout, Trash2, CheckCircle, FileText, Calculator, Bot,
    Lightbulb, AlertTriangle, Check, HelpCircle, Layers, X, Eye, EyeOff,
    Lock, Unlock, PenTool, Send, Copy, Users, Grid, Sparkles, Brain,
    Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Minus, ChevronLeft, RotateCcw
} from 'lucide-react';

const backend_api = import.meta.env.VITE_BACKEND_API || "http://localhost:4010/temp/api";

// --- RICH TEXT EDITOR COMPONENT ---
const RichTextEditor = ({ content, onChange, placeholder }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none min-h-[120px] outline-none px-6 py-4 text-gray-800 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:my-1',
            },
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '');
        }
    }, [content, editor]);

    if (!editor) return null;

    const ToolbarButton = ({ onClick, active, children, title }) => (
        <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onClick(); }}
            title={title}
            className={`p-2 rounded-lg transition-all ${active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="border-4 border-gray-100 rounded-[2rem] overflow-hidden bg-white focus-within:border-indigo-300 transition-colors">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-3 bg-gray-50 border-b-2 border-gray-100">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                    <Bold size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                    <Italic size={16} />
                </ToolbarButton>
                <div className="w-px bg-gray-300 mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
                    <List size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
                    <ListOrdered size={16} />
                </ToolbarButton>
                <div className="w-px bg-gray-300 mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
                    <Minus size={16} />
                </ToolbarButton>
            </div>
            {/* Editor */}
            <EditorContent editor={editor} />
        </div>
    );
};

const StudentList = [
    { id: 'adarsh', name: 'Adarsh', batch: 'Spark1' },
    { id: 'saranya', name: 'Saranya', batch: 'Spark1' },
    { id: 'riya', name: 'Riya', batch: 'Spark2' },
    { id: 'shivangi', name: 'Shivangi', batch: 'Spark2' }
];

// --- STUDENT TEXT EDITOR (Cleaner, no toolbar) ---
const StudentTextEditor = ({ content, onChange, placeholder, disabled, minHeight = '120px' }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content || '',
        editable: !disabled,
        onUpdate: ({ editor }) => {
            onChange(editor.getText()); // Store as plain text for simplicity
        },
        editorProps: {
            attributes: {
                class: 'outline-none px-5 py-4 text-gray-800 text-lg leading-relaxed w-full',
            },
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getText()) {
            editor.commands.setContent(content || '');
        }
    }, [content, editor]);

    useEffect(() => {
        if (editor) {
            editor.setEditable(!disabled);
        }
    }, [disabled, editor]);

    if (!editor) return null;

    return (
        <div
            className={`border-2 rounded-xl overflow-hidden bg-white transition-all cursor-text ${disabled ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-gray-200 focus-within:border-teal-400 focus-within:shadow-lg'}`}
            style={{ minHeight }}
            onClick={() => editor.chain().focus().run()}
        >
            <EditorContent editor={editor} />
            {!content && !disabled && (
                <div className="absolute top-4 left-5 text-gray-300 pointer-events-none text-lg">{placeholder}</div>
            )}
        </div>
    );
};

// --- STUDENT NAVBAR (Shared across student pages) ---
const StudentNavbar = ({ studentId }) => (
    <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-black text-gray-900">Ground<span className="text-teal-500">Zero</span></h1>
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm">{studentId?.charAt(0)?.toUpperCase()}</div>
            <span className="font-medium text-gray-700 capitalize">{studentId}</span>
        </div>
    </div>
);

// --- 1. SHARED: SIMPLE CALCULATOR ---
const SimpleCalculator = () => {
    const [input, setInput] = useState('');
    const handleClick = (val) => setInput(prev => prev + val);
    const clear = () => setInput('');
    const calculate = () => { try { setInput(eval(input).toString()); } catch { setInput('Error'); } };
    return (
        <div className="fixed bottom-24 right-6 bg-gray-900 p-5 rounded-2xl shadow-2xl w-64 border-2 border-gray-700 z-40">
            <div className="bg-gray-100 p-3 rounded-xl mb-3 text-right font-mono text-2xl font-bold h-14 overflow-hidden flex items-center justify-end text-gray-800">{input || '0'}</div>
            <div className="grid grid-cols-4 gap-1.5">
                {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
                    <button key={btn} onClick={() => btn === '=' ? calculate() : handleClick(btn)} className={`p-3 rounded-lg font-bold text-lg hover:scale-105 transition-transform ${btn === '=' ? 'bg-teal-500 text-white col-span-2' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>{btn}</button>
                ))}
                <button onClick={clear} className="col-span-2 bg-red-500 text-white p-2 rounded-lg font-bold mt-1.5">C</button>
            </div>
        </div>
    );
};

// --- 2. SHARED: QUESTION BLOCK RENDERER ---
const QuestionBlock = ({ qData, response, onInput, readOnly, qIndex }) => {
    const [mediaIndex, setMediaIndex] = useState(0);

    // Guard: If no question data, show nothing
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

    const isMissing = !response || (Array.isArray(response) && response.every(v => !v));
    const errorStyles = (readOnly && isMissing) ? "border-red-200 bg-red-50/50 shadow-red-100" : "border-gray-50 bg-white shadow-xl";

    const mediaItems = qData.media || [];
    const hasMultipleMedia = mediaItems.length > 1;

    return (
        <div className={`p-8 rounded-2xl border-2 mb-6 ${errorStyles}`}>
            {readOnly && isMissing && (
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs mb-4">
                    <AlertTriangle size={14} /> No Answer Provided
                </div>
            )}

            <div
                className="prose prose-lg max-w-none mb-8 text-gray-800 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:my-1"
                dangerouslySetInnerHTML={{ __html: qData.prompt || '<p>Question...</p>' }}
            />

            {/* Per-Question Media Carousel */}
            {mediaItems.length > 0 && (
                <div className="mb-8 relative">
                    {/* Media Display */}
                    <div className="w-full rounded-[1.5rem] overflow-hidden border-4 border-gray-100 shadow-lg bg-black relative">
                        {mediaItems[mediaIndex]?.mediaType === 'image' ? (
                            <img src={mediaItems[mediaIndex]?.url} className="w-full h-auto max-h-[400px] object-contain" alt="question media" />
                        ) : (mediaItems[mediaIndex]?.mediaType === 'video' && !mediaItems[mediaIndex]?.url?.includes('youtu')) ? (
                            <video src={mediaItems[mediaIndex]?.url} controls className="w-full h-auto max-h-[400px]" />
                        ) : (
                            <div className="aspect-video w-full">
                                <iframe src={mediaItems[mediaIndex]?.url} className="w-full h-full border-0" title="embed" allowFullScreen />
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        {hasMultipleMedia && (
                            <>
                                <button
                                    onClick={() => setMediaIndex(prev => prev === 0 ? mediaItems.length - 1 : prev - 1)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-indigo-600 transition-all hover:scale-110"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setMediaIndex(prev => prev === mediaItems.length - 1 ? 0 : prev + 1)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-indigo-600 transition-all hover:scale-110"
                                >
                                    <ArrowRight size={20} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Dot Indicators */}
                    {hasMultipleMedia && (
                        <div className="flex justify-center gap-2 mt-4">
                            {mediaItems.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setMediaIndex(i)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === mediaIndex ? 'bg-indigo-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {qData.qType === 'mcq' && (
                <div className="grid gap-4">
                    {qData.options.map((opt, i) => (
                        <button key={i} onClick={() => update(opt)} disabled={readOnly}
                            className={`p-6 rounded-2xl border-4 font-bold text-lg text-left transition-all ${response === opt ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-200'}`}>
                            {opt}
                        </button>
                    ))}
                </div>
            )}

            {qData.qType === 'msq' && (
                <div className="grid gap-4">
                    {qData.options.map((opt, i) => {
                        const selected = Array.isArray(response) ? response.includes(opt) : false;
                        return (
                            <button key={i} onClick={() => {
                                if (readOnly) return;
                                const current = Array.isArray(response) ? [...response] : [];
                                const newSelection = selected ? current.filter(a => a !== opt) : [...current, opt];
                                onInput(newSelection, qIndex);
                            }} disabled={readOnly}
                                className={`p-6 rounded-2xl border-4 font-bold text-lg text-left transition-all flex items-center gap-4 ${selected ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md' : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200'}`}>
                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                                    {selected && <Check size={14} strokeWidth={3} />}
                                </div>
                                {opt}
                            </button>
                        );
                    })}
                    <p className="text-center text-xs font-bold text-blue-400 uppercase tracking-widest mt-2">Select all that apply</p>
                </div>
            )}

            {qData.qType === 'fact_trick' && (
                <div className="grid grid-cols-3 gap-4">
                    {qData.options.slice(0, 3).map((opt, i) => {
                        const icons = [<Check size={32} />, <AlertTriangle size={32} />, <HelpCircle size={32} />];
                        const colors = ['bg-green-100 text-green-700', 'bg-red-100 text-red-700', 'bg-blue-100 text-blue-700'];
                        const isSelected = response === opt;
                        return (
                            <button key={i} onClick={() => update(opt)} disabled={readOnly}
                                className={`p-6 rounded-[2rem] border-4 flex flex-col items-center justify-center gap-4 transition-all h-48 ${isSelected ? 'border-indigo-600 bg-white shadow-xl scale-105 z-10' : 'border-gray-100 bg-gray-50 hover:bg-white'}`}>
                                <div className={`p-3 rounded-full ${colors[i % 3]}`}>{icons[i % 3]}</div>
                                <span className="font-black text-sm text-center uppercase leading-tight text-gray-700">{opt || 'Option'}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {qData.qType === 'single_input' && (
                <div className="space-y-3">
                    <label className="text-sm font-black text-indigo-400 uppercase tracking-widest ml-2">{qData.inputLabel}</label>
                    <StudentTextEditor
                        content={response || ''}
                        onChange={val => update(val)}
                        disabled={readOnly}
                        placeholder={readOnly ? "NOT ANSWERED" : "Type your answer here..."}
                        minHeight={qData.maxChars <= 100 ? "80px" : `${80 + Math.ceil((qData.maxChars - 100) / 100) * 40}px`}
                    />
                    <div className="text-right text-xs font-bold text-gray-300">{response?.length || 0} / {qData.maxChars}</div>
                </div>
            )}

            {qData.qType === 'multi_input' && (
                <div className="grid gap-8">
                    {qData.multiFields?.map((field, idx) => (
                        <div key={idx} className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2 flex justify-between">
                                <span>{field.label || `Step ${idx + 1}`}</span>
                                <span>{(response && response[idx]?.length) || 0} / {field.maxChars || 100}</span>
                            </label>
                            <StudentTextEditor
                                content={(response && response[idx]) || ''}
                                onChange={val => update(val, idx)}
                                disabled={readOnly}
                                placeholder={readOnly ? "NOT ANSWERED" : "Type your answer here..."}
                                minHeight={(field.maxChars || 100) <= 100 ? "80px" : `${80 + Math.ceil(((field.maxChars || 100) - 100) / 100) * 40}px`}
                            />
                        </div>
                    ))}
                </div>
            )}

            {qData.qType === 'fill_blanks' && (
                <div className="leading-[3.5rem] text-xl text-gray-700 font-medium">
                    {qData.fillBlankText.split(/(\[\$.*?\])/).map((part, i, arr) => {
                        if (part.startsWith('[$')) {
                            const max = part.match(/\d+/)[0];
                            const idx = arr.slice(0, i).filter(p => p.startsWith('[$')).length;
                            const val = response ? response[idx] : '';
                            return <input key={i} maxLength={max} disabled={readOnly} value={val || ''} onChange={e => update(e.target.value, idx)}
                                className={`inline-block border-b-4 w-40 mx-2 px-3 text-center outline-none rounded-t-lg font-bold transition-colors ${readOnly && !val ? 'border-red-300 bg-red-100/50 text-red-900' : 'border-indigo-300 bg-indigo-50 text-indigo-900 focus:bg-indigo-100 focus:border-indigo-600'}`} />;
                        }
                        return <span key={i}>{part}</span>;
                    })}
                </div>
            )}
        </div>
    );
};

// --- 3. SHARED: ACTIVITY RENDERER ---
const ActivityRenderer = ({ activity, userResponses = [], onInput, readOnly = false, subIndex, setSubIndex, onSubmitQuestion, customFooter }) => {
    const questions = activity?.practiceData?.questions || [];
    const currentQ = questions[subIndex];
    const totalQ = questions.length;

    if (!activity) return null;

    return (
        <div className="bg-white rounded-[3rem] shadow-2xl flex-1 flex flex-col border-8 border-white overflow-hidden relative">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50 backdrop-blur-sm sticky top-0 z-10">
                <div>
                    <span className="text-indigo-600 font-black text-xs uppercase tracking-widest">{activity.type}</span>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{activity.title}</h2>
                </div>
                <div className="flex gap-2">
                    {activity.showAgent && <div className="px-5 py-2 bg-purple-100 text-purple-700 rounded-full text-xs font-black uppercase flex items-center gap-2 border-2 border-purple-200 animate-pulse"><Bot size={16} /> AI Agent Active</div>}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 bg-gray-50 flex flex-col">
                <div className="max-w-4xl mx-auto w-full pb-20 flex-1">

                    {activity.type === 'reading' ? (
                        <div className="p-24 bg-blue-50 border-4 border-dashed border-blue-200 rounded-[4rem] text-center shadow-inner group hover:bg-blue-100 transition-colors cursor-pointer">
                            <FileText size={120} className="mx-auto text-blue-400 mb-8 group-hover:scale-110 transition-transform" />
                            <h3 className="text-5xl font-black text-blue-900 mb-8">Reading Material</h3>
                            <a href={activity.readingData?.link} target="_blank" rel="noreferrer" className="inline-block bg-blue-600 text-white px-16 py-6 rounded-[2.5rem] font-black text-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all">Launch Document</a>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${((subIndex + 1) / totalQ) * 100}%` }}></div>
                                </div>
                                <span className="font-black text-gray-400 text-xs uppercase tracking-widest">Question {subIndex + 1} of {totalQ}</span>
                            </div>

                            {currentQ && (
                                <QuestionBlock
                                    qIndex={subIndex}
                                    qData={currentQ}
                                    response={userResponses[subIndex]}
                                    onInput={onInput}
                                    readOnly={readOnly}
                                />
                            )}

                            <div className="flex items-center justify-between mt-auto pt-8 border-t-2 border-gray-100">
                                <button onClick={() => setSubIndex(prev => Math.max(0, prev - 1))} disabled={subIndex === 0} className={`p-4 rounded-full border-2 flex items-center justify-center transition-all ${subIndex === 0 ? 'border-gray-100 text-gray-300' : 'border-indigo-100 text-indigo-600 hover:bg-indigo-50'}`}><ArrowLeft size={24} /></button>
                                {customFooter ? customFooter : (!readOnly && onSubmitQuestion && <button onClick={onSubmitQuestion} className="px-10 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-lg flex items-center gap-3 shadow-xl hover:bg-black hover:scale-105 transition-all"><Send size={20} /> Submit Answer</button>)}
                                <button onClick={() => setSubIndex(prev => Math.min(totalQ - 1, prev + 1))} disabled={subIndex === totalQ - 1} className={`p-4 rounded-full border-2 flex items-center justify-center transition-all ${subIndex === totalQ - 1 ? 'border-gray-100 text-gray-300' : 'border-indigo-100 text-indigo-600 hover:bg-indigo-50'}`}><ArrowRight size={24} /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- 4. ADMIN: WORKBENCH (FIXED to include Old Code Editor UI) ---
// --- 4. ADMIN: WORKBENCH (Updated with Student Progress Tracking) ---
const AdminEditor = () => {
    const { id, batchId } = useParams();
    const [wsInfo, setWsInfo] = useState(null);
    const [acts, setActs] = useState([]);

    const [selectedAct, setSelectedAct] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [viewMode, setViewMode] = useState('preview');
    const [editId, setEditId] = useState(null);
    const [previewSubIndex, setPreviewSubIndex] = useState(0);

    const [pageViewMode, setPageViewMode] = useState('content');
    const [adminMode, setAdminMode] = useState('editor');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [allResponses, setAllResponses] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);

    // Default Objects
    const defaultQuestion = {
        qType: 'mcq', prompt: '', options: ['', ''], correctAnswer: '', correctAnswers: [],
        inputLabel: '', maxChars: 500, fillBlankText: '',
        multiFields: [{ label: 'Step 1', maxChars: 100 }],
        aiPrompt: '', postAnswerTip: '',
        media: []
    };

    const initialForm = {
        type: 'practice', title: '',
        allowCalculator: false, showAgent: false,
        readingData: { link: '', allowInput: true },
        practiceData: { description: '', questions: [] }
    };
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        axios.get(`${backend_api}/worksheets/${id}`).then(res => setWsInfo(res.data));
        loadActs();
        loadAllResponses();
        if (batchId) {
            // Stay in editor mode but load students for the sidebar
            axios.get(`${backend_api}/students/${batchId}`).then(res => setFilteredStudents(res.data));
        }
    }, [id, batchId]);

    const loadActs = () => axios.get(`${backend_api}/activities/${id}`).then(res => setActs(res.data));
    const loadAllResponses = () => axios.get(`${backend_api}/admin/worksheet-responses/${id}`).then(res => setAllResponses(res.data));

    // --- ACTIONS ---
    const save = async () => { if (editId) await axios.put(`${backend_api}/activities/${editId}`, { ...form }); else await axios.post(`${backend_api}/activities`, { ...form, worksheetId: id, order: acts.length }); setShowAdd(false); setEditId(null); setSelectedAct(null); loadActs(); };

    const handleEdit = () => {
        if (!selectedAct) return;
        setForm({
            ...selectedAct,
            practiceData: selectedAct.practiceData || { media: [], questions: [] },
            readingData: selectedAct.readingData || { link: '', allowInput: true }
        });
        setEditId(selectedAct._id);
        setShowAdd(true);
    };

    const addQuestion = () => setForm({ ...form, practiceData: { ...form.practiceData, questions: [...form.practiceData.questions, { ...defaultQuestion }] } });

    const updateQuestion = (idx, field, value) => {
        const newQs = [...form.practiceData.questions]; let updatedQ = { ...newQs[idx], [field]: value };
        if (field === 'qType') {
            if (value === 'fact_trick') { updatedQ.options = ['Fact', 'Trick', 'Opinion']; updatedQ.correctAnswer = ''; }
            if (value === 'msq') { updatedQ.options = ['', '']; updatedQ.correctAnswers = []; }
            if (value === 'mcq') { updatedQ.options = ['', '']; updatedQ.correctAnswer = ''; }
            if (value === 'multi_input' && (!updatedQ.multiFields || updatedQ.multiFields.length === 0)) { updatedQ.multiFields = [{ label: 'Step 1', maxChars: 100 }]; }
        }
        newQs[idx] = updatedQ; setForm({ ...form, practiceData: { ...form.practiceData, questions: newQs } });
    };

    const removeQuestion = (idx) => { const newQs = form.practiceData.questions.filter((_, i) => i !== idx); setForm({ ...form, practiceData: { ...form.practiceData, questions: newQs } }); };
    const addMultiField = (qIdx) => { const newQs = [...form.practiceData.questions]; newQs[qIdx].multiFields.push({ label: `Step ${newQs[qIdx].multiFields.length + 1}`, maxChars: 100 }); setForm({ ...form, practiceData: { ...form.practiceData, questions: newQs } }); };
    const updateMultiField = (qIdx, fIdx, key, val) => { const newQs = [...form.practiceData.questions]; newQs[qIdx].multiFields[fIdx][key] = val; setForm({ ...form, practiceData: { ...form.practiceData, questions: newQs } }); };
    const removeMultiField = (qIdx, fIdx) => { const newQs = [...form.practiceData.questions]; newQs[qIdx].multiFields = newQs[qIdx].multiFields.filter((_, i) => i !== fIdx); setForm({ ...form, practiceData: { ...form.practiceData, questions: newQs } }); };

    const addMediaToQuestion = (qIdx, type) => {
        const newQs = [...form.practiceData.questions];
        if (!newQs[qIdx].media) newQs[qIdx].media = [];
        newQs[qIdx].media.push({ url: '', mediaType: type });
        setForm({ ...form, practiceData: { ...form.practiceData, questions: newQs } });
    };
    const updateQuestionMedia = (qIdx, mIdx, val) => {
        const newQs = [...form.practiceData.questions];
        newQs[qIdx].media[mIdx].url = val;
        setForm({ ...form, practiceData: { ...form.practiceData, questions: newQs } });
    };
    const removeQuestionMedia = (qIdx, mIdx) => {
        const newQs = [...form.practiceData.questions];
        newQs[qIdx].media = newQs[qIdx].media.filter((_, i) => i !== mIdx);
        setForm({ ...form, practiceData: { ...form.practiceData, questions: newQs } });
    };

    const getStudentResponseForAct = (actId) => { if (!selectedStudent) return []; const rec = allResponses.find(r => r.studentId === selectedStudent._id && r.activityId === actId); return rec ? rec.responses : []; };

    // --- NEW LOGIC: Calculate "Current Page" and "% of that page" ---
    const getStudentStatus = (studentId) => {
        // 1. If no activities, return 0
        if (acts.length === 0) return { page: 0, percent: 0, isDone: false };

        // 2. Loop through pages to find the first one NOT complete
        for (let i = 0; i < acts.length; i++) {
            const act = acts[i];
            const record = allResponses.find(r => r.studentId === studentId && r.activityId === act._id);
            const answers = record?.responses || [];
            const totalQ = act.practiceData?.questions?.length || 0;

            // Calculate percent for this specific page
            let completedCount = 0;
            if (totalQ > 0) {
                completedCount = answers.filter(r => r !== null && r !== "" && (Array.isArray(r) ? r.some(v => v !== "") : true)).length;
            }

            // If page has no questions (e.g. reading), mark as 100% if record exists
            let pagePercent = 0;
            if (totalQ === 0) {
                pagePercent = record ? 100 : 0;
            } else {
                pagePercent = Math.round((completedCount / totalQ) * 100);
            }

            // FOUND IT: If this page is NOT 100% done, this is their "Current Page"
            if (pagePercent < 100) {
                return { page: i + 1, percent: pagePercent, isDone: false };
            }
        }

        // 3. If loop finishes, they are done with everything
        return { page: acts.length, percent: 100, isDone: true };
    };
    // ------------------------------------------------------------------

    const getActivityCompletionStats = (actId, activityData) => {
        if (!selectedStudent) return 0;
        const studentRecord = allResponses.find(r => r.studentId === selectedStudent._id && r.activityId === actId);
        const studentResponses = studentRecord?.responses || [];
        const totalQuestions = activityData.practiceData?.questions?.length || 0;
        if (totalQuestions === 0) return 0;
        const completedCount = studentResponses.filter(r => r !== null && r !== "" && (Array.isArray(r) ? r.some(v => v !== "") : true)).length;
        return Math.round((completedCount / totalQuestions) * 100);
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden font-sans text-gray-900">
            {/* SIDEBAR */}
            <div className="w-80 bg-white border-r border-gray-200 p-6 flex flex-col shadow-xl z-20">
                <Link to="/admin" className="text-xs font-black text-gray-400 mb-6 uppercase flex items-center gap-2 hover:text-indigo-600 transition-colors"><ArrowLeft size={14} /> Dashboard</Link>
                <div className="mb-6 p-6 bg-indigo-950 rounded-[2rem] text-white shadow-lg border-b-8 border-indigo-800">
                    <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Worksheet</span>
                    <h1 className="text-xl font-black italic truncate leading-tight tracking-tight">{wsInfo?.title || 'Loading...'}</h1>
                    {batchId && <div className="mt-2 text-xs font-bold bg-indigo-800 px-3 py-1 rounded-full inline-block">{batchId}</div>}
                </div>

                {batchId && (
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
                        <button onClick={() => { setAdminMode('editor'); setSelectedStudent(null); }} className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase ${adminMode === 'editor' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}>Activities</button>
                        <button onClick={() => { setAdminMode('review'); }} className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase ${adminMode === 'review' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}>Students</button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                    {adminMode === 'editor' ? (
                        acts.map((a, i) => (
                            <button key={a._id} onClick={() => { setSelectedAct(a); setShowAdd(false); setViewMode('preview'); setPreviewSubIndex(0); setPageViewMode('content'); }} className={`w-full p-4 rounded-2xl border-2 text-left transition-all group ${selectedAct?._id === a._id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-100 hover:bg-gray-50'}`}>
                                <div className="text-[10px] font-black opacity-40 uppercase mb-1">Activity 0{i + 1}</div>
                                <div className="font-bold truncate text-sm text-gray-800">{a.title}</div>
                            </button>
                        ))
                    ) : (
                        !selectedStudent ? (
                            (batchId ? filteredStudents : StudentList).map(s => {
                                // CALCULATE STATUS FOR SIDEBAR ROW
                                const status = getStudentStatus(s._id || s.id);

                                return (
                                    <button key={s.id || s._id} onClick={() => setSelectedStudent(s)} className="w-full p-5 rounded-[2.5rem] border-2 border-gray-100 hover:border-indigo-400 hover:bg-indigo-50 text-left transition-all group bg-white shadow-sm mb-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-black text-gray-900 text-lg block">{s.name}</span>
                                            {status.isDone ? (
                                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md uppercase">Done</span>
                                            ) : (
                                                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md uppercase">At Actv {status.page}</span>
                                            )}
                                        </div>

                                        {/* PROGRESS BAR FOR CURRENT PAGE */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                                                <div className={`h-full transition-all duration-500 ${status.isDone ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${status.percent}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-400">{status.percent}%</span>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <>
                                <button onClick={() => setSelectedStudent(null)} className="w-full py-3 mb-4 text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-600 flex items-center gap-2"><ArrowLeft size={12} /> Back</button>
                                {acts.map((a, i) => {
                                    const pagePercent = getActivityCompletionStats(a._id, a);
                                    return (
                                        <button key={a._id} onClick={() => { setSelectedAct(a); setPreviewSubIndex(0); }} className={`w-full p-4 rounded-2xl border-2 text-left transition-all group mb-2 ${selectedAct?._id === a._id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100'}`}>
                                            <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black uppercase">Activity 0{i + 1}</span><span className="font-bold text-xs">{pagePercent}%</span></div>
                                            <div className="font-bold truncate text-sm text-gray-800">{a.title}</div>
                                        </button>
                                    );
                                })}
                            </>
                        )
                    )}
                </div>
                {adminMode === 'editor' && !batchId && <button onClick={() => { setShowAdd(true); setSelectedAct(null); setForm(initialForm); }} className="mt-6 bg-indigo-600 text-white p-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl">+ New Activity</button>}
            </div>

            <div className="flex-1 p-10 overflow-y-auto bg-gray-100">

                {/* --- DEFAULT VIEW WHEN NO ACTIVITY SELECTED --- */}
                {adminMode === 'editor' && !showAdd && !selectedAct && (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-32 h-32 mx-auto mb-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <Layout size={48} className="text-indigo-300" />
                            </div>
                            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-2">You are at</p>
                            <h2 className="text-4xl font-black text-indigo-900 italic">{wsInfo?.title || 'Worksheet'}</h2>
                            <p className="text-gray-400 mt-4">Select an activity from the sidebar or create a new one</p>
                        </div>
                    </div>
                )}

                {/* --- EDITOR FORM --- */}
                {adminMode === 'editor' && showAdd && (
                    <div className="max-w-5xl mx-auto bg-white p-16 rounded-[4rem] shadow-2xl space-y-12 border-8 border-white">
                        <div className="flex justify-between items-center"><h2 className="text-5xl font-black italic text-indigo-950 underline decoration-indigo-200 decoration-4">{editId ? "Edit Activity" : "Activity Builder"}</h2>{editId && <div className="px-6 py-2 bg-yellow-100 text-yellow-700 font-bold rounded-full uppercase text-xs border border-yellow-200">Editing Mode</div>}</div>

                        <div className="flex gap-4 p-2 bg-gray-100 rounded-[2.5rem] w-full">
                            <button onClick={() => setForm({ ...form, type: 'practice' })} className={`flex-1 py-5 rounded-[2rem] font-black uppercase tracking-widest transition-all ${form.type === 'practice' ? 'bg-white shadow-xl text-indigo-600 scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}>Activity Creation</button>
                            <button onClick={() => setForm({ ...form, type: 'reading' })} className={`flex-1 py-5 rounded-[2rem] font-black uppercase tracking-widest transition-all ${form.type === 'reading' ? 'bg-white shadow-xl text-indigo-600 scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}>Reading Material Creation</button>
                        </div>

                        <div className="space-y-10">
                            <input className="w-full p-8 border-4 border-gray-50 rounded-[2.5rem] font-black text-4xl outline-none focus:border-indigo-600 bg-gray-50 transition-all placeholder:text-gray-300" placeholder="Enter Activity Title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />

                            {form.type === 'reading' && (
                                <div className="p-10 bg-blue-50 rounded-[3.5rem] border-4 border-blue-100 space-y-6">
                                    <h3 className="text-blue-800 font-black text-xl uppercase">Reading Configuration</h3>
                                    <div className="bg-white p-6 rounded-2xl border-2 border-blue-100">
                                        <label className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2 block">Document URL (PDF/Doc)</label>
                                        <input className="w-full font-bold text-lg outline-none text-gray-700" placeholder="https://..." value={form.readingData.link} onChange={e => setForm({ ...form, readingData: { ...form.readingData, link: e.target.value } })} />
                                    </div>
                                </div>
                            )}

                            <div className="p-10 bg-purple-50 rounded-[3.5rem] border-4 border-purple-100 grid md:grid-cols-2 gap-8 shadow-sm">
                                <p className="col-span-2 text-xs font-black text-purple-600 uppercase tracking-[0.2em] mb-2">Global Settings</p>
                                <div onClick={() => setForm({ ...form, allowCalculator: !form.allowCalculator })} className={`flex items-center gap-6 p-6 rounded-[2rem] cursor-pointer transition-all border-4 ${form.allowCalculator ? 'bg-white border-purple-200 shadow-lg' : 'bg-purple-100/50 border-transparent hover:bg-white'}`}><div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${form.allowCalculator ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-500'}`}><Calculator size={24} /></div><span className={`font-black text-lg ${form.allowCalculator ? 'text-purple-900' : 'text-gray-400'}`}>Calculator</span></div>
                                <div onClick={() => setForm({ ...form, showAgent: !form.showAgent })} className={`flex items-center gap-6 p-6 rounded-[2rem] cursor-pointer transition-all border-4 ${form.showAgent ? 'bg-white border-purple-200 shadow-lg' : 'bg-purple-100/50 border-transparent hover:bg-white'}`}><div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${form.showAgent ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-500'}`}><Bot size={24} /></div><span className={`font-black text-lg ${form.showAgent ? 'text-purple-900' : 'text-gray-400'}`}>AI Agent</span></div>

                            </div>

                            {form.type === 'practice' && (
                                <div className="space-y-12">
                                    <div className="space-y-8">
                                        {form.practiceData.questions.map((q, idx) => (
                                            <div key={idx} className="bg-white p-10 rounded-[3rem] border-4 border-gray-100 shadow-xl relative group hover:border-indigo-100 transition-colors">
                                                <button onClick={() => removeQuestion(idx)} className="absolute top-8 right-8 text-red-200 hover:text-red-500 hover:scale-110 transition-all p-2"><Trash2 size={24} /></button>
                                                <div className="flex items-center gap-6 mb-8"><span className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">{idx + 1}</span><select className="bg-indigo-50 text-indigo-900 p-4 rounded-2xl font-black uppercase text-xs outline-none tracking-widest cursor-pointer" value={q.qType} onChange={e => updateQuestion(idx, 'qType', e.target.value)}><option value="mcq">Multiple Choice (Single)</option><option value="msq">Multiple Select (Multi)</option><option value="single_input">Single Input</option><option value="multi_input">Multi-Step Input</option><option value="fill_blanks">Fill Blanks</option><option value="fact_trick">Fact / Trick</option></select></div>
                                                <div className="mb-8">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Question Prompt</label>
                                                    <RichTextEditor content={q.prompt} onChange={(html) => updateQuestion(idx, 'prompt', html)} placeholder="Write your question..." />
                                                </div>

                                                {/* Per-Question Media Section */}
                                                <div className="p-6 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 mb-8">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.15em]"><ImageIcon size={12} className="inline mr-2" />Question Media</p>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => addMediaToQuestion(idx, 'image')} className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm font-bold text-[10px] flex gap-1 items-center hover:bg-indigo-50 hover:border-indigo-200 transition-all"><ImageIcon size={12} /> IMG</button>
                                                            <button onClick={() => addMediaToQuestion(idx, 'video')} className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm font-bold text-[10px] flex gap-1 items-center hover:bg-indigo-50 hover:border-indigo-200 transition-all"><Video size={12} /> VIDEO</button>
                                                            <button onClick={() => addMediaToQuestion(idx, 'embed')} className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm font-bold text-[10px] flex gap-1 items-center hover:bg-indigo-50 hover:border-indigo-200 transition-all"><Monitor size={12} /> EMBED</button>
                                                        </div>
                                                    </div>
                                                    {q.media && q.media.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {q.media.map((m, mIdx) => (
                                                                <div key={mIdx} className="flex gap-3 items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-[9px] uppercase">{m.mediaType}</div>
                                                                    <input className="flex-1 p-2 bg-transparent outline-none font-bold text-sm text-gray-700" placeholder="Paste URL..." value={m.url} onChange={e => updateQuestionMedia(idx, mIdx, e.target.value)} />
                                                                    <button onClick={() => removeQuestionMedia(idx, mIdx)} className="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-center text-gray-300 text-xs font-bold py-2">No media added yet</p>
                                                    )}
                                                </div>

                                                {q.qType === 'mcq' && (
                                                    <div className="mb-8 p-6 bg-gray-50 rounded-[2rem] border-2 border-gray-100">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <span className="text-xs font-black text-gray-400 uppercase">MCQ Options</span>
                                                            <button onClick={() => { const newOpts = [...(q.options || []), '']; updateQuestion(idx, 'options', newOpts); }} className="text-xs font-black text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors">+ ADD OPTION</button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {q.options?.map((opt, oi) => (
                                                                <div key={oi} className="flex gap-3 items-center">
                                                                    <button onClick={() => updateQuestion(idx, 'correctAnswer', opt)} className={`w-10 h-10 rounded-xl border-4 border-white shadow-md flex items-center justify-center transition-all flex-shrink-0 ${q.correctAnswer === opt && opt !== '' ? 'bg-green-500 text-white scale-105' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}><Check size={16} strokeWidth={3} /></button>
                                                                    <input className="flex-1 p-4 bg-white rounded-xl font-bold text-gray-700 border-2 border-gray-100 focus:border-indigo-200 outline-none transition-all" placeholder={`Option ${oi + 1}`} value={opt} onChange={e => { const newOpts = [...q.options]; newOpts[oi] = e.target.value; updateQuestion(idx, 'options', newOpts); }} />
                                                                    {q.options.length > 2 && <button onClick={() => { const newOpts = q.options.filter((_, i) => i !== oi); if (q.correctAnswer === opt) updateQuestion(idx, 'correctAnswer', ''); updateQuestion(idx, 'options', newOpts); }} className="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all flex-shrink-0"><Trash2 size={14} /></button>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 mt-3 text-center font-bold uppercase tracking-widest">Click the checkmark to mark correct answer</p>
                                                    </div>
                                                )}
                                                {q.qType === 'msq' && (
                                                    <div className="mb-8 p-6 bg-blue-50 rounded-[2rem] border-2 border-blue-100">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <span className="text-xs font-black text-blue-600 uppercase">MSQ Options (Select Multiple)</span>
                                                            <button onClick={() => { const newOpts = [...(q.options || []), '']; updateQuestion(idx, 'options', newOpts); }} className="text-xs font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">+ ADD OPTION</button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {q.options?.map((opt, oi) => {
                                                                const isCorrect = (q.correctAnswers || []).includes(opt) && opt !== '';
                                                                return (
                                                                    <div key={oi} className="flex gap-3 items-center">
                                                                        <button onClick={() => {
                                                                            if (opt === '') return;
                                                                            const current = q.correctAnswers || [];
                                                                            const newCorrect = isCorrect ? current.filter(a => a !== opt) : [...current, opt];
                                                                            updateQuestion(idx, 'correctAnswers', newCorrect);
                                                                        }} className={`w-10 h-10 rounded-xl border-4 border-white shadow-md flex items-center justify-center transition-all flex-shrink-0 ${isCorrect ? 'bg-blue-500 text-white scale-105' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}><Check size={16} strokeWidth={3} /></button>
                                                                        <input className="flex-1 p-4 bg-white rounded-xl font-bold text-gray-700 border-2 border-blue-100 focus:border-blue-300 outline-none transition-all" placeholder={`Option ${oi + 1}`} value={opt} onChange={e => { const newOpts = [...q.options]; newOpts[oi] = e.target.value; updateQuestion(idx, 'options', newOpts); }} />
                                                                        {q.options.length > 2 && <button onClick={() => { const newOpts = q.options.filter((_, i) => i !== oi); const newCorrect = (q.correctAnswers || []).filter(a => a !== opt); updateQuestion(idx, 'correctAnswers', newCorrect); updateQuestion(idx, 'options', newOpts); }} className="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all flex-shrink-0"><Trash2 size={14} /></button>}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <p className="text-[10px] text-blue-500 mt-3 text-center font-bold uppercase tracking-widest">Click checkmarks to select ALL correct answers</p>
                                                    </div>
                                                )}
                                                {q.qType === 'fact_trick' && (
                                                    <div className="mb-8 p-6 bg-amber-50 rounded-[2rem] border-2 border-amber-200">
                                                        <span className="text-xs font-black text-amber-600 uppercase block mb-4">Fact / Trick / Opinion</span>
                                                        <div className="space-y-3">
                                                            {['Fact', 'Trick', 'Opinion'].map((label, i) => (
                                                                <div key={i} className="flex gap-3 items-center">
                                                                    <button onClick={() => updateQuestion(idx, 'correctAnswer', q.options[i])} className={`w-10 h-10 rounded-xl border-4 border-white shadow-md flex items-center justify-center transition-all flex-shrink-0 ${q.correctAnswer === q.options[i] && q.options[i] !== '' ? 'bg-amber-500 text-white scale-105' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}><Check size={16} strokeWidth={3} /></button>
                                                                    <div className="flex-1 p-4 bg-white rounded-xl font-bold text-gray-700 border-2 border-amber-100 flex items-center gap-3">
                                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${i === 0 ? 'bg-green-100 text-green-600' : i === 1 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{label}</span>
                                                                        <input className="flex-1 bg-transparent outline-none font-bold" placeholder={`${label} text...`} value={q.options[i] || ''} onChange={e => { const newOpts = [...(q.options || ['', '', ''])]; newOpts[i] = e.target.value; updateQuestion(idx, 'options', newOpts); }} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="text-[10px] text-amber-500 mt-3 text-center font-bold uppercase tracking-widest">Click checkmark to mark the correct category</p>
                                                    </div>
                                                )}
                                                {q.qType === 'fill_blanks' && <div className="bg-gray-50 p-6 rounded-[2rem] mb-8"><textarea className="w-full bg-transparent outline-none font-mono text-lg text-gray-600 h-32" placeholder="Ex: The capital of France is [$Paris]." value={q.fillBlankText} onChange={e => updateQuestion(idx, 'fillBlankText', e.target.value)} /></div>}
                                                {q.qType === 'single_input' && <div className="flex gap-6 mb-8"><input className="flex-1 p-5 bg-gray-50 rounded-2xl font-bold outline-none" placeholder="Input Label" value={q.inputLabel} onChange={e => updateQuestion(idx, 'inputLabel', e.target.value)} /><input className="w-16 bg-transparent font-bold outline-none" type="number" placeholder="Max" value={q.maxChars} onChange={e => updateQuestion(idx, 'maxChars', e.target.value)} /></div>}
                                                {q.qType === 'multi_input' && <div className="mb-8 p-6 bg-gray-50 rounded-[2rem] border-2 border-gray-100"><div className="flex justify-between items-center mb-4"><span className="text-xs font-black text-gray-400 uppercase">Input Fields</span><button onClick={() => addMultiField(idx)} className="text-xs font-black text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors">+ ADD STEP</button></div><div className="space-y-3">{q.multiFields?.map((f, fIdx) => (<div key={fIdx} className="flex gap-4 items-center"><div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 font-bold flex items-center justify-center text-xs">{fIdx + 1}</div><input className="flex-1 p-3 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:border-indigo-400" placeholder="Label (e.g. Step 1)" value={f.label} onChange={e => updateMultiField(idx, fIdx, 'label', e.target.value)} /><input className="w-20 p-3 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:border-indigo-400" type="number" placeholder="Max" value={f.maxChars} onChange={e => updateMultiField(idx, fIdx, 'maxChars', e.target.value)} /><button onClick={() => removeMultiField(idx, fIdx)} className="text-red-300 hover:text-red-500"><X size={16} /></button></div>))}</div></div>}

                                                <div className="grid md:grid-cols-2 gap-6 pt-8 border-t-2 border-gray-100">
                                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100"><label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Brain size={12} /> AI Evaluation</label><textarea className="w-full bg-white p-3 rounded-xl text-sm font-medium outline-none min-h-[80px]" placeholder="Specific instructions for AI grading..." value={q.aiPrompt} onChange={e => updateQuestion(idx, 'aiPrompt', e.target.value)} /></div>
                                                    <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100"><label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest flex items-center gap-2 mb-2"><Lightbulb size={12} /> Success Tip</label><textarea className="w-full bg-white p-3 rounded-xl text-sm font-medium outline-none min-h-[80px]" placeholder="Shown after correct answer or completion..." value={q.postAnswerTip} onChange={e => updateQuestion(idx, 'postAnswerTip', e.target.value)} /></div>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={addQuestion} className="w-full py-8 border-4 border-dashed border-indigo-200 rounded-[3rem] text-indigo-400 font-black text-lg hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all">+ ADD QUESTION</button>
                                    </div>
                                </div>
                            )}
                            <button onClick={save} className="w-full bg-indigo-600 text-white p-8 rounded-[3rem] font-black text-3xl shadow-2xl transform hover:scale-[1.01] active:scale-95">{editId ? "UPDATE Activity" : "PUBLISH NEW Activity"}</button>
                        </div>
                    </div>
                )}

                {/* --- MAIN PREVIEW / RESPONSES --- */}
                {adminMode === 'editor' && !showAdd && selectedAct && (
                    <div className="max-w-6xl mx-auto">
                        {batchId && (
                            <div className="flex gap-4 p-2 bg-white rounded-3xl mb-8 border-2 border-gray-100 shadow-sm w-fit">
                                <button onClick={() => setPageViewMode('content')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${pageViewMode === 'content' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
                                    <Eye size={16} /> Preview
                                </button>
                                <button onClick={() => setPageViewMode('responses')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${pageViewMode === 'responses' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
                                    <Users size={16} /> Class Responses
                                </button>
                            </div>
                        )}

                        {pageViewMode === 'content' ? (
                            <>
                                <div className="relative">
                                    {!batchId && <button onClick={handleEdit} className="absolute -top-3 -right-3 z-50 bg-yellow-400 text-yellow-900 px-8 py-3 rounded-full font-black uppercase tracking-widest shadow-xl border-4 border-white hover:scale-105 transition-all flex items-center gap-2"><PenTool size={18} /> Edit</button>}
                                    <div className="opacity-90 border-8 border-dashed border-indigo-100 rounded-[4rem] overflow-hidden grayscale-[0.2] scale-[0.95]">
                                        <ActivityRenderer activity={selectedAct} readOnly={true} subIndex={previewSubIndex} setSubIndex={setPreviewSubIndex} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="grid gap-6">
                                {filteredStudents.map(student => {
                                    const responseRecord = allResponses.find(r => r.studentId === student._id && r.activityId === selectedAct._id);
                                    const answers = responseRecord?.responses || [];
                                    const studentStatus = getStudentStatus(student._id);

                                    return (
                                        <div key={student._id} className="bg-white p-8 rounded-[2.5rem] shadow-lg border-2 border-gray-50">
                                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-black text-indigo-600">{student.name[0]}</div>
                                                    <div>
                                                        <h3 className="font-black text-xl text-gray-800">{student.name}</h3>

                                                        {/* SHOW CURRENT PAGE & PERCENT HERE IN ROW */}
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {studentStatus.isDone ? (
                                                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">All Done</span>
                                                            ) : (
                                                                <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full uppercase">Currently on Activity {studentStatus.page} ({studentStatus.percent}%)</span>
                                                            )}
                                                            {responseRecord && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">• Submitted {new Date(responseRecord.submittedAt).toLocaleTimeString()}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                {responseRecord ? <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-black text-xs uppercase">Completed</div> : <div className="bg-gray-100 text-gray-400 px-4 py-2 rounded-full font-black text-xs uppercase">Pending</div>}
                                            </div>
                                            <div className="space-y-4">
                                                {selectedAct.practiceData.questions.map((q, qIdx) => (
                                                    <div key={qIdx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                        <div className="flex gap-4">
                                                            <div className="font-bold text-gray-400 text-xs mt-1">Q{qIdx + 1}</div>
                                                            <div className="flex-1">
                                                                <div
                                                                    className="prose prose-sm font-bold text-gray-700 mb-2 [&_p]:leading-normal [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
                                                                    dangerouslySetInnerHTML={{ __html: q.prompt }}
                                                                />
                                                                <p className={`font-mono text-sm ${answers[qIdx] ? 'text-indigo-600 font-bold' : 'text-red-400 italic'}`}>
                                                                    {answers[qIdx] ? (typeof answers[qIdx] === 'object' ? JSON.stringify(answers[qIdx]) : answers[qIdx]) : 'No Answer'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {adminMode === 'review' && selectedStudent && selectedAct && (
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-6 flex justify-between"><h2 className="text-3xl font-black text-indigo-900 italic">Reviewing: {selectedStudent.name}</h2></div>
                        <div className="border-8 border-indigo-200 rounded-[4rem] overflow-hidden"><ActivityRenderer activity={selectedAct} userResponses={getStudentResponseForAct(selectedAct._id)} readOnly={true} subIndex={previewSubIndex} setSubIndex={setPreviewSubIndex} /></div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 5. ADMIN: DASHBOARD (Batches & Worksheets) ---
// --- 5. ADMIN: DASHBOARD (Batches & Worksheets) ---
const AdminHome = () => {
    const [view, setView] = useState('batches');
    const [ws, setWs] = useState([]);
    const [title, setTitle] = useState("");
    const batches = ['Spark1', 'Spark2'];
    const sessions = ['Session 1', 'Session 2', 'Session 3', 'Session 4', 'Session 5'];
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [editingLimit, setEditingLimit] = useState(null); // { session, worksheetId, value }

    useEffect(() => { loadWorksheets(); }, []);
    useEffect(() => {
        if (selectedBatch) {
            axios.get(`${backend_api}/assignments/${selectedBatch}`).then(res => setAssignments(res.data));
        }
    }, [selectedBatch]);

    const loadWorksheets = () => axios.get(`${backend_api}/worksheets`).then(res => setWs(res.data));

    const handleAssign = async (sessionName, worksheetId, pageLimit) => {
        if (!worksheetId) return;
        await axios.post(`${backend_api}/assignments`, { batch: selectedBatch, session: sessionName, worksheetId, pageLimit: pageLimit || 0 });
        const res = await axios.get(`${backend_api}/assignments/${selectedBatch}`);
        setAssignments(res.data);
        document.getElementById(`ws-${sessionName}`).value = "";
        document.getElementById(`limit-${sessionName}`).value = "";
    };

    const handleUpdatePageLimit = async (sessionName, worksheetId, newLimit) => {
        await axios.post(`${backend_api}/assignments`, { batch: selectedBatch, session: sessionName, worksheetId, pageLimit: Number(newLimit) || 0 });
        const res = await axios.get(`${backend_api}/assignments/${selectedBatch}`);
        setAssignments(res.data);
        setEditingLimit(null);
    };

    return (
        <div className="p-12 min-h-screen bg-gray-50 font-sans">
            <div className="flex gap-8 mb-12">
                <button onClick={() => { setView('batches'); setSelectedBatch(null); }} className={`px-8 py-4 rounded-[2rem] font-black text-2xl uppercase transition-all ${view === 'batches' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white text-gray-400'}`}>Batches</button>
                <button onClick={() => setView('worksheets')} className={`px-8 py-4 rounded-[2rem] font-black text-2xl uppercase transition-all ${view === 'worksheets' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white text-gray-400'}`}>Worksheets</button>
            </div>

            {/* WORKSHEETS VIEW */}
            {view === 'worksheets' && (
                <div className="space-y-12">
                    <div className="flex gap-8 bg-white p-8 rounded-[3rem] shadow-xl">
                        <input className="flex-1 text-2xl font-bold outline-none px-4" placeholder="New Worksheet Title..." value={title} onChange={e => setTitle(e.target.value)} />
                        <button onClick={async () => { if (!title) return; await axios.post(`${backend_api}/worksheets`, { title }); setTitle(""); loadWorksheets(); }} className="bg-green-500 text-white px-8 py-4 rounded-full font-black uppercase">Create</button>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        {ws.map(w => (
                            <div key={w._id} className="bg-white p-8 rounded-[3rem] shadow-lg border-4 border-gray-100 hover:border-indigo-200 transition-all">
                                <h3 className="text-3xl font-black text-gray-800 mb-4">{w.title}</h3>
                                <div className="flex gap-4">
                                    <Link to={`/admin/worksheet/${w._id}`} className="bg-indigo-100 text-indigo-700 px-6 py-3 rounded-full font-bold">Edit Content</Link>
                                    <button onClick={() => navigator.clipboard.writeText(w._id)} className="bg-gray-100 text-gray-500 px-6 py-3 rounded-full font-bold flex items-center gap-2"><Copy size={16} /> Copy ID</button>
                                </div>
                                <div className="mt-4 text-xs font-mono text-gray-400 bg-gray-50 p-2 rounded-lg">{w._id}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* BATCH SELECTOR VIEW */}
            {view === 'batches' && !selectedBatch && (
                <div className="grid grid-cols-2 gap-12">
                    {batches.map(b => (
                        <button key={b} onClick={() => setSelectedBatch(b)} className="bg-white p-16 rounded-[4rem] shadow-2xl border-8 border-transparent hover:border-indigo-500 transition-all text-left group">
                            <Users size={64} className="text-indigo-200 mb-8 group-hover:text-indigo-600 transition-colors" />
                            <h2 className="text-6xl font-black text-indigo-900">{b}</h2>
                            <p className="text-xl font-bold text-gray-400 mt-4">Manage Sessions & Students</p>
                        </button>
                    ))}
                </div>
            )}

            {/* SELECTED BATCH VIEW */}
            {view === 'batches' && selectedBatch && (
                <div>
                    <button onClick={() => setSelectedBatch(null)} className="mb-8 font-black text-gray-400 uppercase flex items-center gap-2 hover:text-indigo-600"><ArrowLeft /> Back to Batches</button>
                    <h1 className="text-5xl font-black text-indigo-900 mb-10">{selectedBatch} <span className="text-indigo-300">Sessions</span></h1>
                    <div className="grid grid-cols-2 gap-6">
                        {sessions.map(sess => {
                            const assign = assignments.find(a => a.session === sess);
                            const activeWorksheets = assign?.worksheets || [];

                            return (
                                <div key={sess} className="bg-white rounded-[2rem] shadow-xl overflow-hidden">
                                    {/* Session Header */}
                                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-5 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <h3 className="text-xl font-black text-white">{sess}</h3>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${activeWorksheets.length > 0 ? 'bg-white/20 text-white' : 'bg-white/10 text-indigo-200'}`}>
                                                {activeWorksheets.length > 0 ? `${activeWorksheets.length} Worksheet${activeWorksheets.length > 1 ? 's' : ''}` : 'No Worksheets'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        {/* Linked Worksheets */}
                                        {activeWorksheets.length > 0 && (
                                            <div className="grid gap-3 mb-6">
                                                {activeWorksheets.map((wItem, idx) => {
                                                    const wsDetails = ws.find(w => w._id === wItem.worksheetId);
                                                    const isEditing = editingLimit?.session === sess && editingLimit?.worksheetId === wItem.worksheetId;

                                                    return (
                                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 transition-colors group">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm">{idx + 1}</div>
                                                                <div>
                                                                    <p className="font-bold text-gray-800">{wsDetails?.title || 'Worksheet'}</p>
                                                                    <p className="text-[10px] text-gray-400 font-mono">{wItem.worksheetId}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                {/* Page Limit - Editable */}
                                                                {isEditing ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="number"
                                                                            className="w-20 p-2 bg-white border-2 border-indigo-400 rounded-xl text-center font-bold outline-none"
                                                                            defaultValue={wItem.pageLimit || 0}
                                                                            autoFocus
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') handleUpdatePageLimit(sess, wItem.worksheetId, e.target.value);
                                                                                if (e.key === 'Escape') setEditingLimit(null);
                                                                            }}
                                                                        />
                                                                        <button onClick={(e) => {
                                                                            const input = e.target.closest('.flex').querySelector('input');
                                                                            handleUpdatePageLimit(sess, wItem.worksheetId, input.value);
                                                                        }} className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600"><Check size={16} /></button>
                                                                        <button onClick={() => setEditingLimit(null)} className="p-2 bg-gray-200 text-gray-600 rounded-xl hover:bg-gray-300"><X size={16} /></button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => setEditingLimit({ session: sess, worksheetId: wItem.worksheetId })}
                                                                        className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors flex items-center gap-2"
                                                                    >
                                                                        <span>Limit: {wItem.pageLimit || '∞'}</span>
                                                                        <PenTool size={12} />
                                                                    </button>
                                                                )}

                                                                {/* View Button */}
                                                                <Link to={`/admin/worksheet/${wItem.worksheetId}/batch/${selectedBatch}`} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors" title="Monitor Class">
                                                                    <Eye size={16} />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Add New Worksheet */}
                                        <div className="flex gap-3 items-center p-4 bg-indigo-50 rounded-2xl border-2 border-dashed border-indigo-200">
                                            <input className="flex-1 p-3 bg-white rounded-xl border-2 border-gray-100 font-mono text-sm outline-none focus:border-indigo-400 placeholder:text-gray-300" placeholder="Paste Worksheet ID..." id={`ws-${sess}`} />
                                            <input className="w-24 p-3 bg-white rounded-xl border-2 border-gray-100 font-bold text-sm outline-none focus:border-indigo-400 text-center placeholder:text-gray-300" type="number" placeholder="Limit" id={`limit-${sess}`} />
                                            <button onClick={() => {
                                                const wsId = document.getElementById(`ws-${sess}`).value;
                                                const limit = document.getElementById(`limit-${sess}`).value;
                                                handleAssign(sess, wsId, limit);
                                            }} className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-black transition-colors font-bold text-sm flex items-center gap-2 shadow-lg"><Check size={16} /> Link</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};






// --- 6. STUDENT: PLAYER (Updated: Worksheet Selection Menu) ---
const StudentPlayer = () => {
    const { studentId, batch, session } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);

    // Player States
    const [selectedWorksheet, setSelectedWorksheet] = useState(null); // The specific worksheet object chosen
    const [acts, setActs] = useState([]);
    const [idx, setIdx] = useState(-1); // -1 = activity list view
    const [subIdx, setSubIdx] = useState(0);
    const [ans, setAns] = useState({});

    // UI Tools
    const [showAI, setShowAI] = useState(false);
    const [showCalc, setShowCalc] = useState(false);
    const [showAgentChat, setShowAgentChat] = useState(false);
    const [isGrading, setIsGrading] = useState(false);
    const [currentGrade, setCurrentGrade] = useState(null);

    // 1. Initial Load: Just get the Session details (List of Worksheets)
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await axios.get(`${backend_api}/assignment/${batch}/${session}`);
                setAssignment(res.data);
            } catch (e) {
                console.error("Session load error", e);
            }
            setLoading(false);
        };
        fetchSession();
    }, [batch, session]);

    // 2. Load Specific Worksheet Content (Triggered by Click)
    const loadWorksheetContent = async (wsItem) => {
        setLoading(true);
        try {
            // Fetch activities (Updated to use student endpoint that excludes AI Prompt)
            const actsRes = await axios.get(`${backend_api}/student/activities/${wsItem.worksheetId}`);
            let rawActs = actsRes.data;

            // Apply Page Limit
            if (wsItem.pageLimit && wsItem.pageLimit > 0) {
                rawActs = rawActs.slice(0, wsItem.pageLimit);
            }

            // Fetch Student Responses for these activities
            const allInitialAns = {};
            for (const act of rawActs) {
                try {
                    const resp = await axios.get(`${backend_api}/responses/${studentId}/${act._id}`);
                    allInitialAns[act._id] = resp.data?.responses || [];
                } catch (e) { allInitialAns[act._id] = []; }
            }

            setActs(rawActs);
            setAns(allInitialAns);
            setSelectedWorksheet(wsItem); // This switches the view to Player
            setIdx(-1); // -1 = show activity list first
            setSubIdx(0); // Reset question index
        } catch (e) {
            console.error("Content load error", e);
        }
        setLoading(false);
    };

    // 3. Auto-Resume Logic (Inside the Player)
    useEffect(() => {
        if (selectedWorksheet && acts.length > 0 && acts[idx] && ans[acts[idx]._id]) {
            setShowCalc(false);
            setShowAI(false);

            const loadedResponses = ans[acts[idx]._id] || [];
            const questions = acts[idx].practiceData?.questions || [];
            const totalQuestions = questions.length;

            // Find first unanswered question
            const firstGapIndex = loadedResponses.findIndex(r => r === null || r === "" || (Array.isArray(r) && r.every(v => !v)));

            if (firstGapIndex !== -1) {
                setSubIdx(firstGapIndex);
            } else if (loadedResponses.length < totalQuestions && loadedResponses.length > 0) {
                setSubIdx(loadedResponses.length);
            } else {
                setSubIdx(0);
            }
        }
    }, [idx, acts, selectedWorksheet]);

    // 4. Sequential Lock Logic
    const isPageLocked = (pageIndex) => {
        if (pageIndex === 0) return false;

        const prevAct = acts[pageIndex - 1];
        if (!prevAct || !ans[prevAct._id]) return true;

        const prevResponses = ans[prevAct._id];
        const totalPrevQuestions = prevAct.practiceData?.questions?.length || 0;

        const isPrevComplete = totalPrevQuestions > 0 &&
            prevResponses.length >= totalPrevQuestions &&
            prevResponses.every(r => {
                if (!r) return false;
                if (Array.isArray(r)) return r.length > 0 && r.every(v => v && v.toString().trim() !== "");
                return r.toString().trim() !== "";
            });

        return isPrevComplete ? false : 'seq-lock';
    };

    // --- RENDER HELPERS ---
    const current = acts[idx];
    const lockStatus = selectedWorksheet ? isPageLocked(idx) : false;
    const currentQData = current?.practiceData?.questions?.[subIdx];

    const handleInput = (val, qIdx) => {
        if (lockStatus) return;
        const actId = current._id;
        setAns(prev => ({ ...prev, [actId]: Object.assign([...(prev[actId] || [])], { [qIdx]: val }) }));
    };

    const submitCurrentQuestion = async () => {
        if (lockStatus || isGrading) return;
        setIsGrading(true);
        try {
            const res = await axios.post(`${backend_api}/submit`, {
                studentId,
                worksheetId: selectedWorksheet.worksheetId,
                activityId: current._id,
                responses: ans[current._id] || [],
                questionIndex: subIdx // Send specific question index for grading
            });

            if (res.data.grade) {
                setCurrentGrade(res.data.grade);
            } else {
                setCurrentGrade({ score: 0, feedback: "Grading complete.", tip: "Review your answer." });
            }
        } catch (e) {
            console.error("Submission error", e);
            setCurrentGrade({ score: 0, feedback: "Error submitting.", tip: "Please try again." });
        }
        setIsGrading(false);
        setShowAI(true);
    };

    const handleContinue = () => {
        setShowAI(false);
        setCurrentGrade(null);
        const totalQ = current.practiceData?.questions?.length || 0;
        if (subIdx < totalQ - 1) {
            setSubIdx(prev => prev + 1);
        } else {
            // All questions done for this activity, go back to activity list
            setIdx(-1);
            setSubIdx(0);
        }
    };

    // --- MAIN VIEW ---
    if (loading) return <div className="h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse">Loading...</div>;
    if (!assignment) return <div className="h-screen flex items-center justify-center font-black text-gray-400">Session Not Found.</div>;

    // VIEW 1: WORKSHEET SELECTION MENU
    if (!selectedWorksheet) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                {/* Navbar */}
                <StudentNavbar studentId={studentId} />

                <div className="p-12">
                    <Link to={`/student/${studentId}/dashboard`} className="mb-8 inline-flex items-center gap-2 text-teal-600 font-bold text-sm hover:text-teal-800 transition-colors"><ArrowLeft size={16} /> Back to Home</Link>

                    <h1 className="text-3xl font-black text-gray-900 mb-2">{assignment.session}</h1>
                    <p className="text-gray-400 font-medium mb-10">Select a module to begin working</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assignment.worksheets && assignment.worksheets.map((wsItem, i) => (
                            <button key={i} onClick={() => loadWorksheetContent(wsItem)} className="bg-white p-8 rounded-2xl shadow-md border-2 border-transparent hover:border-teal-400 hover:shadow-lg transition-all group text-left">
                                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 font-black text-lg mb-4 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                                    {i + 1}
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{wsItem.title || "Untitled Worksheet"}</h3>
                                <span className="text-xs text-gray-400">Tap to start</span>
                            </button>
                        ))}
                        {(!assignment.worksheets || assignment.worksheets.length === 0) && (
                            <div className="col-span-3 text-center p-16 text-gray-400 font-medium border-2 border-dashed border-gray-200 rounded-2xl">No worksheets assigned yet.</div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // VIEW 2: ACTIVITY LIST (After selecting worksheet, before selecting activity)
    if (selectedWorksheet && idx === -1) {
        const completedCount = acts.filter((a, i) => {
            const responses = ans[a._id] || [];
            const totalQ = a.practiceData?.questions?.length || 0;
            return totalQ > 0 && responses.length >= totalQ && responses.every(r => r && r.toString().trim() !== "");
        }).length;

        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                {/* Top Header */}
                <StudentNavbar studentId={studentId} />

                <div className="p-8">
                    <button onClick={() => setSelectedWorksheet(null)} className="mb-6 inline-flex items-center gap-2 text-teal-600 font-bold text-sm hover:text-teal-800 transition-colors"><ArrowLeft size={16} /> Back to Home</button>

                    {/* Worksheet Info Card */}
                    <div className="max-w-2xl mx-auto mb-8 bg-teal-50 border border-teal-100 rounded-2xl p-6 text-center shadow-sm">
                        <div className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                            {assignment.session}
                        </div>
                        <h2 className="text-3xl font-black text-gray-800">{selectedWorksheet.title || "Worksheet"}</h2>
                        <p className="text-gray-500 text-sm mt-2 font-medium">Complete all activities below to finish this mission</p>
                    </div>

                    {/* Activity List */}
                    <div className="max-w-2xl mx-auto space-y-3">
                        {acts.map((a, i) => {
                            const status = isPageLocked(i);
                            const responses = ans[a._id] || [];
                            const totalQ = a.practiceData?.questions?.length || 0;
                            const isComplete = totalQ > 0 && responses.length >= totalQ && responses.every(r => r && r.toString().trim() !== "");
                            const isCurrent = !isComplete && (i === 0 || !isPageLocked(i));
                            const isLocked = status === 'seq-lock';

                            return (
                                <button
                                    key={i}
                                    onClick={() => !isLocked && setIdx(i)}
                                    disabled={isLocked}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${isComplete ? 'bg-white border-gray-100' :
                                        isCurrent ? 'bg-white border-teal-400 shadow-md' :
                                            'bg-white border-gray-100 opacity-60'
                                        }`}
                                >
                                    {/* Status Icon */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isComplete ? 'bg-teal-500 text-white' :
                                        isCurrent ? 'bg-teal-500 text-white' :
                                            'bg-gray-200 text-gray-400'
                                        }`}>
                                        {isComplete ? <Check size={20} /> :
                                            isLocked ? <Lock size={16} /> :
                                                <span className="font-bold">{i + 1}</span>}
                                    </div>

                                    {/* Activity Info */}
                                    <div className="flex-1">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide flex items-center gap-2">
                                            Activity {i + 1}
                                            {isCurrent && !isComplete && <span className="bg-pink-500 text-white px-2 py-0.5 rounded text-[8px]">NEXT</span>}
                                        </p>
                                        <p className="font-bold text-gray-800">{a.title}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Progress Bar */}
                    <div className="max-w-2xl mx-auto mt-8 bg-white p-6 rounded-xl border-2 border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-gray-700">Progress</span>
                            <span className="text-sm text-gray-400">{completedCount} / {acts.length} completed</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${(completedCount / acts.length) * 100}%` }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // VIEW 3: QUESTION VIEW (Single question at a time)
    const totalQuestions = current?.practiceData?.questions?.length || 0;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Header */}
            <StudentNavbar studentId={studentId} />

            {/* Back Button */}
            <div className="p-6">
                <button onClick={() => setIdx(-1)} className="inline-flex items-center gap-2 text-teal-600 font-bold text-sm hover:text-teal-800 transition-colors">
                    <ArrowLeft size={16} /> Back to Mission
                </button>
            </div>

            {/* Activity Header */}
            <div className="px-6">
                <div className="max-w-2xl mx-auto bg-gradient-to-r from-teal-500 to-teal-400 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded">🧩 {current.type || 'Activity'}</span>
                    </div>
                    <h1 className="text-xl font-bold">{current.title}</h1>
                </div>
            </div>

            {/* Question Counter with Navigation */}
            <div className="max-w-2xl mx-auto px-6 mt-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {/* Left Arrow - Go to previous questions */}
                        <button
                            onClick={() => subIdx > 0 && setSubIdx(subIdx - 1)}
                            disabled={subIdx === 0}
                            className={`p-2 rounded-lg transition-all ${subIdx > 0 ? 'bg-teal-100 text-teal-600 hover:bg-teal-200' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-gray-600 font-medium">Question {subIdx + 1} of {totalQuestions}</span>
                        {/* Right Arrow - Only if current is answered */}
                        <button
                            onClick={() => {
                                const currentAnswered = ans[current._id]?.[subIdx];
                                if (currentAnswered && subIdx < totalQuestions - 1) setSubIdx(subIdx + 1);
                            }}
                            disabled={!ans[current._id]?.[subIdx] || subIdx >= totalQuestions - 1}
                            className={`p-2 rounded-lg transition-all ${ans[current._id]?.[subIdx] && subIdx < totalQuestions - 1 ? 'bg-teal-100 text-teal-600 hover:bg-teal-200' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <div className="flex gap-1">
                        {Array.from({ length: totalQuestions }).map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full ${i === subIdx ? 'bg-teal-500' : i < subIdx ? 'bg-teal-200' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Question Content */}
            <div className="max-w-2xl mx-auto px-6 mt-6">
                {lockStatus === 'seq-lock' && (
                    <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-center gap-4 text-amber-700">
                        <AlertTriangle size={20} />
                        <span className="font-bold text-sm">Complete previous Activity first!</span>
                    </div>
                )}

                {/* Question Block - Render based on type */}
                <QuestionBlock
                    qData={currentQData}
                    qIndex={subIdx}
                    response={ans[current._id]?.[subIdx]}
                    onInput={(val) => handleInput(val, subIdx)}
                    readOnly={!!lockStatus || isGrading}
                />

                {/* Submit Button */}
                {!lockStatus && !isGrading && !showAI && (
                    <button
                        onClick={submitCurrentQuestion}
                        disabled={!ans[current._id]?.[subIdx]}
                        className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all ${ans[current._id]?.[subIdx]
                            ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Submit Answer
                    </button>
                )}

                {/* Grading State */}
                {isGrading && (
                    <div className="mt-6 p-6 bg-white rounded-2xl border-2 border-gray-100 flex items-center justify-center gap-4">
                        <div className="w-6 h-6 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
                        <span className="font-bold text-gray-600">AI is grading your answer...</span>
                    </div>
                )}

                {/* Calculator Panel */}
                {current.allowCalculator && showCalc && <SimpleCalculator />}

                {/* AI Agent Chat Panel */}
                {current.showAgent && showAgentChat && (
                    <div className={`fixed bottom-24 z-40 w-80 bg-white rounded-2xl shadow-2xl border overflow-hidden ${current.allowCalculator && showCalc ? 'right-[290px]' : 'right-6'}`}>
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Bot size={20} />
                                <span className="font-bold">AI Tutor</span>
                            </div>
                            <button onClick={() => setShowAgentChat(false)} className="p-1 hover:bg-white/20 rounded"><X size={16} /></button>
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
                )}

                {/* Floating Tool Buttons */}
                <div className="fixed bottom-6 right-6 z-50 flex gap-3">
                    {current.showAgent && (
                        <button
                            onClick={() => setShowAgentChat(!showAgentChat)}
                            className={`p-4 rounded-full shadow-xl hover:scale-110 transition-all ${showAgentChat ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border-2 border-purple-200'}`}
                        >
                            <Bot size={24} />
                        </button>
                    )}
                    {current.allowCalculator && (
                        <button
                            onClick={() => setShowCalc(!showCalc)}
                            className={`p-4 rounded-full shadow-xl hover:scale-110 transition-all ${showCalc ? 'bg-teal-600 text-white' : 'bg-white text-teal-600 border-2 border-teal-200'}`}
                        >
                            <Calculator size={24} />
                        </button>
                    )}
                </div>
            </div>

            {/* AI Grading Modal */}
            {showAI && (
                <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-gradient-to-r from-teal-500 to-teal-400 p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl"><Bot size={24} /></div>
                                <div>
                                    <h3 className="font-bold text-lg">AI Evaluation</h3>
                                    <p className="text-teal-100 text-xs">Analysis Complete</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black">{currentGrade?.score}</span>
                                <span className="text-teal-200 text-lg">/10</span>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <span className="text-teal-500 font-bold text-xs uppercase tracking-wide block mb-1">AI Feedback</span>
                                <p className="text-gray-700 italic">"{currentGrade?.feedback}"</p>
                            </div>
                            {(currentGrade?.tip || currentQData?.postAnswerTip) && (
                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3">
                                    <div className="p-2 bg-yellow-400 text-white rounded-lg h-fit"><Lightbulb size={16} /></div>
                                    <div>
                                        <span className="text-yellow-600 font-bold text-xs uppercase block mb-1">Pro Tip</span>
                                        <p className="text-yellow-800 text-sm">{currentGrade?.tip || currentQData?.postAnswerTip}</p>
                                    </div>
                                </div>
                            )}

                            {/* Conditional Button based on Score */}
                            {currentGrade?.score < 5 ? (
                                <button
                                    onClick={() => setShowAI(false)}
                                    className="w-full bg-red-500 text-white py-4 rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={20} /> Try Again
                                </button>
                            ) : (
                                <button
                                    onClick={handleContinue}
                                    className="w-full bg-teal-500 text-white py-4 rounded-xl font-bold hover:bg-teal-600 transition-all"
                                >
                                    {subIdx < totalQuestions - 1 ? 'Next Question →' : 'Complete Activity ✓'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};








// --- 7. STUDENT: DASHBOARD (Session Selector) ---
const StudentDashboard = () => {
    const { studentId } = useParams();
    const [student, setStudent] = useState(null);
    const sessions = ['Session 1', 'Session 2', 'Session 3', 'Session 4', 'Session 5'];

    useEffect(() => {
        const fetchStudent = async () => {
            const res = await axios.get(`${backend_api}/students`);
            const found = res.data.find(s => s._id === studentId);
            setStudent(found);
        };
        fetchStudent();
    }, [studentId]);

    if (!student) return <div className="p-10">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans relative overflow-hidden">
            {/* Navbar */}
            <StudentNavbar studentId={studentId} />

            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100 rounded-full blur-[100px] opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-100 rounded-full blur-[100px] opacity-50 pointer-events-none translate-y-1/2 -translate-x-1/2" />

            <div className="p-12 max-w-6xl mx-auto relative z-10">
                <header className="mb-16">
                    <h1 className="text-gray-900 text-5xl font-black mb-2">Hello, <span className="text-teal-600">{student.name}</span></h1>
                    <div className="flex items-center gap-3 text-gray-500 font-bold uppercase tracking-widest text-sm">
                        <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full">{student.batch}</span>
                        <span>•</span>
                        <span>Learning Dashboard</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map(sess => (
                        <Link key={sess} to={`/student/${studentId}/${student.batch}/${sess}`} className="bg-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group border-2 border-transparent hover:border-teal-100">
                            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
                                <Layers size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 mb-2">{sess}</h2>
                            <p className="text-gray-400 text-sm font-medium mb-6">Explore the activities in this session.</p>
                            <div className="flex items-center text-teal-600 font-bold uppercase text-xs tracking-widest gap-2 group-hover:gap-3 transition-all">
                                Open Session <ArrowRight size={16} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- 8. LOGIN PAGE (Replaces Home) ---
const LoginPage = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState('student'); // 'student' | 'admin'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (userType === 'admin') {
            if (username === 'admin' && password === 'groundzero123') {
                navigate('/admin');
            } else {
                setError('Invalid Admin Credentials');
            }
        } else {
            // Student Login Logic
            const student = StudentList.find(s => s.name.toLowerCase() === username.trim().toLowerCase());
            if (student) {
                if (password === 'groundzero123') {
                    navigate(`/student/${student.id}/dashboard`);
                } else {
                    setError('Invalid Password');
                }
            } else {
                // For better UX during prototype, maybe hint? But strictly:
                setError('Student Not Found');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000" />
            </div>

            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative z-10 border-4 border-gray-100">
                {/* Toggle Header */}
                <div className="flex">
                    <button
                        onClick={() => { setUserType('student'); setError(''); setUsername(''); setPassword(''); }}
                        className={`flex-1 py-6 font-black text-sm uppercase tracking-widest transition-all ${userType === 'student' ? 'bg-teal-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                    >
                        Student Login
                    </button>
                    <button
                        onClick={() => { setUserType('admin'); setError(''); setUsername(''); setPassword(''); }}
                        className={`flex-1 py-6 font-black text-sm uppercase tracking-widest transition-all ${userType === 'admin' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                    >
                        Admin Login
                    </button>
                </div>

                <div className="p-8 pt-10">
                    <div className="text-center mb-8">
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${userType === 'student' ? 'bg-teal-100 text-teal-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            {userType === 'student' ? <User size={40} /> : <Settings size={40} />}
                        </div>
                        <h2 className="text-3xl font-black text-gray-800 tracking-tight">
                            {userType === 'student' ? 'Student Portal' : 'Instructor Access'}
                        </h2>
                        <p className="text-gray-400 text-sm font-medium mt-1">Enter your credentials to continue</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center border-2 border-red-100 flex items-center justify-center gap-2 animate-shake">
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Username</label>
                            <input
                                type="text"
                                className={`w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-4 transition-all font-bold text-gray-700 placeholder-gray-300 ${userType === 'student' ? 'focus:border-teal-300 focus:ring-teal-100' : 'focus:border-indigo-300 focus:ring-indigo-100'}`}
                                placeholder={userType === 'student' ? "Enter your name (e.g. Adarsh)" : "Enter admin username"}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                className={`w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-4 transition-all font-bold text-gray-700 placeholder-gray-300 ${userType === 'student' ? 'focus:border-teal-300 focus:ring-teal-100' : 'focus:border-indigo-300 focus:ring-indigo-100'}`}
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-5 rounded-xl font-black text-lg text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4 flex items-center justify-center gap-2 ${userType === 'student' ? 'bg-teal-500 hover:bg-teal-600 shadow-teal-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
                        >
                            Login <ArrowRight size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- 9. APP ROUTER ---
export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/admin" element={<AdminHome />} />
                <Route path="/admin/worksheet/:id" element={<AdminEditor />} />
                <Route path="/admin/worksheet/:id/batch/:batchId" element={<AdminEditor />} />
                <Route path="/student/:studentId/dashboard" element={<StudentDashboard />} />
                <Route path="/student/:studentId/:batch/:session" element={<StudentPlayer />} />
            </Routes>
        </Router>
    );
}