import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSessionResponses, listBatchSections, listAllSessionActivities } from "../api.js";
import {
    ArrowLeft, Search, ChevronDown, ChevronUp,
    User, BookOpen, MessageSquare, Lightbulb, Star,
    BarChart2, Users, List, Activity, Clock
} from 'lucide-react';

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

const AdminActivityReview = () => {
    const { batchId, batchSessionId, sessionId } = useParams();
    const effectiveSessionId = batchSessionId || sessionId;
    const navigate = useNavigate();

    // Data State
    const [responses, setResponses] = useState([]);
    const [sessionActivities, setSessionActivities] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [viewMode, setViewMode] = useState('student'); // 'student' | 'question' | 'live'
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCards, setExpandedCards] = useState({});
    const [selectedActivityId, setSelectedActivityId] = useState(null); // For Question View

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

    const toggleExpand = (id) => {
        setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // --- Helpers ---

    // Get unique students from responses
    const studentMap = {};
    responses.forEach(r => {
        const student = r.student_obj_id;
        if (student && student._id) {
            studentMap[student._id] = student;
        }
    });
    const students = Object.values(studentMap);

    // Group responses by Student
    const getStudentData = () => {
        const grouped = {};
        responses.forEach(resp => {
            const sId = resp.student_obj_id?._id || 'unknown';
            if (!grouped[sId]) grouped[sId] = [];
            grouped[sId].push(resp);
        });
        return grouped;
    };

    // Calculate Live Status
    const getLiveStatus = () => {
        return students.map(student => {
            // Find all responses for this student
            const studentResps = responses.filter(r => r.student_obj_id?._id === student._id);
            // Sort by submittedAt desc
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

    // Group by Activity -> Question
    const getQuestionViewData = () => {
        // We iterate over *sessionActivities* to show structure even if no responses
        return sessionActivities.map(activity => {
            const activityResps = responses.filter(r => r.batchActivity_obj_id?._id === activity._id);
            const questions = activity.practiceData?.questions || [];

            return {
                activity,
                questions: questions.map((q, idx) => {
                    const answers = activityResps.map(r => {
                        return {
                            student: r.student_obj_id,
                            answer: r.responses?.[idx],
                            grade: r.grade // Note: grade is usually per-question in new model, but here it's per activity submission in schema?
                            // Actually schema has one 'grade' object for the submission.
                            // If we want per-question grading, we'd need to change schema or store array of grades.
                            // For now, assuming whole activity submission.
                        };
                    });
                    return { question: q, index: idx, answers };
                })
            };
        });
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

    const studentData = getStudentData();
    const liveStatusData = getLiveStatus();
    const questionViewData = getQuestionViewData();

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Activity Review</h1>
                            <p className="text-sm text-gray-500">
                                {responses.length} responses • {students.length} students • {sessionActivities.length} activities
                            </p>
                        </div>
                    </div>

                    {/* View Toggles */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('student')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'student' ? 'bg-white shadow text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <User size={16} /> Students
                        </button>
                        <button
                            onClick={() => setViewMode('question')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'question' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <List size={16} /> Questions
                        </button>
                        <button
                            onClick={() => setViewMode('live')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'live' ? 'bg-white shadow text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Activity size={16} /> Live Status
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Search Bar (Global) */}
                <div className="mb-8 relative max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition"
                    />
                </div>

                {/* ================= STUDENT VIEW ================= */}
                {viewMode === 'student' && (
                    <div className="space-y-4">
                        {Object.entries(studentData)
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
                                        <button
                                            onClick={() => toggleExpand(studentId)}
                                            className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                                                    {studentName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{studentName}</h3>
                                                    <p className="text-xs text-gray-500">{studentResps.length} Activities Completed</p>
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                                        </button>

                                        {isExpanded && (
                                            <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50/50">
                                                <div className="grid grid-cols-1 gap-4 mt-6">
                                                    {studentResps.map((resp, i) => (
                                                        <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div>
                                                                    <h4 className="font-bold text-gray-800">{resp.batchActivity_obj_id?.title}</h4>
                                                                    <p className="text-xs text-gray-400 mt-1 capitalize">{resp.batchActivity_obj_id?.type}</p>
                                                                </div>
                                                                <ScoreBadge score={resp.grade?.score} />
                                                            </div>
                                                            {/* Answers */}
                                                            <div className="space-y-2">
                                                                {resp.responses?.map((ans, idx) => (
                                                                    <div key={idx} className="text-sm border-l-2 border-gray-200 pl-3 py-1">
                                                                        <span className="text-xs font-bold text-gray-400 block mb-1">Q{idx + 1}</span>
                                                                        <p className="text-gray-700">{typeof ans === 'object' ? JSON.stringify(ans) : String(ans)}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Activity List Side Panel */}
                        <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                            {questionViewData.map((item, idx) => (
                                <button
                                    key={item.activity._id}
                                    onClick={() => setSelectedActivityId(item.activity._id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedActivityId === item.activity._id
                                        ? 'bg-purple-50 border-purple-200 shadow-sm ring-1 ring-purple-200'
                                        : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                                        }`}
                                >
                                    <h3 className={`font-bold text-sm ${selectedActivityId === item.activity._id ? 'text-purple-700' : 'text-gray-700'}`}>
                                        {item.activity.title}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">{item.questions.length} Questions</p>
                                </button>
                            ))}
                        </div>

                        {/* Question Details */}
                        <div className="lg:col-span-2">
                            {selectedActivityId ? (
                                <div className="space-y-8">
                                    {questionViewData.find(d => d.activity._id === selectedActivityId)?.questions.map((qData, i) => (
                                        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Question {i + 1}</span>
                                                <div className="mt-2 text-gray-800 font-medium" dangerouslySetInnerHTML={{ __html: qData.question.prompt || 'No Prompt' }} />
                                            </div>
                                            <div className="divide-y divide-gray-50">
                                                {qData.answers.filter(a => a.student && a.answer).map((ans, ansIdx) => (
                                                    <div key={ansIdx} className="px-6 py-3 flex items-start gap-4 hover:bg-gray-50/50">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                                                            {ans.student?.name?.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <p className="text-xs font-bold text-gray-900">{ans.student?.name}</p>
                                                                {/* <span className="text-xs text-gray-400">{ans.grade?.score}/10</span> */}
                                                            </div>
                                                            <p className="text-sm text-gray-700 mt-1">{typeof ans.answer === 'object' ? JSON.stringify(ans.answer) : String(ans.answer)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {qData.answers.filter(a => a.student && a.answer).length === 0 && (
                                                    <div className="p-6 text-center text-sm text-gray-400 italic">No answers yet.</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 italic">
                                    Select an activity to view questions.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ================= LIVE VIEW ================= */}
                {viewMode === 'live' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {liveStatusData.map((stat, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg">
                                        {stat.student?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{stat.student?.name}</h3>
                                        <p className="text-xs text-gray-500">{stat.student?.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                            <span>Progress</span>
                                            <span>{Math.round(stat.progress)}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${stat.progress}%` }} />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Last Active</p>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                                            <Activity size={14} className="text-blue-500" />
                                            <span className="truncate">{stat.lastActivity}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                            <Clock size={12} />
                                            <span>{stat.lastActiveTime ? new Date(stat.lastActiveTime).toLocaleTimeString() : 'Never'}</span>
                                        </div>
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
