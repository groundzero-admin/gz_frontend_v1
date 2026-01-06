import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  FaPlus, 
  FaLayerGroup, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaTimes, 
  FaVideo
} from "react-icons/fa";
import { listAllActiveBatches, updateBatchStatus, createBatch } from "../api.js";

// --- Helper: Modal Input ---
const ModalInput = ({ label, type = "text", value, onChange, placeholder, required = true, isDark }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 rounded-lg border bg-transparent transition text-sm"
      style={{
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
      }}
    />
  </div>
);

// --- Helper: Modal Select (UPDATED) ---
const ModalSelect = ({ label, value, onChange, options, isDark }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 rounded-lg border transition appearance-none text-sm"
      style={{
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        // FIX: Force White Background and Black Text
        backgroundColor: "#ffffff", 
        color: "#000000"
      }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// --- Smart Calendar Component (UPDATED) ---
const SmartCalendar = ({ label, value, onChange, isDark }) => {
  const today = new Date();
  const initialDate = value ? new Date(value) : today;
  const [viewDate, setViewDate] = useState(initialDate);

  const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const currentYear = today.getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleDateClick = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const offset = newDate.getTimezoneOffset();
    const adjustedDate = new Date(newDate.getTime() - offset * 60000);
    onChange(adjustedDate.toISOString().split("T")[0]);
  };

  const isSelectable = (day) => {
    const check = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const todayMid = new Date();
    todayMid.setHours(0,0,0,0);
    return check >= todayMid;
  };

  const isSelected = (day) => {
    if (!value) return false;
    const cmpDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const valDate = new Date(value);
    return cmpDate.toDateString() === valDate.toDateString();
  };

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  const blanks = Array(firstDay).fill(null);
  const totalSlots = [...blanks, ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  // FIX: Dropdown Styles for Dark Mode Visibility
  const dropdownStyle = {
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    backgroundColor: "#ffffff", // Explicitly White
    color: "#000000"            // Explicitly Black
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="p-3 rounded-lg border max-w-[280px]"
        style={{
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          backgroundColor: `var(${isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)"})`
        }}
      >
        <div className="flex gap-2 mb-2">
          <select
            value={viewDate.getMonth()}
            onChange={(e) =>
              setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1))
            }
            className="flex-1 px-1 py-1 rounded border text-xs font-medium cursor-pointer"
            style={dropdownStyle}
          >
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>

          <select
            value={viewDate.getFullYear()}
            onChange={(e) =>
              setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1))
            }
            className="w-20 px-1 py-1 rounded border text-xs font-medium cursor-pointer"
            style={dropdownStyle}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-7 mb-1 text-center">
          {days.map(d => (
            <span key={d} className="text-[10px] font-bold opacity-60 uppercase">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 place-items-center">
          {totalSlots.map((day, index) => {
            if (!day) return <div key={index} className="h-7 w-7" />;

            const selectable = isSelectable(day);
            const selected = isSelected(day);

            return (
              <button 
                key={day}
                type="button"
                disabled={!selectable}
                onClick={() => handleDateClick(day)}
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs transition
                  ${selectable ? "hover:bg-[var(--accent-purple)] hover:text-white cursor-pointer" : "opacity-20 cursor-not-allowed"}
                  ${selected ? "bg-[var(--accent-teal)] text-white font-bold shadow-sm scale-110" : ""}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Create Batch Modal ---
const CreateBatchModal = ({ isOpen, onClose, onSubmit, isDark }) => {
  const [formData, setFormData] = useState({
    batchName: "", // Typeable now
    level: "",     // Typeable now
    batchType: "ONLINE",
    citycode: "",
    classLocation: "",
    startDate: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData(prev => ({
        ...prev,
        citycode: "",
        classLocation: ""
      }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (eOrValue, field) => {
    const value = eOrValue?.target ? eOrValue.target.value : eOrValue;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validate start date (>= today)
  const today = new Date();
  today.setHours(0,0,0,0);
  const selectedDate = formData.startDate ? new Date(formData.startDate) : null;
  const isStartDateValid = selectedDate && selectedDate >= today;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isStartDateValid) {
      alert("Start Date cannot be in the past.");
      return;
    }

    if (formData.batchType === "OFFLINE") {
      if (!formData.citycode || !formData.classLocation) {
        alert("City Code and Location are required for Offline batches.");
        return;
      }
    }

    setIsSubmitting(true);
    // Send data to parent (controller expects: batchName, level, description, startDate, batchType, citycode, classLocation)
    const success = await onSubmit(formData);
    if (success) {
      setFormData({
        batchName: "",
        level: "",
        batchType: "ONLINE",
        citycode: "",
        classLocation: "",
        startDate: "",
        description: "",
      });
      onClose();
    }
    setIsSubmitting(false);
  };

  const isOffline = formData.batchType === "OFFLINE";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        className="relative w-full max-w-2xl p-6 rounded-2xl border max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-lg opacity-70 hover:opacity-100"
        >
          <FaTimes />
        </button>

        <h2 className="text-xl font-bold mb-6">Create New Batch</h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2"
        >
          <div>
            <ModalInput
              label="Batch Name / Cohort"
              isDark={isDark}
              placeholder="e.g. Spark, Ignite"
              value={formData.batchName}
              onChange={(e) => handleChange(e, "batchName")}
              required
            />

            <ModalInput
              label="Level"
              isDark={isDark}
              placeholder="e.g. Alpha, Beta"
              value={formData.level}
              onChange={(e) => handleChange(e, "level")}
              required
            />

            <ModalSelect
              label="Batch Mode"
              isDark={isDark}
              value={formData.batchType}
              onChange={(e) => handleChange(e, "batchType")}
              options={[
                { value: "ONLINE", label: "Online" },
                { value: "OFFLINE", label: "Offline" },
              ]}
            />

            {isOffline && (
              <div className="animate-fadeIn">
                <ModalInput
                  label="City Code"
                  isDark={isDark}
                  placeholder="e.g. GWL"
                  value={formData.citycode}
                  onChange={(e) => handleChange(e, "citycode")}
                />
                <ModalInput
                  label="Class Location"
                  isDark={isDark}
                  placeholder="e.g. City Center"
                  value={formData.classLocation}
                  onChange={(e) => handleChange(e, "classLocation")}
                />
              </div>
            )}
          </div>

          <div>
            <SmartCalendar
              label="Start Date"
              isDark={isDark}
              value={formData.startDate}
              onChange={(val) => handleChange(val, "startDate")}
            />

            <div className="mt-2">
              <ModalInput
                label="Description"
                isDark={isDark}
                placeholder="Batch description..."
                value={formData.description}
                onChange={(e) => handleChange(e, "description")}
                required={false}
              />
            </div>
          </div>

          <div
            className="md:col-span-2 flex justify-end gap-4 mt-4 pt-4 border-t"
            style={{
              borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg font-semibold border text-sm transition"
              style={{
                borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
              }}
            >
              Cancel
            </button>

            {/* Disabled until valid start date */}
            <button
              type="submit"
              disabled={isSubmitting || !isStartDateValid}
              className={`px-5 py-2 rounded-lg font-semibold text-white text-sm transition ${
                !isStartDateValid ? "opacity-40 cursor-not-allowed" : ""
              }`}
              style={{
                background:
                  "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
              }}
            >
              {isSubmitting ? "Creating..." : "Create Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Batch Card ---
const BatchCard = ({ batch, isDark, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  const isOffline = batch.batchType === "OFFLINE";

  // Can only go live on or after start date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(batch.startDate);
  start.setHours(0, 0, 0, 0);

  const canGoLive = true;

  const handleCardClick = () => {
    navigate(`/admin/dashboard/batches/${batch.batch_obj_id}`, {
      state: {
        batchName: batch.batchName,
        batchType: batch.batchType,
        startDate: batch.startDate,
        batch_obj_id: batch.batch_obj_id,
      },
    });
  };

  const handleAction = async (e) => {
    e.stopPropagation();

    if (!canGoLive && !batch.isLive) return;

    if (
      !window.confirm(
        `Are you sure you want to change status to ${
          batch.isLive ? "ENDED" : "LIVE"
        }?`
      )
    ) {
      return;
    }

    setIsUpdating(true);
    const newStatus = batch.isLive ? "ENDED" : "LIVE";
    await onStatusUpdate(batch.batch_obj_id, newStatus);
    setIsUpdating(false);
  };

  const statusColor = batch.isLive ? "text-green-400" : "text-yellow-400";

  return (
    <div
      onClick={handleCardClick}
      className="relative p-6 rounded-2xl border flex flex-col h-full transition-all duration-300 hover:shadow-lg cursor-pointer"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        backdropFilter: "blur(10px)",
      }}
    >
      {/* ONLINE / OFFLINE BADGE */}
      <span
        className={`absolute top-4 right-4 text-[10px] px-2 py-1 rounded border font-bold tracking-wide ${
          isOffline
            ? "border-orange-500 text-orange-500 bg-orange-500/10"
            : "border-blue-500 text-blue-500 bg-blue-500/10"
        }`}
      >
        {isOffline ? "OFFLINE" : "ONLINE"}
      </span>

      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`p-3 rounded-full bg-opacity-10 ${
              batch.isLive ? "bg-green-500" : "bg-yellow-500"
            }`}
          >
            <FaLayerGroup className={statusColor} />
          </span>

          <div>
            <h3 className="text-xl font-bold">{batch.batchName}</h3>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${statusColor}`}
            >
              {batch.status}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-2 flex-grow mb-6">
        {batch.description && (
          <p
            className="text-sm font-medium opacity-90 leading-relaxed border-l-4 pl-3 mb-2 
                       break-words break-all whitespace-normal line-clamp-3"
            style={{ borderColor: "var(--accent-teal)" }}
          >
            {batch.description}
          </p>
        )}

        <p className="text-sm flex items-center gap-2 opacity-80">
          <span className="capitalize font-semibold">
            Level: {batch.level}
          </span>
        </p>

        <p className="text-sm flex items-center gap-2 opacity-70">
          {isOffline ? <FaMapMarkerAlt /> : <FaVideo />}
          {isOffline
            ? `${batch.classLocation} (${batch.cityCode})`
            : "Remote / Online"}
        </p>

        <p className="text-sm flex items-center gap-2 opacity-70">
          <FaCalendarAlt />
          Starts: {new Date(batch.startDate).toLocaleDateString()}
        </p>
      </div>

      {/* ACTION BUTTON */}
      <button
        onClick={handleAction}
        disabled={isUpdating || (!batch.isLive && !canGoLive)}
        className={`w-full py-2 rounded-lg font-bold text-sm transition text-white
          ${
            batch.isLive
              ? "bg-red-500 hover:bg-red-600"
              : canGoLive
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-400 cursor-not-allowed"
          }
          ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {isUpdating
          ? "Updating..."
          : batch.isLive
          ? "End Batch"
          : canGoLive
          ? "Make Live"
          : "Not Started"}
      </button>
    </div>
  );
};

// --- Main Page Component ---
const AdminBatchesPage = () => {
  const { isDark } = useOutletContext();
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBatches = async () => {
    setIsLoading(true);
    const response = await listAllActiveBatches();
    if (response.success) {
      setBatches(response.data);
    } else {
      if (response.message !== "No active batches.") {
        // Only show alert if it's a real error, not just empty list
        console.warn("Fetch message:", response.message);
      }
      setBatches([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleStatusUpdate = async (batch_obj_id, newStatus) => {
    // API call now uses batch_obj_id
    const response = await updateBatchStatus(batch_obj_id, newStatus);
    alert(response.message);
    if (response.success) {
      fetchBatches();
      return true;
    }
    return false;
  };

  const handleCreateBatch = async (formData) => {
    // formData keys match controller expectations (batchName, level, etc.)
    const response = await createBatch(formData);
    alert(response.message);
    if (response.success) {
      fetchBatches();
      return true;
    }
    return false;
  };

  const liveBatches = batches.filter((b) => b.isLive);
  const upcomingBatches = batches.filter((b) => b.status === "UPCOMING");

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Batches</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition hover:scale-105 shadow-lg"
          style={{
            background:
              "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
          }}
        >
          <FaPlus /> Add Batch
        </button>
      </div>

      {isLoading ? (
        <p className="text-lg opacity-70">Loading batches...</p>
      ) : (
        <div className="space-y-12">
          {/* Live */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-green-400">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              Live Batches
            </h2>
            {liveBatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveBatches.map((batch) => (
                  <BatchCard
                    key={batch.batch_obj_id}
                    batch={batch}
                    isDark={isDark}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            ) : (
              <p className="opacity-50 italic">No live batches currently.</p>
            )}
          </section>

          <hr
            style={{
              borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
            }}
          />

          {/* Upcoming */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-yellow-400">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              Upcoming Batches
            </h2>
            {upcomingBatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingBatches.map((batch) => (
                  <BatchCard
                    key={batch.batch_obj_id}
                    batch={batch}
                    isDark={isDark}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            ) : (
              <p className="opacity-50 italic">No upcoming batches scheduled.</p>
            )}
          </section>
        </div>
      )}

      <CreateBatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBatch}
        isDark={isDark}
      />
    </div>
  );
};

export default AdminBatchesPage;