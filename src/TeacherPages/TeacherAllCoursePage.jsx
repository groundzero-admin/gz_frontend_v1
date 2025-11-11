import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FaBook, FaChalkboard } from "react-icons/fa";
// Assuming api.js is in the parent directory
import { listTeachersCourses } from "../api.js"; 

// --- Individual Course Card Component ---
const CourseCard = ({ course, isDark, onClick }) => (
  <button 
    onClick={onClick}
    className="p-6 rounded-2xl border text-left flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
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
        className="text-sm line-clamp-3" // Truncates description
        style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
      >
        {course.description}
      </p>
    </div>
  </button>
);

// --- Main Page Component ---
const TeacherCoursesPage = () => {
  const { isDark } = useOutletContext();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      const response = await listTeachersCourses();
      
      if (response.success) {
        setCourses(response.data);
      } else {
        // Auth errors are handled by TeacherLayout
        alert(response.message);
      }
      setIsLoading(false);
    };

    fetchCourses();
  }, []); // Runs once on page load

  const handleCourseClick = (courseId) => {
    // Navigate to the specific course page
    navigate(`/teacher/dashboard/course/${courseId}`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Assigned Courses</h1>

      {isLoading ? (
        <p>Loading courses...</p>
      ) : courses.length === 0 ? (
        // Empty State
        <div 
          className="p-8 rounded-2xl border text-center"
          style={{
            backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
            borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          }}
        >
          <FaBook className="text-5xl mx-auto mb-6 text-[var(--accent-purple)]" />
          <h2 className="text-2xl font-bold mb-2">No Courses Found</h2>
          <p style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
            You have not been assigned to any courses yet.
          </p>
        </div>
      ) : (
        // Data State
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map(course => (
            <CourseCard 
              key={course.courseId} 
              course={course} 
              isDark={isDark} 
              onClick={() => handleCourseClick(course.courseId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherCoursesPage;