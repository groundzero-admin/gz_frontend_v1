import React, { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock,
  KeyRound,
  User,
  Mail,
  Phone,
  School,
  GraduationCap,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";

import { validateInvitation, completeRegistration } from "./api";

export default function StudentRegistration() {
  const token = new URLSearchParams(window.location.search).get("token");

  const [isDark, setIsDark] = useState(true);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [data, setData] = useState(null);

  const [form, setForm] = useState({
    otp: "",
    password: "",
    confirmPassword: "",
  });

  // Theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Validate token
  useEffect(() => {
    const load = async () => {
      try {
        const res = await validateInvitation(token);
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    load();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword)
      return alert("Passwords do not match!");

    setSubmitting(true);

    try {
      const res = await completeRegistration({
        token,
        otp: form.otp,
        password: form.password,
      });

      if (res.success) setSuccess(true);
      else alert(res.message);
    } catch (e) {
      alert(e.message);
    }

    setSubmitting(false);
  };

  const theme = {
    bg: isDark ? "bg-[#0B0C1B]" : "bg-[#F8F9FA]",
    card: isDark ? "bg-white/5" : "bg-white/80",
    border: isDark ? "border-white/10" : "border-black/10",
    text: isDark ? "text-white" : "text-gray-900",
    text2: isDark ? "text-gray-400" : "text-gray-600",
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 transition-all ${theme.bg} ${theme.text}`}
    >
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[450px] bg-[linear-gradient(135deg,rgba(138,43,226,0.25),rgba(0,196,204,0.25))] blur-[90px] opacity-50"></div>
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="absolute top-6 right-6 p-3 rounded-full border backdrop-blur-md"
      >
        {isDark ? <Sun /> : <Moon />}
      </button>

      {/* Main card */}
      <div
        className={`w-full max-w-xl p-8 rounded-2xl shadow-2xl border ${theme.card} ${theme.border}`}
      >
        {/* LOADING */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 size={45} className="animate-spin mx-auto" />
            <p className="mt-3 text-gray-400">Validating invitation…</p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="text-center py-12">
            <AlertCircle size={50} className="mx-auto text-red-500" />
            <h2 className="text-xl font-bold mt-4 text-red-500">Invalid Link</h2>
            <p className="mt-2 text-gray-400">{error}</p>
          </div>
        )}

        {/* SUCCESS */}
        {!loading && !error && success && (
          <div className="text-center py-12">
            <CheckCircle size={60} className="mx-auto text-emerald-500" />
            <h2 className="text-2xl font-bold mt-4 text-emerald-500">
              Registration Complete!
            </h2>
            <p className="mt-3 text-gray-400">Your account is now active.</p>

            <button
              onClick={() => (window.location.href = "/login")}
              className="mt-6 px-8 py-3 rounded-xl font-semibold text-white"
              style={{
                background:
                  "linear-gradient(135deg,#00c4cc,#8a2be2)",
              }}
            >
              Go to Login
            </button>
          </div>
        )}

        {/* MAIN FORM */}
        {!loading && !error && !success && data && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h1
              className="text-3xl font-bold text-center bg-clip-text text-transparent mb-6"
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#00c4cc,#8a2be2)",
              }}
            >
              Student Onboarding
            </h1>

            {/* READ-ONLY INFO CARD */}
            <div
              className={`p-5 rounded-xl border ${theme.border} ${theme.card}`}
            >
              <h3 className="font-semibold text-lg mb-3">Your Details</h3>

             <div className="space-y-4 text-sm">

  <div className="flex items-center gap-3">
    <User size={18} className="opacity-70" />
    <div>
      <p className="font-semibold">Student Name</p>
      <p className={`${theme.text2}`}>{data.studentName}</p>
    </div>
  </div>

  <div className="flex items-center gap-3">
    <Mail size={18} className="opacity-70" />
    <div>
      <p className="font-semibold">Student Email</p>
      <p className={`${theme.text2}`}>{data.studentEmail}</p>
    </div>
  </div>

  <div className="flex items-center gap-3">
    <Phone size={18} className="opacity-70" />
    <div>
      <p className="font-semibold">Parent Phone</p>
      <p className={`${theme.text2}`}>{data.parentPhone}</p>
    </div>
  </div>

  <div className="flex items-center gap-3">
    <School size={18} className="opacity-70" />
    <div>
      <p className="font-semibold">School Name</p>
      <p className={`${theme.text2}`}>{data.schoolName}</p>
    </div>
  </div>

  <div className="flex items-center gap-3">
    <GraduationCap size={18} className="opacity-70" />
    <div>
      <p className="font-semibold">Class Grade</p>
      <p className={`${theme.text2}`}>{data.classGrade}</p>
    </div>
  </div>

  <div className="flex items-center gap-3">
    <GraduationCap size={18} className="opacity-70" />
    <div>
      <p className="font-semibold">Board</p>
      <p className={`${theme.text2}`}>{data.board}</p>
    </div>
  </div>

  <div className="flex items-center gap-3">
    <User size={18} className="opacity-70" />
    <div>
      <p className="font-semibold">Parent Name</p>
      <p className={`${theme.text2}`}>{data.parentName}</p>
    </div>
  </div>

</div>

            </div>

            {/* OTP */}
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                required
                maxLength={6}
                value={form.otp}
                onChange={(e) =>
                  setForm({ ...form, otp: e.target.value })
                }
                placeholder="Enter OTP from Email"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${theme.border} bg-transparent outline-none focus:ring-2 focus:ring-[#00c4cca4]`}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                required
                type="password"
                placeholder="New Password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${theme.border} bg-transparent outline-none focus:ring-2 focus:ring-[#00c4cca4]`}
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                required
                type="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${theme.border} bg-transparent outline-none focus:ring-2 focus:ring-[#00c4cca4]`}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg,#00c4cc,#8a2be2)",
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Complete Onboarding <ArrowRight />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
