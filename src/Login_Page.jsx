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
  FaRocket,
  FaSpinner, // Import the spinner icon
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
  disabled // Add disabled prop to inputs to prevent editing while loading
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
      disabled={disabled} // Disable input
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
        onClick={!disabled ? onEndIconClick : undefined} // Disable click if loading
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
  const [isDark, setIsDark] = useState(false) // Default Light Mode

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  // New state for loading status
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  // --- Generate Stars ---
  const stars = useMemo(() => {
    const starData = [];
    for (let i = 0; i < 50; i++) {
      starData.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 1 + 'px',
        delay: `${Math.random() * 3}s`,
        duration: `${Math.random() * 3 + 2}s`
      });
    }
    return starData;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevent double submission
    if (isLoading) return;

    setIsLoading(true);

    try {
      // We await the login. If successful, navigate happens inside login() 
      // or subsequent code. If it fails, it throws, and we catch it.
      await login(email, password, navigate);
    } catch (error) {
      console.error("Login failed", error);
      // Optional: Add a toast notification here for error
    } finally {
      // Re-enable the button after the request finishes (whether success or fail)
      // Note: If navigate unmounts this component, this might trigger a warning,
      // but usually safe in modern React.
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
      {/* --- Background Effects & Space Elements --- */}
      <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:20px_20px] opacity-50"></div>
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[600px] bg-[linear-gradient(135deg,rgba(138,43,226,0.3)_0%,rgba(0,196,204,0.2)_50%,rgba(60,60,246,0.3)_100%)] rounded-full blur-[80px] opacity-40 animate-[gradient-animation_20s_ease_infinite]"></div>

          {/* Stars */}
          {stars.map((star, index) => (
            <div
              key={index}
              className="absolute rounded-full bg-white star-twinkle"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDelay: star.delay,
                animationDuration: star.duration,
                backgroundColor: isDark ? '#ffffff' : 'var(--accent-purple)',
                opacity: isDark ? 0.8 : 0.4
              }}
            ></div>
          ))}

          {/* --- ROCKET 1: Starts Bottom Left --- */}
          <div className="absolute rocket-1 z-0">
            <FaRocket 
              className="text-4xl md:text-6xl" 
              style={{ 
                 color: 'var(--accent-teal)',
                 filter: `drop-shadow(0 0 10px var(--accent-teal))`
              }} 
            />
          </div>

          {/* --- ROCKET 2: Starts Bottom Right --- */}
          <div className="absolute rocket-2 z-0">
            <FaRocket 
              className="text-4xl md:text-6xl" 
              style={{ 
                 color: 'var(--accent-purple)',
                 filter: `drop-shadow(0 0 10px var(--accent-purple))`
              }} 
            />
          </div>
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
        className="relative z-20 max-w-md w-full p-8 sm:p-10 rounded-2xl border backdrop-blur-xl transition shadow-2xl"
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
            disabled={isLoading} // Disable input when loading
          />

          <InputField
            id="password"
            icon={<FaLock style={{ color: "var(--accent-teal)" }} />}
            type={showPassword ? "text" : "password"} 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isDark={isDark}
            disabled={isLoading} // Disable input when loading
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

      <style jsx>{`
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .star-twinkle {
          animation-name: twinkle;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          animation-timing-function: ease-in-out;
        }

        @keyframes twinkle {
          0% { opacity: 0.3; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.1); }
        }

        /* --- ROCKET ANIMATIONS --- */
        
        /* Rocket 1: Bottom Left to Center to Top Left */
        .rocket-1 {
           position: absolute;
           bottom: 100px;
           left: -100px;
           opacity: 0.8;
           /* 15s duration, infinite loop */
           animation: collisionLeft 15s ease-in-out infinite; 
        }

        /* Rocket 2: Bottom Right to Center to Top Right */
        .rocket-2 {
           position: absolute;
           bottom: 100px;
           right: -100px;
           opacity: 0.8;
           animation: collisionRight 15s ease-in-out infinite;
        }

        /* KEYFRAMES FOR ROCKET 1 (The Lefty) */
        @keyframes collisionLeft {
           0% {
              transform: translate(0, 0) rotate(0deg);
              opacity: 0;
           }
           10% { opacity: 0.8; }
           
           /* Move to Center */
           45% {
              transform: translate(45vw, -45vh) rotate(0deg);
           }
           
           /* COLLISION MOMENT (50%) - Rotate to deflect */
           50% {
              transform: translate(50vw, -50vh) rotate(-90deg);
           }

           /* Fly away to Top Left */
           100% {
              transform: translate(0vw, -100vh) rotate(-90deg);
              opacity: 0;
           }
        }

        /* KEYFRAMES FOR ROCKET 2 (The Righty) */
        @keyframes collisionRight {
           0% {
              transform: translate(0, 0) rotate(-90deg);
              opacity: 0;
           }
           10% { opacity: 0.8; }

           /* Move to Center */
           45% {
              transform: translate(-45vw, -45vh) rotate(-90deg);
           }

           /* COLLISION MOMENT (50%) - Rotate to deflect */
           50% {
              transform: translate(-50vw, -50vh) rotate(0deg);
           }

           /* Fly away to Top Right */
           100% {
              transform: translate(0vw, -100vh) rotate(0deg);
              opacity: 0;
           }
        }

      `}</style>
    </div>
  )
}

export default AuthPage