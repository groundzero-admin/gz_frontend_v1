import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Search,
  RefreshCw,
  Loader2,
  Mail,
  User,
  Users,
  ExternalLink,
  Clock,
  Shield,
  GraduationCap
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { getAllLinksAndOtp } from "../api"; 

export default function Admin_GetAllLinksOtp() {
  const { isDark } = useOutletContext();
  
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState(null); 

  // --- Fetch Data ---
  const fetchData = async () => {
    setLoading(true);
    const response = await getAllLinksAndOtp();
    
    if (response.success && response.data) {
      const sortedData = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setInvites(sortedData);
    } else {
      console.error("Failed to fetch invites:", response.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Helper: Copy Logic ---
  const handleCopy = (invite) => {
    const message = `Hello,

Please complete your registration using the details below:

Link: ${invite.link}

OTP: ${invite.otp}

Regards,
Ground Zero Team`;

    navigator.clipboard.writeText(message);
    setCopiedId(invite._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Helper: Format Strings ---
  const formatText = (str) => {
    if (!str) return "";
    return str.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  // --- Helper: Get Role Icon ---
  const getRoleIcon = (role) => {
    if (role === "PARENT") return <Users size={14} />;
    if (role === "STUDENT") return <GraduationCap size={14} />;
    return <User size={14} />;
  };

  // --- Filter Logic ---
  const filteredInvites = invites.filter(item => 
    item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.otp?.includes(searchTerm) ||
    item.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="min-h-screen transition-colors duration-500 font-sans relative"
      style={{
        backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
      }}
    >
      <style>{`
        :root {
          --bg-dark: #09090b;
          --bg-light: #f8fafc;
          --text-dark-primary: #f8fafc;
          --text-light-primary: #0f172a;
          --text-dark-secondary: #94a3b8;
          --text-light-secondary: #64748b;
          --card-dark: rgba(24, 24, 27, 0.6);
          --card-light: rgba(255, 255, 255, 0.7);
          --border-dark: rgba(255, 255, 255, 0.1);
          --border-light: rgba(0, 0, 0, 0.1);
          --accent-teal: #00c4cc;
          --accent-purple: #8a2be2;
        }
        .glass-panel {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}</style>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(100,100,100,0.1)_1px,transparent_0)] bg-[size:20px_20px]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[500px] bg-[linear-gradient(135deg,rgba(138,43,226,0.1)_0%,rgba(0,196,204,0.1)_50%,rgba(60,60,246,0.1)_100%)] rounded-full blur-[80px] opacity-40"></div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 mb-8 rounded-xl border glass-panel" style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`, borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-purple)] bg-clip-text text-transparent">
              Pending Onboardings
            </h1>
            <p className="text-xs opacity-60 mt-1">Manage registration links and OTPs</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 group-focus-within:text-[var(--accent-teal)]" size={16} />
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Search email, otp, type..." 
                  className="pl-10 pr-4 py-2 rounded-lg text-sm bg-transparent border focus:outline-none focus:border-[var(--accent-teal)] w-64" 
                  style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`, color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }} 
                />
              </div>
            <button onClick={fetchData} className="p-2.5 rounded-lg border hover:opacity-80 transition-all active:scale-95" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`, backgroundColor: `rgba(255,255,255,0.05)` }}>
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-2xl border glass-panel overflow-hidden shadow-2xl" style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`, borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase tracking-wider font-semibold border-b" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`, color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`, backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)" }}>
                  <th className="px-6 py-5">Type</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Email</th>
                  <th className="px-6 py-5">Registration Link</th>
                  <th className="px-6 py-5">OTP</th>
                  <th className="px-6 py-5">Time</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
                
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center opacity-60">
                      <Loader2 className="animate-spin mx-auto mb-3 h-8 w-8 text-[var(--accent-teal)]" />
                      <p>Loading invitations...</p>
                    </td>
                  </tr>
                ) : filteredInvites.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center opacity-50">
                      No invitations found.
                    </td>
                  </tr>
                ) : (
                  filteredInvites.map((invite) => (
                    <tr key={invite._id} className="transition-colors hover:bg-[rgba(255,255,255,0.03)] group">
                      
                      {/* 1. Type Column */}
                      <td className="px-6 py-4 align-middle">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border tracking-wide uppercase
                          ${invite.type === 'PARENT_INVITE' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                            invite.type === 'PAID REGISTRATION' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}
                        >
                          {invite.type === 'PAID REGISTRATION' ? <Shield size={10} /> : <Mail size={10} />}
                          {formatText(invite.type)}
                        </span>
                      </td>

                      {/* 2. Role Column */}
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span className={`p-1.5 rounded-full ${invite.role === 'STUDENT' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                {getRoleIcon(invite.role)}
                            </span>
                            {formatText(invite.role)}
                        </div>
                      </td>

                      {/* 3. Email Column */}
                      <td className="px-6 py-4 align-middle">
                        <div className="font-semibold text-sm opacity-90 select-all">{invite.email}</div>
                      </td>

                      {/* 4. Link Column (Blue & Clickable) */}
                      <td className="px-6 py-4 align-middle">
                         <a 
                            href={invite.link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="group/link flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors max-w-[180px]"
                            title={invite.link}
                         >
                            <span className="truncate underline underline-offset-2 text-xs font-medium decoration-blue-500/30 group-hover/link:decoration-blue-400">
                                {invite.link}
                            </span>
                            <ExternalLink size={12} className="opacity-70 group-hover/link:opacity-100 flex-shrink-0" />
                         </a>
                      </td>

                      {/* 5. OTP Column */}
                      <td className="px-6 py-4 align-middle">
                        <span className="font-mono text-base font-bold tracking-widest text-[var(--accent-teal)] bg-[var(--accent-teal)]/10 px-2 py-1 rounded border border-[var(--accent-teal)]/20 select-all">
                          {invite.otp}
                        </span>
                      </td>

                      {/* 6. Time Column */}
                      <td className="px-6 py-4 align-middle text-xs opacity-70">
                        <div className="flex flex-col">
                            <span className="font-medium opacity-90">
                                {new Date(invite.createdAt).toLocaleDateString()}
                            </span>
                            <span className="opacity-50 text-[10px]">
                                {new Date(invite.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                      </td>

                      {/* 7. Action Column (Improved Button) */}
                      <td className="px-6 py-4 align-middle text-right">
                        <button
                          onClick={() => handleCopy(invite)}
                          className={`
                            inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border shadow-sm
                            ${copiedId === invite._id 
                              ? "bg-green-500 text-white border-green-600 scale-105" 
                              : isDark 
                                ? "bg-white/5 hover:bg-[var(--accent-teal)] hover:text-white hover:border-[var(--accent-teal)] border-white/10 text-gray-300"
                                : "bg-gray-100 hover:bg-[var(--accent-teal)] hover:text-white hover:border-[var(--accent-teal)] border-gray-200 text-gray-700"
                            }
                          `}
                        >
                          {copiedId === invite._id ? <Check size={14} /> : <Copy size={14} />}
                          {copiedId === invite._id ? "Copied!" : "Copy"}
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}