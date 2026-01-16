"use client"

import { useState, useEffect, useMemo } from "react"
import {
  FaSun,
  FaMoon,
  FaEnvelope,
  FaLock,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaSpinner, 
} from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import "./color.css"
import { login } from "./api.js"

// --- REUSABLE INPUT COMPONENT ---
const InputField = ({
  icon,
  type,
  placeholder,
  value,
  onChange,
  id,
  isDark,
  endIcon,
  onEndIconClick,
  disabled
}) => (
  <div className="relative mb-4">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
      {icon}
    </span>
    <input
      type={type}
      placeholder={placeholder}
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full pl-12 pr-12 py-3 rounded-lg border bg-transparent transition relative z-0 focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)] disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        color: `var(${
          isDark ? "--text-dark-primary" : "--text-light-primary"
        })`,
      }}
      required
    />
    {endIcon && (
      <span
        onClick={!disabled ? onEndIconClick : undefined}
        className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 transition ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}`}
        style={{
          color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` 
        }}
      >
        {endIcon}
      </span>
    )}
  </div>
)

const AuthPage = () => {
  const [isDark, setIsDark] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  // Optimization: Reduced star count from 50 to 20 and removed animation properties
  const stars = useMemo(() => {
    const starData = [];
    for (let i = 0; i < 20; i++) {
      starData.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1 + 'px', // Smaller, static stars
      });
    }
    return starData;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLoading) return;

    setIsLoading(true);

    try {
      await login(email, password, navigate);
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen transition-colors duration-500 flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
      }}
    >
      {/* --- Optimized Background --- */}
      <div className="absolute inset-0 pointer-events-none z-0">
          {/* Simple static grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:20px_20px] opacity-50"></div>
          
          {/* Static Gradient Blob (Removed Animation & Reduced Blur) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-gradient-to-b from-purple-500/10 to-teal-500/10 rounded-full blur-3xl opacity-30"></div>

          {/* Static Stars (No Twinkle Animation) */}
          {stars.map((star, index) => (
            <div
              key={index}
              className="absolute rounded-full bg-white"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                backgroundColor: isDark ? '#ffffff' : 'var(--accent-purple)',
                opacity: 0.4
              }}
            ></div>
          ))}
      </div>

      {/* Back Button */}
      <button
        onClick={() => !isLoading && navigate("/spark")}
        disabled={isLoading}
        className={`absolute top-6 left-6 z-30 p-3 rounded-full transition shadow-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
          color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
          border: `1px solid var(${isDark ? "--border-dark" : "--border-light"})`
        }}
      >
        <FaArrowLeft />
      </button>

      {/* Theme Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="absolute top-6 right-6 z-30 p-3 rounded-full hover:opacity-80 transition shadow-sm"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
          border: `1px solid var(${isDark ? "--border-dark" : "--border-light"})`
        }}
      >
        {isDark ? (
          <FaSun className="text-xl" style={{ color: "white" }} />
        ) : (
          <FaMoon className="text-xl" style={{ color: "var(--accent-purple)" }} />
        )}
      </button>

      {/* Heading */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center mb-8 z-20 relative">
        Welcome to{" "}
        <span className="block sm:inline bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-purple)] bg-clip-text text-transparent">
          Ground Zero
        </span>
      </h1>

      {/* Login Card */}
      <div
        className="relative z-20 max-w-md w-full p-8 sm:p-10 rounded-2xl border backdrop-blur-md transition shadow-2xl"
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
            disabled={isLoading} 
          />

          <InputField
            id="password"
            icon={<FaLock style={{ color: "var(--accent-teal)" }} />}
            type={showPassword ? "text" : "password"} 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isDark={isDark}
            disabled={isLoading}
            endIcon={showPassword ? <FaEyeSlash /> : <FaEye />}
            onEndIconClick={() => setShowPassword(!showPassword)}
          />

        <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-8 py-3 rounded-xl font-bold text-lg transition transform 
                        bg-gradient-to-r from-blue-500 to-indigo-600
                        ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98] hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'}`}
              style={{ color: "white" }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-xl" />
                  <span>Logging in...</span>
                </div>
              ) : (
                "Log In"
              )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthPage