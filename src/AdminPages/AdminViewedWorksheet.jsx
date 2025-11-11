import React from 'react';
import { useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";

const AdminWorksheetViewPage = () => {
  const { isDark } = useOutletContext();
  const { courseId } = useParams(); // Get courseId for the "back" button
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Get the URL and title from the 'state' passed in the Link
  const { docxUrl, title } = location.state || {};

  // 2. Handle cases where the user lands on this page directly (no state)
  if (!docxUrl) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-6">No document link was provided. Please go back to the course and select a worksheet.</p>
        <button
          onClick={() => navigate(`/admin/dashboard/course/${courseId || ''}`)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
          style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))" }}
        >
          <FaArrowLeft />
          Go Back
        </button>
      </div>
    );
  }

  // 3. Use the Google Docs viewer to embed the Cloudinary URL
  const embedUrl = `https://docs.google.com/gview?url=${encodeURIComponent(docxUrl)}&embedded=true`;

  return (
    <div>
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/admin/dashboard/course/${courseId}`)} 
          className="p-3 rounded-full transition"
          style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--border-light"})`}}
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-3xl font-bold">{title || "Worksheet Viewer"}</h1>
      </div>

      {/* Embedded Document Viewer */}
      <div 
        className="w-full h-[80vh] rounded-2xl border"
        style={{
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          backgroundColor: `var(${isDark ? "--bg-dark" : "white"})`
        }}
      >
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          className="rounded-2xl"
        >
          Loading document...
        </iframe>
      </div>
    </div>
  );
};

export default AdminWorksheetViewPage;