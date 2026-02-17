import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import ListItem from '@tiptap/extension-list-item';
import {
    FaArrowLeft, FaSave, FaPlus, FaTrash, FaImage, FaVideo, FaCode,
    FaBold, FaItalic, FaListUl, FaListOl, FaQuoteRight, FaHeading, FaTimes,
    FaCheck, FaGlobe, FaChevronRight, FaUpload, FaSpinner
} from "react-icons/fa";
import {
    listActivities, createActivity, getActivity, updateActivity, deleteActivity,
    listBatchActivities, createBatchActivity, getBatchActivity, updateBatchActivity, deleteBatchActivity,
    uploadMedia
} from "../api.js";

// ──────────────────────────────────────────
//  Rich Text Editor
// ──────────────────────────────────────────

const MenuBar = ({ editor }) => {
    if (!editor) return null;
    const isActive = (type, opts) => editor.isActive(type, opts) ? 'bg-gray-200 text-black' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400';
    return (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-t-lg transition-colors">
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
        extensions: [StarterKit, TextStyle, Color, ListItem],
        content: content || '',
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: { class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[100px] p-4' },
        },
    });
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '');
        }
    }, [content, editor]);
    return (
        <div className="border rounded-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white transition-colors">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} placeholder={placeholder} className="dark:text-gray-200" />
        </div>
    );
};

// ──────────────────────────────────────────
//  Main Component
// ──────────────────────────────────────────

const AdminActivityEditor = () => {
    const { isDark } = useOutletContext();
    const { templateSessionId, sectionId, activityId: routeActivityId, batchSectionId } = useParams();
    const navigate = useNavigate();

    const isTemplateMode = location.pathname.includes('template-section');
    const displaySectionId = isTemplateMode ? sectionId : batchSectionId;

    const [activities, setActivities] = useState([]);
    const [sidebarLoading, setSidebarLoading] = useState(false);
    const [selectedActId, setSelectedActId] = useState(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [isLoadingAct, setIsLoadingAct] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingMedia, setUploadingMedia] = useState(null); // { qIdx, type } when uploading
    const [breadcrumb, setBreadcrumb] = useState({ sectionName: '', sessionTitle: '', batchOrTemplateName: '', sessionId: '' });
    const fileInputRefs = useRef({});

    const defaultQuestion = {
        qType: 'mcq',
        prompt: '',
        aiPrompt: 'Evaluate based on correctness.',
        postAnswerTip: '',
        allowAiFeedback: false,
        answer_embed_url: '',
        options: ['', ''],
        correctAnswer: '',
        correctAnswers: [],
        inputLabel: '',
        maxChars: 500,
        fillBlankText: '',
        multiFields: [{ label: 'Step 1', maxChars: 100, fieldType: 'input', options: [] }],
        media: []
    };

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

    // Load sidebar
    useEffect(() => {
        fetchSidebar();
        if (routeActivityId) setSelectedActId(routeActivityId);
    }, [displaySectionId]);

    useEffect(() => {
        if (selectedActId) {
            setIsCreatingNew(false);
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
                setBreadcrumb({
                    sectionName: res.data?.sectionName || '',
                    sessionTitle: res.data?.sessionTitle || '',
                    batchOrTemplateName: res.data?.batchOrTemplateName || '',
                    sessionId: res.data?.sessionId || '',
                });
            }
        } catch (err) { console.error("Sidebar load error", err); }
        finally { setSidebarLoading(false); }
    };

    const fetchActivityDetails = async (id) => {
        setIsLoadingAct(true);
        try {
            const apiCall = isTemplateMode ? getActivity : getBatchActivity;
            const res = await apiCall(id);
            if (res.success) {
                const act = res.data?.activity;
                setForm({
                    ...initialForm,
                    ...act,
                    readingData: act.readingData || { link: '' },
                    practiceData: act.practiceData || { description: '', questions: [] }
                });
            }
        } catch (err) { console.error("Activity load error", err); }
        finally { setIsLoadingAct(false); }
    };

    const handleCreateNew = () => {
        setSelectedActId(null);
        setIsCreatingNew(true);
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
                const apiCall = isTemplateMode ? updateActivity : updateBatchActivity;
                await apiCall(selectedActId, form);
            } else {
                const apiCall = isTemplateMode ? createActivity : createBatchActivity;
                const res = await apiCall(displaySectionId, form);
                if (res.success) {
                    setSelectedActId(res.data?.activity?._id);
                    navigate(isTemplateMode
                        ? `/admin/dashboard/template-section/${sectionId}/activities`
                        : `/admin/dashboard/batch-section/${batchSectionId}/activities`
                    );
                    fetchSidebar();
                }
            }
            alert("Saved successfully!");
            fetchSidebar();
        } catch (err) {
            console.error(err);
            alert("Failed to save.");
        } finally { setIsSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this activity?")) return;
        try {
            const apiCall = isTemplateMode ? deleteActivity : deleteBatchActivity;
            await apiCall(id);
            fetchSidebar();
            if (selectedActId === id) handleCreateNew();
        } catch (err) { alert("Failed to delete."); }
    };

    // ──────────────────────────────────────
    //  Question Helpers
    // ──────────────────────────────────────

    const updateQuestion = (idx, field, value) => {
        const newQs = [...form.practiceData.questions];
        let updatedQ = { ...newQs[idx], [field]: value };

        // Type-specific defaults when switching qType
        if (field === 'qType') {
            if (value === 'fact_trick') {
                updatedQ.options = ['Fact', 'Trick', 'Opinion'];
                updatedQ.correctAnswer = '';
            }
            if (value === 'msq') {
                updatedQ.options = updatedQ.options?.length >= 2 ? updatedQ.options : ['', ''];
                updatedQ.correctAnswers = [];
            }
            if (value === 'mcq') {
                updatedQ.options = updatedQ.options?.length >= 2 ? updatedQ.options : ['', ''];
                updatedQ.correctAnswer = '';
            }
            if (value === 'multi_input' && (!updatedQ.multiFields || updatedQ.multiFields.length === 0)) {
                updatedQ.multiFields = [{ label: 'Step 1', maxChars: 100 }];
            }
        }
        newQs[idx] = updatedQ;
        setForm({ ...form, practiceData: { ...form.practiceData, questions: newQs } });
    };

    const addQuestion = () => {
        setForm({
            ...form,
            practiceData: {
                ...form.practiceData,
                questions: [...form.practiceData.questions, { ...defaultQuestion }]
            }
        });
    };

    const removeQuestion = (idx) => {
        const newQs = form.practiceData.questions.filter((_, i) => i !== idx);
        setForm({ ...form, practiceData: { ...form.practiceData, questions: newQs } });
    };

    // Multi-field helpers
    const addMultiField = (qIdx) => {
        const newQs = [...form.practiceData.questions];
        if (!newQs[qIdx].multiFields) newQs[qIdx].multiFields = [];
        newQs[qIdx].multiFields.push({ label: `Step ${newQs[qIdx].multiFields.length + 1}`, maxChars: 100, fieldType: 'input', options: [], correctAnswers: [] });
        setForm({ ...form, practiceData: { ...form.practiceData, questions: newQs } });
    };

    const updateMultiField = (qIdx, fIdx, key, val) => {
        const newQs = [...form.practiceData.questions];
        newQs[qIdx].multiFields[fIdx][key] = val;
        setForm({ ...form, practiceData: { ...form.practiceData, questions: newQs } });
    };

    const removeMultiField = (qIdx, fIdx) => {
        const newQs = [...form.practiceData.questions];
        newQs[qIdx].multiFields = newQs[qIdx].multiFields.filter((_, i) => i !== fIdx);
        setForm({ ...form, practiceData: { ...form.practiceData, questions: newQs } });
    };

    // Per-question media helpers
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

    // Cloudinary file upload handler
    const handleFileUpload = async (qIdx, mediaType, file) => {
        if (!file) return;
        setUploadingMedia({ qIdx, type: mediaType });
        try {
            const res = await uploadMedia(file, mediaType);
            if (res.success) {
                const newQs = [...form.practiceData.questions];
                if (!newQs[qIdx].media) newQs[qIdx].media = [];
                newQs[qIdx].media.push({ url: res.data.url, mediaType: res.data.mediaType });
                setForm({ ...form, practiceData: { ...form.practiceData, questions: newQs } });
            } else {
                alert('Upload failed: ' + (res.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Upload error', err);
            alert('Upload failed.');
        } finally {
            setUploadingMedia(null);
        }
    };

    const triggerFileInput = (qIdx, mediaType) => {
        const key = `${qIdx}-${mediaType}`;
        if (fileInputRefs.current[key]) {
            fileInputRefs.current[key].click();
        }
    };

    // ──────────────────────────────────────
    //  Render
    // ──────────────────────────────────────

    return (
        <div
            className="flex h-[calc(100vh)] w-[calc(100%+3rem)] md:w-[calc(100%+5rem)] -m-6 md:-m-10 overflow-hidden font-sans transition-colors duration-300"
            style={{
                backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`, // Was bg-gray-50
                color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
            }}
        >
            {/* Sidebar */}
            <div
                className="w-80 border-r flex flex-col transition-colors duration-300"
                style={{
                    backgroundColor: `var(${isDark ? "--bg-dark" : "#ffffff"})`,
                    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`
                }}
            >
                <div className="p-4 border-b space-y-3" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
                    <div className="flex items-center justify-between">
                        <button onClick={() => {
                            if (breadcrumb.sessionId) {
                                navigate(isTemplateMode
                                    ? `/admin/dashboard/template-session/${breadcrumb.sessionId}/sections`
                                    : `/admin/dashboard/batch-session/${breadcrumb.sessionId}/sections`
                                );
                            } else {
                                navigate(-1);
                            }
                        }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition" title="Back to Sections">
                            <FaArrowLeft />
                        </button>
                        <h2 className="font-bold text-lg">Activities</h2>
                        <button onClick={handleCreateNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium transition shadow-lg">
                            <FaPlus size={10} /> Add Activity
                        </button>
                    </div>
                    {/* Breadcrumb */}
                    {breadcrumb.batchOrTemplateName && (
                        <div className="flex flex-wrap items-center gap-2 text-sm mb-1 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <span className="font-bold text-gray-800" title={breadcrumb.batchOrTemplateName}>{breadcrumb.batchOrTemplateName}</span>
                            <FaChevronRight size={10} className="text-gray-400 flex-shrink-0" />
                            <span className="font-bold text-gray-800" title={breadcrumb.sessionTitle}>{breadcrumb.sessionTitle}</span>
                            <FaChevronRight size={10} className="text-gray-400 flex-shrink-0" />
                            <span className="font-extrabold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-100 shadow-sm" title={breadcrumb.sectionName}>{breadcrumb.sectionName}</span>
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {sidebarLoading ? <p className="p-4 text-center opacity-50">Loading...</p> : activities.map(act => (
                        <div
                            key={act._id}
                            onClick={() => setSelectedActId(act._id)}
                            className={`p-3 rounded-lg cursor-pointer flex justify-between items-center group transition border ${selectedActId === act._id ? 'bg-black text-white border-black' : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent'}`}
                        >
                            <span className="truncate w-48 font-medium">{act.title}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(act._id); }}
                                className={`p-1.5 rounded opacity-0 group-hover:opacity-100 transition ${selectedActId === act._id ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-white dark:hover:bg-gray-700 text-gray-500'}`}
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Empty State — no activity selected */}
                {!selectedActId && !isCreatingNew ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <FaPlus size={28} className="text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">No Activity Selected</h2>
                        <p className="text-gray-400 mb-6 max-w-md">Select any activity from the sidebar, or create a new one to get started.</p>
                        <button
                            onClick={handleCreateNew}
                            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
                        >
                            <FaPlus size={12} /> Create New Activity
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Toolbar */}
                        <div
                            className="h-16 border-b flex items-center justify-between px-8"
                            style={{
                                backgroundColor: `var(${isDark ? "--bg-dark" : "#ffffff"})`,
                                borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`
                            }}
                        >
                            <h1 className="text-xl font-bold">{selectedActId ? 'Edit Activity' : 'New Activity'}</h1>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition shadow-lg"
                            >
                                <FaSave /> {isSaving ? 'Saving...' : 'Save Activity'}
                            </button>
                        </div>

                        {/* Scrollable Form */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="max-w-4xl mx-auto space-y-8 pb-20">

                                {/* ──── Basic Info ──── */}
                                <div
                                    className="p-6 rounded-xl shadow-sm border space-y-4"
                                    style={{
                                        backgroundColor: `var(${isDark ? "--card-dark" : "#ffffff"})`,
                                        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`
                                    }}
                                >
                                    <div>
                                        <label className="block text-sm font-bold mb-1 opacity-70">Configuration</label>
                                        <div className="flex gap-4 flex-wrap">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" checked={form.type === 'practice'} onChange={() => setForm({ ...form, type: 'practice' })} /> Practice (Questions)
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" checked={form.type === 'reading'} onChange={() => setForm({ ...form, type: 'reading' })} /> Reading (Link)
                                            </label>
                                            <div className="w-px bg-gray-200 dark:bg-gray-700 mx-2" />
                                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                                <input type="checkbox" checked={form.allowCalculator} onChange={e => setForm({ ...form, allowCalculator: e.target.checked })} /> Calculator
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                                <input type="checkbox" checked={form.showAgent} onChange={e => setForm({ ...form, showAgent: e.target.checked })} /> AI Tutor
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-1 opacity-70">Activity Title</label>
                                        <input
                                            className="w-full text-2xl font-bold border-b-2 outline-none py-2 bg-transparent"
                                            style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}
                                            placeholder="e.g., Intro to Algebra"
                                            value={form.title}
                                            onChange={e => setForm({ ...form, title: e.target.value })}
                                        />
                                    </div>

                                    {form.type === 'reading' && (
                                        <div>
                                            <label className="block text-sm font-bold mb-1 opacity-70">Document Link / URL</label>
                                            <input
                                                className="w-full p-2 border rounded-lg"
                                                placeholder="https://..."
                                                value={form.readingData.link}
                                                onChange={e => setForm({ ...form, readingData: { link: e.target.value } })}
                                                style={{
                                                    backgroundColor: `var(${isDark ? "rgba(0,0,0,0.2)" : "#f9fafb"})`,
                                                    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`
                                                }}
                                            />
                                        </div>
                                    )}


                                </div>

                                {/* ──── Questions Editor ──── */}
                                {form.type === 'practice' && (
                                    <div className="space-y-6">
                                        {form.practiceData.questions.map((q, idx) => (
                                            <div
                                                key={idx}
                                                className="p-6 rounded-xl shadow-sm border relative group transition-colors"
                                                style={{
                                                    backgroundColor: `var(${isDark ? "--card-dark" : "#ffffff"})`,
                                                    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`
                                                }}
                                            >

                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md">{idx + 1}</span>
                                                        <select
                                                            value={q.qType}
                                                            onChange={e => updateQuestion(idx, 'qType', e.target.value)}
                                                            className="font-bold px-3 py-1.5 rounded-lg outline-none cursor-pointer text-sm border"
                                                            style={{
                                                                backgroundColor: `var(${isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6"})`,
                                                                color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
                                                                borderColor: `var(${isDark ? "--border-dark" : "transparent"})`
                                                            }}
                                                        >
                                                            <option value="mcq">Multiple Choice (Single)</option>
                                                            <option value="msq">Multiple Select (Multi)</option>
                                                            <option value="single_input">Single Input</option>
                                                            <option value="multi_input">Multi-Step Input</option>
                                                            <option value="fill_blanks">Fill Blanks</option>
                                                            <option value="fact_trick">Fact / Trick / Opinion</option>
                                                            <option value="no_response">No Response (View Only)</option>
                                                        </select>
                                                    </div>
                                                    <button onClick={() => removeQuestion(idx)} className="text-gray-300 hover:text-red-500 p-1"><FaTrash size={14} /></button>
                                                </div>

                                                {/* Prompt */}
                                                <div className="mb-4">
                                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Question Prompt</label>
                                                    <RichTextEditor
                                                        content={q.prompt}
                                                        onChange={val => updateQuestion(idx, 'prompt', val)}
                                                        placeholder="Type your question here..."
                                                    />
                                                </div>

                                                {/* ──── Per-Question Media Section ──── */}
                                                <div
                                                    className="mb-4 p-4 rounded-xl border-2 border-dashed"
                                                    style={{
                                                        backgroundColor: `var(${isDark ? "rgba(0,0,0,0.2)" : "#f9fafb"})`,
                                                        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`
                                                    }}
                                                >
                                                    <div className="flex justify-between items-center mb-3">
                                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                                            <FaImage size={10} /> Question Media
                                                        </label>
                                                        <div className="flex gap-2 flex-wrap">
                                                            <button onClick={() => addMediaToQuestion(idx, 'image')}
                                                                className="px-3 py-1 rounded-lg border shadow-sm font-bold text-[10px] flex gap-1 items-center hover:opacity-80 transition-all"
                                                                style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "#ffffff"})`, borderColor: `var(${isDark ? "--border-dark" : "#e5e7eb"})`, color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
                                                                <FaImage size={10} /> IMG URL
                                                            </button>
                                                            <button onClick={() => addMediaToQuestion(idx, 'video')}
                                                                className="px-3 py-1 rounded-lg border shadow-sm font-bold text-[10px] flex gap-1 items-center hover:opacity-80 transition-all"
                                                                style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "#ffffff"})`, borderColor: `var(${isDark ? "--border-dark" : "#e5e7eb"})`, color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
                                                                <FaVideo size={10} /> VIDEO URL
                                                            </button>
                                                            <button onClick={() => addMediaToQuestion(idx, 'embed')}
                                                                className="bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm font-bold text-[10px] flex gap-1 items-center hover:bg-green-50 hover:border-green-200 transition-all">
                                                                <FaGlobe size={10} /> EMBED
                                                            </button>
                                                            <div className="w-px bg-gray-200 mx-0.5" />
                                                            <button onClick={() => triggerFileInput(idx, 'image')}
                                                                disabled={uploadingMedia?.qIdx === idx && uploadingMedia?.type === 'image'}
                                                                className="bg-blue-600 text-white px-3 py-1 rounded-lg shadow-sm font-bold text-[10px] flex gap-1 items-center hover:bg-blue-700 transition-all disabled:opacity-50">
                                                                {uploadingMedia?.qIdx === idx && uploadingMedia?.type === 'image'
                                                                    ? <><FaSpinner size={10} className="animate-spin" /> Uploading...</>
                                                                    : <><FaUpload size={10} /> Upload Image</>}
                                                            </button>
                                                            <button onClick={() => triggerFileInput(idx, 'video')}
                                                                disabled={uploadingMedia?.qIdx === idx && uploadingMedia?.type === 'video'}
                                                                className="bg-purple-600 text-white px-3 py-1 rounded-lg shadow-sm font-bold text-[10px] flex gap-1 items-center hover:bg-purple-700 transition-all disabled:opacity-50">
                                                                {uploadingMedia?.qIdx === idx && uploadingMedia?.type === 'video'
                                                                    ? <><FaSpinner size={10} className="animate-spin" /> Uploading...</>
                                                                    : <><FaUpload size={10} /> Upload Video</>}
                                                            </button>
                                                            {/* Hidden file inputs */}
                                                            <input type="file" accept="image/*" className="hidden"
                                                                ref={el => fileInputRefs.current[`${idx}-image`] = el}
                                                                onChange={e => { handleFileUpload(idx, 'image', e.target.files[0]); e.target.value = ''; }} />
                                                            <input type="file" accept="video/*" className="hidden"
                                                                ref={el => fileInputRefs.current[`${idx}-video`] = el}
                                                                onChange={e => { handleFileUpload(idx, 'video', e.target.files[0]); e.target.value = ''; }} />
                                                        </div>
                                                    </div>
                                                    {q.media && q.media.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {q.media.map((m, mIdx) => (
                                                                <div key={mIdx} className="flex gap-2 items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[8px] uppercase ${m.mediaType === 'image' ? 'bg-blue-100 text-blue-600'
                                                                        : m.mediaType === 'video' ? 'bg-purple-100 text-purple-600'
                                                                            : 'bg-green-100 text-green-600'
                                                                        }`}>
                                                                        {m.mediaType}
                                                                    </div>
                                                                    <input
                                                                        className="flex-1 p-1.5 bg-transparent outline-none font-medium text-sm text-gray-700 dark:text-gray-200"
                                                                        placeholder="Paste URL..."
                                                                        value={m.url}
                                                                        onChange={e => updateQuestionMedia(idx, mIdx, e.target.value)}
                                                                    />
                                                                    <button onClick={() => removeQuestionMedia(idx, mIdx)}
                                                                        className="w-6 h-6 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                                                        <FaTimes size={10} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-center text-gray-300 text-xs font-bold py-1">No media added yet</p>
                                                    )}
                                                </div>

                                                {/* ──── MCQ Options ──── */}
                                                {q.qType === 'mcq' && (
                                                    <div className="mb-4 p-4 rounded-xl border" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f9fafb', borderColor: isDark ? 'var(--border-dark)' : '#f3f4f6' }}>
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">MCQ Options (click ✓ for correct)</span>
                                                            <button onClick={() => updateQuestion(idx, 'options', [...(q.options || []), ''])}
                                                                className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50">+ Add Option</button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {(q.options || []).map((opt, oi) => (
                                                                <div key={oi} className="flex gap-2 items-center">
                                                                    <button onClick={() => updateQuestion(idx, 'correctAnswer', opt)}
                                                                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${q.correctAnswer === opt && opt !== '' ? 'bg-green-500 border-green-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300 hover:border-green-300'
                                                                            }`}><FaCheck size={10} /></button>
                                                                    <input className="flex-1 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium outline-none focus:border-black dark:focus:border-white dark:text-gray-200"
                                                                        placeholder={`Option ${oi + 1}`}
                                                                        value={opt}
                                                                        onChange={e => { const n = [...q.options]; n[oi] = e.target.value; updateQuestion(idx, 'options', n); }}
                                                                    />
                                                                    {q.options.length > 2 && (
                                                                        <button onClick={() => { const n = q.options.filter((_, i) => i !== oi); if (q.correctAnswer === opt) updateQuestion(idx, 'correctAnswer', ''); updateQuestion(idx, 'options', n); }}
                                                                            className="w-6 h-6 rounded-full bg-red-50 dark:bg-red-900/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white"><FaTimes size={10} /></button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* ──── MSQ Options (Multiple Correct) ──── */}
                                                {q.qType === 'msq' && (
                                                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">MSQ Options — Select ALL Correct</span>
                                                            <button onClick={() => updateQuestion(idx, 'options', [...(q.options || []), ''])}
                                                                className="text-xs font-bold text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800">+ Add Option</button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {(q.options || []).map((opt, oi) => {
                                                                const isCorrect = (q.correctAnswers || []).includes(opt) && opt !== '';
                                                                return (
                                                                    <div key={oi} className="flex gap-2 items-center">
                                                                        <button onClick={() => {
                                                                            if (opt === '') return;
                                                                            const current = q.correctAnswers || [];
                                                                            const newCorrect = isCorrect ? current.filter(a => a !== opt) : [...current, opt];
                                                                            updateQuestion(idx, 'correctAnswers', newCorrect);
                                                                        }}
                                                                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${isCorrect ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300 hover:border-blue-300'
                                                                                }`}><FaCheck size={10} /></button>
                                                                        <input className="flex-1 p-2 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800 text-sm font-medium outline-none focus:border-blue-400 dark:text-gray-200"
                                                                            placeholder={`Option ${oi + 1}`}
                                                                            value={opt}
                                                                            onChange={e => { const n = [...q.options]; n[oi] = e.target.value; updateQuestion(idx, 'options', n); }}
                                                                        />
                                                                        {q.options.length > 2 && (
                                                                            <button onClick={() => {
                                                                                const n = q.options.filter((_, i) => i !== oi);
                                                                                const nc = (q.correctAnswers || []).filter(a => a !== opt);
                                                                                updateQuestion(idx, 'correctAnswers', nc);
                                                                                updateQuestion(idx, 'options', n);
                                                                            }}
                                                                                className="w-6 h-6 rounded-full bg-red-50 dark:bg-red-900/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white"><FaTimes size={10} /></button>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-2 text-center font-bold uppercase tracking-widest">Click checkmarks to select ALL correct answers</p>
                                                    </div>
                                                )}

                                                {/* ──── Fact / Trick / Opinion ──── */}
                                                {q.qType === 'fact_trick' && (
                                                    <div className="mb-4 p-4 bg-amber-50 dark:bg-orange-900/10 rounded-xl border border-amber-200 dark:border-orange-800">
                                                        <span className="text-xs font-bold text-amber-600 dark:text-orange-400 uppercase block mb-3">Fact / Trick / Opinion</span>
                                                        <div className="space-y-2">
                                                            {['Fact', 'Trick', 'Opinion'].map((label, i) => (
                                                                <div key={i} className="flex gap-2 items-center">
                                                                    <button onClick={() => updateQuestion(idx, 'correctAnswer', q.options?.[i] || label)}
                                                                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${q.correctAnswer === (q.options?.[i] || label) && q.options?.[i] !== '' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300 hover:border-amber-300'
                                                                            }`}><FaCheck size={10} /></button>
                                                                    <div className="flex-1 p-2 bg-white dark:bg-gray-800 rounded-lg border border-amber-100 dark:border-orange-900 flex items-center gap-3">
                                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${i === 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : i === 1 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                                            }`}>{label}</span>
                                                                        <input className="flex-1 bg-transparent outline-none font-medium text-sm dark:text-gray-200" placeholder={`${label} text...`}
                                                                            value={q.options?.[i] || ''}
                                                                            onChange={e => {
                                                                                const newOpts = [...(q.options || ['', '', ''])];
                                                                                while (newOpts.length < 3) newOpts.push('');
                                                                                newOpts[i] = e.target.value;
                                                                                updateQuestion(idx, 'options', newOpts);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="text-[10px] text-amber-500 dark:text-orange-400 mt-2 text-center font-bold uppercase tracking-widest">Click checkmark to mark the correct category</p>
                                                    </div>
                                                )}

                                                {/* ──── Single Input ──── */}
                                                {q.qType === 'single_input' && (
                                                    <div className="mb-4 flex gap-4">
                                                        <div className="flex-1">
                                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Input Label</label>
                                                            <input className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 outline-none focus:border-black dark:focus:border-white text-sm font-medium dark:text-gray-200"
                                                                placeholder="e.g., Your Answer" value={q.inputLabel || ''}
                                                                onChange={e => updateQuestion(idx, 'inputLabel', e.target.value)} />
                                                        </div>
                                                        <div className="w-24">
                                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Max Chars</label>
                                                            <input className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 outline-none focus:border-black dark:focus:border-white text-sm font-bold text-center dark:text-gray-200"
                                                                type="number" value={q.maxChars || 500}
                                                                onChange={e => updateQuestion(idx, 'maxChars', parseInt(e.target.value, 10) || 500)} />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* ──── Multi-Step Input (Mixed Types) ──── */}
                                                {q.qType === 'multi_input' && (
                                                    <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="text-xs font-bold text-gray-500 uppercase">Steps (Input or MSQ)</span>
                                                            <button onClick={() => addMultiField(idx)}
                                                                className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full hover:bg-teal-100">+ Add Step</button>
                                                        </div>
                                                        <div className="space-y-4">
                                                            {(q.multiFields || []).map((f, fIdx) => (
                                                                <div key={fIdx} className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
                                                                    <div className="flex gap-3 items-center">
                                                                        <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 font-bold flex items-center justify-center text-xs flex-shrink-0">{fIdx + 1}</div>
                                                                        <select
                                                                            value={f.fieldType || 'input'}
                                                                            onChange={e => updateMultiField(idx, fIdx, 'fieldType', e.target.value)}
                                                                            className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-bold outline-none cursor-pointer bg-gray-50"
                                                                        >
                                                                            <option value="input">Text Input</option>
                                                                            <option value="mcq">MSQ (Multiple Select)</option>
                                                                        </select>
                                                                        <input className="flex-1 p-2 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:border-black"
                                                                            placeholder="Label (e.g. Step 1)" value={f.label}
                                                                            onChange={e => updateMultiField(idx, fIdx, 'label', e.target.value)} />
                                                                        {(f.fieldType || 'input') === 'input' && (
                                                                            <input className="w-16 p-2 rounded-lg border border-gray-200 text-sm font-bold outline-none focus:border-black text-center"
                                                                                type="number" placeholder="Max" value={f.maxChars}
                                                                                onChange={e => updateMultiField(idx, fIdx, 'maxChars', parseInt(e.target.value, 10) || 100)} />
                                                                        )}
                                                                        <button onClick={() => removeMultiField(idx, fIdx)}
                                                                            className="text-red-300 hover:text-red-500"><FaTimes size={12} /></button>
                                                                    </div>
                                                                    {/* MSQ Options Editor with correct answer checkmarks */}
                                                                    {(f.fieldType || 'input') === 'mcq' && (
                                                                        <div className="ml-10 space-y-2">
                                                                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Click ✓ to mark correct answers (multiple allowed)</p>
                                                                            {(f.options || []).map((opt, oi) => {
                                                                                const isCorrect = (f.correctAnswers || []).includes(opt) && opt !== '';
                                                                                return (
                                                                                    <div key={oi} className="flex gap-2 items-center">
                                                                                        <button onClick={() => {
                                                                                            if (opt === '') return;
                                                                                            const current = f.correctAnswers || [];
                                                                                            const newCorrect = isCorrect ? current.filter(a => a !== opt) : [...current, opt];
                                                                                            updateMultiField(idx, fIdx, 'correctAnswers', newCorrect);
                                                                                        }}
                                                                                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${isCorrect ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-200 text-gray-300 hover:border-blue-300'
                                                                                                }`}><FaCheck size={10} /></button>
                                                                                        <input className="flex-1 p-2 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:border-black"
                                                                                            placeholder={`Option ${oi + 1}`}
                                                                                            value={opt}
                                                                                            onChange={e => {
                                                                                                const newOpts = [...(f.options || [])];
                                                                                                newOpts[oi] = e.target.value;
                                                                                                updateMultiField(idx, fIdx, 'options', newOpts);
                                                                                            }} />
                                                                                        {(f.options || []).length > 2 && (
                                                                                            <button onClick={() => {
                                                                                                const newOpts = (f.options || []).filter((_, i) => i !== oi);
                                                                                                const nc = (f.correctAnswers || []).filter(a => a !== opt);
                                                                                                updateMultiField(idx, fIdx, 'options', newOpts);
                                                                                                updateMultiField(idx, fIdx, 'correctAnswers', nc);
                                                                                            }}
                                                                                                className="w-6 h-6 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white"><FaTimes size={10} /></button>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                            <button
                                                                                onClick={() => {
                                                                                    const newOpts = [...(f.options || []), ''];
                                                                                    updateMultiField(idx, fIdx, 'options', newOpts);
                                                                                }}
                                                                                className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100"
                                                                            >+ Add Option</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* ──── Fill in the Blanks ──── */}
                                                {q.qType === 'fill_blanks' && (
                                                    <div className="mb-4 p-4 bg-gray-50 dark:bg-[rgba(0,0,0,0.2)] rounded-xl border border-gray-100 dark:border-gray-700">
                                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 block">
                                                            Blank Text — Use <code className="bg-gray-200 dark:bg-gray-700 dark:text-gray-300 px-1 rounded text-[10px]">[$N]</code> for blanks (N = max chars)
                                                        </label>
                                                        <textarea
                                                            className="w-full bg-white dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700 outline-none font-mono text-sm text-gray-600 dark:text-gray-300 min-h-[80px] focus:border-black dark:focus:border-white"
                                                            placeholder="Ex: The capital of France is [$5]. Its currency is the [$4]."
                                                            value={q.fillBlankText || ''}
                                                            onChange={e => updateQuestion(idx, 'fillBlankText', e.target.value)}
                                                        />
                                                        {/* Live Preview */}
                                                        {q.fillBlankText && (
                                                            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                                                <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase">Preview</p>
                                                                <div className="text-sm text-gray-700 dark:text-gray-300 leading-8">
                                                                    {q.fillBlankText.split(/(\[\$.*?\])/).map((part, pi) => {
                                                                        if (part.startsWith('[$')) {
                                                                            const max = part.match(/\d+/)?.[0] || '?';
                                                                            return <span key={pi} className="inline-block mx-1 px-3 py-0.5 bg-teal-50 dark:bg-teal-900/30 border-b-2 border-teal-400 rounded-t text-teal-700 dark:text-teal-400 font-bold text-xs">_{max} chars_</span>;
                                                                        }
                                                                        return <span key={pi}>{part}</span>;
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* ──── AI Grading Config ──── */}
                                                <div className="grid grid-cols-2 gap-4 mt-4 border-t dark:border-gray-700 pt-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase mb-1 block">AI Grading Prompt</label>
                                                        <textarea
                                                            className="w-full p-2 border border-purple-100 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/10 text-xs min-h-[80px] outline-none focus:border-purple-300 dark:focus:border-purple-500 dark:text-gray-200"
                                                            value={q.aiPrompt || ''}
                                                            onChange={e => updateQuestion(idx, 'aiPrompt', e.target.value)}
                                                            placeholder="Instructions for the AI grader..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1 block">Post-Answer Tip/Feedback</label>
                                                        <textarea
                                                            className="w-full p-2 border border-blue-100 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-xs min-h-[80px] outline-none focus:border-blue-300 dark:focus:border-blue-500 dark:text-gray-200"
                                                            value={q.postAnswerTip || ''}
                                                            onChange={e => updateQuestion(idx, 'postAnswerTip', e.target.value)}
                                                            placeholder="Helpful explanation shown after submission..."
                                                        />
                                                    </div>
                                                </div>

                                                {/* ──── Per-Question Settings ──── */}
                                                <div className="flex flex-wrap gap-6 items-center mt-4 border-t dark:border-gray-700 pt-4">
                                                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                                                        <input type="checkbox" checked={q.allowAiFeedback === true}
                                                            onChange={e => updateQuestion(idx, 'allowAiFeedback', e.target.checked)} />
                                                        <span className="font-bold text-gray-600 dark:text-gray-400">Allow AI Feedback</span>
                                                    </label>
                                                    <div className="flex-1 min-w-[200px]">
                                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Answer Embed URL</label>
                                                        <input className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 outline-none focus:border-black dark:focus:border-white text-sm font-medium dark:text-gray-200"
                                                            placeholder="https://embed-url..."
                                                            value={q.answer_embed_url || ''}
                                                            onChange={e => updateQuestion(idx, 'answer_embed_url', e.target.value)} />
                                                    </div>
                                                    <div className="min-w-[150px]">
                                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Embed Label</label>
                                                        <input className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 outline-none focus:border-black dark:focus:border-white text-sm font-medium dark:text-gray-200"
                                                            placeholder="e.g., Solution Video"
                                                            value={q.answer_embed_label || ''}
                                                            onChange={e => updateQuestion(idx, 'answer_embed_label', e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add Question Button */}
                                        <button
                                            onClick={addQuestion}
                                            className="w-full py-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-400 dark:text-gray-500 font-bold text-lg hover:bg-gray-50 dark:hover:bg-white/5 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            <FaPlus /> ADD QUESTION
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminActivityEditor;
