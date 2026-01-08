import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPencilAlt,
  FaStar, 
  FaGlobeAmericas,
  FaTimes
} from 'react-icons/fa';
import { MdOutlineRocketLaunch } from "react-icons/md"; 
import { MessageCircle, Sparkles, Star } from 'lucide-react';
import { updateStudentProfile } from '../api.js'; 

// --- Animation Variants ---
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 50, damping: 20 }
  }
};

// --- COMPONENT: Fixed Space Background ---
const SpaceBackground = ({ isDark }) => {
  const stars = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 10 + 8,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 3 
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Nebula Clouds */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} 
        className={`absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[120px] 
          ${isDark ? "bg-indigo-900/40" : "bg-sky-200/60"}
      `}></motion.div>
      <motion.div 
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }} 
        className={`absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] 
          ${isDark ? "bg-purple-900/40" : "bg-violet-200/60"}
      `}></motion.div>

      {/* Twinkling Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{ opacity: 0.3, scale: 0.8 }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
          className={`absolute ${isDark ? "text-white" : "text-slate-400"}`}
          style={{ left: `${star.left}%`, top: `${star.top}%` }}
        >
          <Star size={star.size} fill="currentColor" strokeWidth={0} />
        </motion.div>
      ))}

      {/* Floating Rocket */}
      <motion.div
        initial={{ x: -100, y: "100vh", opacity: 0 }}
        animate={{ x: "120vw", y: "-20vh", opacity: [0, 1, 1, 0] }}
        transition={{ duration: 100, repeat: Infinity, ease: "linear", delay: 1 }}
        className={`absolute top-0 left-0 ${isDark ? "text-gray-200" : "text-slate-600"}`}
        style={{ zIndex: 10 }}
      >
        <MdOutlineRocketLaunch size={60} style={{ transform: "rotate(0deg)", filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))" }} />
      </motion.div>

      {/* Floating Earth */}
      <motion.div
        initial={{ x: "110vw", y: 100, rotate: 0, opacity: 0 }}
        animate={{ x: -200, y: 300, rotate: -45, opacity: isDark ? 0.4 : 0.2 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear", delay: 0 }}
        className={`absolute top-20 left-0 ${isDark ? "text-purple-300" : "text-indigo-400"}`}
        style={{ zIndex: 5 }}
      >
        <FaGlobeAmericas size={120} />
      </motion.div>
    </div>
  );
};

// --- COMPONENTS ---

const ProfileCard = ({ userData, isDark, onProfileUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: userData?.username || "", grade: userData?.class || "" });
    const [isSaving, setIsSaving] = useState(false);
  
    useEffect(() => {
      setFormData({ name: userData?.username || "", grade: userData?.class || "" });
    }, [userData]);
  
    const handleSave = async () => {
      setIsSaving(true);
      const response = await updateStudentProfile({ name: formData.name, class: formData.grade });
      
      if (response.success) {
        onProfileUpdate({
            ...userData,
            username: formData.name,
            class: formData.grade
        });
        setIsEditing(false);
      } else {
        alert(response.message || "Failed to update profile");
      }
      setIsSaving(false);
    };
  
    return (
      <motion.div 
        variants={cardVariants} 
        whileHover={{ scale: 1.01 }} 
        className="relative col-span-1 md:col-span-2 mb-6 z-10"
      >
        <div className="flex justify-between items-center mb-4">
           <div>
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>My Space</h2>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>Make it yours!</p>
           </div>
           
           {!isEditing ? (
               <button 
                onClick={() => setIsEditing(true)} 
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 hover:scale-105 active:scale-95 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-500/30"
               >
                  <FaPencilAlt /> Customize
               </button>
           ) : (
               <div className="flex gap-2">
                  <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 hover:scale-105 active:scale-95 text-white text-xs font-bold shadow-lg transition-transform">
                     {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setIsEditing(false)} className={`px-4 py-2 rounded-full text-xs font-bold border hover:scale-105 active:scale-95 transition-transform ${isDark ? "bg-white/10 text-white border-transparent" : "bg-white text-gray-700 border-gray-200"}`}>
                     Cancel
                  </button>
               </div>
           )}
        </div>
  
        {/* Removed backdrop-blur-md to fix hover blur issue */}
        <div className={`relative p-8 rounded-3xl border overflow-hidden transition-all duration-300
          ${isDark ? "bg-[#13111C]/80 border-yellow-500/20" : "bg-white/60 border-yellow-400/50 shadow-xl"}
        `}>
          <MdOutlineRocketLaunch 
            className={`absolute -right-6 -bottom-6 text-9xl opacity-[0.07] rotate-[-45deg] pointer-events-none
                ${isDark ? "text-white" : "text-slate-900"}
            `} 
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                  <div className={`absolute inset-0 rounded-full blur-md opacity-70 transition-all duration-500
                      ${isDark ? "bg-gradient-to-tr from-yellow-400 via-purple-500 to-cyan-500" : "bg-gradient-to-tr from-yellow-300 via-pink-400 to-cyan-400"}
                  `}></div>
                  <div className={`relative w-28 h-28 rounded-full flex items-center justify-center text-5xl font-bold border-4 shadow-2xl
                      ${isDark ? "bg-[#1A1625] border-[#13111C] text-white" : "bg-white border-white text-slate-800"}
                  `}>
                      {formData.name.charAt(0).toUpperCase()}
                  </div>
              </div>
  
              <div className="flex-1 text-center md:text-left w-full">
                  <div className="flex justify-center md:justify-start mb-3">
                      <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm
                          ${isDark 
                             ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30 text-purple-200" 
                             : "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-600"
                          }
                      `}>
                          <FaStar className="text-yellow-400 text-xs" /> 
                          Meet the Inventor 
                          <FaStar className="text-yellow-400 text-xs" />
                      </span>
                  </div>
  
                  {isEditing ? (
                      <div className="flex flex-col gap-3 max-w-md animate-in fade-in slide-in-from-bottom-2">
                          <div className="flex items-center gap-3">
                              <span className={`w-12 text-right text-sm font-bold ${isDark ? "text-gray-400" : "text-gray-600"}`}>Name:</span>
                              <input 
                                type="text" 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                className={`flex-1 rounded-xl px-4 py-2 outline-none border focus:ring-2 focus:ring-cyan-500/50 transition-all ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-slate-900"}`} 
                                placeholder="Your Name" 
                              />
                          </div>
                          
                          <div className="flex items-center gap-3">
                              <span className={`w-12 text-right text-sm font-bold ${isDark ? "text-gray-400" : "text-gray-600"}`}>Grade:</span>
                              <input 
                                type="text" 
                                inputMode="numeric"
                                value={formData.grade} 
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setFormData({...formData, grade: val});
                                }}
                                className={`w-24 rounded-xl px-4 py-2 outline-none border focus:ring-2 focus:ring-cyan-500/50 transition-all ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-slate-900"}`} 
                                placeholder="Grade" 
                              />
                          </div>
                      </div>
                  ) : (
                      <>
                          <h1 className={`text-4xl font-extrabold mb-2 tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>{userData?.username || "Space Explorer"}</h1>
                          <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                             • {userData?.email || "Explorer"} • {userData?.class ? `${userData.class}th Grade` : "N/A"}
                          </p>
                      </>
                  )}
              </div>
          </div>
        </div>
      </motion.div>
    );
};

const CompanionCard = ({ isDark, userData }) => {
    const [companionName, setCompanionName] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const userKey = userData?.email || userData?.user_number || "guest";
    const storageKey = `student_companion_name_${userKey}`;

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        setCompanionName(saved || "");
    }, [storageKey]); 

    const handleSave = () => {
        const nameToSave = companionName.trim();
        setCompanionName(nameToSave);
        localStorage.setItem(storageKey, nameToSave);
        setIsEditing(false);
    };

    return (
        <motion.div 
          variants={cardVariants} 
          whileHover={{ scale: 1.02 }}
          // Removed backdrop-blur-md
          className={`p-6 rounded-3xl border flex flex-col h-full shadow-lg relative overflow-hidden group transition-all duration-300 z-10
          ${isDark ? "bg-[#13111C]/80 border-white/5" : "bg-white/60 border-blue-100 shadow-blue-500/5"}
        `}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-cyan-400" />
                <div>
                    <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>My Companion</h3>
                    <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-slate-400"}`}>Here is your learning companion</p>
                </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 flex-1">
              <div className="relative flex items-center gap-2 mt-2">
                 {isEditing ? (
                     <input 
                        autoFocus
                        type="text"
                        value={companionName}
                        onChange={(e) => setCompanionName(e.target.value)}
                        onBlur={handleSave} 
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        placeholder="Name your companion..."
                        className={`w-full bg-transparent text-xl font-bold outline-none border-b-2 pb-1 ${isDark ? "text-cyan-400 border-cyan-500/50 placeholder:text-white/20" : "text-cyan-600 border-cyan-400/50 placeholder:text-gray-400"}`} 
                     />
                 ) : (
                    <div 
                        onClick={() => setIsEditing(true)} 
                        className="flex items-center gap-3 w-full cursor-pointer group"
                    >
                        <h4 className={`text-xl font-bold truncate ${companionName ? (isDark ? "text-cyan-400" : "text-cyan-600") : "text-gray-400/60 italic"}`}>
                            {companionName || "Name your companion..."}
                        </h4>
                        
                        <FaPencilAlt 
                           size={12} 
                           className={`opacity-30 group-hover:opacity-100 transition-all ${isDark ? "text-white" : "text-slate-600"}`} 
                        />
                    </div>
                 )}
              </div>

              <div className="flex items-center gap-3 my-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
                      <Sparkles className="text-white w-6 h-6 animate-pulse" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {['Friendly', 'Curious', 'Smart'].map((tag, i) => (
                          <span key={i} className={`px-2 py-1 rounded-md border text-[10px] font-bold ${isDark ? "bg-cyan-950/30 border-cyan-500/30 text-cyan-300" : "bg-cyan-50 border-cyan-200 text-cyan-700"}`}>{tag}</span>
                      ))}
                  </div>
              </div>
              
              <div className="mt-auto -mb-1">
                  <div className={`p-4 rounded-2xl text-xs italic relative border ${isDark ? "bg-white/5 border-white/5 text-gray-400" : "bg-white/60 border-blue-50 text-slate-600 shadow-sm"}`}>
                      "Hi! I'm {companionName || "your friend"}. Let's solve some mysteries today!"
                  </div>
              </div>
          </div>
        </motion.div>
    );
};

const MissionCard = ({ isDark, userData }) => {
    const [mission, setMission] = useState("");
    const inputRef = useRef(null);

    const userKey = userData?.email || userData?.user_number || "guest";
    const storageKey = `student_mission_${userKey}`;

    useEffect(() => { 
        setMission(localStorage.getItem(storageKey) || ""); 
    }, [storageKey]);

    const handleChange = (e) => {
        setMission(e.target.value);
        localStorage.setItem(storageKey, e.target.value);
    };

    return (
        <motion.div 
            variants={cardVariants} 
            whileHover={{ scale: 1.02 }}
            // Removed backdrop-blur-md
            className={`p-6 rounded-3xl border flex flex-col h-full shadow-lg relative overflow-hidden z-10 ${isDark ? "bg-[#13111C]/80 border-white/5" : "bg-white/60 border-purple-100"}`}
        >
            <div className={`absolute bottom-0 right-0 w-32 h-32 blur-[50px] rounded-full pointer-events-none opacity-50 ${isDark ? "bg-purple-500/20" : "bg-purple-300/30"}`}></div>
            
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <MdOutlineRocketLaunch size={18} className="text-purple-400" />
                    <div>
                        <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>My Mission</h3>
                        <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-slate-400"}`}>What do you want to achieve?</p>
                    </div>
                </div>
                <button 
                    onClick={() => inputRef.current?.focus()} 
                    className={`opacity-30 hover:opacity-100 hover:scale-110 active:scale-95 transition-all ${isDark ? "text-white" : "text-slate-600"}`}
                >
                    <FaPencilAlt size={12} />
                </button>
            </div>
            
            <textarea 
                ref={inputRef}
                value={mission} 
                onChange={handleChange} 
                className={`w-full h-full bg-transparent resize-none outline-none text-2xl font-bold leading-tight 
                    ${isDark ? "text-white placeholder:text-white/20" : "text-slate-900 placeholder:text-gray-300"}
                `} 
                placeholder="Type your big goal here..." 
            />
        </motion.div>
    );
};

const QuickFactsCard = ({ userData, isDark }) => {
    const [coolThing, setCoolThing] = useState("");
    const inputRef = useRef(null); 

    const userKey = userData?.email || userData?.user_number || "guest";
    const storageKey = `student_cool_thing_${userKey}`;

    useEffect(() => { 
        setCoolThing(localStorage.getItem(storageKey) || ""); 
    }, [storageKey]);

    const handleChange = (e) => {
        setCoolThing(e.target.value);
        localStorage.setItem(storageKey, e.target.value);
    };

    return (
        <motion.div 
            variants={cardVariants} 
            whileHover={{ scale: 1.02 }}
            // Removed backdrop-blur-md
            className={`p-6 rounded-3xl border flex flex-col shadow-lg h-full z-10 ${isDark ? "bg-[#13111C]/80 border-white/5" : "bg-white/60 border-orange-100"}`}
        >
            <div className="flex items-center gap-2 mb-6"><FaStar size={18} className="text-yellow-400" /><h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>Quick Facts</h3></div>
            <div className="flex gap-12 mb-6">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">STUDENT NO.</p><p className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{userData?.user_number || "GZSTXXX"}</p></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">GRADE</p><p className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{userData?.class || "7"}th</p></div>
            </div>
            <div className="mt-auto">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ONE COOL THING ABOUT ME</p>
                    <button 
                        onClick={() => inputRef.current?.focus()} 
                        className={`opacity-30 hover:opacity-100 hover:scale-110 active:scale-95 transition-all ${isDark ? "text-white" : "text-slate-600"}`}
                    >
                        <FaPencilAlt size={12} />
                    </button>
                </div>
                <input 
                    ref={inputRef}
                    type="text" 
                    value={coolThing} 
                    onChange={handleChange} 
                    placeholder="Tell us one more cool thing..."
                    className={`w-full bg-transparent border-b py-1 text-sm outline-none focus:border-yellow-500 transition-colors font-medium 
                        ${isDark 
                            ? "border-white/10 text-gray-200 placeholder:text-white/20" 
                            : "border-gray-300 text-slate-800 focus:border-yellow-500 placeholder:text-gray-400"
                        }`} 
                />
            </div>
        </motion.div>
    );
};

// --- UPDATED INTERESTS CARD ---
const InterestsCard = ({ isDark, userData }) => {
    const [tags, setTags] = useState([]);
    const [newInterest, setNewInterest] = useState("");
    
    // Default options (The "old" small cards)
    const defaultInterests = ["Coding" , "Science", "Drawing", "Space"];
    
    const userKey = userData?.email || userData?.user_number || "guest";
    const storageKey = `student_interests_${userKey}`;

    useEffect(() => { 
        const saved = localStorage.getItem(storageKey); 
        setTags(saved ? JSON.parse(saved) : ["Coding", "Gaming"]); 
    }, [storageKey]);
    
    const toggleTag = (tag) => {
        let newTags;
        if (tags.includes(tag)) {
            newTags = tags.filter(t => t !== tag);
        } else {
            newTags = [...tags, tag];
        }
        setTags(newTags); 
        localStorage.setItem(storageKey, JSON.stringify(newTags)); 
    };

    const handleKeyDown = (e) => {
        // Pressing Enter adds the tag
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent creating a new line in the textarea
            const trimmed = newInterest.trim();
            if (trimmed && !tags.includes(trimmed)) {
                 const newTags = [...tags, trimmed];
                 setTags(newTags); 
                 localStorage.setItem(storageKey, JSON.stringify(newTags)); 
                 setNewInterest("");
            }
        }
    };
    
    return (
        <motion.div 
            variants={cardVariants} 
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-3xl border flex flex-col shadow-lg h-full z-10 
            ${isDark 
                ? "bg-[#13111C]/80 border-white/5" 
                : "bg-white/60 border-violet-100 shadow-violet-500/5"
            }
        `}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FaStar size={18} className={isDark ? "text-pink-400" : "text-violet-500"} />
                    <div>
                        <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>What I Like</h3>
                        <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-slate-400"}`}>Pick favorites or add your own.</p>
                    </div>
                </div>
            </div>

            {/* Multi-line Input Field (Textarea) */}
            <div className="relative mb-4 flex-1">
                <textarea 
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type an interest and press Enter..." 
                    className={`w-full h-full bg-transparent border rounded-xl p-3 text-sm outline-none font-bold resize-none
                        ${isDark 
                            ? "border-white/10 text-white placeholder:text-white/20 focus:border-pink-400 focus:bg-white/5" 
                            : "border-gray-300 text-slate-800 placeholder:text-gray-400 focus:border-violet-400 focus:bg-white"
                        }
                    `}
                    style={{ minHeight: '60px' }} 
                />
                 <FaPencilAlt size={12} className={`absolute right-3 top-3 opacity-30 ${isDark ? "text-white" : "text-slate-600"}`} />
            </div>
            
            {/* Tags Display Area (Defaults + Custom) */}
            <div className="flex flex-wrap gap-2 content-start overflow-y-auto max-h-[100px] scrollbar-hide">
              {/* 1. Render Default Options */}
              {defaultInterests.map(interest => {
                  const isSelected = tags.includes(interest);
                  return (
                    <button 
                        key={interest}
                        onClick={() => toggleTag(interest)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 border flex items-center gap-2 hover:scale-105 active:scale-95
                            ${isSelected 
                                ? "bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/20" 
                                : isDark 
                                    ? "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10" 
                                    : "bg-white border-violet-200 text-slate-600 hover:bg-violet-50 hover:border-violet-300"
                            }
                        `}
                    >
                        {interest}
                    </button>
                  )
              })}

              {/* 2. Render Custom Added Tags */}
              <AnimatePresence>
                {tags.filter(t => !defaultInterests.includes(t)).map(tag => (
                    <motion.button 
                        key={tag} 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => toggleTag(tag)}
                        className={`group px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 border flex items-center gap-2 hover:scale-105 active:scale-95 bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/20`}
                    >
                        {tag}
                        <FaTimes className="text-[10px] opacity-50 group-hover:opacity-100" />
                    </motion.button>
                ))}
              </AnimatePresence>
            </div>
        </motion.div>
    );
};

// --- MAIN PAGE ---
const StudentMySpacePage = () => {
  const context = useOutletContext();
  const isDark = context?.isDark ?? true;
  const [userData, setUserData] = useState(context?.userData || {});

  useEffect(() => { 
    if (context?.userData) setUserData(context.userData); 
  }, [context?.userData]);

  const handleProfileUpdate = (updatedData) => { setUserData(prev => ({ ...prev, ...updatedData })); };

  return (
    <motion.div initial="hidden" animate="visible" className="relative min-h-[85vh] max-w-5xl mx-auto">
      <SpaceBackground isDark={isDark} />
      <motion.div variants={cardVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
        
        {/* Pass userData to all cards so they can create unique storage keys */}
        <ProfileCard userData={userData} isDark={isDark} onProfileUpdate={handleProfileUpdate} />
        
        <div className="h-64"><CompanionCard isDark={isDark} userData={userData} /></div>
        <div className="h-64"><MissionCard isDark={isDark} userData={userData} /></div>
        <div className="h-64"><QuickFactsCard userData={userData} isDark={isDark} /></div>
        <div className="h-64"><InterestsCard isDark={isDark} userData={userData} /></div>

      </motion.div>
    </motion.div>
  );
};

export default StudentMySpacePage;