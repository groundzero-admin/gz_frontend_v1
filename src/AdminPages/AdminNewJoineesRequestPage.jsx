import React, { useState, useEffect } from "react";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  Search,
  User,
  Calendar,
  Layers,
  School,
  UserRound,
  X,
  CheckSquare,
  Square
} from "lucide-react";

import { useOutletContext } from "react-router-dom";
import { getNewJoinersList, sendCredentials, getBatches } from "../api";

export default function AdminOrders() {
  const { isDark } = useOutletContext();

  const [orders, setOrders] = useState([]);
  const [batches, setBatches] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // ✅ Changed to Array for Multiple Selection
  const [selectedBatchIds, setSelectedBatchIds] = useState([]); 

  // 1. Fetch Orders and Batches
  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersData, batchesData] = await Promise.all([
        getNewJoinersList(),
        getBatches()
      ]);

      if (ordersData.success) {
        setOrders(ordersData.data || []);
      } else {
        setStatusMessage({ type: "error", text: ordersData.message });
      }

      if (batchesData.success) {
        setBatches(batchesData.data || []);
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Server Error" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sortOrders = (orders) => {
    const paid = orders
      .filter((o) => o.paymentStatus === "PAID")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const pending = orders
      .filter((o) => o.paymentStatus !== "PAID")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return [...paid, ...pending];
  };

  const initiateSendCredentials = (order) => {
    setSelectedOrder(order);
    setSelectedBatchIds([]); // Reset selection
    setIsModalOpen(true);
  };

  // ✅ Toggle Batch Selection Logic
  const toggleBatchSelection = (batchId) => {
    setSelectedBatchIds(prev => 
      prev.includes(batchId) 
        ? prev.filter(id => id !== batchId) // Remove if exists
        : [...prev, batchId] // Add if new
    );
  };

  const handleConfirmSend = async () => {
    // Filter the actual batch objects based on selected IDs
    const selectedBatches = batches.filter(b => selectedBatchIds.includes(b.batch_obj_id));

    setIsModalOpen(false);
    setProcessingId(selectedOrder._id);

    // ✅ Send Array of batches (Empty array = No Batch / Credentials Only)
    const res = await sendCredentials(selectedOrder._id, selectedBatches);

    if (res.success) {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === selectedOrder._id ? { ...o, isCredentialSent: true } : o
        )
      );
      setStatusMessage({ type: "success", text: "Credentials Sent Successfully!" });
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }

    setProcessingId(null);
    setSelectedOrder(null);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const filteredOrders = sortOrders(
    orders.filter(
      (order) =>
        order.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
        /* Custom Scrollbar for Batch List */
        .batch-list::-webkit-scrollbar {
          width: 6px;
        }
        .batch-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .batch-list::-webkit-scrollbar-thumb {
          background-color: var(--accent-purple);
          border-radius: 4px;
        }
      `}</style>

      {/* --- MULTI-BATCH SELECTION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div 
            className="w-full max-w-lg rounded-2xl border shadow-2xl glass-panel animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]"
            style={{
              backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
              borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
            }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b shrink-0" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-purple)] bg-clip-text text-transparent">
                  Assign Batches
                </h3>
                <p className="text-xs opacity-60 mt-1">
                  for {selectedOrder?.studentName}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="opacity-70 hover:opacity-100 transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto batch-list">
              <p className="text-sm opacity-80 mb-4">
                Select the batch(es) to link. You can select <strong>none</strong>, <strong>one</strong>, or <strong>multiple</strong>.
              </p>
              
              <div className="flex flex-col gap-3">
                {batches.length === 0 ? (
                  <div className="text-center p-6 border border-dashed rounded-xl opacity-50">
                    No active batches available.
                  </div>
                ) : (
                  batches.map(batch => {
                    const isSelected = selectedBatchIds.includes(batch.batch_obj_id);
                    return (
                      <div 
                        key={batch.batch_obj_id}
                        onClick={() => toggleBatchSelection(batch.batch_obj_id)}
                        className={`
                          relative p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between group
                          ${isSelected 
                            ? 'bg-[var(--accent-purple)]/10 border-[var(--accent-purple)]' 
                            : 'hover:bg-white/5 border-transparent bg-black/5 dark:bg-white/5'
                          }
                        `}
                        style={{
                           borderColor: isSelected ? 'var(--accent-purple)' : `var(${isDark ? "--border-dark" : "--border-light"})`
                        }}
                      >
                        <div className="flex flex-col">
                           <span className="font-bold text-sm">{batch.batchName}</span>
                           <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                batch.batchType === 'ONLINE' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                              }`}>
                                {batch.batchType}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                batch.isLive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {batch.status}
                              </span>
                           </div>
                        </div>

                        <div className={`
                          w-6 h-6 rounded-full border flex items-center justify-center transition-colors
                          ${isSelected ? 'bg-[var(--accent-purple)] border-[var(--accent-purple)]' : 'border-gray-500'}
                        `}>
                          {isSelected && <CheckCircle size={14} className="text-white" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-4 border-t shrink-0 bg-black/5 dark:bg-white/5 flex justify-between items-center" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
              
              <div className="text-xs font-bold opacity-70">
                 {selectedBatchIds.length === 0 
                   ? "Sending Credentials Only (No Batch)" 
                   : `Assigning ${selectedBatchIds.length} Batch(es)`
                 }
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium opacity-70 hover:opacity-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSend}
                  className="px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(to right, var(--accent-teal), var(--accent-purple))'
                  }}
                >
                  Confirm & Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT (Same as before) --- */}
      <div className="relative w-full min-h-screen overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(100,100,100,0.1)_1px,transparent_0)] bg-[size:20px_20px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[500px] bg-[linear-gradient(135deg,rgba(138,43,226,0.2)_0%,rgba(0,196,204,0.15)_50%,rgba(60,60,246,0.2)_100%)] rounded-full blur-[80px] opacity-40 animate-[gradient-animation_20s_ease_infinite]"></div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-6 py-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 mb-8 rounded-xl border glass-panel transition-all" style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`, borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-purple)] bg-clip-text text-transparent">New Joinees Management</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 group-focus-within:text-[var(--accent-teal)]" size={16} />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search students..." className="pl-10 pr-4 py-2 rounded-lg text-sm bg-transparent border focus:outline-none focus:border-[var(--accent-teal)] w-64" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`, color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }} />
              </div>
              <button onClick={fetchData} className="p-2.5 rounded-lg border hover:opacity-80 transition-all active:scale-95" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`, backgroundColor: `rgba(255,255,255,0.05)` }}><RefreshCw size={18} className={loading ? "animate-spin" : ""} /></button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border glass-panel overflow-hidden shadow-2xl" style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`, borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase tracking-wider font-semibold border-b" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`, color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`, backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)" }}>
                    <th className="px-6 py-5">Order ID</th>
                    <th className="px-6 py-5">Date</th>
                    <th className="px-6 py-5">Student Profile</th>
                    <th className="px-6 py-5">Parent Profile</th>
                    <th className="px-6 py-5">Order Details</th>
                    <th className="px-6 py-5">Payment</th>
                    <th className="px-6 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
                  {loading ? (
                    <tr><td colSpan="7" className="px-6 py-20 text-center opacity-60"><Loader2 className="animate-spin mx-auto mb-3 h-8 w-8 text-[var(--accent-teal)]" /><p>Loading...</p></td></tr>
                  ) : filteredOrders.map((order) => (
                    <tr key={order._id} className="transition-colors hover:bg-[rgba(255,255,255,0.03)] group">
                        <td className="px-6 py-5 align-top"><span className="font-mono text-xs font-medium px-2 py-1 rounded border opacity-80" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>#{order._id.slice(-6).toUpperCase()}</span></td>
                        <td className="px-6 py-5 align-top text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-5 align-top">
                            <div className="font-semibold text-sm">{order.studentName}</div>
                            <div className="text-xs opacity-60">{order.studentEmail}</div>
                        </td>
                        <td className="px-6 py-5 align-top">
                            <div className="font-medium text-sm">{order.parentName}</div>
                            <div className="text-xs opacity-60">{order.parentEmail}</div>
                        </td>
                        <td className="px-6 py-5 align-top">
                            <div className="text-sm font-medium">{order.purchaseType}</div>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-[var(--border-dark)]">{order.batchType}</span>
                        </td>
                        <td className="px-6 py-5 align-top">
                             <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${order.paymentStatus === "PAID" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                                {order.paymentStatus}
                             </div>
                        </td>
                        <td className="px-6 py-5 align-middle text-right">
                          {order.isCredentialSent ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-dark)] bg-[rgba(255,255,255,0.02)] text-xs font-medium opacity-50 cursor-not-allowed">
                              <CheckCircle size={14} /> Sent
                            </div>
                          ) : (
                            <button
                              onClick={() => initiateSendCredentials(order)}
                              disabled={processingId === order._id || order.paymentStatus !== "PAID"}
                              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg shadow-lg transition-all ${order.paymentStatus === "PAID" ? "text-white hover:opacity-90 hover:scale-105" : "bg-gray-700/20 text-gray-500 cursor-not-allowed"}`}
                              style={order.paymentStatus === "PAID" ? { background: "linear-gradient(to right, var(--accent-teal), var(--accent-purple))" } : {}}
                            >
                              {processingId === order._id ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                              {processingId === order._id ? "Sending..." : "Send Credentials"}
                            </button>
                          )}
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className={`fixed bottom-8 right-8 px-5 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-bounce-in z-50 glass-panel ${statusMessage.type === "success" ? "border-emerald-500/50 text-emerald-500" : "border-red-500/50 text-red-500"}`}>
          <div className={`p-2 rounded-full ${statusMessage.type === "success" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>{statusMessage.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}</div>
          <div className="flex flex-col"><span className="font-bold text-sm">{statusMessage.type === "success" ? "Success" : "Error"}</span><span className="text-xs opacity-80">{statusMessage.text}</span></div>
        </div>
      )}
    </div>
  );
}