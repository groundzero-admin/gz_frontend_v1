// Save as InvitePage.jsx
"use client"

import { useState, useEffect } from "react"
import {
  FaSun,
  FaMoon,
  FaEnvelope,
  FaLock,
  FaUser,
  FaMobileAlt,
  FaHashtag,
  FaChild,
  FaChalkboardTeacher,
} from "react-icons/fa"
import { useNavigate, useSearchParams } from "react-router-dom"
import "./color.css" // Your color.css file
import { validateInvite, onboardUser } from "./api.js"

// Reusable Input Component (moved outside for performance)
const InputField = ({
  icon,
  type,
  placeholder,
  value,
  onChange,
  id,
  isDark,
  readOnly = false,
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
      readOnly={readOnly}
      className={`w-full pl-12 pr-4 py-3 rounded-lg border bg-transparent transition ${
        readOnly ? "opacity-70" : ""
      }`}
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

const InviteOnboardPage = () => {
  const [isDark, setIsDark] = useState(true)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Page State
  const [isLoading, setIsLoading] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [message, setMessage] = useState("Verifying your invitation...")

  // URL Params
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)

  // Form State
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [mobile, setMobile] = useState("")
  // Student-specific fields
  const [age, setAge] = useState("")
  const [studentClass, setStudentClass] = useState("")

  // --- 1. Theme Toggle Effect ---
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  // --- 2. Validation Effect (On Page Load) ---
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token")
    const roleFromUrl = searchParams.get("role")

    if (
      !tokenFromUrl ||
      !roleFromUrl ||
      !["student", "teacher", "parent"].includes(roleFromUrl)
    ) {
      setMessage("Invalid or missing invitation link. Please use the link from your email.")
      setIsValid(false)
      setIsLoading(false)
      return
    }

    // Store token and role
    setToken(tokenFromUrl)
    setRole(roleFromUrl)

    // Call API to validate
    const checkInvite = async () => {
      const response = await validateInvite(tokenFromUrl, roleFromUrl)
      if (response.success) {
        setIsValid(true)
        setEmail(response.data.email) // Pre-fill the email
        setMessage("Invitation validated! Please complete your registration.")
      } else {
        setIsValid(false)
        setMessage(response.message) // Show backend error (e.g., "Expired")
      }
      setIsLoading(false)
    }

    checkInvite()
  }, [searchParams])

  // --- 3. Form Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Build the form data object based on the role
    const formData = {
      token,
      role,
      email,
      otp,
      name,
      password,
      mobile,
    }

    if (role === "student") {
      formData.age = age
      formData.class = studentClass // Backend expects 'class'
    }
    
    // (Teacher & Parent only need the common fields per your backend code)

    const response = await onboardUser(formData)

    if (response.success) {
      alert(response.message) // "Student onboarded", etc.
      navigate("/login") // Redirect to login page on success
    } else {
      alert(response.message) // "Invalid OTP", "Email already registered", etc.
    }
  }

  // --- 4. Render Helper for Dynamic Fields ---
  const renderDynamicFields = () => {
    if (role === "student") {
      return (
        <>
          <InputField
            id="age"
            icon={<FaChild style={{ color: "var(--accent-teal)" }} />}
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            isDark={isDark}
          />
          <InputField
            id="class"
            icon={<FaChalkboardTeacher style={{ color: "var(--accent-teal)" }} />}
            type="number"
            placeholder="Class"
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            isDark={isDark}
          />
        </>
      )
    }
    // Teacher and Parent have no extra fields
    return null
  }

  // --- 5. Main Render ---
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[600px] bg-[linear-gradient(135deg,rgba(138,43,226,0.3)_0%,rgba(0,196,204,0.2)_50%,rgba(60,60,246,0.3)_100%)] rounded-full blur-[80px] opacity-40 animate-[gradient-animation_20s_ease_infinite]"></div>

      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="absolute top-6 right-6 z-20 p-3 rounded-full hover:opacity-80 transition"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
        }}
        aria-label="Toggle Theme"
      >
        {isDark ? (
          <FaSun className="text-xl" style={{ color: "#FFA500" }} />
        ) : (
          <FaMoon
            className="text-xl"
            style={{ color: "var(--accent-purple)" }}
          />
        )}
      </button>

      {/* Auth Card */}
      <div
        className="relative z-10 max-w-md w-full p-8 sm:p-10 rounded-2xl border backdrop-blur-md transition"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        }}
      >
        <h2 className="text-3xl font-bold text-center mb-4">
          Complete Your Registration
        </h2>
        
        <p className="text-center text-sm mb-6" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
          {message}
        </p>

        {/* Show Form only if validation is successful */}
        {!isLoading && isValid && (
          <form onSubmit={handleSubmit}>
            <InputField
              id="email"
              icon={<FaEnvelope style={{ color: "var(--accent-teal)" }} />}
              type="email"
              placeholder="Email Address"
              value={email}
              isDark={isDark}
              readOnly={true} // Email is pre-filled and read-only
            />
            <InputField
              id="otp"
              icon={<FaHashtag style={{ color: "var(--accent-teal)" }} />}
              type="text" // Use text for OTP as it might be numbers/letters
              placeholder="OTP from your Email"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              isDark={isDark}
            />
            <InputField
              id="name"
              icon={<FaUser style={{ color: "var(--accent-teal)" }} />}
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isDark={isDark}
            />
            <InputField
              id="password"
              icon={<FaLock style={{ color: "var(--accent-teal)" }} />}
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isDark={isDark}
            />
            <InputField
              id="mobile"
              icon={<FaMobileAlt style={{ color: "var(--accent-teal)" }} />}
              type="tel"
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              isDark={isDark}
            />

            {/* Dynamic fields for Student */}
            {renderDynamicFields()}

            {/* Submit Button */}
            <button
              type="submit"
              className="relative w-full px-8 py-3 mt-4 rounded-xl font-bold text-lg overflow-hidden transition border-gradient"
              style={{
                backgroundColor: `var(${
                  isDark ? "--button-bg-dark" : "--button-bg-light"
                })`,
                color: `var(${
                  isDark ? "--button-text-dark" : "--button-text-dark"
                })`,
              }}
            >
              Complete Registration
            </button>
          </form>
        )}

        {/* Show "Go to Login" button if validation fails */}
        {!isLoading && !isValid && (
           <button
              onClick={() => navigate('/login')}
              className="relative w-full px-8 py-3 mt-4 rounded-xl font-bold text-lg overflow-hidden transition border-gradient"
              style={{
                backgroundColor: `var(${
                  isDark ? "--button-bg-dark" : "--button-bg-light"
                })`,
                color: `var(${
                  isDark ? "--button-text-dark" : "--button-text-dark"
                })`,
              }}
            >
              Go to Login
            </button>
        )}

      </div>

      {/* Animation keyframes */}
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

export default InviteOnboardPage