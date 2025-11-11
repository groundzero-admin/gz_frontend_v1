// You can save this file as AuthPage.jsx (or any name you prefer)
"use client"

import { useState, useEffect } from "react"
import {
  FaSun,
  FaMoon,
  FaEnvelope,
  FaLock,
  FaUser,
  FaUsers,
  FaArrowLeft,
  FaChevronDown,
} from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import "./color.css" // Your color.css file
// --- 1. MODIFIED: Import both login and requestAccess ---
import { login, requestAccess } from "./api.js"

// --- REUSABLE INPUT COMPONENT (Unchanged) ---
const InputField = ({
  icon,
  type,
  placeholder,
  value,
  onChange,
  id,
  isDark,
}) => (
  <div className="relative mb-4">
    <span className="absolute left-4 top-1/2 -translate-y-1/2">
      {icon}
    </span>
    <input
      type={type}
      placeholder={placeholder}
      id={id}
      value={value}
      onChange={onChange}
      className="w-full pl-12 pr-4 py-3 rounded-lg border bg-transparent transition"
      style={{
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        color: `var(${
          isDark ? "--text-dark-primary" : "--text-light-primary"
        })`,
      }}
      required
    />
  </div>
)

const AuthPage = () => {
  const [isDark, setIsDark] = useState(true)
  const [isLoginView, setIsLoginView] = useState(true)

  // --- Form State (Unchanged) ---
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("student")

  const navigate = useNavigate()

  // --- Theme Toggle Effect (Unchanged) ---
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  // --- 2. MODIFIED: handleSubmit with new logic ---
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isLoginView) {
      // Handle Login Logic
      await login(email, password, navigate)
    } else {
      // Handle Request Access Logic
      const success = await requestAccess(name, email, role);

      // If the request was successful (200 or 201 response)
      if (success) {
        // Clear the form fields
        setName("");
        setEmail("");
        setRole("student");
        // Flip back to the login view as a good UX
        setIsLoginView(true);
      }
      // If 'success' is false, the alert() in api.js already handled
      // showing the error (e.g., "Email already registered"),
      // so we just leave the form as-is for the user to correct.
    }
  }

  // --- Clear form fields when switching views (Unchanged) ---
  const toggleView = () => {
    setIsLoginView(!isLoginView)
    setEmail("")
    setPassword("")
    setName("")
    setRole("student")
  }

  return (
    <div
      className="min-h-screen transition-colors duration-500 flex flex-col items-center justify-center p-4"
      style={{
        backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
      }}
    >
      {/* Background Effects (Unchanged) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:20px_20px]"></div>
      <div className="absolute top-0 left-1/2 -translatex-1/2 w-[80%] h-[600px] bg-[linear-gradient(135deg,rgba(138,43,226,0.3)_0%,rgba(0,196,204,0.2)_50%,rgba(60,60,246,0.3)_100%)] rounded-full blur-[80px] opacity-40 animate-[gradient-animation_20s_ease_infinite]"></div>

      {/* Back to Home Button (Unchanged) */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 p-3 rounded-full hover:opacity-80 transition"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
          color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
        }}
        aria-label="Back to Home"
      >
        <FaArrowLeft />
      </button>

      {/* Theme Toggle Button (Unchanged) */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="absolute top-6 right-6 z-20 p-3 rounded-full hover:opacity-80 transition"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
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

      {/* --- HEADING (Unchanged) --- */}
      <h1
        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center mb-8 z-10"
        style={{
          color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
        }}
      >
        Welcome to{" "}
        <span className="block sm:inline bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-purple)] bg-clip-text text-transparent">
          Ground Zero
        </span>
      </h1>

      {/* Auth Card (Unchanged) */}
      <div
        className="relative z-10 max-w-md w-full p-8 sm:p-10 rounded-2xl border backdrop-blur-md transition"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        }}
      >
        <h2 className="text-3xl font-bold text-center mb-8">
          {isLoginView ? "Login to Your Account" : "Request Access"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* --- Fields for Request Access View --- */}
          {!isLoginView && (
            <InputField
              id="name"
              icon={<FaUser style={{ color: "var(--accent-teal)" }} />}
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isDark={isDark}
            />
          )}

          {/* --- Common Field: Email --- */}
          <InputField
            id="email"
            icon={<FaEnvelope style={{ color: "var(--accent-teal)" }} />}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isDark={isDark}
          />

          {/* --- Field for Login View --- */}
          {isLoginView && (
            <InputField
              id="password"
              icon={<FaLock style={{ color: "var(--accent-teal)" }} />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isDark={isDark}
            />
          )}

          {/* --- Fields for Request Access View (Unchanged) --- */}
          {!isLoginView && (
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                <FaUsers style={{ color: "var(--accent-teal)" }} />
              </span>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-lg border bg-transparent transition appearance-none"
                style={{
                  borderColor: `var(${
                    isDark ? "--border-dark" : "--border-light"
                  })`,
                  color: `var(${
                    isDark ? "--text-dark-primary" : "--text-light-primary"
                  })`,
                  backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
                }}
              >
                <option value="student">
                  I am a Student
                </option>
                <option value="parent">
                  I am a Parent
                </option>
                <option value="teacher">
                  I am a Teacher
                </option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <FaChevronDown style={{ color: "var(--accent-teal)" }} />
              </span>
            </div>
          )}

          {/* Submit Button (Unchanged) */}
          <button
            type="submit"
            className="relative w-full px-8 py-3 rounded-xl font-bold text-lg overflow-hidden transition border-gradient"
            style={{
              backgroundColor: `var(${
                isDark ? "--button-bg-dark" : "--button-bg-light"
              })`,
              color: `var(${
                isDark ? "--button-text-dark" : "--button-text-dark"
              })`,
            }}
          >
            {isLoginView ? "Log In" : "Request Access"}
          </button>
        </form>

        {/* View Toggle Link (Unchanged) */}
        <p
          className="text-sm text-center mt-6"
          style={{
            color: `var(${
              isDark ? "--text-dark-secondary" : "--text-light-secondary"
            })`,
          }}
        >
          {isLoginView
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            onClick={toggleView}
            className="font-bold hover:underline bg-transparent border-none p-0"
            style={{ color: "var(--accent-teal)" }}
          >
            {isLoginView ? "Request Access" : "Log In"}
          </button>
        </p>
      </div>

      {/* Animation keyframes (Unchanged) */}
      <style>{`
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        /* Fix for select option styling in dark mode */
        select option {
          background-color: var(${isDark ? "--bg-dark" : "--bg-light"});
          color: var(${isDark ? "--text-dark-primary" : "--text-light-primary"});
        }
      `}</style>
    </div>
  )
}

export default AuthPage