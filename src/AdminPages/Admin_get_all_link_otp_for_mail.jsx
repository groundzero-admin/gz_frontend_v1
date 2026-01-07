import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Search,
  RefreshCw,
  Loader2,
  Mail,
  Users,
  UserPlus,
  Link as LinkIcon,
  Clock
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { getAllLinksAndOtp } from "../api"; // Import the function created above

export default function Admin_GetAllLinksOtp() {
  const { isDark } = useOutletContext();
  
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState(null); // To show "Copied!" feedback

  // --- Fetch Data ---
  const fetchData = async () => {
    setLoading(true);
    const response = await getAllLinksAndOtp();
    
    if (response.success && response.data) {
      // Sort: Newest first based on createdAt
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

  // --- Helper: Generate Copy Message ---
  const handleCopy = (invite) => {
    // 1. Construct the message
    const message = `Hello,

Please complete your registration using the details below:

Link: ${invite.link}

OTP: ${invite.otp}

Regards,
Ground Zero Team`;

    // 2. Write to clipboard
    navigator.clipboard.writeText(message);

    // 3. Visual Feedback
    setCopiedId(invite._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Helper: Format Invite Type text ---
  const formatType = (type) => {
    switch (type) {
      case "PARENT_INVITE": return "Parent Invite";
      case "DIRECT_STUDENT_INVITE": return "Admin Invite Student";
      case "NEW_JOINEE_INVITE": return "Course Purchase";
      default: return type.replace(/_/g, " ");
    }
  };

  // --- Helper: Get Icon based on Type ---
  const getTypeIcon = (type) => {
    if (type === "PARENT_INVITE") return <Users size={14} />;
    if (type === "NEW_JOINEE_INVITE") return <UserPlus size={14} />;
    return <Mail size={14} />;
  };

  // --- Filter Logic ---
  const filteredInvites = invites.filter(item => 
    item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.otp?.includes(searchTerm) ||
    item.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="min-h-screen transition-colors duration-500 font-sans relative"
      style={{
        backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
      }}
    >
      {/* Styles reused from your previous page for consistency */}
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

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 mb-8 rounded-xl border glass-panel" style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`, borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-purple)] bg-clip-text text-transparent">
              Pending Invitations
            </h1>
            <p className="text-xs opacity-60 mt-1">Manage sent links and OTPs</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 group-focus-within:text-[var(--accent-teal)]" size={16} />
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Search email, otp..." 
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
                  <th className="px-6 py-5">Recipient Email</th>
                  <th className="px-6 py-5">Context Details</th>
                  <th className="px-6 py-5">OTP</th>
                  <th className="px-6 py-5">Created At</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
                
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center opacity-60">
                      <Loader2 className="animate-spin mx-auto mb-3 h-8 w-8 text-[var(--accent-teal)]" />
                      <p>Loading invitations...</p>
                    </td>
                  </tr>
                ) : filteredInvites.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center opacity-50">
                      No invitations found.
                    </td>
                  </tr>
                ) : (
                  filteredInvites.map((invite) => (
                    <tr key={invite._id} className="transition-colors hover:bg-[rgba(255,255,255,0.03)] group">
                      
                      {/* Type Column */}
                      <td className="px-6 py-5 align-top">
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold border 
                          ${invite.type === 'PARENT_INVITE' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                            invite.type === 'NEW_JOINEE_INVITE' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}
                        >
                          {getTypeIcon(invite.type)}
                          {formatType(invite.type)}
                        </div>
                      </td>

                      {/* Email Column */}
                      <td className="px-6 py-5 align-top">
                        <div className="font-semibold text-sm">{invite.email}</div>
                        <a href={invite.link} target="_blank" rel="noreferrer" className="text-[10px] opacity-50 hover:opacity-100 hover:text-[var(--accent-teal)] flex items-center gap-1 mt-1 truncate max-w-[200px]">
                          <LinkIcon size={10} /> {invite.link}
                        </a>
                      </td>

                      {/* Details Column */}
                      <td className="px-6 py-5 align-top">
                        <div className="text-sm opacity-80">{invite.details}</div>
                      </td>

                      {/* OTP Column */}
                      <td className="px-6 py-5 align-top">
                        <span className="font-mono text-base font-bold tracking-widest text-[var(--accent-teal)]">
                          {invite.otp}
                        </span>
                      </td>

                      {/* Date Column */}
                      <td className="px-6 py-5 align-top text-xs opacity-70">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {new Date(invite.createdAt).toLocaleString()}
                        </div>
                        <div className="text-[10px] opacity-50 mt-1 pl-4">
                          {(() => {
                            const diff = new Date() - new Date(invite.createdAt);
                            const hours = Math.floor(diff / 36e5);
                            return hours < 24 ? `${hours} hours ago` : `${Math.floor(hours/24)} days ago`;
                          })()}
                        </div>
                      </td>

                      {/* Action Column */}
                      <td className="px-6 py-5 align-middle text-right">
                        <button
                          onClick={() => handleCopy(invite)}
                          className={`
                            inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border
                            ${copiedId === invite._id 
                              ? "bg-green-500/20 text-green-500 border-green-500/50 scale-105" 
                              : "bg-transparent hover:bg-[rgba(255,255,255,0.05)] border-[var(--border-dark)] opacity-70 hover:opacity-100"
                            }
                          `}
                        >
                          {copiedId === invite._id ? <Check size={14} /> : <Copy size={14} />}
                          {copiedId === invite._id ? "Copied" : "Copy Info"}
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