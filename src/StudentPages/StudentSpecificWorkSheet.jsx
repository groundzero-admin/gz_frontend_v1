import React from 'react';
import { useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';

// --- SVG Icons ---
const FaArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor">
    <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
  </svg>
);
const FaCommentsIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="24" height="24" fill="currentColor" className={className}>
    <path d="M532 32H44C19.7 32 0 51.7 0 76v224c0 24.3 19.7 44 44 44h19.3l8.4 14.6c19.1 33.1 55.4 53.4 94.9 53.4H310.4c39.5 0 75.8-20.3 94.9-53.4l8.4-14.6H436c6.4 0 12.5-1.4 18-4l80-36c13.2-5.9 22-18.7 22-32V76c0-24.3-19.7-44-44-44zM40.4 48C50.2 48 56 57.1 56 64v192c0 6.9-5.8 16-15.6 16H44c-2.2 0-4-1.8-4-4V76c0-15.5 12.5-28 28-28H40.4zM532 272l-80 36c-2.3 1-4.8 1.6-7.3 1.6H436c-13.2 0-25.4-8.1-30.8-20.3l-9.9-22.1c-2.4-5.3-7.5-8.8-13.2-8.8H192c-5.8 0-10.8 3.5-13.2 8.8l-9.9 22.1C163.4 303.9 151.2 312 138 312H112c-4.1 0-7.8-1.2-11-3.4L80 297.8V64c0-4.4 3.6-8 8-8h416c4.4 0 8 3.6 8 8V272z"/>
  </svg>
);
const FaPaperPlaneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="currentColor">
    <path d="M16.1 260.2c-22.6 12.9-20.5 47.3 3.6 57.3L160 376V479.3c0 18.1 14.6 32.7 32.7 32.7c9.7 0 18.9-4.3 25.1-11.8l62-74.3 123.9 51.6c18.9 7.9 40.8-4.5 43.9-24.7l64-416c1.9-12.1-3.4-24.3-13.1-31.2s-23.1-7.1-34.4-1.3L16.1 260.2zM224 432V345.8l-111.3-46.4L432.2 65.2 224 432z"/>
  </svg>
);
const FaSpinnerIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="40" height="40" fill="currentColor" className={className}>
    <path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm416 0a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z"/>
  </svg>
);
// --- End SVG Icons ---


const StudentDocViewerPage = () => {
  const { isDark } = useOutletContext();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { docxUrl, title } = location.state || {};

  // Error handling
  if (!docxUrl) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-6">No document link was provided. Please go back and select a worksheet.</p>
        <button
          onClick={() => navigate(`/student/dashboard/course/${courseId || ''}`)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
          style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))" }}
        >
          <FaArrowLeftIcon />
          <span className="ml-2">Go Back to Worksheets</span>
        </button>
      </div>
    );
  }

  const embedUrl = `https://docs.google.com/gview?url=${encodeURIComponent(docxUrl)}&embedded=true`;

  return (
    // Use h-screen and subtract the student navbar's height (h-20)
    // Negative margins pull content to the edge, overriding layout padding
    <div className="flex flex-col h-[calc(100vh_-_theme('spacing.20'))] -mt-6 -ml-6 md:-mt-10 md:-ml-10"> 

      {/* Header with Back Button (Fixed Height) */}
      <div 
        className="flex items-center gap-4 p-4 flex-shrink-0"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          borderBottomWidth: "1px"
        }}
      >
        <button
          onClick={() => navigate(`/student/dashboard/course/${courseId}`)} 
          className="p-3 rounded-full transition"
          style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "--border-light"})`}}
        >
          <FaArrowLeftIcon />
        </button>
        <h1 className="text-xl font-bold truncate">{title || "Worksheet Viewer"}</h1>
      </div>

      {/* Main Content Area (Stretches to fill remaining space) */}
      <div className="flex flex-col lg:flex-row gap-6 p-6 flex-grow min-h-0">
        
        {/* --- Left 70%: Document Viewer (Stretches) --- */}
        <div 
          className="w-full lg:w-[70%] h-full rounded-2xl border"
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
            <div className="flex items-center justify-center h-full">
              <FaSpinnerIcon className="animate-spin text-4xl" />
              <span className="ml-4 text-lg">Loading document...</span>
            </div>
          </iframe>
        </div>

        {/* --- Right 30%: AI Chat & Doubts (Stretches) --- */}
        <div className="w-full lg:w-[30%] flex flex-col gap-6 h-full">
          
          {/* AI Chat Box (Takes ~75% of the 30% column) */}
          <div 
            className="flex-grow p-6 rounded-2xl border flex flex-col"
            style={{
              backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
              borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
              flexBasis: '75%' // Suggests 75% height
            }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
              <FaCommentsIcon className="text-[var(--accent-teal)]" />
              AI Assistant
            </h3>
            <div className="flex-grow flex flex-col items-center justify-center text-center"
              style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
            >
              <FaCommentsIcon className="text-5xl opacity-30 mb-4" />
              <h4 className="font-bold text-lg mb-1">Chat Coming Soon</h4>
              <p className="text-sm">Get instant help on this worksheet!</p>
            </div>
          </div>

          {/* Ask Doubt Box (Takes ~25% of the 30% column) */}
          <div 
            className="flex-shrink-0 p-6 rounded-2xl border flex flex-col justify-center"
            style={{
              backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
              borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
              flexBasis: '25%' // Suggests 25% height
            }}
          >
            <h3 className="text-xl font-bold mb-3">Still Stuck?</h3>
            <button
              onClick={() => alert("This will open a modal to ask your teacher!")}
              className="w-full px-4 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))"
              }}
            >
              <FaPaperPlaneIcon />
              <span className="ml-2">Ask a Teacher</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDocViewerPage;