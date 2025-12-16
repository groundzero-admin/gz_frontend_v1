import React, { useState, useEffect } from "react";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  Search,
  Phone,
  User,
  Calendar,
  Layers,
  School ,
  UserRound
} from "lucide-react";

import { useOutletContext } from "react-router-dom";
import { getNewJoinersList, sendCredentials } from "../api";

export default function AdminOrders() {

  // ✅ Theme now inherited from AdminLayout
  const { isDark } = useOutletContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getNewJoinersList();
      if (data.success) {
        setOrders(data.data || []);
      } else {
        setStatusMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Server Error" });
    }const sortOrders = (orders) => {
  const paid = orders
    .filter(o => o.paymentStatus === "PAID")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const pending = orders
    .filter(o => o.paymentStatus !== "PAID")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return [...paid, ...pending];
};


    setLoading(false);
  };


   
  const sortOrders = (orders) => {
  const paid = orders
    .filter(o => o.paymentStatus === "PAID")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const pending = orders
    .filter(o => o.paymentStatus !== "PAID")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return [...paid, ...pending];
};



  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSendCredentials = async (id) => {
    setProcessingId(id);
    const res = await sendCredentials(id);

    if (res.success) {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, isCredentialSent: true } : o
        )
      );
      setStatusMessage({ type: "success", text: "Credentials Sent!" });
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }

    setProcessingId(null);
    setTimeout(() => setStatusMessage(null), 3000);
  };


const filteredOrders = sortOrders(
  orders.filter(order =>
    order.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order._id?.toLowerCase().includes(searchTerm.toLowerCase())
  )
);


  return (
    <div
      className="min-h-screen transition-colors duration-500 font-sans"
      style={{
        backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
      }}
    >
      {/* CSS Variables Injection (Simulating color.css) */}
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
          --button-bg-dark: #8a2be2;
          --button-bg-light: #8a2be2;
        }
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-panel {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}</style>

      <div className="relative w-full min-h-screen overflow-hidden">
        {/* BACKGROUND PATTERNS (From Landing Page) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(100,100,100,0.1)_1px,transparent_0)] bg-[size:20px_20px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[500px] bg-[linear-gradient(135deg,rgba(138,43,226,0.2)_0%,rgba(0,196,204,0.15)_50%,rgba(60,60,246,0.2)_100%)] rounded-full blur-[80px] opacity-40 animate-[gradient-animation_20s_ease_infinite]"></div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-6 py-8">
          
          {/* HEADER */}
          <div 
            className="flex flex-col md:flex-row justify-between items-center px-6 py-4 mb-8 rounded-xl border glass-panel transition-all"
            style={{
              backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
              borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
            }}
          >
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-purple)] bg-clip-text text-transparent">
                New Joinees Management
              </h1>
              <p className="text-sm opacity-70 mt-1">
                Review new enrollments and issue credentials.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
               {/* Search Input */}
               <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 group-focus-within:text-[var(--accent-teal)] transition-colors" size={16} />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search orders..." 
                    className="pl-10 pr-4 py-2 rounded-lg text-sm bg-transparent border focus:outline-none focus:border-[var(--accent-teal)] transition-all w-64"
                    style={{
                      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                      color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
                    }}
                  />
               </div>

              <button 
                onClick={fetchOrders}
                className="p-2.5 rounded-lg border hover:opacity-80 transition-all active:scale-95"
                style={{
                  borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                  backgroundColor: `rgba(255,255,255,0.05)`
                }}
                title="Sync Data"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> 
              </button>

              {/* <button
                onClick={() => setIsDark(!isDark)}
                className="p-2.5 rounded-lg border hover:opacity-80 transition-all active:scale-95"
                style={{
                  borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                  backgroundColor: `rgba(255,255,255,0.05)`
                }}
              >
                {isDark ? (
                  <Sun size={18} className="text-[var(--accent-teal)]" />
                ) : (
                  <Moon size={18} className="text-[var(--accent-purple)]" />
                )}
              </button> */}
            </div>
          </div>

          {/* MAIN TABLE CARD */}
          <div 
            className="rounded-2xl border glass-panel overflow-hidden shadow-2xl"
            style={{
              backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
              borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr 
                    className="text-xs uppercase tracking-wider font-semibold border-b"
                    style={{
                      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                      color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
                      backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'
                    }}
                  >
                    <th className="px-6 py-5 w-24">Order ID</th>
                    <th className="px-6 py-5 w-32">Date</th>
                    <th className="px-6 py-5">Student Profile</th>
                    <th className="px-6 py-5">Parent Profile</th>
                    <th className="px-6 py-5">Order Details</th>
                    <th className="px-6 py-5">Payment</th>
                    <th className="px-6 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-20 text-center opacity-60">
                        <Loader2 className="animate-spin mx-auto mb-3 h-8 w-8 text-[var(--accent-teal)]" />
                        <p>Loading data...</p>
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-20 text-center opacity-60">
                        <div className="bg-[rgba(255,255,255,0.05)] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                          <User size={24} />
                        </div>
                        <p>No orders found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr 
                        key={order._id} 
                        className="transition-colors hover:bg-[rgba(255,255,255,0.03)] group"
                      >
                        {/* Order ID */}
                        <td className="px-6 py-5 align-top">
                          <span 
                            className="font-mono text-xs font-medium px-2 py-1 rounded border opacity-80"
                            style={{ 
                              borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                            }}
                          >
                            #{order._id ? order._id.slice(-6).toUpperCase() : 'N/A'}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-5 align-top">
                           <div className="flex items-start gap-2 text-sm">
                             <Calendar size={14} className="mt-0.5 opacity-60" />
                             <div>
                               <div className="font-medium">
                                 {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, {
                                   month: 'short', day: 'numeric'
                                 }) : 'N/A'}
                               </div>
                               <div className="text-xs opacity-50 mt-0.5">
                                 {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                               </div>
                             </div>
                           </div>
                        </td>

                        {/* Student Details */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start gap-3">
                              <div className="mt-1 p-1.5 rounded-full shrink-0 bg-[rgba(138,43,226,0.1)] text-[var(--accent-purple)]">
                                <User size={14} />
                              </div>
                              <div>
                                <div className="font-semibold text-sm">{order.studentName || 'Unknown'}</div>
                                <div className="text-xs opacity-60">{order.studentEmail || 'No Email'}</div>
                              </div>
                            </div>
                            
                            {/* Academic Info */}
                            <div className="pl-9 text-xs opacity-70 space-y-1.5">
                               <div className="flex items-center gap-1.5">
                                  <School size={12} />
                                  <span>{order.schoolName || 'School N/A'}</span>
                               </div>
                               <div className="flex gap-1.5">
                                  <span className="px-1.5 py-0.5 rounded border border-[var(--border-dark)] bg-[rgba(255,255,255,0.02)]">
                                    {order.classGrade || 'Grade ?'}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded border border-[var(--border-dark)] bg-[rgba(255,255,255,0.02)]">
                                    {order.board || 'Board ?'}
                                  </span>
                               </div>
                            </div>
                          </div>
                        </td>

                        {/* Parent Details */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 rounded-full shrink-0 bg-[rgba(0,196,204,0.1)] text-[var(--accent-teal)]">
                              <UserRound size={14} />
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                 {order.parentName || 'Parent Info'}
                              </div>
                              <div className="text-xs opacity-60 mt-0.5 space-y-0.5">
                                 <p>{order.parentEmail}</p>
                                 <p>{order.parentPhone}</p>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Order Info */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 rounded-full shrink-0 bg-orange-500/10 text-orange-400">
                              <Layers size={14} />
                            </div>
                            <div>
                               <div className="text-sm font-medium">
                                 {order.purchaseType || 'Standard'}
                               </div>
                               <div className="mt-1">
                                 <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-[var(--border-dark)] bg-[rgba(255,255,255,0.05)]">
                                   {order.batchType || 'General'}
                                 </span>
                               </div>
                            </div>
                          </div>
                        </td>

                        {/* Payment */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex flex-col gap-1.5">
                            <div className={`inline-flex items-center w-fit px-2.5 py-1 rounded-full text-xs font-bold border ${
                              order.paymentStatus === 'PAID' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {order.paymentStatus === 'PAID' ? <CheckCircle size={10} className="mr-1.5" /> : <AlertCircle size={10} className="mr-1.5" />}
                              {order.paymentStatus || 'PENDING'}
                            </div>
                            <div className="text-sm font-semibold opacity-90 ml-1">
                              ₹{order.amount?.toLocaleString() || '0'}
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-5 align-middle text-right">
                          {order.isCredentialSent ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-dark)] bg-[rgba(255,255,255,0.02)] text-xs font-medium opacity-50 cursor-not-allowed">
                              <CheckCircle size={14} />
                              Sent
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSendCredentials(order._id)}
                              disabled={processingId === order._id || order.paymentStatus !== 'PAID'}
                              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg shadow-lg transition-all
                                ${order.paymentStatus === 'PAID' 
                                  ? 'text-white hover:opacity-90 hover:scale-105' 
                                  : 'bg-gray-700/20 text-gray-500 cursor-not-allowed'}`}
                              style={order.paymentStatus === 'PAID' ? {
                                background: 'linear-gradient(to right, var(--accent-teal), var(--accent-purple))'
                              } : {}}
                            >
                              {processingId === order._id ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Mail size={14} />
                                  Send Credentials
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Footer */}
            <div 
              className="px-6 py-4 border-t flex justify-between items-center text-xs font-medium opacity-60"
              style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}
            >
               <span>Total Orders: {filteredOrders.length}</span>
               <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-teal)]"></span>
                  <span>Live Sync Active</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {statusMessage && (
        <div className={`fixed bottom-8 right-8 px-5 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-bounce-in z-50 glass-panel ${
          statusMessage.type === 'success' 
            ? 'border-emerald-500/50 text-emerald-500' 
            : 'border-red-500/50 text-red-500'
        }`}>
          <div className={`p-2 rounded-full ${statusMessage.type === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
             {statusMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          </div>
          <div className="flex flex-col">
             <span className="font-bold text-sm">{statusMessage.type === 'success' ? 'Success' : 'Error'}</span>
             <span className="text-xs opacity-80" style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
                {statusMessage.text}
             </span>
          </div>
        </div>
      )}
    </div>
  );
}