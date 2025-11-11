import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate, Link } from 'react-router-dom';
import { FaFileAlt, FaArrowLeft, FaExternalLinkAlt, FaPlus, FaTimes, FaBook, FaAlignLeft, FaHashtag, FaFileUpload } from "react-icons/fa";
// Assuming api.js is in the same directory
import { getWorksheetsForCourse, uploadWorksheet } from "../api.js"; 

// --- Reusable Input Component for Modal ---
const ModalInput = ({ id, label, icon, isDark, ...props }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium mb-2">
      {label}
    </label>
    <div className="relative">
      <span 
        className="absolute left-4 top-1/2 -translate-y-1/2"
        style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
      >
        {icon}
      </span>
      <input
        id={id}
        className="w-full pl-12 pr-4 py-3 rounded-lg border bg-transparent transition"
        style={{
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
        }}
        {...props}
      />
    </div>
  </div>
);

// --- Create Worksheet Modal Component ---
// FIX: Removed useParams() from modal. It will get all data from parent.
const CreateWorksheetModal = ({ isOpen, onClose, onSubmit, isDark }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [worksheetNumber, setWorksheetNumber] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a .docx file to upload.");
      return;
    }
    setIsSubmitting(true);
    
    // Pass form data to parent submit function
    const success = await onSubmit({
      title,
      description,
      worksheetNumber,
      file
    });

    if (success) {
      // Clear form on success
      setTitle("");
      setDescription("");
      setWorksheetNumber("");
      setFile(null);
      setIsSubmitting(false);
      onClose(); // Close the modal
    } else {
      // If it failed, stop loading so user can try again
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;

  // Modal styles
  const modalBG = isDark ? "var(--bg-dark)" : "var(--bg-light)";
  const textColor = isDark ? "var(--text-dark-primary)" : "var(--text-light-primary)";
  const secondaryText = isDark ? "var(--text-dark-secondary)" : "var(--text-light-secondary)";
  const modalBorder = isDark ? "var(--border-dark)" : "var(--border-light)";
  
  return (
    // Overlay
    <div 
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(5px)" }}
    >
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-lg p-8 rounded-2xl border"
        style={{ backgroundColor: modalBG, color: textColor, borderColor: modalBorder }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full transition"
          style={{ color: secondaryText, backgroundColor: `var(${isDark ? "--card-dark" : "rgba(0,0,0,0.05)"})`}}
        >
          <FaTimes />
        </button>

        <h2 className="text-2xl font-bold mb-6">Add New Worksheet</h2>
        
        <form onSubmit={handleSubmit}>
          <ModalInput
            id="title"
            label="Worksheet Title"
            icon={<FaBook />}
            type="text"
            placeholder="e.g., Chapter 1: Equations"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            isDark={isDark}
            required
          />
          <ModalInput
            id="description"
            label="Description"
            icon={<FaAlignLeft />}
            type="text"
            placeholder="A summary of this worksheet..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            isDark={isDark}
            required
          />
          <ModalInput
            id="worksheetNumber"
            label="Worksheet Number"
            icon={<FaHashtag />}
            type="number"
            placeholder="e.g., 1"
            value={worksheetNumber}
            onChange={(e) => setWorksheetNumber(e.target.value)}
            isDark={isDark}
            required
          />
          
          {/* File Input */}
          <div className="mb-4">
            <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
              Worksheet File (.docx)
            </label>
            <div className="relative">
              <span 
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
              >
                <FaFileUpload />
              </span>
              <label 
                htmlFor="file-upload" 
                className="w-full pl-12 pr-4 py-3 rounded-lg border bg-transparent transition cursor-pointer flex items-center"
                style={{
                  borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                  color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`
                }}
              >
                {file ? file.name : "Click to select a .docx file"}
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden" // Visually hidden, but label triggers it
                accept=".docx, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-semibold"
              style={{
                backgroundColor: `var(${isDark ? "--border-dark" : "rgba(0,0,0,0.05)"})`,
                color: textColor
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg font-semibold text-white transition"
              style={{
                background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Worksheet Card ---
const WorksheetCard = ({ worksheet, isDark, courseId }) => (
  <Link
    // FIX: Using singular "course" path
    to={`/admin/dashboard/course/${courseId}/${worksheet.worksheetId}`}
    state={{ docxUrl: worksheet.link, title: worksheet.title }}
    className="p-6 rounded-2xl border block transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    style={{
      backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      backdropFilter: "blur(10px)"
    }}
  >
    <div className="flex items-start gap-4">
      <span 
        className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full"
        style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.03)"})`}}
      >
        <FaFileAlt className="text-2xl text-[var(--accent-teal)]" />
      </span>
      <div>
        <h3 className="text-xl font-bold mb-1">
          {worksheet.worksheetNumber}. {worksheet.title}
        </h3>
        <p 
          className="text-sm line-clamp-2"
          style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
        >
          {worksheet.description}
        </p>
      </div>
      <FaExternalLinkAlt className="ml-auto flex-shrink-0 text-sm" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}} />
    </div>
  </Link>
);

// --- "Add Worksheet" Card (FUNCTIONAL) ---
const AddWorksheetCard = ({ isDark, onClick }) => (
  <button 
    onClick={onClick}
    className="p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center min-h-[148px] transition-all duration-300 hover:shadow-lg"
    style={{
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`
    }}
  >
    <FaPlus className="text-4xl mb-4" />
    <span className="text-lg font-semibold">Add New Worksheet</span>
  </button>
);

// --- Main Page Component ---
const AdminWorksheetListPage = () => {
  const { isDark } = useOutletContext();
  
  // --- FIX: Read the 'courseId' parameter from the URL ---
  // This assumes your route in App.jsx is: /admin/dashboard/course/:courseId
  const { courseId } = useParams(); 
  // --- END FIX ---
  
  const navigate = useNavigate();
  
  const [worksheets, setWorksheets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!courseId) {
      setIsLoading(false);
      return;
    }

    const fetchWorksheets = async () => {
      try {
        const response = await getWorksheetsForCourse(courseId);
        if (response.success) {
          setWorksheets(response.data);
        } else {
          alert(response.message);
        }
      } catch (error) {
        console.error("Failed to fetch worksheets:", error);
        alert("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorksheets();
  }, [courseId]);

  // --- FIX: 'courseId' is now defined in the component's scope ---
  const handleUploadSubmit = async (formData) => {
    // formData = { title, description, worksheetNumber, file }
    
    console.log("Uploading worksheet for courseId:", courseId); // This will now be correct
    
    const response = await uploadWorksheet(
      courseId, // <-- This is now correctly passed
      formData.title,
      formData.description,
      formData.worksheetNumber,
      formData.file
    );

    alert(response.message); // Show success or error

    if (response.success) {
      // Add new worksheet to the list
      setWorksheets(prev => [...prev, response.data]);
      return true; // Tell modal submission was successful
    }
    return false; // Tell modal submission failed
  };
  // --- END FIX ---

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)} // Go back one page
          className="p-3 rounded-full transition"
          style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--border-light"})`}}
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-3xl font-bold">Worksheets</h1>
      </div>

      {isLoading ? (
        <p>Loading worksheets...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {worksheets.length > 0 ? (
            worksheets.map(ws => (
              <WorksheetCard 
                key={ws.worksheetId} 
                worksheet={ws} 
                isDark={isDark} 
                courseId={courseId}
              />
            ))
          ) : (
            <p>No worksheets found for this course.</p>
          )}
          {/* Add the functional "Add" card */}
          <AddWorksheetCard isDark={isDark} onClick={() => setIsModalOpen(true)} />
        </div>
      )}

      {/* Render the modal */}
      <CreateWorksheetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleUploadSubmit}
        isDark={isDark}
      />
    </div>
  );
};

export default AdminWorksheetListPage;