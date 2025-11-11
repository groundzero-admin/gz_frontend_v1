"use client"

import { useState, useEffect } from "react"
import {
  FaSun,
  FaMoon,
  FaSignOutAlt,
  FaUserGraduate,
  FaEnvelope,
  FaBirthdayCake,
  FaChalkboard,
} from "react-icons/fa"
import { useNavigate } from "react-router-dom"
// --- PATHS FIXED ---
import "./color.css" // Your color.css file
import { checkRole, logout, getMyChildrenDetails } from "./api.js"

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

// --- Helper: Child Card Component ---
const ChildCard = ({ child, isDark }) => (
  <div
    className="p-6 rounded-2xl border"
    style={{
      backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      backdropFilter: "blur(10px)"
    }}
  >
    <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
      <FaUserGraduate className="text-[var(--accent-teal)]" />
      {child.name}
    </h3>
    <p className="flex items-center gap-3 mb-2" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
      <FaEnvelope />
      {child.email}
    </p>
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-4">
      <p className="flex items-center gap-3" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
        <FaBirthdayCake />
        Age: <span className="font-bold" style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`}}>{child.age}</span>
      </p>
      <p className="flex items-center gap-3" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
        <FaChalkboard />
        Class: <span className="font-bold" style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`}}>{child.class}</span>
      </p>
    </div>
  </div>
);

// --- Main Page Component ---
const ParentDashboardPage = () => {
  const [isDark, setIsDark] = useState(true)
  const [authStatus, setAuthStatus] = useState({
    isLoading: true,
    isAuthorized: false,
    username: "",
    correctRole: "",
    message: "Verifying your access...",
  })
  const [childrenData, setChildrenData] = useState([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const navigate = useNavigate()

  // --- Theme Toggle Effect ---
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  // --- 1. Auth Check Effect ---
  useEffect(() => {
    const authorizePage = async () => {
      // Check for "parent" role
      const response = await checkRole("parent")

      if (response.success) {
        setAuthStatus({
          isLoading: false,
          isAuthorized: true,
          username: response.data.username, // Get username from auth check
          correctRole: response.data.role,
          message: response.message,
        })
      } else {
        // Auth failed (not logged in, or wrong role)
        setAuthStatus({
          isLoading: false,
          isAuthorized: false,
          username: "",
          correctRole: response.data?.correctRole || "", 
          message: response.message,
        })
      }
    }
    authorizePage()
  }, [])

  // --- 2. Data Fetch Effect (runs only *after* auth is successful) ---
  useEffect(() => {
    if (!authStatus.isAuthorized) return; // Don't fetch if not authorized

    const fetchChildren = async () => {
      setIsDataLoading(true);
      const response = await getMyChildrenDetails();
      if (response.success) {
        setChildrenData(response.data); // Set the array of children
      } else {
        alert(response.message); // Show error (e.g., "Failed to fetch")
      }
      setIsDataLoading(false);
    };

    fetchChildren();
  }, [authStatus.isAuthorized]); // Dependency on auth success

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
    const isRoleMismatch = authStatus.correctRole && authStatus.correctRole !== "parent"

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

  // --- RENDER 3: Authorized and Loaded State ---
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
      }}
    >
      {/* Simple Navbar */}
      <header
        className="p-4 border-b"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          backdropFilter: "blur(10px)"
        }}
      >
        <div className="container mx-auto flex justify-between items-center">
          {/* --- EDITED: Changed text-2xl to text-3xl --- */}
          <h1 className="font-bold text-3xl bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-purple)] bg-clip-text text-transparent">
            Ground Zero
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-3 rounded-full hover:opacity-80 transition"
              style={{
                backgroundColor: `var(${isDark ? "--bg-dark" : "--card-light"})`,
              }}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <FaSun className="text-xl" style={{ color: "white" }} />
              ) : (
                <FaMoon
                  className="text-xl"
                  style={{ color: "var(--accent-purple)" }}
                />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 p-3 rounded-lg font-medium transition"
              style={{
                color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
                backgroundColor: `var(${isDark ? "--bg-dark" : "--card-light"})`,
              }}
              aria-label="Logout"
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-5xl p-4 sm:p-10">
        {/* --- EDITED: Added role to welcome message --- */}
        <div className="flex items-baseline gap-3 mb-6">
          <h2 className="text-4xl font-bold">
            Welcome, {authStatus.username}!
          </h2>
          <span 
            className="text-2xl font-medium capitalize" 
            style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
          >
            ({authStatus.correctRole})
          </span>
        </div>
        
        <h3 className="text-2xl font-bold mb-6" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
          Your Children
        </h3>

        {isDataLoading ? (
          <p>Loading children's details...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {childrenData.length > 0 ? (
              childrenData.map(child => (
                <ChildCard key={child._id} child={child} isDark={isDark} />
              ))
            ) : (
              <p>No children linked to your account were found.</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default ParentDashboardPage