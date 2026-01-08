"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  FaSun,
  FaMoon,
  FaSignOutAlt,
  FaUserGraduate,
  FaEnvelope,
  FaBirthdayCake,
  FaChalkboard,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  // FaUser is no longer needed
} from "react-icons/fa"
import { useNavigate } from "react-router-dom"
// Assuming api.js and color.css are in the parent directory
import "./color.css" 
import { checkRole, logout, getMyChildrenDetails, getMyChildHistory } from "./api.js"

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

// --- Helper: Child Card Component (New Style) ---
const ChildCard = ({ child, isDark, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`p-6 rounded-2xl border flex flex-col items-center transition-all duration-300
      ${isSelected ? 'shadow-lg' : 'opacity-70 hover:opacity-100'}
    `}
    style={{
      backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
      borderColor: isSelected ? 'var(--accent-purple)' : `var(${isDark ? "--border-dark" : "--border-light"})`,
      borderWidth: isSelected ? '2px' : '1px',
      backdropFilter: "blur(10px)"
    }}
  >
    {/* --- THIS IS THE CHANGE --- */}
    {/* Replaced the icon with a unique, aesthetic avatar */}
    <img
      src={`https://i.pinimg.com/originals/15/c1/ec/15c1ec0f3beb08c3587d65462fd0fc7a.jpg`}
      alt={child.name}
      className="w-24 h-24 rounded-full mb-4"
      style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.03)"})`}}
      // Fallback in case the avatar service is down
      onError={(e) => { 
        e.target.onerror = null; 
        e.target.src = `https://placehold.co/100/EEE/333?text=${child.name.charAt(0)}`; 
      }}
    />
    {/* --- END OF CHANGE --- */}
    
    {/* Child Info */}
    <h3 className="text-xl font-bold">{child.name}</h3>
    <p 
      className="text-sm" 
      style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
    >
      Age {child.age}, Class {child.class}
    </p>
  </button>
);

// --- Helper: Add Child Card (Dummy) ---
const AddChildCard = ({ isDark }) => (
  <button 
    className="p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center 
               min-h-[220px] transition-all duration-300 hover:shadow-lg"
    style={{
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`
    }}
  >
    <FaPlus className="text-4xl mb-4" />
    <span className="text-lg font-semibold">Add Child</span>
  </button>
);

// --- Helper: Prompt History Row Component ---
const HistoryRow = ({ item, isDark }) => (
  <div 
    className="group relative flex items-center p-4 border-b"
    style={{
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      backgroundColor: `var(${isDark ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.02)"})`
    }}
  >
    {/* Status Icon */}
    <div className="w-1/12 text-center">
      {item.isBadPrompt ? (
        <FaTimesCircle className="text-red-500 text-xl" title="Bad Prompt" />
      ) : (
        <FaCheckCircle className="text-green-500 text-xl" title="Good Prompt" />
      )}
    </div>
    
    {/* Prompt (Truncated) */}
    <div className="w-5/12 px-4">
      <p className={`truncate ${item.isBadPrompt ? 'text-red-400' : ''}`}>
        {item.prompt}
      </p>
    </div>
    
    {/* Date */}
    <div 
      className="w-3/12 px-4 text-xs" 
      style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
    >
      {new Date(item.createdAt).toLocaleString()}
    </div>
    
    {/* Worksheet ID */}
    <div 
      className="w-3/12 px-4 text-xs" 
      style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
    >
      {item.worksheetId || 'N/A'}
    </div>

    {/* The Hover Tooltip */}
    <div 
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-96 p-4
                 hidden group-hover:block z-20 
                 rounded-lg shadow-xl"
      style={{
        backgroundColor: `var(${isDark ? "--bg-dark" : "white"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        borderWidth: "1px"
      }}
    >
      <h4 className="font-bold mb-1">Full Prompt:</h4>
      <p className="text-sm mb-3 whitespace-pre-wrap">{item.prompt}</p>
      <h4 className="font-bold mb-1">Full Response:</h4>
      <p 
        className="text-sm whitespace-pre-wrap" 
        style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
      >
        {item.response || "No response (Bad Prompt)"}
      </p>
      <div 
        className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent 
                   border-t-8 absolute top-full left-1/2 -translate-x-1/2"
        style={{ borderTopColor: `var(${isDark ? "--border-dark" : "--border-light"})`}}
      ></div>
    </div>
  </div>
);

// --- Main Page Component ---
const ParentDashboardPage = () => {
  const [isDark, setIsDark] = useState(false )
  const [authStatus, setAuthStatus] = useState({
    isLoading: true,
    isAuthorized: false,
    username: "",
    correctRole: "",
    message: "Verifying your access...",
  })
  
  // Child Data
  const [childrenData, setChildrenData] = useState([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  
  // History Data
  const [selectedChildEmail, setSelectedChildEmail] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [filterBadPrompts, setFilterBadPrompts] = useState(false); // Toggle state

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
      const response = await checkRole("parent")
      if (response.success) {
        setAuthStatus({
          isLoading: false,
          isAuthorized: true,
          username: response.data.username,
          correctRole: response.data.role,
          message: response.message,
        })
      } else {
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

  // --- 2. Children Data Fetch Effect (Only after auth) ---
  useEffect(() => {
    if (!authStatus.isAuthorized) return; 

    const fetchChildren = async () => {
      setIsDataLoading(true);
      const response = await getMyChildrenDetails();
      if (response.success) {
        setChildrenData(response.data);
      } else {
        alert(response.message);
      }
      setIsDataLoading(false);
    };

    fetchChildren();
  }, [authStatus.isAuthorized]);

  // --- 3. Child Click Handler (Fetches History) ---
  const handleChildClick = async (child) => {
    setSelectedChildEmail(child.email); // Highlight the card
    setIsHistoryLoading(true);
    setHistoryData([]); // Clear old history

    const response = await getMyChildHistory(child.email);
    if (response.success) {
      setHistoryData(response.data);
    } else {
      alert(response.message);
    }
    setIsHistoryLoading(false);
  };

  const handleLogout = () => {
    logout(navigate)
  }

  // --- 4. Memoized Filtered History ---
  const filteredHistory = useMemo(() => {
    if (filterBadPrompts) {
      return historyData.filter(item => item.isBadPrompt);
    }
    return historyData; // Return all
  }, [historyData, filterBadPrompts]);


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
          <h1 className="font-bold text-3xl bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-purple)] bg-clip-text text-transparent">
            Ground Zero
          </h1>
          <div className="flex items-center gap-4">
            <span className="font-medium hidden sm:inline">
              Welcome, {authStatus.username}!
              <span className="text-sm ml-2" style={{ color: 'var(--accent-teal)'}}>
                ({authStatus.correctRole})
              </span>
            </span>
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
      <main className="container mx-auto max-w-6xl p-4 sm:p-10">
        
        <h3 className="text-2xl font-bold mb-6">
          Your Children
        </h3>

        {/* Children Cards */}
        {isDataLoading ? (
          <p>Loading children's details...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {childrenData.map(child => (
              <ChildCard 
                key={child._id} 
                child={child} 
                isDark={isDark}
                isSelected={selectedChildEmail === child.email}
                onClick={() => handleChildClick(child)}
              />
            ))}
            <AddChildCard isDark={isDark} />
          </div>
        )}

        {/* --- History Section --- */}
        <div className="mt-12">
          {/* Tabs */}
          <div className="flex justify-between items-center border-b" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`}}>
            <div className="flex gap-6">
              <button className="py-4 font-bold border-b-2" style={{ borderColor: 'var(--accent-purple)'}}>
                Prompt History
              </button>
              <button 
                className="py-4 font-medium" 
                style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
                onClick={() => alert("Recent Activity coming soon!")}
              >
                Recent Activity
              </button>
            </div>
            
            {/* Toggle Switch */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>All</span>
              <button
                onClick={() => setFilterBadPrompts(!filterBadPrompts)}
                className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${
                  filterBadPrompts ? 'bg-red-500' : 'bg-[var(--accent-teal)]'
                }`}
              >
                <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  filterBadPrompts ? 'translate-x-6' : ''
                }`}></span>
              </button>
              <span className="text-sm font-medium" style={{ color: 'var(--accent-teal)'}}>Bad Prompts Only</span>
            </div>
          </div>

          {/* History List */}
          <div 
            className="rounded-b-2xl border border-t-0 overflow-hidden" 
            style={{
              backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
              borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center p-4 text-sm uppercase"
              style={{ 
                color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
                backgroundColor: `var(${isDark ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.02)"})`
              }}
            >
              <div className="w-1/12 text-center">Status</div>
              <div className="w-5/12 px-4">Prompt</div>
              <div className="w-3/12 px-4">Date</div>
              <div className="w-3/12 px-4">Worksheet ID</div>
            </div>

            {/* List Body */}
            <div>
              {isHistoryLoading ? (
                <div className="flex items-center justify-center p-10">
                  <FaSpinner className="animate-spin text-3xl text-[var(--accent-purple)]" />
                  <span className="ml-4 text-lg">Loading history...</span>
                </div>
              ) : !selectedChildEmail ? (
                <p className="p-10 text-center" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
                  Please select a child's card above to view their prompt history.
                </p>
              ) : filteredHistory.length === 0 ? (
                <p className="p-10 text-center" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
                  No {filterBadPrompts ? "bad prompts" : "prompts"} found for this student.
                </p>
              ) : (
                filteredHistory.map((item, index) => (
                  <HistoryRow 
                    key={index} 
                    item={item} 
                    isDark={isDark} 
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ParentDashboardPage