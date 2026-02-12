import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSessionResponses, listBatchSections } from "../api.js";
import {
    ArrowLeft, Search, ChevronDown, ChevronUp,
    User, BookOpen, MessageSquare, Lightbulb, Star
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

    const [responses, setResponses] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCards, setExpandedCards] = useState({});
    const [filterActivity, setFilterActivity] = useState('all');

    useEffect(() => {
        fetchData();
    }, [effectiveSessionId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [respResult, sectResult] = await Promise.all([
                getSessionResponses(effectiveSessionId),
                listBatchSections(effectiveSessionId),
            ]);
            if (respResult.success) setResponses(respResult.data?.responses || []);
            if (sectResult.success) setSections(sectResult.data?.sections || []);
        } catch (err) {
            console.error("Error fetching review data:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Get unique activity titles from responses
    const activityTitles = [...new Set(responses.map(r => r.batchActivity_obj_id?.title || 'Unknown Activity'))];

    // Filter responses
    const filtered = responses.filter(resp => {
        const studentName = resp.student_obj_id?.name || '';
        const actTitle = resp.batchActivity_obj_id?.title || 'Unknown Activity';
        const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesActivity = filterActivity === 'all' || actTitle === filterActivity;
        return matchesSearch && matchesActivity;
    });

    // Group responses by student
    const groupedByStudent = {};
    filtered.forEach(resp => {
        const studentId = resp.student_obj_id?._id || resp.student_obj_id || 'unknown';
        if (!groupedByStudent[studentId]) {
            groupedByStudent[studentId] = {
                student: resp.student_obj_id,
                responses: []
            };
        }
        groupedByStudent[studentId].responses.push(resp);
    });

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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-xl transition"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Activity Review</h1>
                            <p className="text-sm text-gray-500">{filtered.length} submissions from {Object.keys(groupedByStudent).length} students</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by student name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterActivity}
                        onChange={(e) => setFilterActivity(e.target.value)}
                        className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                        <option value="all">All Activities</option>
                        {activityTitles.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                {/* Empty State */}
                {Object.keys(groupedByStudent).length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-bold text-gray-400">No Submissions Found</h3>
                        <p className="text-sm text-gray-400 mt-1">No student responses match your search.</p>
                    </div>
                )}

                {/* Student Cards */}
                <div className="space-y-4">
                    {Object.entries(groupedByStudent).map(([studentId, { student, responses: studentResps }]) => {
                        const studentName = student?.name || 'Unknown Student';
                        const studentEmail = student?.email || '';
                        const avgScore = studentResps.reduce((sum, r) => sum + (r.grade?.score || 0), 0) / studentResps.length;
                        const isExpanded = expandedCards[studentId];

                        return (
                            <div key={studentId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                {/* Student Header */}
                                <button
                                    onClick={() => toggleExpand(studentId)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-200/50">
                                            {studentName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{studentName}</h3>
                                            <p className="text-xs text-gray-400">{studentEmail} • {studentResps.length} {studentResps.length === 1 ? 'submission' : 'submissions'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right mr-2">
                                            <div className="text-xs text-gray-400 mb-1">Average</div>
                                            <ScoreBadge score={Math.round(avgScore * 10) / 10} />
                                        </div>
                                        {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="px-6 pb-6 border-t border-gray-50">
                                        <div className="space-y-4 mt-4">
                                            {studentResps.map((resp, respIdx) => {
                                                const activityTitle = resp.batchActivity_obj_id?.title || 'Unknown Activity';
                                                const activityType = resp.batchActivity_obj_id?.type || 'practice';
                                                const grade = resp.grade;

                                                return (
                                                    <div key={resp._id || respIdx} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                                        {/* Activity Header */}
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-teal-100 rounded-lg">
                                                                    <BookOpen size={16} className="text-teal-600" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-gray-800">{activityTitle}</h4>
                                                                    <span className="text-xs text-gray-400 capitalize">{activityType}</span>
                                                                </div>
                                                            </div>
                                                            <ScoreBadge score={grade?.score} />
                                                        </div>

                                                        {/* AI Feedback */}
                                                        {grade && (
                                                            <div className="space-y-3">
                                                                {grade.feedback && (
                                                                    <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-100">
                                                                        <MessageSquare size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                                                        <div>
                                                                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-1">AI Feedback</h5>
                                                                            <p className="text-sm text-gray-700 leading-relaxed">{grade.feedback}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {grade.tip && (
                                                                    <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100">
                                                                        <Lightbulb size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                                                        <div>
                                                                            <h5 className="text-xs font-bold text-amber-600 uppercase mb-1">Coach Tip</h5>
                                                                            <p className="text-sm text-amber-800 leading-relaxed">{grade.tip}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Student Responses */}
                                                        {resp.responses && resp.responses.length > 0 && (
                                                            <div className="mt-4">
                                                                <h5 className="text-xs font-bold text-gray-400 uppercase mb-2">Student Answers</h5>
                                                                <div className="space-y-2">
                                                                    {resp.responses.map((ans, idx) => (
                                                                        <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 text-sm">
                                                                            <span className="text-xs text-gray-400 font-medium">Q{idx + 1}:</span>{' '}
                                                                            <span className="text-gray-700">
                                                                                {typeof ans === 'object' ? JSON.stringify(ans) : String(ans || '—')}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Submission Time */}
                                                        <p className="text-xs text-gray-400 mt-3">
                                                            Submitted {resp.submittedAt ? new Date(resp.submittedAt).toLocaleString() : 'N/A'}
                                                        </p>
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
            </div>
        </div>
    );
};

export default AdminActivityReview;
