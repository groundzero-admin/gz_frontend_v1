import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { FaBook, FaPencilAlt, FaCalendarAlt, FaQuestionCircle } from 'react-icons/fa';

// --- Reusable Quick Action Card ---
const QuickActionCard = ({ to, icon, title, description, isDark }) => (
  <Link
    to={to}
    className="p-6 rounded-2xl border flex items-center gap-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    style={{
      backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      backdropFilter: "blur(10px)"
    }}
  >
    <span 
      className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full"
      style={{ 
        backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.03)"})`,
      }}
    >
      {icon}
    </span>
    <div>
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
        {description}
      </p>
    </div>
  </Link>
);

// --- Welcome SVG Illustration ---
const WelcomeSVG = ({ isDark }) => (
  <svg viewBox="0 0 200 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="student-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--accent-teal)" />
        <stop offset="100%" stopColor="var(--accent-purple)" />
      </linearGradient>
    </defs>
    
    {/* Book */}
    <path 
      d="M160,150 L160,30 C160,20 150,10 140,10 L70,10 C50,10 40,20 40,40 L40,160 C40,170 50,180 60,180 L140,180 C150,180 160,170 160,160" 
      fill={`var(${isDark ? "--card-dark" : "--bg-light"})`} 
      stroke="url(#student-grad)" 
      strokeWidth="6"
    />
    {/* Page line */}
    <line 
      x1="45" y1="35" x2="155" y2="35" 
      stroke={`var(${isDark ? "--border-dark" : "--border-light"})`} 
      strokeWidth="3"
    />
    <line 
      x1="45" y1="165" x2="155" y2="165" 
      stroke={`var(${isDark ? "--border-dark" : "--border-light"})`} 
      strokeWidth="3"
    />
    {/* Bookmark */}
    <path 
      d="M70,10 L70,50 L85,35 L100,50 L100,10" 
      fill="url(#student-grad)"
      stroke="url(#student-grad)"
      strokeWidth="2"
    />
  </svg>
);


const StudentDashboardPage = () => {
  // Get userData and isDark from the parent layout
  const { isDark, userData } = useOutletContext();

  return (
    <div className="flex flex-col gap-8">
      {/* --- Main Welcome Card --- */}
      <div 
        className="p-8 rounded-2xl border flex flex-col md:flex-row items-center justify-between overflow-hidden"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        }}
      >
        <div className="z-10">
          <h1 className="text-4xl font-bold mb-3">
            Hello, {userData.username}!
          </h1>
          <p className="text-lg mb-8" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
            Welcome back. Let's get started on your next lesson.
          </p>
          <div className="flex items-center gap-4">
            <Link 
              to="/student/dashboard/practice"
              className="px-6 py-3 rounded-xl font-bold text-lg text-white"
              style={{
                background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))"
              }}
            >
              Start Practice
            </Link>
            <Link 
              to="/student/dashboard/doubts"
              className="px-6 py-3 rounded-xl font-bold text-lg"
              style={{
                backgroundColor: `var(${isDark ? "--border-dark" : "rgba(0,0,0,0.05)"})`,
              }}
            >
              Ask a Doubt
            </Link>
          </div>
        </div>
        <div className="w-48 h-48 mt-8 md:mt-0 z-10">
          <WelcomeSVG isDark={isDark} />
        </div>
      </div>

      {/* --- Quick Action Cards --- */}
      <h2 className="text-2xl font-bold">Your Quick Links</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {/* --- 3. UPDATED THIS CARD'S LINK --- */}
        <QuickActionCard 
          to="/student/dashboard/course" 
          icon={<FaBook className="text-3xl text-[var(--accent-purple)]" />} 
          title="My Courses"
          description="View all your enrolled courses and progress."
          isDark={isDark}
        />
        <QuickActionCard 
          to="/student/dashboard/practice" 
          icon={<FaPencilAlt className="text-3xl text-[var(--accent-teal)]" />} 
          title="Practice Zone"
          description="Hone your skills with interactive exercises."
          isDark={isDark}
        />
        <QuickActionCard 
          to="/student/dashboard/schedules" 
          icon={<FaCalendarAlt className="text-3xl text-orange-400" />} 
          title="Class Schedules"
          description="See your upcoming classes and events."
          isDark={isDark}
        />
        <QuickActionCard 
          to="/student/dashboard/doubts" 
          icon={<FaQuestionCircle className="text-3xl text-blue-400" />} 
          title="Doubt Solver"
          description="Get help from teachers and our AI assistant."
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default StudentDashboardPage;