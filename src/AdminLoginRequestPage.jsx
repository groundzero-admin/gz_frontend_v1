import React, { useState, useEffect } from 'react';
import { FaSearch } from "react-icons/fa";
import { useOutletContext } from 'react-router-dom';
import { getAllAccessRequests, approveAccessRequest } from "./api.js";

// --- Helper component for the colored role badge ---
const RoleBadge = ({ role }) => {
  const styles = {
    student: "bg-blue-100 text-blue-800",
    teacher: "bg-purple-100 text-purple-800",
    parent: "bg-pink-100 text-pink-800",
  };
  // Dark mode styles
  const darkStyles = {
    student: "bg-blue-900 text-blue-200",
    teacher: "bg-purple-900 text-purple-200",
    parent: "bg-pink-900 text-pink-200",
  };

  const { isDark } = useOutletContext(); // Get theme from parent

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? darkStyles[role] : styles[role]}`}>
      {role}
    </span>
  );
};

// --- Main Page Component ---
const AdminRequestPage = () => {
  const { isDark } = useOutletContext(); // Get theme from parent
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvingId, setApprovingId] = useState(null); // ID of request being approved

  // --- Data Fetching ---
  const fetchRequests = async () => {
    setIsLoading(true);
    const response = await getAllAccessRequests();
    if (response.success) {
      const unresolved = response.data.filter(req => !req.resolved);
      setRequests(unresolved);
      setFilteredRequests(unresolved);
    } else {
      alert(response.message);
    }
    setIsLoading(false);
  };

  // --- Initial data load ---
  useEffect(() => {
    fetchRequests();
  }, []);

  // --- Search filter effect ---
  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = requests.filter(req => 
      req.name.toLowerCase().includes(lowerSearch) ||
      req.email.toLowerCase().includes(lowerSearch)
    );
    setFilteredRequests(filtered);
  }, [searchTerm, requests]);

  // --- Action Handler ---
  const handleApprove = async (requestId) => {
    setApprovingId(requestId); // Set loading state for this button
    
    const response = await approveAccessRequest(requestId);
    alert(response.message); // Show "Invitation sent" or error

    if (response.success) {
      // Refresh list by removing the approved item from state
      setRequests(prev => prev.filter(req => req._id !== requestId));
    }
    
    setApprovingId(null); // Reset loading state
  };

  return (
    <div className="transition-colors">
      <h1 className="text-3xl font-bold mb-2">Manage Join Requests</h1>
      <p style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}} className="mb-6">
        {filteredRequests.length} Pending Requests
      </p>

      {/* Search Bar */}
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
          <FaSearch />
        </span>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md pl-12 pr-4 py-3 rounded-lg border bg-transparent"
          style={{ 
            borderColor: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary" })`,
            backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})` , 
            color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary" })`,

          }}
        />
      </div>

      {/* Requests Table */}
      <div 
        className="rounded-lg border"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            {/* Table Header */}
            <thead>
              <tr 
                className="text-left text-xs font-medium uppercase"
                style={{ 
                  color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
                  borderBottom: `1px solid var(${isDark ? "--border-dark" : "--border-light"})`
                }}
              >
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Requested Role</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody>
              {isLoading ? (
                <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan="4" className="p-4 text-center">No pending requests found.</td></tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req._id} style={{ borderTop: `1px solid var(${isDark ? "--border-dark" : "--border-light"})`}}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                          style={{
                            backgroundColor: `var(${isDark ? "--border-dark" : "rgba(0,0,0,0.05)"})`,
                            color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`
                          }}
                        >
                          {req.name[0].toUpperCase()}
                        </div>
                        <span className="font-medium">{req.name}</span>
                      </div>
                    </td>
                    <td className="p-4" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
                      {req.email}
                    </td>
                    <td className="p-4">
                      <RoleBadge role={req.role} />
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleApprove(req._id)}
                        disabled={approvingId === req._id}
                        className="px-4 py-1.5 rounded-md bg-green-500 text-white font-medium text-sm hover:bg-green-600 disabled:bg-gray-400 disabled:animate-pulse"
                      >
                        {approvingId === req._id ? "..." : "Approve"}
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
  );
};

export default AdminRequestPage;