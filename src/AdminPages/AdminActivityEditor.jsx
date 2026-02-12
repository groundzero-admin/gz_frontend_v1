import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import ListItem from '@tiptap/extension-list-item';
import {
    FaArrowLeft, FaSave, FaPlus, FaTrash, FaImage, FaVideo, FaCode,
    FaBold, FaItalic, FaListUl, FaListOl, FaQuoteRight, FaHeading, FaTimes
} from "react-icons/fa";
import {
    listActivities, createActivity, getActivity, updateActivity, deleteActivity,
    listBatchActivities, createBatchActivity, getBatchActivity, updateBatchActivity, deleteBatchActivity
} from "../api.js";

// --- Rich Text Editor ---
const MenuBar = ({ editor }) => {
    if (!editor) return null;

    const isActive = (type, opts) => editor.isActive(type, opts) ? 'bg-gray-200 text-black' : 'text-gray-500 hover:bg-gray-100';

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50 rounded-t-lg">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded ${isActive('bold')}`} title="Bold"><FaBold size={14} /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded ${isActive('italic')}`} title="Italic"><FaItalic size={14} /></button>
            <div className="w-px bg-gray-300 mx-1" />
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-1.5 rounded ${isActive('heading', { level: 1 })}`} title="Heading 1"><FaHeading size={14} /></button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded ${isActive('bulletList')}`} title="Bullet List"><FaListUl size={14} /></button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded ${isActive('orderedList')}`} title="Ordered List"><FaListOl size={14} /></button>
            <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-1.5 rounded ${isActive('blockquote')}`} title="Quote"><FaQuoteRight size={14} /></button>
        </div>
    );
};

const RichTextEditor = ({ content, onChange, placeholder }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            ListItem
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[100px] p-4',
            },
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '');
        }
    }, [content, editor]);

    return (
        <div className="border rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-black">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} placeholder={placeholder} />
        </div>
    );
};

// --- Main Component ---
const AdminActivityEditor = () => {
    const { templateSessionId, sectionId, activityId: routeActivityId, batchSectionId } = useParams();
    const navigate = useNavigate();

    // Template Mode Check
    const isTemplateMode = location.pathname.includes('template-section');
    const displaySectionId = isTemplateMode ? sectionId : batchSectionId;

    // State
    const [activities, setActivities] = useState([]);
    const [sidebarLoading, setSidebarLoading] = useState(false);
    const [selectedActId, setSelectedActId] = useState(null);
    const [isLoadingAct, setIsLoadingAct] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const initialForm = {
        type: 'practice',
        title: '',
        order: 0,
        allowCalculator: false,
        showAgent: false,
        readingData: { link: '' },
        practiceData: { description: '', questions: [] }
    };
    const [form, setForm] = useState(initialForm);

    // Initial Load
    useEffect(() => {
        fetchSidebar();
        if (routeActivityId) {
            setSelectedActId(routeActivityId);
        }
    }, [displaySectionId]);

    // Fetch Activity Details when selected changes
    useEffect(() => {
        if (selectedActId) {
            fetchActivityDetails(selectedActId);
        } else {
            setForm(initialForm);
        }
    }, [selectedActId]);

    const fetchSidebar = async () => {
        setSidebarLoading(true);
        try {
            const apiCall = isTemplateMode ? listActivities : listBatchActivities;
            const res = await apiCall(displaySectionId);
            if (res.success) {
                setActivities(res.data?.activities || []);
            }
        } catch (err) {
            console.error("Sidebar load error", err);
        } finally {
            setSidebarLoading(false);
        }
    };

    const fetchActivityDetails = async (id) => {
        setIsLoadingAct(true);
        try {
            const apiCall = isTemplateMode ? getActivity : getBatchActivity;
            const res = await apiCall(id);
            if (res.success) {
                const act = res.data?.activity;
                // Ensure structure
                setForm({
                    ...initialForm,
                    ...act,
                    readingData: act.readingData || { link: '' },
                    practiceData: act.practiceData || { description: '', questions: [] }
                });
            }
        } catch (err) {
            console.error("Activity load error", err);
        } finally {
            setIsLoadingAct(false);
        }
    };

    const handleCreateNew = () => {
        setSelectedActId(null);
        setForm(initialForm);
        navigate(isTemplateMode
            ? `/admin/dashboard/template-section/${sectionId}/activities`
            : `/admin/dashboard/batch-section/${batchSectionId}/activities`
        );
    };

    const handleSave = async () => {
        if (!form.title) return alert("Title is required");
        setIsSaving(true);
        try {
            if (selectedActId) {
                // Update
                const apiCall = isTemplateMode ? updateActivity : updateBatchActivity;
                await apiCall(selectedActId, form);
            } else {
                // Create
                const apiCall = isTemplateMode ? createActivity : createBatchActivity;
                const res = await apiCall(displaySectionId, form);
                if (res.success) {
                    setSelectedActId(res.data?.activity?._id);
                    // Update URL without reload
                    navigate(isTemplateMode
                        ? `/admin/dashboard/template-section/${sectionId}/activities`
                        : `/admin/dashboard/batch-section/${batchSectionId}/activities`
                    );
                    fetchSidebar(); // Refresh list to show new item
                }
            }
            alert("Saved successfully!");
            fetchSidebar();
        } catch (err) {
            console.error(err);
            alert("Failed to save.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this activity?")) return;
        try {
            const apiCall = isTemplateMode ? deleteActivity : deleteBatchActivity;
            await apiCall(id);
            fetchSidebar();
            if (selectedActId === id) handleCreateNew();
        } catch (err) {
            alert("Failed to delete.");
        }
    };

    // --- Form Handlers ---
    const updateQuestion = (idx, field, val) => {
        const newQs = [...form.practiceData.questions];
        newQs[idx] = { ...newQs[idx], [field]: val };
        setForm({ ...form, practiceData: { ...form.practiceData, questions: newQs } });
    };

    const addQuestion = (type) => {
        const newQ = {
            qType: type,
            prompt: '',
            aiPrompt: 'Grade based on correctness.',
            postAnswerTip: '',
            options: type === 'mcq' || type === 'msq' ? ['Option 1', 'Option 2'] : [],
            correctAnswer: '',
            correctAnswers: [],
            inputLabel: 'Target Answer',
            maxChars: 100,
            fillBlankText: 'The sky is <blank>.',
            media: []
        };
        setForm({
            ...form,
            practiceData: { ...form.practiceData, questions: [...form.practiceData.questions, newQ] }
        });
    };

    const removeQuestion = (idx) => {
        const newQs = form.practiceData.questions.filter((_, i) => i !== idx);
        setForm({ ...form, practiceData: { ...form.practiceData, questions: newQs } });
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full"><FaArrowLeft /></button>
                    <h2 className="font-bold text-lg">Activities</h2>
                    <button onClick={handleCreateNew} className="p-2 bg-black text-white rounded-full hover:bg-gray-800"><FaPlus size={12} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {sidebarLoading ? <p className="p-4 text-center text-gray-400">Loading...</p> : activities.map(act => (
                        <div
                            key={act._id}
                            onClick={() => setSelectedActId(act._id)}
                            className={`p-3 rounded-lg cursor-pointer flex justify-between items-center group transition ${selectedActId === act._id ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                        >
                            <span className="truncate w-48 font-medium">{act.title}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(act._id); }}
                                className={`p-1.5 rounded opacity-0 group-hover:opacity-100 transition ${selectedActId === act._id ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-white text-gray-500'}`}
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Toolbar */}
                <div className="h-16 bg-white border-b flex items-center justify-between px-8">
                    <h1 className="text-xl font-bold">{selectedActId ? 'Edit Activity' : 'New Activity'}</h1>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    >
                        <FaSave /> {isSaving ? 'Saving...' : 'Save Activity'}
                    </button>
                </div>

                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto space-y-8 pb-20">
                        {/* Basic Info */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Configuration</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={form.type === 'practice'}
                                            onChange={() => setForm({ ...form, type: 'practice' })}
                                        /> Practice (Questions)
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={form.type === 'reading'}
                                            onChange={() => setForm({ ...form, type: 'reading' })}
                                        /> Reading (Link)
                                    </label>
                                    <div className="w-px bg-gray-200 mx-2" />
                                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                                        <input
                                            type="checkbox"
                                            checked={form.allowCalculator}
                                            onChange={e => setForm({ ...form, allowCalculator: e.target.checked })}
                                        /> Calculator
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                                        <input
                                            type="checkbox"
                                            checked={form.showAgent}
                                            onChange={e => setForm({ ...form, showAgent: e.target.checked })}
                                        /> AI Tutor
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Activity Title</label>
                                <input
                                    className="w-full text-2xl font-bold border-b-2 border-gray-200 focus:border-black outline-none py-2"
                                    placeholder="e.g., Intro to Algebra"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                />
                            </div>
                            {form.type === 'reading' && (
                                <div>
                                    <label className="block text-sm font-bold mb-1">Document Link / URL</label>
                                    <input
                                        className="w-full p-2 border rounded-lg bg-gray-50"
                                        placeholder="https://..."
                                        value={form.readingData.link}
                                        onChange={e => setForm({ ...form, readingData: { link: e.target.value } })}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Questions Editor (Practice Mode) */}
                        {form.type === 'practice' && (
                            <div className="space-y-6">
                                {form.practiceData.questions.map((q, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border relative group">
                                        {/* Question Header */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                                <select
                                                    value={q.qType}
                                                    onChange={e => updateQuestion(idx, 'qType', e.target.value)}
                                                    className="font-bold bg-transparent outline-none cursor-pointer hover:underline"
                                                >
                                                    <option value="mcq">Multiple Choice</option>
                                                    <option value="msq">Multiple Select</option>
                                                    <option value="single_input">Short Answer</option>
                                                    <option value="fill_blanks">Fill Blanks</option>
                                                    <option value="fact_trick">Fact / Trick / Opinion</option>
                                                </select>
                                            </div>
                                            <button onClick={() => removeQuestion(idx)} className="text-gray-300 hover:text-red-500"><FaTrash /></button>
                                        </div>

                                        {/* Prompt */}
                                        <div className="mb-4">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Question Prompt</label>
                                            <RichTextEditor
                                                content={q.prompt}
                                                onChange={val => updateQuestion(idx, 'prompt', val)}
                                                placeholder="Type your question here..."
                                            />
                                        </div>

                                        {/* Media Inputs (Simplified) */}
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Attachment URL (Optional)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    className="flex-1 p-2 text-sm border rounded bg-white"
                                                    placeholder="Image or Video URL..."
                                                    value={q.media?.[0]?.url || ''}
                                                    onChange={e => {
                                                        // Simple single media handling for now
                                                        const newVal = e.target.value;
                                                        const newMedia = newVal ? [{ url: newVal, mediaType: 'image' }] : [];
                                                        updateQuestion(idx, 'media', newMedia);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Specific Type Inputs */}
                                        {(q.qType === 'mcq' || q.qType === 'msq') && (
                                            <div className="mb-4">
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Options</label>
                                                {q.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className="flex items-center gap-2 mb-2">
                                                        <div className={`w-4 h-4 border rounded-full ${q.qType === 'mcq' && q.correctAnswer === opt ? 'bg-green-500' : ''} ${q.qType === 'msq' && q.correctAnswers?.includes(opt) ? 'bg-green-500' : ''}`} />
                                                        <input
                                                            className="flex-1 p-2 border rounded text-sm"
                                                            value={opt}
                                                            onChange={e => {
                                                                const newOpts = [...q.options];
                                                                newOpts[oIdx] = e.target.value;
                                                                updateQuestion(idx, 'options', newOpts);
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                // Toggle correct answer logic
                                                                if (q.qType === 'mcq') updateQuestion(idx, 'correctAnswer', opt);
                                                                else {
                                                                    const current = q.correctAnswers || [];
                                                                    const text = opt;
                                                                    if (current.includes(text)) updateQuestion(idx, 'correctAnswers', current.filter(c => c !== text));
                                                                    else updateQuestion(idx, 'correctAnswers', [...current, text]);
                                                                }
                                                            }}
                                                            className="text-xs text-green-600 font-bold hover:underline"
                                                        >
                                                            Mark Correct
                                                        </button>
                                                        <button onClick={() => updateQuestion(idx, 'options', q.options.filter((_, i) => i !== oIdx))} className="text-gray-400 hover:text-red-500"><FaTimes /></button>
                                                    </div>
                                                ))}
                                                <button onClick={() => updateQuestion(idx, 'options', [...q.options, `Option ${q.options.length + 1}`])} className="text-sm text-blue-600 font-medium">+ Add Option</button>
                                            </div>
                                        )}

                                        {q.qType === 'single_input' && (
                                            <div className="mb-4">
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Valid Answers (Comma separated)</label>
                                                <input
                                                    className="w-full p-2 border rounded bg-yellow-50 font-mono text-sm"
                                                    value={q.correctAnswer}
                                                    onChange={e => updateQuestion(idx, 'correctAnswer', e.target.value)}
                                                    placeholder="e.g., 42, forty-two, 42.0"
                                                />
                                            </div>
                                        )}

                                        {/* AI Grading Config */}
                                        <div className="grid grid-cols-2 gap-4 mt-6 border-t pt-4">
                                            <div>
                                                <label className="text-xs font-bold text-purple-600 uppercase mb-1 block">AI Grading Prompt</label>
                                                <textarea
                                                    className="w-full p-2 border border-purple-100 rounded bg-purple-50 text-xs min-h-[80px]"
                                                    value={q.aiPrompt}
                                                    onChange={e => updateQuestion(idx, 'aiPrompt', e.target.value)}
                                                    placeholder="Instructions for the AI grader..."
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-blue-600 uppercase mb-1 block">Post-Answer Tip/Feedback</label>
                                                <textarea
                                                    className="w-full p-2 border border-blue-100 rounded bg-blue-50 text-xs min-h-[80px]"
                                                    value={q.postAnswerTip}
                                                    onChange={e => updateQuestion(idx, 'postAnswerTip', e.target.value)}
                                                    placeholder="Helpful explanation shown after submission..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Question Buttons */}
                                <div className="grid grid-cols-3 gap-2 py-4">
                                    {['mcq', 'single_input', 'fill_blanks'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => addQuestion(type)}
                                            className="p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-black hover:bg-gray-50 text-gray-500 hover:text-black font-bold transition flex items-center justify-center gap-2"
                                        >
                                            <FaPlus /> Add {type.replace('_', ' ').toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminActivityEditor;
