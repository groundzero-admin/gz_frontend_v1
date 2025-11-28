"use client"

import { useState, useEffect } from "react"
import {
  FaRegLightbulb, // <-- Added for Dashboard
  FaBook,
  FaPencilAlt,
  FaQuestionCircle,
  FaCalendarAlt,
  FaSignOutAlt,
  FaUserCircle,
  FaAngleRight,
  FaBars,
  FaTimes,
  FaSun,
  FaMoon,
} from "react-icons/fa"

import { GiArtificialHive } from "react-icons/gi";


import { useNavigate, Link, Outlet, useLocation } from "react-router-dom"
// Assuming api.js and color.css are in the parent directory
import "../color.css" 
import { checkRole, logout } from "../api.js" 

// --- Helper: Full Page Message (for Auth Errors) ---
const FullPageMessage = ({ isDark, children }) => (
  <div
    className="min-h-screen w-full flex flex-col items-center justify-center p-6"
    style={{
      backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
      color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
    }}
  >
    <div 
      className="p-10 rounded-2xl border text-center"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        backdropFilter: "blur(10px)"
      }}
    >
      {children}
    </div>
  </div>
)

// --- Helper: SidebarLink ---
const SidebarLink = ({ to, icon, label, isActive, isDark }) => (
  <li>
    <Link
      to={to}
      className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? "font-bold text-white shadow-lg" 
          : "font-medium"
      }`}
      style={{
        backgroundColor: isActive ? 'var(--accent-purple)' : 'transparent',
        color: isActive ? 'white' : `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
      }}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {isActive && <FaAngleRight className="text-xl" />}
    </Link>
  </li>
);

// --- Sidebar Component ---
const Sidebar = ({ isDark, onLogout, onToggleTheme, isOpen }) => {
  const location = useLocation();
  // Check if the current path *starts with* the link path
  const isActive = (path) => location.pathname.startsWith(path);
  // Check for *exact* path match
  const isExactActive = (path) => location.pathname === path;

  return (
    <nav 
      className={`w-72 h-screen fixed top-0 left-0 p-6 flex flex-col z-30 transition-all duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        borderRightWidth: "1px",
        backdropFilter: "blur(10px)"
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 mb-10"
        style={{
          color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
        }}
      >
        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[var(--accent-purple)]">
          <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
        </svg>
        <h2 className="font-bold text-2xl">GZ Student</h2>
      </div>

      {/* Links - Updated for Student */}
      <ul className="flex flex-col gap-2 flex-grow">
        {/* --- 1. NEW DASHBOARD LINK --- */}
        <SidebarLink 
          to="/student/dashboard" 
          icon={<FaRegLightbulb />} 
          label="Dashboard" 
          isActive={isExactActive("/student/dashboard")} // Exact match
          isDark={isDark}
        />
        {/* --- 2. CORRECTED "MY COURSES" LINK --- */}
        <SidebarLink 
          to="/student/dashboard/mybatches" 
          icon={<FaBook />} 
          label="My Batches" 
          isActive={isActive("/student/dashboard/mybatches")}
          isDark={isDark}
        />

          <SidebarLink 
            to="/student/dashboard/allbatches" 
            icon={<FaBook />} 
            label="All Batches" 
            isActive={isActive("/student/dashboard/allbatches")}
            isDark={isDark}
          />

         <SidebarLink 
          to="/student/dashboard/asktoai" 
          icon={<GiArtificialHive />} 
          label="Ask to AI" 
          isActive={isActive("/student/dashboard/asktoai")}
          isDark={isDark}
        />

        <SidebarLink 
          to="/student/dashboard/replit" 
          icon={<FaPencilAlt />} 
          label="Replit" 
          isActive={isActive("/student/dashboard/replit")}
          isDark={isDark}
        />
        <SidebarLink 
          to="/student/dashboard/doubts" 
          icon={<FaQuestionCircle />} 
          label="Doubts" 
          isActive={isActive("/student/dashboard/doubts")}
          isDark={isDark}
        />
        <SidebarLink 
          to="/student/dashboard/schedules" 
          icon={<FaCalendarAlt />} 
          label="Schedules" 
          isActive={isActive("/student/dashboard/schedules")}
          isDark={isDark}
        />
      </ul>
      
      {/* Footer (Unchanged) */}
      <div className="flex flex-col gap-4">
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-4 p-3 rounded-lg font-medium transition"
          style={{
            color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
            backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.03)"})`
          }}
        >
          {isDark ? <FaSun /> : <FaMoon />}
          <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-4 p-3 rounded-lg font-medium transition"
          style={{
            color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
            backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.03)"})`
          }}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

// --- Navbar Component (Unchanged) ---
const Navbar = ({ userData, onToggleSidebar, isDark }) => (
  <header
    className="h-20 fixed top-0 left-0 right-0 flex items-center justify-between px-6 z-20
      md:left-72
    "
    style={{
      backgroundColor: `var(${isDark ? "rgba(11, 12, 27, 0.8)" : "rgba(248, 249, 250, 0.8)"})`,
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      borderBottomWidth: "1px",
      backdropFilter: "blur(10px)"
    }}
  >
    <div className="flex items-center gap-4">
      <button onClick={onToggleSidebar} className="p-2 md:hidden">
        <FaBars className="text-2xl" />
      </button>
      <div className="hidden sm:block">
        <h3 className="font-bold text-lg">
          Welcome, {userData.username}!
          <span className="text-sm font-medium ml-2" style={{ color: 'var(--accent-teal)'}}>
            ({userData.student_number})
          </span>
        </h3>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <span className="font-bold hidden sm:block">{userData.username}</span>
      <FaUserCircle className="text-3xl" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}} />
    </div>
  </header>
);

// --- The Main Layout Component (Unchanged Auth Logic) ---
const StudentLayout = () => {
  const [isDark, setIsDark] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [authStatus, setAuthStatus] = useState({
    isLoading: true,
    isAuthorized: false,
    userData: null,
    correctRole: "",
    message: "Checking authorization...",
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  useEffect(() => {
    const authorizePage = async () => {
      const response = await checkRole("student")
      if (response.success) {
        setAuthStatus({
          isLoading: false,
          isAuthorized: true,
          userData: response.data, 
          correctRole: response.data.role,
          message: response.message,
        })

 


      } else {
        setAuthStatus({
          isLoading: false,
          isAuthorized: false,
          userData: null,
          correctRole: response.data?.correctRole || "",
          message: response.message,
        })
      }
    }
    authorizePage()
  }, [])

  const handleLogout = () => {
    logout(navigate)
  }

  // --- RENDER 1: Loading State ---
  if (authStatus.isLoading) {
    return (
      <FullPageMessage isDark={isDark}>
        <h2 className="text-2xl font-bold">{authStatus.message}</h2>
      </FullPageMessage>
    )
  }

  // --- RENDER 2: Not Authorized State ---
  if (!authStatus.isAuthorized) {
    const isRoleMismatch = authStatus.correctRole && authStatus.correctRole !== "student"
    return (
      <FullPageMessage isDark={isDark}>
        <h2 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h2>
        <p className="text-lg mb-6">{authStatus.message}</p>
        
        {isRoleMismatch ? (
          <button
            onClick={() => navigate(`/${authStatus.correctRole}/dashboard`)}
            className="px-6 py-3 rounded-xl font-bold text-lg text-white"
            style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))" }}
          >
            Go to {authStatus.correctRole} Dashboard
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-xl font-bold text-lg text-white"
            style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))" }}
          >
            Go to Login
          </button>
        )}
      </FullPageMessage>
    )
  }


  // --- RENDER 3: Authorized State ---
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
      }}
    >
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <Sidebar 
        isDark={isDark}
        onLogout={handleLogout}
        onToggleTheme={() => setIsDark(!isDark)}
        isOpen={isSidebarOpen}
      />
      <Navbar
        userData={authStatus.userData}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isDark={isDark}
      />
      <main className="transition-all duration-300 md:ml-72 pt-20">
        <div className="p-6 md:p-10">
          <Outlet context={{ isDark, userData: authStatus.userData }} /> 
        </div>
      </main>
    </div>
  )
}

export default StudentLayout