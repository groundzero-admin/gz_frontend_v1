import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaLayerGroup, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { listAllActiveBatches } from '../api.js';

// --- Background Component (Pure CSS) ---
const SpaceBackground = ({ isDark }) => {
  const bgStyle = isDark ? {
    backgroundColor: '#02040a',
    backgroundImage: `radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(56, 189, 248, 0.15) 0px, transparent 50%)`
  } : {
    backgroundColor: '#ffffff',
    backgroundImage: `radial-gradient(at 0% 0%, rgba(167, 139, 250, 0.2) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.2) 0px, transparent 50%)`
  };
  return <div className="fixed inset-0 pointer-events-none -z-10" style={{ ...bgStyle, backgroundAttachment: 'fixed', backgroundSize: 'cover' }} />;
};

const ActiveBatchesPageForBoard = () => {
  const navigate = useNavigate();
  // Safe check for context in case it's used outside the main layout
  const context = useOutletContext(); 
  const isDark = context?.isDark ?? true; 

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBatches = async () => {
      setLoading(true);
      const res = await listAllActiveBatches();
      if (res.success) {
        setBatches(res.data || []);
      } else {
        console.error(res.message);
      }
      setLoading(false);
    };
    loadBatches();
  }, []);

  const handleCardClick = (batchId) => {
    navigate(`${batchId}`);
  };

  return (
    <div className="relative min-h-screen p-6 md:p-10">
      <SpaceBackground isDark={isDark} />
      
      <div className="max-w-7xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 flex items-center gap-3 ${isDark ? "text-white" : "text-slate-800"}`}>
          <FaLayerGroup className="text-cyan-400" /> Select a batch
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-48 rounded-3xl animate-pulse ${isDark ? "bg-white/5" : "bg-gray-200"}`} />
            ))}
          </div>
        ) : batches.length === 0 ? (
          <div className={`p-10 text-center rounded-3xl border border-dashed ${isDark ? "border-white/10 text-gray-500" : "border-gray-300 text-gray-400"}`}>
            No active batches found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <div
                key={batch.batch_obj_id}
                onClick={() => handleCardClick(batch.batch_obj_id)}
                className={`
                  cursor-pointer relative overflow-hidden rounded-3xl p-6 border shadow-xl transition-all duration-300 group transform
                  hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]
                  ${isDark 
                    ? "bg-[#13111C]/80 border-white/10 hover:border-cyan-500/50" 
                    : "bg-white border-white/60 shadow-blue-500/5 hover:border-blue-400"
                  }
                `}
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                    ${batch.isLive 
                      ? "bg-green-500/10 text-green-500 border-green-500/20" 
                      : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                    }
                  `}>
                    {batch.status}
                  </span>
                  <span className={`text-[10px] font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                     {batch.batchType}
                  </span>
                </div>

                <h3 className={`text-xl font-bold mb-2 truncate ${isDark ? "text-white" : "text-slate-800"}`}>
                  {batch.batchName}
                </h3>
                
                <p className={`text-sm mb-6 line-clamp-2 h-10 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                  {batch.description || "No description available."}
                </p>

                <div className={`pt-4 border-t flex items-center justify-between text-xs font-medium
                   ${isDark ? "border-white/10 text-gray-400" : "border-gray-100 text-gray-500"}
                `}>
                   <div className="flex items-center gap-2">
                      <FaCalendarAlt />
                      {new Date(batch.startDate).toLocaleDateString()}
                   </div>
                   
                   {batch.batchType === 'OFFLINE' && (
                     <div className="flex items-center gap-2">
                        <FaMapMarkerAlt /> {batch.cityCode}
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveBatchesPageForBoard;