"use client"

import { useState, useEffect } from "react"
import {
  FaRegLightbulb,
  FaBook,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaEnvelopeOpenText,
  FaSignOutAlt,
  FaUserCircle,
  FaAngleRight,
  FaBars, // Hamburger
  FaTimes, // Close
  FaSun,
  FaMoon
} from "react-icons/fa"
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom"
import "../color.css" // Your color.css file
import { checkRole, logout } from "../api.js"

// --- Sidebar Component (Re-styled) ---
const Sidebar = ({ userData, onLogout, isDark, onToggleTheme, isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation()
  const currentPath = location.pathname

  const sidebarLinks = [
    { to: "/admin/dashboard/request", icon: <FaRegLightbulb />, label: "Requests" },
    { to: "/admin/dashboard/batches", icon: <FaBook />, label: "Batches" },
    { to: "/admin/dashboard/teacher", icon: <FaChalkboardTeacher />, label: "Teachers" },
    { to: "/admin/dashboard/student", icon: <FaUserGraduate />, label: "Students" },
    { to: "/admin/dashboard/invitation", icon: <FaEnvelopeOpenText />, label: "Invitations" },

    // ✅ NEW ATTENDANCE ROUTE ADDED
    { to: "/admin/dashboard/attendance", icon: <FaUserGraduate />, label: "Attendance" },
  ]


  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <nav
        className={`w-64 h-screen fixed top-0 left-0 p-5 flex flex-col z-20 transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0`}
        style={{
          backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
          color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
          borderRight: `1px solid var(${isDark ? "--border-dark" : "--border-light"})`
        }}
      >
        {/* User Info Header */}
        <div className="flex items-center gap-3 mb-8">
          <FaUserCircle className="text-4xl" style={{ color: "var(--accent-teal)"}} />
          <div>
            <h3 className="font-bold text-sm">{userData.username} - Admin</h3>
            <p className="text-xs" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
              {userData.email}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <ul className="flex flex-col gap-2 flex-grow">
          {sidebarLinks.map((link) => (
            <SidebarLink
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              isActive={currentPath === link.to}
              isDark={isDark}
            />
          ))}
        </ul>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-3 p-3 mb-2 rounded-lg font-medium transition-colors"
          style={{ 
            color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
            backgroundColor: `var(${isDark ? "--card-dark" : "rgba(0,0,0,0.03)"})`
          }}
        >
          {isDark ? <FaSun style={{ color: "white"}} /> : <FaMoon style={{ color: "var(--accent-purple)"}} />}
          <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 p-3 rounded-lg font-medium transition-colors"
          style={{ 
            color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = `var(${isDark ? "--card-dark" : "rgba(0,0,0,0.03)"})`}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <FaSignOutAlt />
          <span>Log out</span>
        </button>
      </nav>
    </>
  )
}

// --- Sidebar Link Component (Re-styled) ---
const SidebarLink = ({ to, icon, label, isActive, isDark }) => (
  <li>
    <Link
      to={to}
      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
        isActive
          ? "text-[var(--accent-teal)]"
          : ""
      }`}
      style={{
        backgroundColor: isActive ? `var(${isDark ? "rgba(0,196,204,0.1)" : "rgba(0,196,204,0.1)"})` : 'transparent',
        color: isActive ? "var(--accent-teal)" : `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`
      }}
      onMouseOver={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = `var(${isDark ? "--card-dark" : "rgba(0,0,0,0.03)"})`}}
      onMouseOut={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'}}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      {isActive && <FaAngleRight />}
    </Link>
  </li>
)

// --- Full Page Message (for Errors/Loading) ---
const FullPageMessage = ({ isDark, children }) => (
  <div
    className="min-h-screen w-full flex flex-col items-center justify-center gap-6"
    style={{
      backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
      color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
    }}
  >
    {children}
  </div>
)

// --- The Main Layout Component (Handles Auth & State) ---
const AdminLayout = () => {
  const [isDark, setIsDark] = useState(true) // Default to dark
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [authStatus, setAuthStatus] = useState({
    isLoading: true,
    isAuthorized: false,
    userData: null,
    correctRole: "",
    message: "Checking authorization...",
  })
  const navigate = useNavigate()

  // --- Theme Effect ---
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  // --- Auth Check Effect ---
  useEffect(() => {
    const authorizePage = async () => {
      const response = await checkRole("admin")
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

  // --- 1. Loading State ---
  if (authStatus.isLoading) {
    return (
      <FullPageMessage isDark={isDark}>
        <h2 className="text-2xl font-bold animate-pulse">{authStatus.message}</h2>
      </FullPageMessage>
    )
  }

  // --- 2. Not Authorized State ---
  if (!authStatus.isAuthorized) {
    const isRoleMismatch = authStatus.correctRole && authStatus.correctRole !== "admin"
    return (
      <FullPageMessage isDark={isDark}>
        <h2 className="text-3xl font-bold text-red-500">Access Denied</h2>
        <p className="text-lg">{authStatus.message}</p>
        
        {isRoleMismatch ? (
          <button
            onClick={() => navigate(`/${authStatus.correctRole}/dashboard`)}
            className="px-6 py-3 rounded-lg font-bold text-lg text-white"
            style={{ backgroundColor: "var(--accent-purple)"}}
          >
            Go to {authStatus.correctRole} Dashboard
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-lg font-bold text-lg text-white"
            style={{ backgroundColor: "var(--accent-teal)"}}
          >
            Go to Login
          </button>
        )}
      </FullPageMessage>
    )
  }

  // --- 3. Authorized State (Render Layout) ---
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
      }}
    >
      <Sidebar 
        userData={authStatus.userData} 
        onLogout={handleLogout} 
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      {/* Mobile Header with Hamburger Button */}
      <header 
        className="md:hidden sticky top-0 flex items-center p-4 z-10"
        style={{
          backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
          borderBottom: `1px solid var(${isDark ? "--border-dark" : "--border-light"})`,
          backdropFilter: "blur(10px)"
        }}
      >
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-2xl p-2">
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </header>

      {/* Main Content Area: Renders child routes */}
      <main className="md:ml-64 p-6 md:p-10">
        {/* --- THIS IS THE UPDATE ---
          Pass both isDark and userData to all child routes
        */}
        <Outlet context={{ isDark, userData: authStatus.userData }} /> 
      </main>
    </div>
  )
}

export default AdminLayout