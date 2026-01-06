import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaLayerGroup, 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaInfoCircle,
  FaShoppingCart,
  FaCheckCircle,
  FaCreditCard,
  FaChalkboardTeacher,
  FaLock
} from "react-icons/fa";

// Import the updated API functions
import { remainingSessionInfoBatchForStudent, createCreditTopUpSession } from "../api.js";

// --- Pricing Constants (For Display Only) ---
// These match your backend logic so the user sees the correct estimated price
const PRICE_ONLINE = 1500;
const PRICE_OFFLINE = 1500;
const FULL_BATCH_SIZE = 12; 

const StudentSessionPurchase = () => {
  const { isDark } = useOutletContext();
  const navigate = useNavigate();

  // Data State
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); 

  // Selection State
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [purchaseType, setPurchaseType] = useState('REMAINING'); // 'SINGLE', 'REMAINING', 'ENTIRE'

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await remainingSessionInfoBatchForStudent();
      
      if (response.success && response.data && response.data.length > 0) {
        setBatches(response.data);
        // Auto-select the first batch
        setSelectedBatchId(response.data[0].batch_obj_id);
      } else if (!response.success) {
        console.error("Error fetching batches:", response.message);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // --- Derived Data ---
  const selectedBatch = batches.find(b => b.batch_obj_id === selectedBatchId);
  
  // Calculate Display Costs
  const getCostDetails = () => {
    if (!selectedBatch) return { count: 0, pricePerSession: 0, total: 0 };

    const isOnline = selectedBatch.batchType === 'ONLINE';
    const pricePerSession = isOnline ? PRICE_ONLINE : PRICE_OFFLINE;
    
    let count = 0;
    switch (purchaseType) {
      case 'SINGLE': count = 1; break;
      case 'REMAINING': count = selectedBatch.remaining_classes || 0; break;
      case 'ENTIRE': count = FULL_BATCH_SIZE; break;
      default: count = 0;
    }

    return {
      count,
      pricePerSession,
      total: count * pricePerSession
    };
  };

  const { count, pricePerSession, total } = getCostDetails();

  // --- Payment Handler (Updated for Backend Calculation) ---
const handlePayment = async () => {
  if (!selectedBatch) return;

  setIsProcessing(true);

  try {
    const response = await createCreditTopUpSession(
      selectedBatch.batch_obj_id,
      selectedBatch.batchType,
      count,
      purchaseType
    );

    if (!response.success || !response.data?.order) {
      alert("Unable to initiate payment");
      setIsProcessing(false);
      return;
    }

    const { key, order } = response.data;

    const options = {
      key,
      amount: order.amount,
      currency: "INR",
      order_id: order.id,

      name: "GroundZero",
      description: "Session Top-Up",

      handler: function () {
        alert("Payment successful!");
        window.location.reload();
      },

      theme: {
        color: "#2563eb",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (err) {
    console.error("Payment failed", err);
    alert("Payment failed. Try again.");
  } finally {
    setIsProcessing(false);
  }
};

  // --- Styles ---
  const cardBg = isDark ? "var(--card-dark)" : "var(--bg-light)";
  const borderColor = isDark ? "var(--border-dark)" : "var(--border-light)";
  const textColor = isDark ? "var(--text-dark-primary)" : "var(--text-light-primary)";
  const textSecondary = isDark ? "var(--text-dark-secondary)" : "var(--text-light-secondary)";

  return (
    <div className="pb-10 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-3 rounded-full transition"
          style={{ backgroundColor: cardBg, color: textColor }}
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-3xl font-bold" style={{ color: textColor }}>Purchase Sessions</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 animate-pulse">
          <FaShoppingCart className="text-2xl text-[var(--accent-teal)]" />
          <p style={{ color: textSecondary }}>Loading available batches...</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="p-10 rounded-2xl border text-center" style={{ backgroundColor: cardBg, borderColor }}>
          <FaInfoCircle className="text-4xl mx-auto mb-4 text-orange-400" />
          <h2 className="text-xl font-bold">No Active Batches Found</h2>
          <p style={{ color: textSecondary }}>You are not enrolled in any batches with remaining sessions.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Batch List */}
          <div className="lg:w-7/12 flex flex-col gap-4">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2" style={{ color: textColor }}>
              <FaLayerGroup className="text-[var(--accent-teal)]" /> Select a Batch
            </h2>
            
            {batches.map((batch) => {
              const isSelected = selectedBatchId === batch.batch_obj_id;
              
              return (
                <div 
                  key={batch.batch_obj_id}
                  onClick={() => setSelectedBatchId(batch.batch_obj_id)}
                  className={`
                    relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
                    hover:scale-[1.01]
                  `}
                  style={{ 
                    backgroundColor: cardBg,
                    borderColor: isSelected ? 'var(--accent-teal)' : borderColor,
                    boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 text-[var(--accent-teal)]">
                      <FaCheckCircle size={24} />
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                         ${batch.batchType === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}
                       `}>
                         {batch.batchType}
                       </span>
                       <span className="text-xs font-mono opacity-50 border px-2 py-0.5 rounded" style={{ borderColor }}>
                         {batch.level}
                       </span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-1" style={{ color: textColor }}>{batch.batchName}</h3>
                  <p className="text-sm mb-4 line-clamp-2" style={{ color: textSecondary }}>{batch.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm" style={{ color: textSecondary }}>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt /> 
                      <span>Starts: {new Date(batch.startDate).toLocaleDateString()}</span>
                    </div>
                    
                    {batch.batchType === 'OFFLINE' ? (
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt />
                        <span>{batch.classLocation}, {batch.cityCode}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FaGlobe />
                        <span>Remote / Online</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t flex items-center gap-2" style={{ borderColor }}>
                     <FaChalkboardTeacher className="text-lg opacity-70" />
                     <span className="font-semibold" style={{ color: textColor }}>
                       {batch.remaining_classes} Sessions Remaining
                     </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: Purchase Options & Summary */}
          <div className="lg:w-5/12">
            <div className="sticky top-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: textColor }}>
                <FaCreditCard className="text-[var(--accent-teal)]" /> Payment Details
              </h2>

              <div className="rounded-2xl border p-6 shadow-xl backdrop-blur-md" 
                   style={{ backgroundColor: cardBg, borderColor }}>
                
                {/* Selected Batch Summary */}
                {selectedBatch && (
                   <div className="mb-6 pb-6 border-b" style={{ borderColor }}>
                     <p className="text-sm opacity-60 uppercase tracking-wide">Selected Batch</p>
                     <h3 className="text-xl font-bold" style={{ color: textColor }}>{selectedBatch.batchName}</h3>
                     <p className="text-sm mt-1" style={{ color: textSecondary }}>
                       Type: <strong className={selectedBatch.batchType === 'ONLINE' ? 'text-blue-500' : 'text-orange-500'}>{selectedBatch.batchType}</strong>
                     </p>
                   </div>
                )}

                {/* Purchase Type Options */}
                <div className="flex flex-col gap-3 mb-8">
                  <label className={`
                    flex items-center p-4 rounded-xl border cursor-pointer transition-colors
                    ${purchaseType === 'SINGLE' ? 'bg-[var(--accent-teal)] bg-opacity-10 border-[var(--accent-teal)]' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}
                  `}
                  style={{ borderColor: purchaseType === 'SINGLE' ? 'var(--accent-teal)' : borderColor }}
                  >
                    <input 
                      type="radio" 
                      name="ptype" 
                      checked={purchaseType === 'SINGLE'} 
                      onChange={() => setPurchaseType('SINGLE')}
                      className="w-5 h-5 text-[var(--accent-teal)]"
                    />
                    <div className="ml-3">
                      <span className="block font-bold" style={{ color: textColor }}>Buy Next Session</span>
                      <span className="text-xs" style={{ color: textSecondary }}>Single class access</span>
                    </div>
                  </label>

                  <label className={`
                    flex items-center p-4 rounded-xl border cursor-pointer transition-colors
                    ${purchaseType === 'REMAINING' ? 'bg-[var(--accent-teal)] bg-opacity-10 border-[var(--accent-teal)]' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}
                  `}
                  style={{ borderColor: purchaseType === 'REMAINING' ? 'var(--accent-teal)' : borderColor }}
                  >
                    <input 
                      type="radio" 
                      name="ptype" 
                      checked={purchaseType === 'REMAINING'} 
                      onChange={() => setPurchaseType('REMAINING')}
                      className="w-5 h-5 text-[var(--accent-teal)]"
                    />
                    <div className="ml-3">
                      <span className="block font-bold" style={{ color: textColor }}>Buy Remaining Sessions</span>
                      <span className="text-xs" style={{ color: textSecondary }}>
                        {selectedBatch?.remaining_classes || 0} classes left
                      </span>
                    </div>
                  </label>

                  <label className={`
                    flex items-center p-4 rounded-xl border cursor-pointer transition-colors
                    ${purchaseType === 'ENTIRE' ? 'bg-[var(--accent-teal)] bg-opacity-10 border-[var(--accent-teal)]' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}
                  `}
                  style={{ borderColor: purchaseType === 'ENTIRE' ? 'var(--accent-teal)' : borderColor }}
                  >
                    <input 
                      type="radio" 
                      name="ptype" 
                      checked={purchaseType === 'ENTIRE'} 
                      onChange={() => setPurchaseType('ENTIRE')}
                      className="w-5 h-5 text-[var(--accent-teal)]"
                    />
                    <div className="ml-3">
                      <span className="block font-bold" style={{ color: textColor }}>Buy Entire Batch</span>
                      <span className="text-xs" style={{ color: textSecondary }}>Full course ({FULL_BATCH_SIZE} sessions)</span>
                    </div>
                  </label>
                </div>

                {/* Bill Summary */}
                <div className="space-y-2 mb-8 p-4 rounded-lg bg-black/5 dark:bg-white/5">
                  <div className="flex justify-between text-sm" style={{ color: textSecondary }}>
                    <span>Session Cost ({selectedBatch?.batchType})</span>
                    <span>₹{pricePerSession}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: textSecondary }}>
                    <span>Number of Sessions</span>
                    <span>x {count}</span>
                  </div>
                  <div className="border-t my-2 pt-2 flex justify-between font-bold text-lg" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: textColor }}>
                    <span>Total Amount</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handlePayment}
                  disabled={!selectedBatch || isProcessing}
                  className={`
                    w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform 
                    flex items-center justify-center gap-2
                    ${(!selectedBatch || isProcessing)
                      ? 'bg-sky-300 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                    }
                  `}
                >
                  {isProcessing ? (
                    <>
                      <FaLock className="animate-pulse" /> Redirecting to Gateway...
                    </>
                  ) : (
                    `Proceed to Pay ₹${total.toLocaleString()}`
                  )}
                </button>

              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default StudentSessionPurchase;