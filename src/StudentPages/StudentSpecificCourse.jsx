import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate, Link } from 'react-router-dom';
import { FaFileAlt, FaArrowLeft, FaExternalLinkAlt, FaCheck } from 'react-icons/fa';
// Assuming api.js is in the parent directory
import { listStudentWorksheets } from '../api.js'; 

// --- Custom Checkbox Component ---
const ReadCheckbox = ({ isRead, onToggle }) => {
  // This state is "optimistic" - it updates the UI immediately.
  const [isChecked, setIsChecked] = useState(isRead);

  // Sync with parent prop if it changes
  useEffect(() => {
    setIsChecked(isRead);
  }, [isRead]);

  const handleClick = (e) => {
    // Stop the click from navigating the whole card
    e.stopPropagation(); 
    e.preventDefault();
    
    // Optimistically update the UI
    const newReadStatus = !isChecked;
    setIsChecked(newReadStatus);
    
    // Call the parent's onToggle function
    onToggle(newReadStatus);
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        onClick={handleClick}
        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${
          isChecked 
            ? 'border-[var(--accent-teal)] bg-[var(--accent-teal)]' 
            : 'border-[var(--text-dark-secondary)]'
        }`}
        style={{
          borderColor: isChecked ? 'var(--accent-teal)' : `var(${useOutletContext().isDark ? "--border-dark" : "--border-light"})`
        }}
      >
        {isChecked && <FaCheck className="text-white" size={14} />}
      </div>
      <span 
        className="text-sm font-medium"
        style={{ color: isChecked ? 'var(--accent-teal)' : `var(${useOutletContext().isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
      >
        {isChecked ? "Completed" : "Mark as Read"}
      </span>
    </div>
  );
};


// --- Worksheet Card Component ---
const WorksheetCard = ({ worksheet, isDark, courseId, onToggleRead }) => (
  <Link
    // Navigate to the viewer page
    to={`/student/dashboard/course/${courseId}/${worksheet.worksheetId}`}
    // Pass the URL and title in 'state' so it's not in the URL bar
    state={{ docxUrl: worksheet.link, title: worksheet.title }}
    className="p-6 rounded-2xl border block transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    style={{
      backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      backdropFilter: "blur(10px)"
    }}
  >
    <div className="flex flex-col sm:flex-row items-start gap-4">
      {/* Icon & Title */}
      <div className="flex items-start gap-4 flex-grow">
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
        <FaExternalLinkAlt className="ml-auto flex-shrink-0 text-sm opacity-50" />
      </div>

      {/* "Mark as Read" Checkbox */}
      <div className="mt-4 sm:mt-0 sm:ml-auto flex-shrink-0">
        <ReadCheckbox 
          isRead={worksheet.isRead}
          onToggle={(newStatus) => onToggleRead(worksheet.worksheetId, newStatus)}
        />
      </div>
    </div>
  </Link>
);

// --- Main Page Component ---
const StudentWorksheetPage = () => {
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
      const response = await listStudentWorksheets(courseId);
      
      if (response.success) {
        setWorksheets(response.data);
      } else {
        alert(response.message);
      }
      setIsLoading(false);
    };

    fetchWorksheets();
  }, [courseId]);

  // --- "Mark as Read" Handler ---
  const handleToggleReadStatus = (worksheetId, newStatus) => {
    // This is where you would call your *future* API to save the status
    // e.g., await markWorksheetAsRead(worksheetId, newStatus);
    
    // For now, just alert the user as requested
    alert("This function will be updated soon.");

    // And update the state locally to keep the UI in sync
    setWorksheets(prev =>
      prev.map(ws =>
        ws.worksheetId === worksheetId ? { ...ws, isRead: newStatus } : ws
      )
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/student/dashboard/course")} // Go back to courses list
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
        <div className="flex flex-col gap-6">
          {worksheets.length > 0 ? (
            worksheets.map(ws => (
              <WorksheetCard 
                key={ws.worksheetId} 
                worksheet={ws} 
                isDark={isDark} 
                courseId={courseId}
                onToggleRead={handleToggleReadStatus}
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
        </div>
      )}
    </div>
  );
};

export default StudentWorksheetPage;