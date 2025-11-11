import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FaBook, FaChalkboard, FaSpinner } from 'react-icons/fa';
// Assuming api.js is in the parent directory
import { listStudentsCourses, enrollInCourse } from '../api.js'; 

// --- Individual Course Card Component ---
const CourseCard = ({ course, isDark, onEnroll, isEnrolling }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Only navigate if the student is enrolled
    if (course.isEnrolled) {
      // Use singular 'course' as we defined in App.jsx
      navigate(`/student/dashboard/course/${course.courseId}`);
    }
  };

  const handleEnrollClick = (e) => {
    // Stop the click from bubbling up to the card wrapper
    e.stopPropagation();
    onEnroll(course.courseId);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`p-6 rounded-2xl border flex flex-col h-full transition-all duration-300 ${
        course.isEnrolled 
          ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' 
          : 'opacity-80' // Make non-enrolled courses slightly faded
      }`}
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        backdropFilter: "blur(10px)"
      }}
    >
      <div className="flex-grow">
        {/* Icon */}
        <span 
          className="flex items-center justify-center w-12 h-12 rounded-full mb-4"
          style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.03)"})`}}
        >
          <FaBook className="text-2xl text-[var(--accent-purple)]" />
        </span>
        
        {/* Course Info */}
        <h3 className="text-xl font-bold mb-2">{course.title}</h3>
        <p 
          className="flex items-center gap-3 mb-4 text-sm" 
          style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
        >
          <FaChalkboard />
          Class: {course.class}
        </p>
        <p 
          className="text-sm line-clamp-3"
          style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
        >
          {course.description}
        </p>
      </div>

      {/* Conditional "Study" or "Enroll" Button */}
      <div className="mt-6">
        {course.isEnrolled ? (
          <button 
            className="w-full px-4 py-3 rounded-lg font-bold text-lg text-white"
            style={{
              background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))"
            }}
          >
            Study
          </button>
        ) : (
          <button 
            onClick={handleEnrollClick}
            disabled={isEnrolling}
            className="w-full px-4 py-3 rounded-lg font-bold text-lg flex items-center justify-center transition"
            style={{
              backgroundColor: `var(${isDark ? "--border-dark" : "rgba(0,0,0,0.05)"})`,
              color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
            }}
          >
            {isEnrolling ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Enrolling...
              </>
            ) : (
              "Enroll"
            )}
          </button>
        )}
      </div>
    </div>
  );
};


// --- Main Page Component ---
const StudentCoursesPage = () => {
  const { isDark } = useOutletContext();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null); // Tracks which course is enrolling

  // --- Data Fetching ---
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      const response = await listStudentsCourses();
      
      if (response.success) {
        setCourses(response.data);
      } else {
        // Auth errors are handled by StudentLayout
        alert(response.message);
      }
      setIsLoading(false);
    };

    fetchCourses();
  }, []);

  // --- Enroll Action Handler ---
  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId); // Set loading state for this card
    
    // Calls the real API function
    const response = await enrollInCourse(courseId); 
    alert(response.message);

    if (response.success) {
      // Update the UI in real-time
      setCourses(prevCourses =>
        prevCourses.map(course =>
          course.courseId === courseId
            ? { ...course, isEnrolled: true } // Flip the 'isEnrolled' status
            : course
        )
      );
    }
    setEnrollingId(null); // Clear loading state
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Courses</h1>

      {isLoading ? (
        <p>Loading courses...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.length > 0 ? (
            courses.map(course => (
              <CourseCard 
                key={course.courseId} 
                course={course} 
                isDark={isDark} 
                onEnroll={handleEnroll}
                isEnrolling={enrollingId === course.courseId}
              />
            ))
          ) : (
            <div 
              className="p-8 rounded-2xl border text-center col-span-full"
              style={{
                backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
                borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
              }}
            >
              <FaBook className="text-5xl mx-auto mb-6 text-[var(--accent-purple)]" />
              <h2 className="text-2xl font-bold mb-2">No Courses Found</h2>
              <p style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
                It looks like there are no courses assigned to your class yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentCoursesPage;