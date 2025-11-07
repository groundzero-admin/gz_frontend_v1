// (Or update this to your backend URL)
const BASE_URL = "http://localhost:4011/api"; 

// --- Paths (add these) ---
export const whoamipath = `${BASE_URL}/whoami`;
export const loginPath = `${BASE_URL}/login`;
export const requestAccessPath = `${BASE_URL}/requestaccess`;
export const validateInvitePath = `${BASE_URL}/validateinvite`;
export const onboardUserPath = `${BASE_URL}/onboard`;
export const checkRolePath = `${BASE_URL}/checkrole`;
export const logoutPath = `${BASE_URL}/logout`;
export const getAllRequestsPath = `${BASE_URL}/admin/getallrequest`;
export const actionRequestPath = `${BASE_URL}/admin/actionrequest`;


// --- whoami ---
export const whoami = async () => {
  try {
    const response = await fetch(whoamipath, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) {
      return { success: false, message: `HTTP error: ${response.status}`, data: null };
    }
    return await response.json();
  } catch (error) {
    console.error("Network error fetching whoami:", error);
    return { success: false, message: "Network error or server is down.", data: null };
  }
};

// --- login ---
export const login = async (email, password, navigate) => {
  try {
    const response = await fetch(loginPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    console.log(data)
    if (data.success) {
      const role = data.role;
      navigate(`/${role}/dashboard`);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed: Network error or server is down.");
  }
};

// --- requestAccess ---
export const requestAccess = async (name, email, role) => {
  try {
    const response = await fetch(requestAccessPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role }),
    });
    const data = await response.json();
    alert(data.message);
    return data.success;
  } catch (error) {
    console.error("Request Access error:", error);
    alert("Request failed: Network error or server is down.");
    return false;
  }
};

// --- validateInvite ---
export const validateInvite = async (token, role) => {
  try {
    const response = await fetch(validateInvitePath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, role }),
    });
    return await response.json();
  } catch (error) {
    console.error("Validate Invite error:", error);
    return { success: false, message: "Network error or server is down."};
  }
};

// --- onboardUser ---
export const onboardUser = async (formData) => {
  try {
    const response = await fetch(onboardUserPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    return await response.json();
  } catch (error) {
    console.error("Onboard User error:", error);
    return { success: false, message: "Network error or server is down." };
  }
};

/**
 * Checks if the user's cookie role matches the expected role for the page.
 * @param {string} expectedRole - The role we expect (e.g., "admin")
 */
export const checkRole = async (expectedRole) => {
  try {
    const response = await fetch(checkRolePath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Sends the auth_token cookie
      body: JSON.stringify({ role: expectedRole }),
    });
    const data = await response.json();
    return { ...data, status: response.status }; // Return data + HTTP status
  } catch (error) {
    console.error("Check Role error:", error);
    return { 
      success: false, 
      message: "Network error or server is down.",
      status: 500
    };
  }
};

/**
 * Logs the user out by clearing the auth cookie.
 */
export const logout = async (navigate) => {
  try {
    await fetch(logoutPath, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
  navigate('/'); // Always redirect to login
};

/**
 * (ADMIN) Fetches all pending access requests.
 */
export const getAllAccessRequests = async () => {
  try {
    const response = await fetch(getAllRequestsPath, {
      method: 'GET',
      credentials: 'include', // Sends admin cookie
    });
    return await response.json(); // Returns { success, message, data: [...] }
  } catch (error) {
    console.error("Get All Requests error:", error);
    return { success: false, message: "Network error fetching requests." };
  }
};

/**
 * (ADMIN) Approves an access request.
 * @param {string} requestId - The _id of the request to approve.
 */
export const approveAccessRequest = async (requestId) => {
  try {
    const response = await fetch(actionRequestPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Sends admin cookie
      body: JSON.stringify({ 
        requestId: requestId,
        action: "allow" 
      }),
    });
    return await response.json(); // Returns { success, message }
  } catch (error) {
    console.error("Action Request error:", error);
    return { success: false, message: "Network error processing action." };
  }
};