import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSessionResponses, listBatchSections, listAllSessionActivities } from "../api.js";
import {
    ArrowLeft, ArrowRight, Search, ChevronDown, ChevronUp,
    User, List, Activity, Clock, Star,
    Check, AlertTriangle, HelpCircle, FileText, RefreshCw,
    ExternalLink, Maximize2, X, Eye, EyeOff
} from 'lucide-react';

// ──────────────────────────────────────────
//  HELPER: ID Normalizer
// ──────────────────────────────────────────
const normalizeId = (id) => {
    if (!id) return null;
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id._id) return id._id.toString();
    return id.toString();
};

// ──────────────────────────────────────────
//  UI COMPONENTS (Shared)
// ──────────────────────────────────────────

const ScoreBadge = ({ score }) => {
    const s = score ?? 0;
    const color = s >= 8 ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
        : s >= 5 ? 'bg-amber-100 text-amber-700 border-amber-200'
            : 'bg-red-100 text-red-700 border-red-200';
    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${color}`}>
            <Star size={14} /> {s}/10
        </span>
    );
};

const MediaCarousel = ({ mediaItems }) => {
    const [mediaIndex, setMediaIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    if (!mediaItems || mediaItems.length === 0) return null;

    const hasMultiple = mediaItems.length > 1;
    const current = mediaItems[mediaIndex];

    const getOpenUrl = () => {
        let openUrl = current?.url || '';
        const embedMatch = openUrl.match(/youtube\.com\/embed\/([^?&/]+)/);
        if (embedMatch) return `https://www.youtube.com/watch?v=${embedMatch[1]}`;
        const shortMatch = openUrl.match(/youtu\.be\/([^?&/]+)/);
        if (shortMatch) return `https://www.youtube.com/watch?v=${shortMatch[1]}`;
        return openUrl;
    };

    const renderMedia = () => {
        if (!current?.url) return null;
        const isYouTube = current.url.includes('youtu');

        if (current.mediaType === 'image') {
            return <img src={current.url} className="w-full h-auto max-h-[600px] object-contain bg-black" alt="AI-powered learning content" />;
        }
        if (current.mediaType === 'video' && !isYouTube) {
            return <video src={current.url} controls className="w-full h-auto max-h-[600px] bg-black" />;
        }
        return (
            <div className="aspect-video w-full bg-black">
                <iframe src={current.url} className="w-full h-full border-0" title="Interactive learning resource" allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            </div>
        );
    };

    return (
        <>
            <div className="mb-6 relative w-full">
                {/* Toolbar above carousel */}
                {current?.url && (
                    <div className="flex items-center justify-end gap-2 mb-2 px-1">
                        <button
                            onClick={() => setIsZoomed(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 transition-all"
                        >
                            <Maximize2 size={13} />
                            Zoom
                        </button>
                        <a
                            href={getOpenUrl()}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-all"
                        >
                            <ExternalLink size={13} />
                            Open in New Tab
                        </a>
                    </div>
                )}

                {/* Normal carousel */}
                <div className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 relative">
                    {renderMedia()}
                    {hasMultiple && (
                        <>
                            <button onClick={() => setMediaIndex(prev => prev === 0 ? mediaItems.length - 1 : prev - 1)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-teal-600 transition-all hover:scale-110 z-10">
                                <ArrowLeft size={20} />
                            </button>
                            <button onClick={() => setMediaIndex(prev => prev === mediaItems.length - 1 ? 0 : prev + 1)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-teal-600 transition-all hover:scale-110 z-10">
                                <ArrowRight size={20} />
                            </button>
                        </>
                    )}
                </div>

                {/* Dot indicators */}
                {hasMultiple && (
                    <div className="flex justify-center gap-1.5 mt-3">
                        {mediaItems.map((_, i) => (
                            <button key={i} onClick={() => setMediaIndex(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === mediaIndex ? 'bg-teal-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Fullscreen overlay — matching student page style */}
            {isZoomed && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setIsZoomed(false)}>
                    {/* Close button */}
                    <button
                        onClick={() => setIsZoomed(false)}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-xl flex items-center justify-center text-gray-600 hover:text-red-500 transition-all hover:scale-110 z-50"
                    >
                        <X size={20} />
                    </button>

                    {/* Open in new tab button */}
                    <a
                        href={getOpenUrl()}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="absolute top-6 right-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-xl flex items-center justify-center text-gray-600 hover:text-blue-500 transition-all hover:scale-110 z-50"
                    >
                        <ExternalLink size={18} />
                    </a>

                    {/* Media container */}
                    <div className="max-w-[90vw] max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
                        {current?.mediaType === 'image' && (
                            <img src={current.url} className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl" alt="AI-powered learning content — zoomed view" />
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
                                <button onClick={() => setMediaIndex(prev => prev === 0 ? mediaItems.length - 1 : prev - 1)}
                                    className="absolute left-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:text-teal-600 transition-all hover:scale-110">
                                    <ArrowLeft size={22} />
                                </button>
                                <button onClick={() => setMediaIndex(prev => prev === mediaItems.length - 1 ? 0 : prev + 1)}
                                    className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:text-teal-600 transition-all hover:scale-110">
                                    <ArrowRight size={22} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Bottom bar — dots + minimize */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                        {hasMultiple && (
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                {mediaItems.map((_, i) => (
                                    <button key={i} onClick={(e) => { e.stopPropagation(); setMediaIndex(i); }}
                                        className={`w-3 h-3 rounded-full transition-all ${i === mediaIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`}
                                    />
                                ))}
                            </div>
                        )}
                        <button
                            onClick={() => setIsZoomed(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold hover:bg-white/30 transition-all"
                        >
                            <X size={14} />
                            Minimize
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

const QuestionBlock = ({ qData, response, readOnly, hidePrompt }) => {
    if (!qData) return <div className="p-4 bg-gray-50 text-gray-400 italic text-sm">Question data unavailable</div>;

    const mediaItems = qData.media || [];

    return (
        <div className="space-y-4 font-sans w-full">
            {!hidePrompt && (
                <div className="space-y-4 w-full">
                    {qData.prompt && qData.prompt.replace(/<[^>]*>/g, '').trim() ? (
                        <div className="prose prose-lg max-w-none text-gray-800 bg-white p-5 rounded-xl border border-gray-200 shadow-sm w-full"
                            dangerouslySetInnerHTML={{ __html: qData.prompt }}
                        />
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm font-medium flex items-center gap-2">
                            This question does not contain any question text.
                        </div>
                    )}
                    <MediaCarousel mediaItems={mediaItems} />
                </div>
            )}

            {qData.qType !== 'no_response' && (
                <div className={`rounded-xl p-5 border-2 transition-all w-full ${readOnly ? 'bg-gray-50 border-gray-200' : 'bg-white border-teal-100'}`}>

                    {readOnly && <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Student Answer</div>}

                    {qData.qType === 'mcq' && (
                        <div className="grid gap-2 w-full">
                            {(qData.options || []).map((opt, i) => (
                                <button key={i} disabled
                                    className={`p-4 rounded-lg border font-bold text-base text-left flex items-center justify-between w-full ${response === opt
                                        ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-sm ring-1 ring-teal-500'
                                        : 'bg-white border-gray-100 text-gray-400 opacity-60'
                                        }`}>
                                    <span>{opt}</span>
                                    {response === opt && <Check size={20} />}
                                </button>
                            ))}
                        </div>
                    )}

                    {qData.qType === 'msq' && (
                        <div className="grid gap-2 w-full">
                            {(qData.options || []).map((opt, i) => {
                                const selected = Array.isArray(response) ? response.includes(opt) : false;
                                return (
                                    <button key={i} disabled
                                        className={`p-4 rounded-lg border font-bold text-base text-left flex items-center gap-3 w-full ${selected
                                            ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm ring-1 ring-blue-500'
                                            : 'bg-white border-gray-100 text-gray-400 opacity-60'
                                            }`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${selected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                                            {selected && <Check size={12} strokeWidth={4} />}
                                        </div>
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {qData.qType === 'single_input' && (
                        <div className="space-y-1 w-full">
                            <label className="text-[10px] font-bold text-teal-600 uppercase tracking-wider ml-1">{qData.inputLabel}</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 text-base font-medium resize-none focus:outline-none"
                                value={response || ''}
                                disabled
                                rows={3}
                                placeholder="(No answer)"
                            />
                        </div>
                    )}

                    {qData.qType === 'multi_input' && (
                        <div className="grid gap-3 w-full">
                            {(qData.multiFields || []).map((field, fIdx) => (
                                <div key={fIdx} className="w-full">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">{field.label || `Step ${fIdx + 1}`}</label>
                                    <textarea
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 text-base font-medium resize-none focus:outline-none"
                                        value={(response && response[fIdx]) || ''}
                                        disabled
                                        rows={1}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {qData.qType === 'fill_blanks' && (
                        <div className="leading-loose text-lg text-gray-800 font-medium bg-white p-6 rounded-xl border border-gray-200 w-full">
                            {(qData.fillBlankText || '').split(/(\[\$.*?\])/).map((part, i, arr) => {
                                if (part.startsWith('[$')) {
                                    const idx = arr.slice(0, i).filter(p => p.startsWith('[$')).length;
                                    const val = (response && response[idx]) ? response[idx] : '';
                                    return (
                                        <input
                                            key={i}
                                            disabled
                                            value={val}
                                            className={`inline-block border-b-2 w-32 mx-1 px-1 text-center font-bold text-lg ${val ? 'border-teal-500 text-teal-800 bg-teal-50' : 'border-red-200 text-red-300 bg-red-50'}`}
                                        />
                                    );
                                }
                                return <span key={i}>{part}</span>;
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ──────────────────────────────────────────
//  MAIN COMPONENT
// ──────────────────────────────────────────

const AdminActivityReview = () => {
    const { batchId, batchSessionId, sessionId } = useParams();
    const effectiveSessionId = batchSessionId || sessionId;
    const navigate = useNavigate();

    // Data State
    const [responses, setResponses] = useState([]);
    const [sessionActivities, setSessionActivities] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // UI State
    const [viewMode, setViewMode] = useState('question'); // 'student' | 'question' | 'live'
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCards, setExpandedCards] = useState({});
    const [selectedActivityId, setSelectedActivityId] = useState(null);

    useEffect(() => {
        fetchData();
    }, [effectiveSessionId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [respResult, sectResult, actResult] = await Promise.all([
                getSessionResponses(effectiveSessionId),
                listBatchSections(effectiveSessionId),
                listAllSessionActivities(effectiveSessionId)
            ]);

            if (respResult.success) setResponses(respResult.data?.responses || []);
            if (sectResult.success) setSections(sectResult.data?.sections || []);
            if (actResult.success) setSessionActivities(actResult.data?.activities || []);

        } catch (err) {
            console.error("Error fetching review data:", err);
        } finally {
            setLoading(false);
        }
    };

    // ──────────────────────────────────────────
    //  REFRESH LOGIC
    // ──────────────────────────────────────────
    const refreshResponses = async () => {
        setRefreshing(true);
        try {
            const respResult = await getSessionResponses(effectiveSessionId);
            if (respResult.success) {
                setResponses(respResult.data?.responses || []);
            }
        } catch (err) {
            console.error("Error refreshing responses:", err);
        } finally {
            setTimeout(() => setRefreshing(false), 500);
        }
    };

    // --- Helpers ---
    const studentMap = {};
    responses.forEach(r => {
        const student = r.student_obj_id;
        if (student && student._id) studentMap[student._id] = student;
    });
    const students = Object.values(studentMap);

    const getStudentData = () => {
        const grouped = {};
        responses.forEach(resp => {
            const sId = resp.student_obj_id?._id || 'unknown';
            if (!grouped[sId]) grouped[sId] = [];
            grouped[sId].push(resp);
        });
        return grouped;
    };

    const toggleExpand = (id) => {
        setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const groupedSections = useMemo(() => {
        const grouped = [];
        const unassigned = [];
        const sectionMap = {};
        sections.forEach(sec => {
            sectionMap[sec._id] = { ...sec, activities: [] };
            grouped.push(sectionMap[sec._id]);
        });
        sessionActivities.forEach(act => {
            const secId = normalizeId(act.batchSection_obj_id);
            if (secId && sectionMap[secId]) {
                sectionMap[secId].activities.push(act);
            } else {
                unassigned.push(act);
            }
        });
        if (unassigned.length > 0) grouped.push({ _id: 'unassigned', sectionName: 'Uncategorized', activities: unassigned });
        return grouped;
    }, [sections, sessionActivities]);

    useEffect(() => {
        if (viewMode === 'question' && !selectedActivityId && groupedSections.length > 0) {
            const firstSectionWithActivities = groupedSections.find(s => s.activities && s.activities.length > 0);
            if (firstSectionWithActivities) {
                setSelectedActivityId(firstSectionWithActivities.activities[0]._id);
            }
        }
    }, [viewMode, groupedSections, selectedActivityId]);


    const getSelectedActivityData = () => {
        if (!selectedActivityId) return null;
        const activity = sessionActivities.find(a => a._id === selectedActivityId);
        if (!activity) return null;

        const activityResps = responses.filter(r => r.batchActivity_obj_id?._id === selectedActivityId);
        const questions = activity.practiceData?.questions || [];

        return {
            activity,
            questions: questions.map((q, idx) => ({
                question: q,
                index: idx,
                answers: activityResps.map(r => ({
                    student: r.student_obj_id,
                    answer: r.responses?.[idx],
                    grade: r.grade,
                    submittedAt: r.submittedAt
                }))
            }))
        };
    };

    const getLiveStatus = () => {
        return students.map(student => {
            const studentResps = responses.filter(r => r.student_obj_id?._id === student._id);
            studentResps.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
            const lastResp = studentResps[0];
            const completedCount = new Set(studentResps.map(r => r.batchActivity_obj_id?._id)).size;
            const totalActivities = sessionActivities.length;
            const progress = totalActivities > 0 ? (completedCount / totalActivities) * 100 : 0;
            return {
                student,
                lastActivity: lastResp?.batchActivity_obj_id?.title || 'Not Started',
                lastActiveTime: lastResp?.submittedAt,
                completedCount,
                totalActivities,
                progress
            };
        }).filter(s => s.student.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Loading reviews...</p>
                </div>
            </div>
        );
    }

    const selectedData = getSelectedActivityData();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100 transition-colors">

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm transition-colors">
                <div className="w-full px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Activity Review</h1>
                            <p className="text-sm text-gray-500">
                                {responses.length} responses • {students.length} students
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button onClick={() => setViewMode('student')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'student' ? 'bg-white shadow text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}>
                                <User size={16} /> Students
                            </button>
                            <button onClick={() => setViewMode('question')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'question' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}>
                                <List size={16} /> Questions
                            </button>
                            <button onClick={() => setViewMode('live')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'live' ? 'bg-white shadow text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}>
                                <Activity size={16} /> Live Status
                            </button>
                        </div>
                        <button
                            onClick={() => window.open(`/admin/present/batch-session/${effectiveSessionId}/review`, '_blank')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-bold transition shadow-md"
                            title="Open in new tab (presentation mode)"
                        >
                            <ExternalLink size={14} /> Open in New Tab
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className={`mx-auto py-8 ${viewMode === 'question' ? 'w-[98%] px-2' : 'max-w-7xl px-6'}`}>

                {/* SEARCH & REFRESH BAR (For Student & Live views) */}
                {viewMode !== 'question' && (
                    <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Only show Search in Student View */}
                        {viewMode === 'student' ? (
                            <div className="relative max-w-md w-full">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition shadow-sm"
                                />
                            </div>
                        ) : (
                            <div className="flex-1"></div> // Spacer for Live View
                        )}

                        <button
                            onClick={refreshResponses}
                            className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-200 text-sm font-bold transition shadow-sm hover:shadow-md whitespace-nowrap"
                            disabled={refreshing}
                        >
                            <RefreshCw size={16} className={refreshing ? "animate-spin text-teal-500" : "text-gray-400"} />
                            {refreshing ? "Refreshing..." : "Refresh Data"}
                        </button>
                    </div>
                )}

                {/* ================= STUDENT VIEW ================= */}
                {viewMode === 'student' && (
                    <div className="space-y-4">
                        {Object.entries(getStudentData())
                            .filter(([sId, resps]) => {
                                const name = resps[0]?.student_obj_id?.name || 'Unknown';
                                return name.toLowerCase().includes(searchTerm.toLowerCase());
                            })
                            .map(([studentId, studentResps]) => {
                                const student = studentResps[0]?.student_obj_id;
                                const studentName = student?.name || 'Unknown Student';
                                const isExpanded = expandedCards[studentId];

                                return (
                                    <div key={studentId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                                        <button onClick={() => toggleExpand(studentId)} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-teal-200">
                                                    {studentName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">{studentName}</h3>
                                                    <p className="text-sm text-gray-500">{studentResps.length} Activities Submitted</p>
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                                        </button>

                                        {isExpanded && (
                                            <div className="px-6 pb-8 border-t border-gray-100 bg-gray-50/50">
                                                <div className="grid grid-cols-1 gap-8 mt-6">
                                                    {studentResps.map((resp, i) => {
                                                        const fullActivity = sessionActivities.find(a => normalizeId(a._id) === normalizeId(resp.batchActivity_obj_id?._id));
                                                        const questions = fullActivity?.practiceData?.questions || [];

                                                        return (
                                                            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                                                <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] rounded uppercase font-bold">{resp.batchActivity_obj_id?.type}</span>
                                                                            <span className="text-xs text-gray-400 font-medium">{new Date(resp.submittedAt).toLocaleDateString()}</span>
                                                                        </div>
                                                                        <h4 className="font-bold text-xl text-gray-800">{resp.batchActivity_obj_id?.title}</h4>
                                                                    </div>
                                                                    <ScoreBadge score={resp.grade?.score} />
                                                                </div>
                                                                <div className="p-6 space-y-12">
                                                                    {questions.length > 0 ? (
                                                                        questions.map((q, qIdx) => (
                                                                            <div key={qIdx} className="relative pl-8 border-l-2 border-gray-200">
                                                                                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 text-[10px] flex items-center justify-center font-bold text-gray-500">
                                                                                    {qIdx + 1}
                                                                                </span>
                                                                                <QuestionBlock qData={q} response={resp.responses?.[qIdx]} readOnly={true} hidePrompt={false} />
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="text-center text-gray-400 italic py-4">Original question data not found.</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}

                {/* ================= QUESTION VIEW ================= */}
                {viewMode === 'question' && (
                    <div className="grid grid-cols-[280px_1fr] gap-6 h-[calc(100vh-140px)]">

                        {/* 1. Sidebar */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
                            <div className="p-4 border-b bg-gray-50/50"><h2 className="font-bold text-gray-700 text-sm">Curriculum</h2></div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-4 custom-scrollbar">
                                {groupedSections.map((section) => (
                                    <div key={section._id}>
                                        <div className="px-2 mb-2 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                                Section : {section.sectionName}
                                            </h3>
                                        </div>
                                        <div className="space-y-1">
                                            {section.activities.map((act) => (
                                                <button key={act._id} onClick={() => setSelectedActivityId(act._id)} className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all relative overflow-hidden ${selectedActivityId === act._id ? 'bg-purple-50 border-purple-200 shadow-sm text-purple-700' : 'bg-white border-transparent hover:bg-gray-50 text-gray-600'}`}>
                                                    {selectedActivityId === act._id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />}
                                                    <p className="font-bold text-xs truncate">Activity : {act.title}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Main Content */}
                        <div className="flex flex-col h-full overflow-hidden">
                            {selectedData ? (
                                <div className="h-full overflow-y-auto pr-2 pb-20 space-y-8">
                                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900">{selectedData.activity.title}</h2>
                                            <div className="flex gap-4 mt-1 text-sm text-gray-500">
                                                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${selectedData.activity.type === 'reading' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>{selectedData.activity.type}</span>
                                                {selectedData.activity.type === 'reading'
                                                    ? <span>{(selectedData.activity.readingData?.materials || []).length} Materials</span>
                                                    : <span>{selectedData.questions.length} Questions</span>
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reading Material View */}
                                    {selectedData.activity.type === 'reading' && (() => {
                                        const materials = selectedData.activity.readingData?.materials || [];
                                        const tipText = selectedData.activity.readingData?.tipText || '';
                                        const legacyLink = selectedData.activity.readingData?.link;
                                        if (legacyLink && materials.length === 0) materials.push({ title: 'Reading Resource', url: legacyLink, mediaType: 'link' });
                                        const typeIcons = { pdf: '📄', doc: '📝', image: '🖼️', video: '🎬', embed: '🌐', link: '🔗' };

                                        const ReviewMaterialViewer = () => {
                                            const [viewIdx, setViewIdx] = React.useState(null);
                                            const viewing = viewIdx !== null ? materials[viewIdx] : null;

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

                                            const renderContent = () => {
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
                                                            <iframe src={viewerUrl} className="relative z-10 w-full h-full rounded-xl shadow-2xl border-0 bg-white" title="AI-powered education document viewer" allowFullScreen />
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div className="relative w-[85vw] h-[80vh]">
                                                        {loadingBg}
                                                        <iframe src={url} className="relative z-10 w-full h-full rounded-xl shadow-2xl border-0 bg-white" title="AI-powered learning resource" allowFullScreen />
                                                    </div>
                                                );
                                            };

                                            return (
                                                <>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {materials.map((mat, idx) => (
                                                            <button key={idx} onClick={() => setViewIdx(idx)}
                                                                className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all text-left group"
                                                            >
                                                                <p className="font-bold text-gray-900 truncate">{mat.title || `Material ${idx + 1}`}</p>
                                                                {mat.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{mat.description}</p>}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {viewing && (
                                                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setViewIdx(null)}>
                                                            <button onClick={() => setViewIdx(null)}
                                                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-xl flex items-center justify-center text-gray-600 hover:text-red-500 transition-all hover:scale-110 z-50">
                                                                <X size={20} />
                                                            </button>
                                                            <a href={getViewableUrl(viewing.url, viewing.mediaType)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                                                className="absolute top-6 right-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-xl flex items-center justify-center text-gray-600 hover:text-blue-500 transition-all hover:scale-110 z-50">
                                                                <ExternalLink size={18} />
                                                            </a>
                                                            <div className="relative" onClick={e => e.stopPropagation()}>
                                                                {renderContent()}
                                                                {materials.length > 1 && (
                                                                    <>
                                                                        <button onClick={() => setViewIdx(p => p === 0 ? materials.length - 1 : p - 1)}
                                                                            className="absolute left-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:text-teal-600 transition-all hover:scale-110">
                                                                            <ArrowLeft size={22} />
                                                                        </button>
                                                                        <button onClick={() => setViewIdx(p => p === materials.length - 1 ? 0 : p + 1)}
                                                                            className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:text-teal-600 transition-all hover:scale-110">
                                                                            <ArrowRight size={22} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                                                                {materials.length > 1 && (
                                                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                                                        {materials.map((_, i) => (
                                                                            <button key={i} onClick={(e) => { e.stopPropagation(); setViewIdx(i); }}
                                                                                className={`w-3 h-3 rounded-full transition-all ${i === viewIdx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`} />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                                                                    {viewing.title || `Material ${viewIdx + 1}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        };

                                        return (
                                            <div className="space-y-4">
                                                {tipText && (
                                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
                                                        <span className="text-xl">💡</span>
                                                        <div className="text-amber-800 text-sm font-medium leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: tipText }} />
                                                    </div>
                                                )}
                                                {materials.length > 0 ? <ReviewMaterialViewer /> : (
                                                    <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 italic">No reading materials attached.</div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Practice Questions View */}
                                    {selectedData.activity.type !== 'reading' && selectedData.questions.map((qData, i) => (
                                        <div key={i} className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-sm shadow-md">{i + 1}</div>
                                                <div className="h-px bg-gray-200 flex-1" />
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"> Question</span>
                                            </div>

                                            {/* Full Width Master Question */}
                                            <div className="bg-white rounded-2xl p-1 border border-transparent">
                                                <QuestionBlock qData={qData.question} readOnly={true} response={null} />
                                            </div>

                                            <div className="bg-gray-100/80 rounded-3xl p-6 border border-gray-200/50">

                                                {/* Response Header — collapsed by default */}
                                                <button
                                                    onClick={() => toggleExpand(`q-${i}`)}
                                                    className="w-full flex items-center justify-between hover:bg-gray-200/50 rounded-xl px-2 py-2 transition"
                                                >
                                                    <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                                                        <User size={16} /> Student Responses
                                                    </h3>
                                                    <div className="flex items-center gap-3">
                                                        <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm border">
                                                            {qData.answers.filter(a => a.student && a.answer).length} Answers
                                                        </span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); refreshResponses(); }}
                                                            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-teal-50 text-teal-700 rounded-full border border-teal-200 text-xs font-bold transition shadow-sm hover:shadow-md"
                                                            disabled={refreshing}
                                                        >
                                                            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                                                            {refreshing ? "Updating" : "Refresh"}
                                                        </button>
                                                        {expandedCards[`q-${i}`] ? <EyeOff size={14} className="text-gray-400" /> : <Eye size={14} className="text-gray-400" />}
                                                        {expandedCards[`q-${i}`] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                                    </div>
                                                </button>

                                                {expandedCards[`q-${i}`] && (
                                                    <div className="grid grid-cols-1 gap-6 mt-4">
                                                        {qData.answers.filter(a => a.student && a.answer).map((ans, ansIdx) => (
                                                            <div key={ansIdx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition group w-full">
                                                                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs">{ans.student?.name?.charAt(0)}</div>
                                                                        <div><p className="font-bold text-sm text-gray-900">{ans.student?.name}</p></div>
                                                                    </div>
                                                                </div>
                                                                <div className="w-full">
                                                                    <QuestionBlock qData={qData.question} response={ans.answer} readOnly={true} hidePrompt={true} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                    <List size={48} className="mb-4 opacity-20" />
                                    <p className="font-medium">Select an activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ================= LIVE STATUS VIEW ================= */}
                {viewMode === 'live' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getLiveStatus().map((stat, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg">{stat.student?.name?.charAt(0)}</div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-gray-900 truncate">{stat.student?.name}</h3>
                                        <p className="text-xs text-gray-500 truncate">{stat.student?.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1"><span>Progress</span><span>{Math.round(stat.progress)}%</span></div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${stat.progress}%` }} /></div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Last Active</p>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-800"><Activity size={14} className="text-blue-500" /><span className="truncate">{stat.lastActivity}</span></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminActivityReview;