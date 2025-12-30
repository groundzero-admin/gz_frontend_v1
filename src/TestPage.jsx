import React, { useState, useEffect } from 'react';

// Replace with your backend URL
const BACKEND_URL = 'http://localhost:5000/api';

export default function TestPage() {
  // --- States ---
  const [eventType, setEventType] = useState('discovery'); // discovery | squad | teaching
  const [loading, setLoading] = useState(false);
  const [allSlots, setAllSlots] = useState([]); // Raw slots from backend
  const [availableDates, setAvailableDates] = useState([]); // Unique dates derived from slots
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(''); // ISO String of the chosen slot
  
  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    prereq: '',
    num_people: 1,
    squad_emails: '' // We will parse this string into an array later
  });

  // --- 1. Load Razorpay Script Dynamically ---
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // --- 2. Fetch Slots when Event Type Changes ---
  useEffect(() => {
    fetchSlots();
    // Reset selection when type changes
    setSelectedDate('');
    setSelectedSlot('');
  }, [eventType]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/get-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, days: 14 })
      });
      const data = await res.json();
      
      // Process slots: Group by Date
      const rawSlots = data.slots || [];
      setAllSlots(rawSlots);

      // Extract unique dates (YYYY-MM-DD) for the dropdown
      const uniqueDates = [...new Set(rawSlots.map(s => s.split('T')[0]))];
      setAvailableDates(uniqueDates);
    } catch (err) {
      console.error("Failed to load slots", err);
      alert("Could not load available slots.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Handle Form Changes ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 4. Submit & Pay ---
  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return alert("Please select a time slot.");

    const res = await loadRazorpay();
    if (!res) return alert('Razorpay SDK failed to load. Are you online?');

    setLoading(true);

    try {
      // Prepare payload
      const payload = {
        eventType,
        slot_time: selectedSlot,
        name: formData.name,
        phone: formData.phone,
        prereq: formData.prereq,
        // Conditional fields
        email: eventType !== 'squad' ? formData.email : undefined,
        num_people: eventType === 'squad' ? parseInt(formData.num_people) : undefined,
        squad_emails: eventType === 'squad' ? formData.squad_emails.split(',').map(e => e.trim()) : undefined
      };

      // A. Create Session on Backend
      const apiRes = await fetch(`${BACKEND_URL}/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const orderData = await apiRes.json();

      if (!orderData.success) {
        throw new Error("Server failed to create order");
      }

      // B. Open Razorpay
      const options = {
        key: orderData.key_id, // Key ID from backend
        amount: orderData.amount * 100, // Amount in paise (backend usually sends Rs, check logic)
        currency: "INR",
        name: "Your Project Name",
        description: `Booking: ${eventType}`,
        order_id: orderData.order_id,
        handler: function (response) {
          alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}. Check your email for the meeting link.`);
          // Optionally redirect user here
          window.location.reload();
        },
        prefill: {
          name: formData.name,
          email: formData.email || (formData.squad_emails ? formData.squad_emails.split(',')[0] : ''),
          contact: formData.phone
        },
        theme: { color: "#3399cc" }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      alert("Something went wrong during booking.");
    } finally {
      setLoading(false);
    }
  };

  // --- Styles (Simple Inline) ---
  const containerStyle = { maxWidth: '600px', margin: '2rem auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' };
  const inputStyle = { width: '100%', padding: '8px', margin: '8px 0', boxSizing: 'border-box' };
  const buttonStyle = { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' };
  const slotButtonStyle = (isActive) => ({
    padding: '8px', margin: '5px', border: '1px solid #007bff', 
    backgroundColor: isActive ? '#007bff' : 'white', 
    color: isActive ? 'white' : '#007bff', cursor: 'pointer', borderRadius: '4px'
  });

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center' }}>Book a Session</h2>

      {/* 1. Event Type Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label><strong>Select Session Type:</strong></label>
        <select 
          value={eventType} 
          onChange={(e) => setEventType(e.target.value)} 
          style={inputStyle}
        >
          <option value="discovery">Discovery Call (₹200)</option>
          <option value="squad">Squad Session (₹500)</option>
          <option value="teaching">One-on-One Teaching (₹2000)</option>
        </select>
      </div>

      {/* 2. Date Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label><strong>Select Date:</strong></label>
        <select 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)} 
          style={inputStyle}
          disabled={loading}
        >
          <option value="">-- Choose a Date --</option>
          {availableDates.map(date => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>
        {loading && <small> Loading availability...</small>}
      </div>

      {/* 3. Time Slot Selection (Grid) */}
      {selectedDate && (
        <div style={{ marginBottom: '20px' }}>
          <label><strong>Available Time Slots:</strong></label>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {allSlots
              .filter(slot => slot.startsWith(selectedDate))
              .map(slot => {
                const timeLabel = new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <button 
                    key={slot} 
                    onClick={() => setSelectedSlot(slot)}
                    style={slotButtonStyle(selectedSlot === slot)}
                  >
                    {timeLabel}
                  </button>
                );
              })}
            {allSlots.filter(slot => slot.startsWith(selectedDate)).length === 0 && <p>No slots available on this date.</p>}
          </div>
        </div>
      )}

      {/* 4. Booking Form */}
      {selectedSlot && (
        <form onSubmit={handleBooking} style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <h3>Your Details</h3>
          
          <input 
            type="text" name="name" placeholder="Full Name" required 
            value={formData.name} onChange={handleInputChange} style={inputStyle} 
          />
          
          <input 
            type="tel" name="phone" placeholder="Phone Number" required 
            value={formData.phone} onChange={handleInputChange} style={inputStyle} 
          />

          {/* Conditional: Email (Hidden for Squad, shown for others) */}
          {eventType !== 'squad' && (
            <input 
              type="email" name="email" placeholder="Email Address" required 
              value={formData.email} onChange={handleInputChange} style={inputStyle} 
            />
          )}

          {/* Conditional: Squad Fields */}
          {eventType === 'squad' && (
            <>
              <input 
                type="number" name="num_people" placeholder="Number of People" min="2" required 
                value={formData.num_people} onChange={handleInputChange} style={inputStyle} 
              />
              <textarea 
                name="squad_emails" placeholder="Enter emails separated by commas (e.g. a@x.com, b@x.com)" required 
                value={formData.squad_emails} onChange={handleInputChange} style={inputStyle} rows="3"
              />
            </>
          )}

          <textarea 
            name="prereq" placeholder="Any prerequisites or topics? (Optional)" 
            value={formData.prereq} onChange={handleInputChange} style={inputStyle} rows="2"
          />

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Processing...' : `Confirm & Pay`}
          </button>
        </form>
      )}
    </div>
  );
}