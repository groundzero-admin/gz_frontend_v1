import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
    FaArrowLeft,
    FaPlus,
    FaEdit,
    FaTrash,
    FaList,
    FaChevronUp,
    FaChevronDown
} from "react-icons/fa";
import {
    listSections,
    createSection,
    updateSection,
    deleteSection,
    listBatchSections,
    createBatchSection,
    updateBatchSection,
    deleteBatchSection,
    reorderTemplateSections,
    reorderBatchSections
} from "../api.js";

const AdminSectionPage = () => {
    const { isDark } = useOutletContext();
    const { templateSessionId, batchSessionId } = useParams();
    const navigate = useNavigate();
    const isTemplateMode = !!templateSessionId;

    // Determine ID to use (templateSessionId or batchSessionId)
    const currentSessionId = isTemplateMode ? templateSessionId : batchSessionId;

    const [sections, setSections] = useState([]);
    const [sessionDetails, setSessionDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [formData, setFormData] = useState({ sectionName: '', order: 0 });

    useEffect(() => {
        fetchSections();
    }, [currentSessionId]);

    const fetchSections = async () => {
        setLoading(true);
        try {
            const apiCall = isTemplateMode ? listSections : listBatchSections;
            const res = await apiCall(currentSessionId);
            if (res.success) {
                setSections(res.data?.sections || []);
                setSessionDetails(isTemplateMode ? res.data?.templateSession : res.data?.batchSession);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError("Failed to load sections.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingSection) {
                const apiCall = isTemplateMode ? updateSection : updateBatchSection;
                // Determine the correct ID to pass for update (sectionId vs batchSectionId)
                // The API wrappers expect the specific section ID as the first argument
                await apiCall(editingSection._id, formData.sectionName, formData.order);
            } else {
                const apiCall = isTemplateMode ? createSection : createBatchSection;
                // Create needs parent ID
                await apiCall(currentSessionId, formData.sectionName, formData.order);
            }
            setIsModalOpen(false);
            fetchSections();
        } catch (err) {
            console.error(err);
            alert("Failed to save section.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this section? All contained activities will also be deleted.")) return;
        try {
            const apiCall = isTemplateMode ? deleteSection : deleteBatchSection;
            await apiCall(id);
            fetchSections();
        } catch (err) {
            alert("Failed to delete section.");
        }
    };

    const openModal = (section = null) => {
        setEditingSection(section);
        if (section) {
            setFormData({ sectionName: section.sectionName, order: section.order });
        } else {
            const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order || 0)) : -1;
            setFormData({ sectionName: '', order: maxOrder + 1 });
        }
        setIsModalOpen(true);
    };

    const handleNavigateToActivities = (sectionId) => {
        if (isTemplateMode) {
            navigate(`/admin/dashboard/template-section/${sectionId}/activities`);
        } else {
            navigate(`/admin/dashboard/batch-section/${sectionId}/activities`);
        }
    };

    const handleReorder = async (sectionId, direction) => {
        const idx = sections.findIndex(s => s._id === sectionId);
        if (idx === -1) return;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= sections.length) return;

        const newList = [...sections];
        [newList[idx], newList[swapIdx]] = [newList[swapIdx], newList[idx]];
        setSections(newList);

        const orderedIds = newList.map(s => s._id);
        const reorderFn = isTemplateMode ? reorderTemplateSections : reorderBatchSections;
        await reorderFn(orderedIds);
    };

    return (
        <div
            className="flex flex-col min-h-[calc(100vh)] w-[calc(100%+3rem)] md:w-[calc(100%+5rem)] -m-6 md:-m-10 p-6 font-sans transition-colors duration-300"
            style={{
                backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
                color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
            }}
        >
            <div className="max-w-4xl mx-auto w-full pt-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (isTemplateMode && sessionDetails?.template_obj_id?._id) {
                                    navigate(`/admin/dashboard/templates/${sessionDetails.template_obj_id._id}`);
                                } else if (!isTemplateMode && sessionDetails?.batch_obj_id?._id) {
                                    navigate(`/admin/dashboard/batches/${sessionDetails.batch_obj_id._id}`);
                                } else {
                                    navigate(-1);
                                }
                            }}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                        >
                            <FaArrowLeft />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {sessionDetails ? (
                                    <>
                                        <span className="text-gray-400 font-medium text-lg block mb-1">
                                            {isTemplateMode
                                                ? sessionDetails.template_obj_id?.templateName || "Template"
                                                : sessionDetails.batch_obj_id?.batchName || "Batch"}
                                        </span>
                                        {sessionDetails.title || (isTemplateMode ? "Template Session" : "Batch Session")}
                                    </>
                                ) : (
                                    isTemplateMode ? "Template Session Sections" : "Batch Session Sections"
                                )}
                            </h1>
                            <p className="text-gray-500 text-sm">
                                {sessionDetails?.description || "Manage sections for this session"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition shadow-lg"
                    >
                        <FaPlus /> Add Section
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-20">Loading...</div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
                ) : sections.length === 0 ? (
                    <div
                        className="p-12 rounded-2xl shadow-sm text-center border dashed transition-colors"
                        style={{
                            backgroundColor: isDark ? "var(--card-dark)" : "#ffffff",

                            borderColor: `var(${isDark ? "--border-dark" : "#e5e7eb"})`
                        }}
                    >
                        <p className="opacity-50 mb-4">No sections found.</p>
                        <button onClick={() => openModal()} className="text-blue-600 hover:underline">Create your first section</button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {sections.map((section) => (
                            <div
                                key={section._id}
                                className="p-6 rounded-xl shadow-sm border hover:shadow-md transition flex items-center justify-between group"
                                style={{
                                    backgroundColor: isDark ? "var(--card-dark)" : "#ffffff",

                                    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`
                                }}
                            >
                                <div
                                    className="flex-1 cursor-pointer"
                                    onClick={() => handleNavigateToActivities(section._id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold">{section.sectionName}</h3>
                                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded opacity-70">Order: {section.order}</span>
                                        {isTemplateMode ? null : (
                                            // Show if it's synced or custom
                                            <span className={`text-xs px-2 py-1 rounded ${section.templateSection_ref ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'}`}>
                                                {section.templateSection_ref ? 'Synced' : 'Custom'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm opacity-60 mt-1 flex items-center gap-1 group-hover:text-blue-500 transition">
                                        <FaList className="text-xs" /> Click to manage activities
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col gap-0.5 mr-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleReorder(section._id, 'up'); }}
                                            disabled={sections.indexOf(section) === 0}
                                            className={`p-1 rounded transition text-red-400 ${sections.indexOf(section) === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-300'}`}
                                            title="Move up"
                                        >
                                            <FaChevronUp size={10} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleReorder(section._id, 'down'); }}
                                            disabled={sections.indexOf(section) === sections.length - 1}
                                            className={`p-1 rounded transition text-red-400 ${sections.indexOf(section) === sections.length - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-300'}`}
                                            title="Move down"
                                        >
                                            <FaChevronDown size={10} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => openModal(section)}
                                        className="p-2 opacity-50 hover:opacity-100 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(section._id)}
                                        className="p-2 opacity-50 hover:opacity-100 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm  z-50 flex items-center justify-center p-4">
                    <div
                        className="w-full max-w-md rounded-2xl p-6 shadow-2xl transition-colors"
                        style={{
                            backgroundColor: isDark ? "var(--card-dark)" : "#ffffff",

                            color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
                            border: `1px solid var(${isDark ? "--border-dark" : "transparent"})`
                        }}
                    >
                        <h2 className="text-xl font-bold mb-4">{editingSection ? 'Edit Section' : 'New Section'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 opacity-80">Section Name</label>
                                <input
                                    type="text"
                                    value={formData.sectionName}
                                    onChange={e => setFormData({ ...formData, sectionName: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none bg-transparent"
                                    style={{ borderColor: `var(${isDark ? "--border-dark" : "#e5e7eb"})` }}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 opacity-80">Order</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none bg-transparent"
                                    style={{ borderColor: `var(${isDark ? "--border-dark" : "#e5e7eb"})` }}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!formData.sectionName}
                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSectionPage;
