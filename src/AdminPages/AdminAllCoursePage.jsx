import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FaBook, FaChalkboard, FaAlignLeft, FaPlus, FaTimes, FaEnvelope, FaUser } from "react-icons/fa";
// --- Assuming api.js is in the same directory ---
import { listAllCourses, createCourse } from "../api.js"; 

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

// --- Create Course Modal Component ---
// Defined outside the main component to prevent re-render issues
const CreateCourseModal = ({ isOpen, onClose, onSubmit, isDark }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseClass, setCourseClass] = useState("");
  const [teacherEmails, setTeacherEmails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = {
      title,
      description,
      class: Number(courseClass),
      // Split by comma, trim whitespace, and remove any empty strings
      teacherEmails: teacherEmails.split(',').map(email => email.trim()).filter(Boolean)
    };
    
    const success = await onSubmit(formData);
    // onSubmit will handle alerts. If successful, it closes the modal.
    // If not, we stop loading so the user can fix errors.
    if (!success) {
      setIsSubmitting(false);
    }
    // On success, the modal will be closed by the parent
  };
  
  // This ensures the modal doesn't render if not open
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

        <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
        
        <form onSubmit={handleSubmit}>
          <ModalInput
            id="title"
            label="Course Title"
            icon={<FaBook />}
            type="text"
            placeholder="e.g., Introduction to Algebra"
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
            placeholder="A brief summary of the course..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            isDark={isDark}
            required
          />
          <ModalInput
            id="class"
            label="Class"
            icon={<FaChalkboard />}
            type="number"
            placeholder="e.g., 9"
            value={courseClass}
            onChange={(e) => setCourseClass(e.target.value)}
            isDark={isDark}
            required
          />
          <ModalInput
            id="teachers"
            label="Teacher Emails (Optional)"
            icon={<FaEnvelope />}
            type="text"
            placeholder="teacher1@mail.com, teacher2@mail.com"
            value={teacherEmails}
            onChange={(e) => setTeacherEmails(e.target.value)}
            isDark={isDark}
          />
          
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
              {isSubmitting ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


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
        className="text-sm line-clamp-3" // Truncates description to 3 lines
        style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
      >
        {course.description}
      </p>
    </div>
  </button>
);

// --- "Add Course" Card (FUNCTIONAL) ---
const AddCourseCard = ({ isDark, onClick }) => (
  <button 
    onClick={onClick} // <-- ADDED ONCLICK
    className="p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center min-h-[268px] transition-all duration-300 hover:shadow-lg"
    style={{
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`
    }}
  >
    <FaPlus className="text-4xl mb-4" />
    <span className="text-lg font-semibold">Add New Course</span>
  </button>
);

// --- Main Page Component (UPDATED) ---
const AdminCourseListPage = () => {
  const { isDark } = useOutletContext(); // Get theme from parent
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // <-- ADDED STATE
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      const response = await listAllCourses();
      
      if (response.success) {
        setCourses(response.data);
      } else {
        alert(response.message);
      }
      setIsLoading(false);
    };

    fetchCourses();
  }, []); // Runs once on page load

  const handleCourseClick = (courseId) => {
    navigate(`/admin/dashboard/course/${courseId}`);
  };

  // --- ADDED: Handler for modal submission ---
  const handleCreateCourseSubmit = async (formData) => {
    const response = await createCourse(formData);
    
    // Show detailed alert with link results if available
    if (response.success) {
      let alertMessage = response.message;
      if (response.data.teacherLinks && response.data.teacherLinks.length > 0) {
        alertMessage += "\n\nTeacher Link Status:\n" + 
          response.data.teacherLinks.map(link => `- ${link.email}: ${link.status}`).join("\n");
      }
      alert(alertMessage);
    } else {
      alert(response.message); // Show error message
    }
    
    if (response.success) {
      // Add new course to the top of the list
      setCourses(prevCourses => [response.data, ...prevCourses]);
      setIsModalOpen(false); // Close modal
      return true; // Tell modal submission was successful
    }
    return false; // Tell modal submission failed
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">All Courses</h1>

      {isLoading ? (
        <p>Loading courses...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map(course => (
            <CourseCard 
              key={course._id} 
              course={course} 
              isDark={isDark} 
              onClick={() => handleCourseClick(course._id)}
            />
          ))}
          <AddCourseCard isDark={isDark} onClick={() => setIsModalOpen(true)} />
        </div>
      )}

      {/* --- ADDED: Render the modal --- */}
      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCourseSubmit}
        isDark={isDark}
      />
    </div>
  );
};

export default AdminCourseListPage;