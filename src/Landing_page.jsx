"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { whoami } from "./api.js"
import {
  FaRobot,
  FaLaptopCode,
  FaGraduationCap,
  FaChartBar,
  FaUsers,
  FaShieldAlt,
  FaSun,
  FaMoon,
  FaStar,
  FaUserCircle,
} from "react-icons/fa"
import "./color.css"

const LandingPage = () => {
  const [isDark, setIsDark] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [isDark])

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await whoami()
        if (response && response.success === true && response.data) {
          setUserData(response.data)
          setIsLoggedIn(true)
        } else {
          setIsLoggedIn(false)
          setUserData(null)
        }
      } catch (error) {
        console.error("Authentication check failed:", error)
        setIsLoggedIn(false)
        setUserData(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const handleHeroClick = () => {
    if (isLoggedIn && userData?.role) {
      navigate(`/${userData.role.toLowerCase()}/dashboard`)
    } else {
      navigate("/login")
    }
  }

  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{
        backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
      }}
    >
      <div className="relative w-full min-h-screen overflow-hidden">
        {/* BACKGROUND */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:20px_20px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[600px] bg-[linear-gradient(135deg,rgba(138,43,226,0.3)_0%,rgba(0,196,204,0.2)_50%,rgba(60,60,246,0.3)_100%)] rounded-full blur-[80px] opacity-40 animate-[gradient-animation_20s_ease_infinite]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-5">

          {/* HEADER */}
          <header
            className="flex justify-between items-center px-10 py-3 mt-6 rounded-xl border backdrop-blur-md mb-10 transition"
            style={{
              backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
              borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
            }}
          >
            <div className="flex items-center gap-4">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-[var(--accent-purple)]"
              >
                <path
                  d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
                  fill="currentColor"
                ></path>
              </svg>
              <h2 className="font-bold text-lg">GroundZero</h2>
            </div>

            {/* RIGHT HEADER */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-3 rounded-full hover:opacity-80 transition"
                style={{
                  backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
                }}
              >
                {isDark ? (
                  <FaSun className="text-xl" style={{ color: "var(--highlight-light)" }} />
                ) : (
                  <FaMoon className="text-xl" style={{ color: "var(--accent-purple)" }} />
                )}
              </button>

              <div className="min-w-[150px] text-right">
                {isLoading ? (
                  <div className="text-sm opacity-70">Loading...</div>
                ) : isLoggedIn ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm hidden sm:block">
                      Welcome, {userData?.name}
                    </span>
                    <FaUserCircle className="text-2xl text-[var(--accent-teal)]" />
                  </div>
                ) : (
                  <button
                    onClick={handleHeroClick}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: "var(--accent-purple)",
                      color: "var(--button-text-dark)",
                    }}
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* HERO SECTION */}
          <section className="text-center py-20 flex flex-col items-center gap-8">
            <h1 className="font-extrabold leading-tight max-w-5xl text-[clamp(32px,8vw,80px)]">
              Empower Learning with{" "}
              <span className="bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-purple)] bg-clip-text text-transparent">
                AI + Code Sandbox
              </span>
            </h1>
            <p className="text-lg max-w-2xl opacity-80">
              The all-in-one platform for personalized education, interactive coding,
              and insightful analytics.
            </p>

            <button
              onClick={handleHeroClick}
              className="px-8 py-4 rounded-xl font-bold text-lg border-gradient text-white"
              style={{
                backgroundColor: `var(${isDark ? "--button-bg-dark" : "--button-bg-light"})`,
              }}
            >
              Hit the Ground Running
            </button>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* 1️⃣ OUR DELIVERABLES */}
          {/* ------------------------------------------------------------ */}

          <section className="mt-20">
            <h2 className="text-center text-3xl font-bold mb-10">
              Our Core Skill Deliverables
            </h2>

            <div className="grid gap-6 md:grid-cols-3">

              {[
                { title: "Creative Thinking", points: [
                  "Building new things",
                  "Solving open-ended problems",
                  "Expressing imagination",
                ]},
                { title: "Communication", points: [
                  "Public speaking",
                  "Storytelling",
                  "Clarity & persuasion",
                ]},
                { title: "Critical Thinking", points: [
                  "Evaluating claims",
                  "Peer pressure",
                  "AI misinformation",
                ]},
                { title: "Life Skills", points: [
                  "Entrepreneurship",
                  "Finance",
                  "Well-being",
                ]},
                { title: "Systems Thinking", points: [
                  "Cause & effect",
                  "Connecting ideas",
                  "Breaking down problems",
                ]},
                { title: "AI Nativeness", points: [
                  "Build with AI",
                  "Prototyping",
                ]},
              ].map((card, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl border backdrop-blur-lg"
                  style={{
                    backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
                    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                  }}
                >
                  <h3 className="font-bold text-xl mb-3">{card.title}</h3>
                  <ul className="text-sm opacity-80 space-y-1">
                    {card.points.map((p, j) => (
                      <li key={j}>• {p}</li>
                    ))}
                  </ul>
                </div>
              ))}

            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* 2️⃣ UPDATED — UPCOMING BATCHES */}
          {/* ------------------------------------------------------------ */}

          <section className="mt-24">
            <h2 className="text-center text-3xl font-bold mb-10">Upcoming Batches</h2>

            <div className="grid gap-8 md:grid-cols-3 px-4">

              {[
                {
                  title: "Online Classes",
                  list: [
                    "Multiple slots",
                    "Max 8 students",
                    "2 sessions per week",
                    "6 weeks: 12 sessions",
                    "Google Classroom",
                  ],
                  price: "₹1000/session",
                  badge: "Next Batch: Jan 10",
                  action: () => navigate("/buycourse?coursetype=ONLINE"),
                  btnText: "Enroll Now"
                },
                {
                  title: "Offline Classes",
                  list: [
                    "In-person interaction",
                    "Max 10 students",
                    "2 sessions per week",
                    "HSR Layout Center",
                    "Sat & Sun • 4:30–6:30pm",
                  ],
                  price: "₹1500/session",
                  badge: "Next Batch: Jan 10",
                  action: () => navigate("/buycourse?coursetype=OFFLINE"),
                  btnText: "Enroll Now"
                },
                {
                  title: "Personal Mentorship",
                  list: [
                    "One-on-one sessions",
                    "Personalised learning",
                    "Flexible pace",
                    "Live coding & Discussion" ,
                    "Placement Guidance"
                  ],
                  price: "₹1000/session",
                  badge: "Flexible Scheduling",
                  action: () => {}, // Dummy function as requested
                  btnText: "Contact Us"
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl shadow-xl backdrop-blur-lg border"
                  style={{
                    background: `linear-gradient(
                      135deg,
                      rgba(0,196,204,0.25),
                      rgba(138,43,226,0.25)
                    )`,
                    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                  }}
                >
                  <h3 className="font-bold text-2xl mb-4">{card.title}</h3>

                  <ul className="text-sm mb-4 opacity-90 space-y-1">
                    {card.list.map((item, j) => (
                      <li key={j}>• {item}</li>
                    ))}
                  </ul>

                  <div className="font-semibold mb-2">Price: {card.price}</div>

                  <div className="mb-4 font-bold text-[var(--accent-teal)]">{card.badge}</div>

                  <button 
                    onClick={card.action}
                    className="px-4 py-2 rounded-lg w-full font-medium border-gradient text-white hover:opacity-90 transition-opacity"
                  >
                    {card.btnText}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* WHY CHOOSE US */}
          {/* ------------------------------------------------------------ */}

          <section className="mt-20">
            <h2 className="text-center text-2xl font-bold mb-10">
              Why Choose Our Platform?
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 px-4">
              {[
                {
                  icon: <FaRobot className="text-3xl text-[var(--accent-teal)]" />,
                  title: "AI Tutor",
                  desc: "Personalized AI assistance available 24/7.",
                },
                {
                  icon: <FaLaptopCode className="text-3xl text-[var(--accent-teal)]" />,
                  title: "Online IDE",
                  desc: "Practice coding instantly in the browser.",
                },
                {
                  icon: <FaGraduationCap className="text-3xl text-[var(--accent-teal)]" />,
                  title: "Smart Courses",
                  desc: "Adaptive learning for every student.",
                },
                {
                  icon: <FaChartBar className="text-3xl text-[var(--accent-teal)]" />,
                  title: "Analytics Dashboard",
                  desc: "Understand progress with real insights.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl border backdrop-blur-lg"
                  style={{
                    backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
                    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                  }}
                >
                  <div className="mb-4">{f.icon}</div>
                  <h3 className="font-bold mb-2">{f.title}</h3>
                  <p className="text-sm opacity-80">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* FEATURES */}
          {/* ------------------------------------------------------------ */}

          <section className="flex flex-col gap-6 px-4 mt-16">
            {[
              {
                icon: <FaUsers className="text-4xl" />,
                title: "Collaborative Learning Spaces",
                desc: "Work in groups, share ideas, and learn together.",
              },
              {
                icon: <FaShieldAlt className="text-4xl" />,
                title: "Safe & Secure Environment",
                desc: "Privacy-first learning with protective controls.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-8 p-8 rounded-xl border backdrop-blur-lg"
                style={{
                  backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
                  borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                }}
              >
                <div className="text-[var(--accent-teal)]">{feature.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm opacity-80">{feature.desc}</p>
                </div>
              </div>
            ))}
          </section>

          {/* ------------------------------------------------------------ */}
          {/* TESTIMONIALS */}
          {/* ------------------------------------------------------------ */}

          <section className="mt-20">
            <h2 className="text-center text-2xl font-bold mb-10">
              Hear from Our Students
            </h2>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  name: "Maya Rodriguez",
                  img: "https://randomuser.me/api/portraits/women/44.jpg",
                  review:
                    "The AI tutor helped me level up faster than any class!",
                },
                {
                  name: "Ben Carter",
                  img: "https://randomuser.me/api/portraits/men/41.jpg",
                  review:
                    "Browser-based IDE is a game changer for coding practice.",
                },
                {
                  name: "Chloe Kim",
                  img: "https://randomuser.me/api/portraits/women/68.jpg",
                  review:
                    "Adaptive courses let me learn at my own pace effortlessly.",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl border"
                  style={{
                    backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
                    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={s.img}
                      alt={s.name}
                      className="w-12 h-12 rounded-full border"
                    />
                    <div>
                      <p className="font-bold">{s.name}</p>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm opacity-80">{s.review}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* FOOTER */}
          {/* ------------------------------------------------------------ */}

          <footer className="mt-20 pt-10">
            <div className="border-t mb-8"></div>
            <div className="flex flex-col items-center gap-8 pb-8">
              <div className="flex items-center gap-4">
                <span className="font-bold text-lg">GroundZero</span>
              </div>
              <nav className="flex gap-6 text-sm opacity-80">
                {["About", "Product", "Resources", "Contact", "Terms", "Privacy"].map(
                  (l, i) => (
                    <a key={i} href="#" className="hover:underline">
                      {l}
                    </a>
                  )
                )}
              </nav>
              <p className="text-xs opacity-60">
                © 2025 GroundZero. All rights reserved.
              </p>
            </div>
          </footer>

        </div>
      </div>

      {/* ANIMATION */}
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

export default LandingPage