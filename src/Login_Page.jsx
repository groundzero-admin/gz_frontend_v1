"use client"

import { useState, useEffect } from "react"
import {
  FaSun,
  FaMoon,
  FaEnvelope,
  FaLock,
  FaArrowLeft,
} from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import "./color.css"
import { login } from "./api.js"

<<<<<<< HEAD
// --- REUSABLE INPUT COMPONENT (Unchanged) ---

const InputField = ({ 
=======
// --- REUSABLE INPUT COMPONENT ---
const InputField = ({
>>>>>>> localdev
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

  // --- Login Form State ---
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const navigate = useNavigate()

  // --- Theme Toggle Effect ---
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  // --- Login Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(email, password, navigate)
  }

  return (
    <div
      className="min-h-screen transition-colors duration-500 flex flex-col items-center justify-center p-4"
      style={{
        backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:20px_20px]"></div>
      <div className="absolute top-0 left-1/2 -translatex-1/2 w-[80%] h-[600px] bg-[linear-gradient(135deg,rgba(138,43,226,0.3)_0%,rgba(0,196,204,0.2)_50%,rgba(60,60,246,0.3)_100%)] rounded-full blur-[80px] opacity-40 animate-[gradient-animation_20s_ease_infinite]"></div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/spark")}
        className="absolute top-6 left-6 z-20 p-3 rounded-full hover:opacity-80 transition"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
          color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
        }}
      >
        <FaArrowLeft />
      </button>

      {/* Theme Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="absolute top-6 right-6 z-20 p-3 rounded-full hover:opacity-80 transition"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
        }}
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

      {/* Heading */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center mb-8 z-10">
        Welcome to{" "}
        <span className="block sm:inline bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-purple)] bg-clip-text text-transparent">
          Ground Zero
        </span>
      </h1>

      {/* Login Card */}
      <div
        className="relative z-10 max-w-md w-full p-8 sm:p-10 rounded-2xl border backdrop-blur-md transition"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        }}
      >
        <h2 className="text-3xl font-bold text-center mb-8">
          Login to Your Account
        </h2>

        <form onSubmit={handleSubmit}>
          <InputField
            id="email"
            icon={<FaEnvelope style={{ color: "var(--accent-teal)" }} />}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isDark={isDark}
          />

          <InputField
            id="password"
            icon={<FaLock style={{ color: "var(--accent-teal)" }} />}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isDark={isDark}
          />

        <button
              type="submit"
              className="w-full px-8 py-3 rounded-xl font-bold text-lg transition
                        bg-gradient-to-r from-blue-500 to-indigo-600
                        hover:from-blue-600 hover:to-indigo-700"
              style={{ color: "white" }}
            >
              Log In
          </button>

        </form>
      </div>

      <style>{`
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  )
}

export default AuthPage
