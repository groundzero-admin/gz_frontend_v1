import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate, Link } from 'react-router-dom';
import { FaFileAlt, FaArrowLeft, FaExternalLinkAlt } from "react-icons/fa";
// Assuming api.js is in the parent directory
import { listTeacherWorksheets } from "../api.js"; 

// --- Worksheet Card Component (Teacher Version) ---
// This is simplified: no checkbox, just links to the doc viewer.
const WorksheetCard = ({ worksheet, isDark, courseId }) => (
  <Link
    // Navigate to the (future) teacher's viewer page
    to={`/teacher/dashboard/course/${courseId}/${worksheet.worksheetId}`}
    // Pass the URL and title in 'state' so it's not in the URL bar
    state={{ docxUrl: worksheet.link, title: worksheet.title }}
    className="p-6 rounded-2xl border block transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    style={{
      backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      backdropFilter: "blur(10px)"
    }}
  >
    <div className="flex items-start gap-4">
      {/* Icon */}
      <span 
        className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full"
        style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.03)"})`}}
      >
        <FaFileAlt className="text-2xl text-[var(--accent-teal)]" />
      </span>
      {/* Title & Description */}
      <div className="flex-grow">
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
      {/* Link Icon */}
      <FaExternalLinkAlt className="ml-auto flex-shrink-0 text-sm opacity-50" />
    </div>
  </Link>
);

// --- Main Page Component ---
const TeacherWorksheetListPage = () => {
  const { isDark } = useOutletContext();
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [worksheets, setWorksheets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Fetching ---
  useEffect(() => {
    if (!courseId) {
      setIsLoading(false);
      return;
    }

    const fetchWorksheets = async () => {
      setIsLoading(true);
      // Use the new teacher-specific API function
      const response = await listTeacherWorksheets(courseId);
      
      if (response.success) {
        setWorksheets(response.data);
      } else {
        alert(response.message);
      }
      setIsLoading(false);
    };

    fetchWorksheets();
  }, [courseId]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/teacher/dashboard/course")} // Go back to teacher's courses list
          className="p-3 rounded-full transition"
          style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--border-light"})`}}
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-3xl font-bold">Worksheets</h1>
      </div>

      {/* Content */}
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
            <p 
              className="p-8 rounded-2xl border text-center"
              style={{
                backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
                borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`
              }}
            >
              No worksheets have been added to this course yet.
            </p>
          )}
          {/* We can add a "Create Worksheet" card here later, just like the admin one */}
        </div>
      )}
    </div>
  );
};

export default TeacherWorksheetListPage;