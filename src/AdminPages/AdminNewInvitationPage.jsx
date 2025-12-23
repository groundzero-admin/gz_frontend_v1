import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  FaUserPlus, 
  FaUserFriends, 
  FaEnvelope, 
  FaGraduationCap, 
  FaCoins, 
  FaPaperPlane,
  FaMinus,
  FaPlus,
  FaWifi,
  FaBan,
  FaLayerGroup,
  FaCheckCircle
} from 'react-icons/fa';

// Import getBatches along with invite functions
import { inviteParentOnly, inviteStudentAndParent, getBatches } from "../api.js";

// --- Reusable Components ---

const FormInput = ({ id, label, icon, placeholder, value, onChange, type = "text", isDark, required = true }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-bold mb-2 opacity-80">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <span 
        className="absolute left-4 top-1/2 -translate-y-1/2 text-lg" 
        style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
      >
        {icon}
      </span>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full pl-12 pr-4 py-3 rounded-xl border bg-transparent transition-all focus:ring-2 outline-none"
        style={{
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          backgroundColor: `var(${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"})`,
          color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
        }}
      />
    </div>
  </div>
);

// Credit Counter Component
const CreditCounter = ({ label, value, onChange, step, isDark, icon: Icon, colorClass }) => {
  const handleDecrement = () => {
    if (value - step >= 0) {
      onChange(value - step);
    } else {
      onChange(0);
    }
  };

  const handleIncrement = () => {
    onChange(value + step);
  };

  return (
    <div 
      className="p-4 rounded-xl border flex flex-col items-center justify-between gap-3"
      style={{
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        backgroundColor: `var(${isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)"})`
      }}
    >
      <div className="flex items-center gap-2 text-sm font-bold opacity-80 mb-1">
        <Icon className={colorClass} />
        {label}
      </div>

      <div className="flex items-center gap-4 w-full justify-center">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= 0}
          className={`p-3 rounded-lg transition-all ${value <= 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-red-500/10 hover:text-red-500'}`}
          style={{ backgroundColor: `var(${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"})` }}
        >
          <FaMinus size={12} />
        </button>

        <span className="text-2xl font-mono font-bold w-20 text-center">
          {value}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          className="p-3 rounded-lg transition-all hover:bg-green-500/10 hover:text-green-500"
          style={{ backgroundColor: `var(${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"})` }}
        >
          <FaPlus size={12} />
        </button>
      </div>
    </div>
  );
};

const TabButton = ({ isActive, onClick, icon, label, isDark }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all border-b-2
      ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-80'}
    `}
    style={{
      borderColor: isActive ? 'var(--accent-teal)' : 'transparent',
      color: isActive 
        ? 'var(--accent-teal)' 
        : `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
      backgroundColor: isActive ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)') : 'transparent'
    }}
  >
    {icon} {label}
  </button>
);

// --- Main Component ---

const AdminInvitationsPage = () => {
  const { isDark } = useOutletContext();
  const [activeTab, setActiveTab] = useState('newStudent');
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [studentEmail, setStudentEmail] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  
  // Credits
  const [onlineCredit, setOnlineCredit] = useState(0);
  const [offlineCredit, setOfflineCredit] = useState(0);

  // Batches
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);

  // Fetch batches on mount
  useEffect(() => {
    const loadBatches = async () => {
      const response = await getBatches();
      if (response.success) {
        setAvailableBatches(response.data || []);
      }
    };
    loadBatches();
  }, []);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setStudentEmail('');
    setParentEmail('');
    setOnlineCredit(0);
    setOfflineCredit(0);
    setSelectedBatchIds([]); // Reset selected batches
  };

  const toggleBatchSelection = (batchId) => {
    setSelectedBatchIds(prev => 
      prev.includes(batchId) 
        ? prev.filter(id => id !== batchId) 
        : [...prev, batchId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let response;

    if (activeTab === 'newStudent') {
      // Filter full batch objects based on selected IDs
      const batchesToSend = availableBatches
        .filter(b => selectedBatchIds.includes(b.batch_obj_id))
        .map(b => ({
            batch_obj_id: b.batch_obj_id,
            batchName: b.batchName
        }));

      response = await inviteStudentAndParent(
        studentEmail, 
        parentEmail, 
        onlineCredit, 
        offlineCredit, 
        batchesToSend // Pass array of batches
      );
    } else {
      response = await inviteParentOnly(parentEmail, studentEmail);
    }

    setIsLoading(false);
    alert(response.message);

    if (response.success) {
      setStudentEmail('');
      setParentEmail('');
      setOnlineCredit(0);
      setOfflineCredit(0);
      setSelectedBatchIds([]);
    }
  };

  const cardStyle = {
    backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    backdropFilter: "blur(10px)"
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Send Invitations</h1>
      <p className="opacity-70 mb-8" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` }}>
        Manage onboarding for new students and parents.
      </p>

      <div className="rounded-2xl border overflow-hidden shadow-xl" style={cardStyle}>
        
        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
          <TabButton 
            isActive={activeTab === 'newStudent'} 
            onClick={() => handleTabSwitch('newStudent')}
            icon={<FaUserPlus />}
            label="New Student & Parent Both"  
            isDark={isDark}
          />
          <TabButton 
            isActive={activeTab === 'linkParent'} 
            onClick={() => handleTabSwitch('linkParent')}
            icon={<FaUserFriends />}
            label="Invite Parent Only"
            isDark={isDark}
          />
        </div>

        {/* Form Area */}
        <div className="p-8">
          <form onSubmit={handleSubmit}>
            
            {/* Header Info */}
            <div className="mb-6 p-4 rounded-xl text-sm border border-l-4" 
                 style={{ 
                   backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                   borderColor: isDark ? 'var(--border-dark)' : 'var(--border-light)',
                   borderLeftColor: 'var(--accent-teal)'
                 }}>
              {activeTab === 'newStudent' ? (
                <p>
                  <strong>Onboard a new family:</strong> Create accounts for Student and Parent, assign credits, and optionally enroll them in batches immediately.
                </p>
              ) : (
                <p>
                  <strong>Link an existing student:</strong> Use this if the student is already registered but their parent has not joined yet.
                </p>
              )}
            </div>

            {/* Email Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="studentEmail"
                label={activeTab === 'newStudent' ? "New Student Email" : "Existing Student Email"}
                icon={<FaGraduationCap />}
                placeholder="student@example.com"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                type="email"
                isDark={isDark}
              />

              <FormInput
                id="parentEmail"
                label="Parent Email"
                icon={<FaUserFriends />}
                placeholder="parent@example.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                type="email"
                isDark={isDark}
              />
            </div>

            {/* NEW: Credits & Batches Section (Only for New Student Flow) */}
            {activeTab === 'newStudent' && (
              <>
                {/* 1. Credits */}
                <div className="mt-6 pt-6 border-t" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <FaCoins className="text-yellow-500" /> Initial Wallet Balance
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CreditCounter 
                      label="Online Credits"
                      value={onlineCredit}
                      onChange={setOnlineCredit}
                      step={1000}
                      isDark={isDark}
                      icon={FaWifi}
                      colorClass="text-blue-500"
                    />
                    <CreditCounter 
                      label="Offline Credits"
                      value={offlineCredit}
                      onChange={setOfflineCredit}
                      step={1500}
                      isDark={isDark}
                      icon={FaBan}
                      colorClass="text-orange-500"
                    />
                  </div>
                </div>

                {/* 2. Assign Batches */}
                <div className="mt-6 pt-6 border-t" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <FaLayerGroup className="text-[var(--accent-purple)]" /> Assign Batches (Optional)
                  </h3>
                  <p className="text-xs opacity-60 mb-4">Select any batches to enroll the student immediately.</p>
                  
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scroll">
                    {availableBatches.length === 0 ? (
                        <p className="text-sm opacity-50 italic">No active batches available.</p>
                    ) : (
                        availableBatches.map(batch => {
                            const isSelected = selectedBatchIds.includes(batch.batch_obj_id);
                            return (
                                <div 
                                    key={batch.batch_obj_id}
                                    onClick={() => toggleBatchSelection(batch.batch_obj_id)}
                                    className={`
                                      flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                                      ${isSelected 
                                        ? 'bg-[var(--accent-purple)] bg-opacity-10 border-[var(--accent-purple)]' 
                                        : 'hover:bg-white/5 border-transparent bg-black/5 dark:bg-white/5'
                                      }
                                    `}
                                    style={{
                                        borderColor: isSelected ? 'var(--accent-purple)' : `var(${isDark ? "--border-dark" : "--border-light"})`
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">{batch.batchName}</span>
                                        <span className="text-[10px] opacity-70">{batch.batchType} • {batch.status}</span>
                                    </div>
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-[var(--accent-purple)] border-[var(--accent-purple)]' : 'border-gray-500'}`}>
                                        {isSelected && <FaCheckCircle className="text-white text-xs" />}
                                    </div>
                                </div>
                            )
                        })
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 px-6 py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
              style={{
                background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                "Sending Invitations..."
              ) : (
                <>
                  <FaPaperPlane /> 
                  {activeTab === 'newStudent' ? "Invite Student & Parent" : "Send Parent Invite"}
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminInvitationsPage;