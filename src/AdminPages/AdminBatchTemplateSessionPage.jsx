import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft,
    FaPlus,
    FaClock,
    FaTimes,
    FaEdit,
    FaTrash,
    FaCopy
} from "react-icons/fa";
import {
    getBatchTemplateDetails,
    createBatchTemplateSession,
    updateBatchTemplateSession,
    deleteBatchTemplateSession
} from "../api.js";

// --- Helper: Time Picker ---
const TimePicker = ({ label, value, onChange, isDark }) => {
    const parseTime = (val) => {
        if (!val) return { h: "10", m: "00", p: "AM" };
        const [timePart, periodPart] = val.split(' ');
        const [h, m] = timePart.split(':');
        return { h, m, p: periodPart || "AM" };
    };

    const [timeState, setTimeState] = useState(parseTime(value));

    useEffect(() => {
        onChange(`${timeState.h}:${timeState.m} ${timeState.p}`);
    }, [timeState]);

    useEffect(() => {
        setTimeState(parseTime(value));
    }, [value]);

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

    const update = (key, val) => setTimeState(prev => ({ ...prev, [key]: val }));

    const selectStyle = {
        backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{label}</label>
            <div className="flex items-center gap-2">
                <select value={timeState.h} onChange={(e) => update('h', e.target.value)} className="px-2 py-2 rounded border text-sm" style={selectStyle}>
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="font-bold">:</span>
                <select value={timeState.m} onChange={(e) => update('m', e.target.value)} className="px-2 py-2 rounded border text-sm" style={selectStyle}>
                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={timeState.p} onChange={(e) => update('p', e.target.value)} className="px-2 py-2 rounded border text-sm" style={selectStyle}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
            </div>
        </div>
    );
};

// --- Template Session Modal (simplified — no date, no links) ---
const TemplateSessionModal = ({ isOpen, onClose, onSubmit, isDark, editingSession, existingSessions = [] }) => {
    const [formData, setFormData] = useState({
        session_number: '',
        title: '',
        description: '',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        dayNumber: '1',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editingSession) {
            setFormData({
                session_number: editingSession.session_number || '',
                title: editingSession.title || '',
                description: editingSession.description || '',
                startTime: editingSession.startTime || '10:00 AM',
                endTime: editingSession.endTime || '11:00 AM',
                dayNumber: editingSession.dayNumber || '1',
            });
        } else {
            const maxSessionNum = existingSessions.reduce((max, s) => Math.max(max, Number(s.session_number || 0)), 0);
            const maxDay = existingSessions.reduce((max, s) => Math.max(max, Number(s.dayNumber || 0)), 0);
            setFormData({
                session_number: String(maxSessionNum + 1),
                title: '',
                description: '',
                startTime: '10:00 AM',
                endTime: '11:00 AM',
                dayNumber: String(maxDay + 1),
            });
        }
    }, [editingSession, isOpen, existingSessions]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = {
            session_number: Number(formData.session_number),
            title: formData.title,
            description: formData.description,
            startTime: formData.startTime,
            endTime: formData.endTime,
            dayNumber: Number(formData.dayNumber),
        };
        const success = await onSubmit(payload, editingSession ? true : false);
        if (success) onClose();
        setIsSubmitting(false);
    };

    const inputStyle = {
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }}>
            <div
                className="relative w-full max-w-lg p-6 rounded-2xl border max-h-[90vh] overflow-y-auto custom-scrollbar"
                style={{
                    backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
                    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                    color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
                }}
            >
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-bold">
                        {editingSession ? "Edit Template Session" : "Add Template Session"}
                    </h2>
                    <button onClick={onClose} className="p-2 text-lg opacity-70 hover:opacity-100"><FaTimes /></button>
                </div>

                {/* Info Note */}
                <div className="mb-6 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs">
                    <p className="font-bold text-blue-400 mb-1">💡 Template sessions are blueprints</p>
                    <p className="opacity-80">Title, description, timing, and day number are saved here. The "Day" field sets the session date relative to batch start (Day 1 = start date, Day 8 = 7 days later).</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1">Session #</label>
                            <input
                                type="number" id="session_number"
                                value={formData.session_number} onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border" style={inputStyle}
                                required placeholder="1"
                                disabled={!!editingSession}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input type="text" id="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border" style={inputStyle} required placeholder="e.g. Intro to Logic" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1">Day #</label>
                            <input
                                type="number" id="dayNumber"
                                value={formData.dayNumber} onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border" style={inputStyle}
                                required placeholder="1" min="1"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea id="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border" style={inputStyle} rows="2" placeholder="Topics covered..."></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <TimePicker label="Start Time" isDark={isDark} value={formData.startTime} onChange={(val) => setFormData(prev => ({ ...prev, startTime: val }))} />
                        <TimePicker label="End Time" isDark={isDark} value={formData.endTime} onChange={(val) => setFormData(prev => ({ ...prev, endTime: val }))} />
                    </div>

                    <div className="flex justify-end gap-4 mt-6 pt-4 border-t" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
                        <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-semibold border text-sm" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg font-semibold text-white text-sm" style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))", opacity: isSubmitting ? 0.7 : 1 }}>
                            {isSubmitting ? "Saving..." : (editingSession ? "Update Session" : "Add Session")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Template Session Card ---
const TemplateSessionCard = ({ session, isDark, onClick, onDelete }) => {
    return (
        <div
            onClick={onClick}
            className="p-5 rounded-xl border flex items-start gap-4 transition-all hover:shadow-lg cursor-pointer h-full relative group"
            style={{
                backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
                borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
            }}
        >
            {/* Action buttons */}
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <span className="text-xs font-bold px-2 py-1 rounded bg-black/10 dark:bg-white/10 flex items-center gap-1">
                    <FaEdit /> Edit
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(session); }}
                    className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    title="Delete session"
                >
                    <FaTrash size={12} />
                </button>
            </div>

            {/* Session Number */}
            <div
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                style={{
                    backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.05)"})`,
                    color: "var(--accent-teal)",
                }}
            >
                {session.session_number}
            </div>

            {/* Content */}
            <div className="flex-grow min-w-0">
                <h3 className="text-lg font-bold truncate pr-16">{session.title}</h3>
                <p className="text-sm mb-3 opacity-80 line-clamp-2">{session.description || "No description"}</p>

                <div className="flex items-center gap-3 text-xs font-medium opacity-70">
                    <span className="flex items-center gap-1"><FaClock /> {session.startTime} - {session.endTime}</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold">Day {session.dayNumber}</span>
                </div>
            </div>
        </div>
    );
};

// --- Main Page ---
const AdminBatchTemplateSessionPage = () => {
    const { isDark } = useOutletContext();
    const { templateId } = useParams();
    const navigate = useNavigate();

    const [templateDetails, setTemplateDetails] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        const response = await getBatchTemplateDetails(templateId);
        if (response.success && response.data) {
            setTemplateDetails(response.data.template);
            setSessions(response.data.sessions || []);
        } else {
            alert(`Error: ${response.message}`);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (templateId) fetchData();
    }, [templateId]);

    const handleSessionSubmit = async (formData, isUpdate) => {
        let response;

        if (isUpdate) {
            if (!editingSession?._id) {
                alert("Error: Missing session ID for update.");
                return false;
            }
            response = await updateBatchTemplateSession({
                session_obj_id: editingSession._id,
                title: formData.title,
                description: formData.description,
                startTime: formData.startTime,
                endTime: formData.endTime,
                dayNumber: formData.dayNumber,
            });
        } else {
            response = await createBatchTemplateSession({
                template_obj_id: templateId,
                ...formData,
            });
        }

        alert(response.message);
        if (response.success) {
            fetchData();
            return true;
        }
        return false;
    };

    const handleDeleteSession = async (session) => {
        const confirmation = window.prompt(`To confirm deletion of template session "${session.title}", please type "DELETE" below:\n\nThis cannot be undone.`);
        if (confirmation !== "DELETE") {
            if (confirmation) alert("Deletion cancelled. You must type DELETE exactly.");
            return;
        }

        const response = await deleteBatchTemplateSession(session._id);
        alert(response.message);
        if (response.success) fetchData();
    };

    const openCreateModal = () => {
        setEditingSession(null);
        setIsSessionModalOpen(true);
    };

    const openEditModal = (session) => {
        setEditingSession(session);
        setIsSessionModalOpen(true);
    };

    if (isLoading) {
        return <p className="text-lg opacity-70">Loading template...</p>;
    }

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate("/admin/dashboard/templates")}
                    className="p-2 rounded-lg border transition hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}
                >
                    <FaArrowLeft />
                </button>
                <div className="flex-grow">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FaCopy className="text-purple-400" />
                        {templateDetails?.templateName || "Template"}
                    </h1>
                    {templateDetails?.description && (
                        <p className="text-sm opacity-70 mt-1">{templateDetails.description}</p>
                    )}
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition hover:scale-105 shadow-lg"
                    style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))" }}
                >
                    <FaPlus /> Add Session
                </button>
            </div>

            {/* Sessions Grid */}
            {sessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessions.map((session) => (
                        <TemplateSessionCard
                            key={session._id}
                            session={session}
                            isDark={isDark}
                            onClick={() => openEditModal(session)}
                            onDelete={handleDeleteSession}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 opacity-60">
                    <FaCopy className="text-5xl mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-medium">No sessions in this template</p>
                    <p className="text-sm mt-1">Add sessions to create a reusable blueprint for your batches.</p>
                </div>
            )}

            {/* Modal */}
            <TemplateSessionModal
                isOpen={isSessionModalOpen}
                onClose={() => { setIsSessionModalOpen(false); setEditingSession(null); }}
                onSubmit={handleSessionSubmit}
                isDark={isDark}
                editingSession={editingSession}
                existingSessions={sessions}
            />
        </div>
    );
};

export default AdminBatchTemplateSessionPage;
