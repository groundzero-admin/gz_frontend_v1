import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
    FaPlus,
    FaLayerGroup,
    FaTimes,
    FaCopy,
    FaCalendarAlt
} from "react-icons/fa";
import { listAllBatchTemplates, createBatchTemplate } from "../api.js";

// --- Helper: Modal Input ---
const ModalInput = ({ label, type = "text", value, onChange, placeholder, required = true, isDark }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium mb-2">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full px-3 py-2 rounded-lg border bg-transparent transition text-sm"
            style={{
                borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
            }}
        />
    </div>
);

// --- Create Template Modal ---
const CreateTemplateModal = ({ isOpen, onClose, onSubmit, isDark }) => {
    const [templateName, setTemplateName] = useState("");
    const [description, setDescription] = useState("");
    const [templateType, setTemplateType] = useState("ONLINE");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!templateName.trim()) {
            alert("Template name is required.");
            return;
        }
        setIsSubmitting(true);
        const success = await onSubmit(templateName.trim(), description.trim(), templateType);
        if (success) {
            setTemplateName("");
            setDescription("");
            setTemplateType("ONLINE");
            onClose();
        }
        setIsSubmitting(false);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }}
        >
            <div
                className="relative w-full max-w-md p-6 rounded-2xl border"
                style={{
                    backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
                    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                    color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
                }}
            >
                <button onClick={onClose} className="absolute top-5 right-5 text-lg opacity-70 hover:opacity-100">
                    <FaTimes />
                </button>

                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FaCopy /> Create New Template
                </h2>

                <form onSubmit={handleSubmit}>
                    <ModalInput
                        label="Template Name"
                        isDark={isDark}
                        placeholder="e.g. spark_alpha"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        required
                    />
                    <ModalInput
                        label="Description (Optional)"
                        isDark={isDark}
                        placeholder="What this template covers..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required={false}
                    />
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Template Type</label>
                        <div className="flex gap-3">
                            {["ONLINE", "OFFLINE"].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setTemplateType(type)}
                                    className={`flex-1 px-4 py-2 rounded-lg border font-bold text-sm transition ${templateType === type
                                            ? type === "ONLINE"
                                                ? "border-blue-500 text-blue-500 bg-blue-500/10"
                                                : "border-orange-500 text-orange-500 bg-orange-500/10"
                                            : "opacity-40"
                                        }`}
                                    style={{ borderColor: templateType === type ? undefined : `var(${isDark ? "--border-dark" : "--border-light"})` }}
                                >
                                    {type === "ONLINE" ? "🌐 Online" : "🏫 Offline"}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6 pt-4 border-t" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
                        <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-semibold border text-sm" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 rounded-lg font-semibold text-white text-sm"
                            style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))", opacity: isSubmitting ? 0.7 : 1 }}
                        >
                            {isSubmitting ? "Creating..." : "Create Template"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Template Card ---
const TemplateCard = ({ template, isDark }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/admin/dashboard/templates/${template._id}`, {
            state: { templateName: template.templateName },
        });
    };

    return (
        <div
            onClick={handleClick}
            className="relative p-6 rounded-2xl border flex flex-col h-full transition-all duration-300 hover:shadow-lg cursor-pointer group"
            style={{
                backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
                borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                backdropFilter: "blur(10px)",
            }}
        >
            {/* Type Badge */}
            <span
                className={`absolute top-4 right-4 text-[10px] px-2 py-1 rounded border font-bold tracking-wide ${template.templateType === "OFFLINE"
                        ? "border-orange-500 text-orange-500 bg-orange-500/10"
                        : "border-blue-500 text-blue-500 bg-blue-500/10"
                    }`}
            >
                {template.templateType}
            </span>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <span className="p-3 rounded-full bg-purple-500 bg-opacity-10">
                    <FaCopy className="text-purple-400" />
                </span>
                <div>
                    <h3 className="text-xl font-bold">{template.templateName}</h3>
                    <span className="text-xs font-semibold opacity-60">
                        {template.sessionCount} {template.sessionCount === 1 ? "session" : "sessions"}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-2 flex-grow">
                {template.description && (
                    <p
                        className="text-sm font-medium opacity-90 leading-relaxed border-l-4 pl-3 mb-2 break-words whitespace-normal line-clamp-3"
                        style={{ borderColor: "var(--accent-teal)" }}
                    >
                        {template.description}
                    </p>
                )}

                <p className="text-sm flex items-center gap-2 opacity-70">
                    <FaCalendarAlt />
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                </p>
            </div>

            {/* Hover hint */}
            <div className="mt-4 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-center" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`, color: "var(--accent-teal)" }}>
                Click to manage sessions →
            </div>
        </div>
    );
};

// --- Main Page ---
const AdminBatchTemplatePage = () => {
    const { isDark } = useOutletContext();
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTemplates = async () => {
        setIsLoading(true);
        const response = await listAllBatchTemplates();
        if (response.success) {
            setTemplates(response.data?.templates || []);
        } else {
            console.warn("Fetch templates:", response.message);
            setTemplates([]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleCreateTemplate = async (templateName, description, templateType) => {
        const response = await createBatchTemplate(templateName, description, templateType);
        alert(response.message);
        if (response.success) {
            fetchTemplates();
            return true;
        }
        return false;
    };

    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Batch Templates</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition hover:scale-105 shadow-lg"
                    style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))" }}
                >
                    <FaPlus /> New Template
                </button>
            </div>

            {isLoading ? (
                <p className="text-lg opacity-70">Loading templates...</p>
            ) : templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <TemplateCard key={template._id} template={template} isDark={isDark} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 opacity-60">
                    <FaCopy className="text-5xl mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-medium">No templates yet</p>
                    <p className="text-sm mt-1">Create a template to define reusable session blueprints for your batches.</p>
                </div>
            )}

            <CreateTemplateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTemplate}
                isDark={isDark}
            />
        </div>
    );
};

export default AdminBatchTemplatePage;
