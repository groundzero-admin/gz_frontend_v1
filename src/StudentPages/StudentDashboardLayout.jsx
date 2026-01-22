"use client"

import { useState, useEffect, useMemo } from "react"
import {
  FaHome,
  FaCommentDots,
  FaCompass,
  FaSun,
  FaMoon,
  
} from "react-icons/fa" 

// import { BsClipboard2Pulse } from "react-icons/bs";


import { GoGoal } from "react-icons/go";

import { MdOutlineRocketLaunch } from "react-icons/md"; 
import { BsStars } from "react-icons/bs"
import { HiOutlineLogout } from "react-icons/hi";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom"
import "../color.css"
import { checkRole, logout } from "../api.js"

// --- Helper: Full Page Message ---
const FullPageMessage = ({ isDark, children }) => (
  <div
    className="min-h-screen w-full flex flex-col items-center justify-center p-6 transition-colors duration-300"
    style={{
      backgroundColor: isDark ? "#02040a" : "#F3F4F6", 
      color: isDark ? "#E0E7FF" : "#1F2937",
    }}
  >
    <div
      className="p-10 rounded-2xl border text-center shadow-2xl"
      style={{
        backgroundColor: isDark ? "#0B0C1B" : "#FFFFFF",
        borderColor: isDark ? "#1F2937" : "#E5E7EB",
      }}
    >
      {children}
    </div>
  </div>
)

// --- Helper: Sidebar Item Component (Optimized) ---
const SidebarItem = ({ to, icon, label, subLabel, isActive, isDark }) => {
  return (
    <Link
      to={to}
      // OPTIMIZATION: Removed 'backdrop-blur-md' from non-active state to save resources
      // Added 'transform-gpu' to active state to smooth out the glow effect rendering
      className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 mb-2 overflow-hidden transform-gpu
        ${isActive 
          ? "bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.15)] border border-cyan-500/20 backdrop-blur-md" 
          : "text-gray-500 hover:bg-gray-500/5 hover:text-cyan-400 border border-transparent"
        }
      `}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-50 pointer-events-none" />
      )}

      <div 
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 relative z-10
          ${isActive 
            ? "bg-cyan-500/20 text-cyan-400 shadow-inner shadow-cyan-500/20" 
            : "bg-gray-500/10 text-gray-500 group-hover:bg-cyan-500/10 group-hover:text-cyan-400"
          }
        `}
      >
        <span className="text-lg">{icon}</span>
      </div>

      <div className="flex-1 relative z-10">
        <span 
          className={`font-semibold text-sm block transition-colors truncate
          ${isActive 
             ? (isDark ? "text-cyan-50" : "text-black") 
             : (isDark ? "text-gray-400" : "text-gray-600")
          }`}
        >
          {label}
        </span>
        
        <span className={`text-[10px] uppercase tracking-wider font-medium ${isActive ? "text-cyan-400/80" : "text-gray-500"}`}>
          {subLabel}
        </span>
      </div>

      {isActive && (
        <BsStars className="w-4 h-4 text-cyan-400 animate-pulse relative z-10" />
      )}
    </Link>
  )
}

// --- Sidebar Component (Optimized) ---
const Sidebar = ({ isDark, onLogout, onToggleTheme, isOpen, userData }) => {
  const location = useLocation()
  const [companionName, setCompanionName] = useState("Spark");
  
  const isActive = (path) => {
    if (path === "/student/dashboard") return location.pathname === "/student/dashboard";
    return location.pathname.startsWith(path);
  }

  useEffect(() => {
    const updateCompanionName = () => {
      if (!userData) return;
      
      const userKey = userData.email || userData.user_number || "guest";
      const storageKey = `student_companion_name_${userKey}`;
      const savedName = localStorage.getItem(storageKey);

      if (savedName && savedName.trim() !== "") {
        setCompanionName(savedName);
      } else {
        setCompanionName("Spark");
      }
    };

    updateCompanionName();
    window.addEventListener("storage", updateCompanionName);
    window.addEventListener("focus", updateCompanionName);

    return () => {
      window.removeEventListener("storage", updateCompanionName);
      window.removeEventListener("focus", updateCompanionName);
    };
  }, [userData]);


  return (
    <aside
      // OPTIMIZATION: 'transform-gpu' and 'will-change-transform' force the browser
      // to use the Graphics Card for the slide-in animation, making it silky smooth.
      className={`fixed left-0 top-0 h-full w-72 flex flex-col z-50 transition-transform duration-300 border-r backdrop-blur-xl shadow-2xl transform-gpu will-change-transform
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      style={{
        backgroundColor: isDark ? "rgba(2, 4, 16, 0.85)" : "rgba(255, 255, 255, 0.9)", 
        borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      }}
    >
      {/* OPTIMIZATION: Added transform-gpu to these static blobs so they don't cause layout repaints */}
      <div className="absolute top-0 left-0 w-full h-64 bg-cyan-500/5 blur-[80px] pointer-events-none transform-gpu" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/5 blur-[60px] pointer-events-none transform-gpu" />

      <div className="p-6 pb-4 border-b border-gray-500/10 relative z-10">
        <div className="flex items-center gap-3">
          {/* OPTIMIZATION: Reduced shadow spread and complex overlapping animations */}
          <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
             <MdOutlineRocketLaunch className="w-6 h-6 text-white drop-shadow-md" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-tight">
              SPARK
            </h1>
            <p className="text-[10px] text-gray-500 tracking-[0.25em] uppercase font-bold">
              Ground Zero
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar relative z-10">
        <SidebarItem 
            to="/student/dashboard" 
            icon={<FaHome />} 
            label="Home" 
            subLabel="Command Deck" 
            isActive={isActive("/student/dashboard")} 
            isDark={isDark} 
        />
        
        <SidebarItem 
            to="/student/dashboard/asktoai" 
            icon={<FaCommentDots />} 
            label={`Ask ${companionName}`} 
            subLabel="Your Companion" 
            isActive={isActive("/student/dashboard/asktoai")} 
            isDark={isDark} 
        />

        {/* --- Assignments --- */}
        <SidebarItem 
            to="/student/dashboard/my-assignments" 
            icon={<GoGoal />} 
            label="Assignments" 
            subLabel="Your Goals" 
            isActive={isActive("/student/dashboard/my-assignments")} 
            isDark={isDark} 
        />

        {/* --- NEW ENTRY: White Board --- */}
        {/* <SidebarItem 
            to="/student/dashboard/whiteboard" 
            icon={<BsClipboard2Pulse />} 
            label="White Board" 
            subLabel="Your Board" 
            isActive={isActive("/student/dashboard/whiteboard")} 
            isDark={isDark} 
        /> */}
        
        <SidebarItem 
            to="/student/dashboard/workspace" 
            icon={<FaCompass />} 
            label="My Space" 
            subLabel="Your Universe" 
            isActive={isActive("/student/dashboard/workspace")} 
            isDark={isDark} 
        />
      </nav>

      <div className="p-4 border-t border-gray-500/10 flex flex-col gap-3 relative z-10 bg-gradient-to-t from-black/5 to-transparent">
        <div className="flex items-center justify-between px-2 mb-1">
             <button onClick={onToggleTheme} className={`p-2 rounded-lg transition-all ${isDark ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-800 hover:bg-black/5"}`} title="Toggle Theme">
               {isDark ? <FaSun className="text-sm text-white" /> : <FaMoon className="text-sm text-black" />}
             </button>
             <button onClick={onLogout} className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-2" title="Logout">
                <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
                <HiOutlineLogout className="text-sm" />
             </button>
        </div>
        <div className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 border backdrop-blur-sm ${isDark ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10" : "bg-gray-100/80 border-gray-200 hover:bg-gray-200/80"}`}>
          <div className="w-11 h-11 rounded-[1rem] bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-indigo-500/30">
            {userData?.username ? userData.username.charAt(0).toUpperCase() : "S"}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold truncate ${isDark ? "text-gray-100" : "text-gray-900"}`}>{userData?.username || "Space Explorer"}</p>
            <p className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-0.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              {userData?.class ? `${userData.class}th Grade` : "Student"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

// --- Main Layout ---
const StudentLayout = () => {
  const [isDark, setIsDark] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [authStatus, setAuthStatus] = useState({ isLoading: true, isAuthorized: false, userData: null, correctRole: "", message: "Checking authorization..." })
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
      document.body.style.backgroundColor = "#02040a" 
    } else {
      document.documentElement.classList.remove("dark")
      document.body.style.backgroundColor = "#F3F4F6"
    }
  }, [isDark])

  useEffect(() => {
    const authorizePage = async () => {
      try {
        const response = await checkRole("student")
        if (response.success) {
          setAuthStatus({ isLoading: false, isAuthorized: true, userData: response.data, correctRole: response.data.role, message: response.message })
        } else {
          setAuthStatus({ isLoading: false, isAuthorized: false, userData: null, correctRole: response.data?.correctRole || "", message: response.message })
        }
      } catch (error) {
        setAuthStatus({ isLoading: false, isAuthorized: false, message: "Authorization failed" })
      }
    }
    authorizePage()
  }, [])

  const handleLogout = () => logout(navigate)

  if (authStatus.isLoading) return <FullPageMessage isDark={isDark}><h2 className="text-xl font-bold animate-pulse text-cyan-500">Initializing Command Deck...</h2></FullPageMessage>
  
  if (!authStatus.isAuthorized) {
    const isRoleMismatch = authStatus.correctRole && authStatus.correctRole !== "student"
    return (
      <FullPageMessage isDark={isDark}>
        <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
        <p className="text-gray-400 mb-6">{authStatus.message}</p>
        <button onClick={() => navigate(isRoleMismatch ? `/${authStatus.correctRole}/dashboard` : "/login")} className="px-6 py-2 rounded-lg font-bold text-sm text-white shadow-lg shadow-cyan-500/20" style={{ background: "linear-gradient(90deg, #06b6d4, #8b5cf6)" }}>
          {isRoleMismatch ? `Switch to ${authStatus.correctRole}` : "Return to Login"}
        </button>
      </FullPageMessage>
    )
  }

  const isChatPage = location.pathname.includes('/asktoai');

  return (
    <div className={`min-h-screen flex ${isDark ? "bg-[#02040a] text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      {/* Overlay: Removed expensive blur, just simple transparency */}
      {isSidebarOpen && <div className="fixed inset-0 z-30 bg-black/80 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
      
      <Sidebar isDark={isDark} onLogout={handleLogout} onToggleTheme={() => setIsDark(!isDark)} isOpen={isSidebarOpen} userData={authStatus.userData} />
      
      <button onClick={() => setIsSidebarOpen(prev => !prev)} className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-full bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 backdrop-blur-md">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      <main 
        className={`flex-1 transition-all duration-300 lg:ml-72 overflow-x-hidden 
          ${isChatPage ? "p-0 h-screen" : "p-8 md:p-12"}`}
      >
        <Outlet context={{ isDark, userData: authStatus.userData }} /> 
      </main>
    </div>
  )
}

export default StudentLayout