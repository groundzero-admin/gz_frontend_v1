// (Or update this to your backend URL)
const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL  ; 

// console.log("API BASE_URL is:", BASE_URL);

// --- Paths (add these) ---
export const whoamipath = `${BASE_URL}/whoami`;
export const loginPath = `${BASE_URL}/login`;
export const requestAccessPath = `${BASE_URL}/requestaccess`;
export const validateInvitePath = `${BASE_URL}/invite-validate`;
export const onboardUserPath = `${BASE_URL}/onboard`;
export const checkRolePath = `${BASE_URL}/checkrole`;
export const logoutPath = `${BASE_URL}/logout`;
export const getAllRequestsPath = `${BASE_URL}/admin/getallrequest`;
export const actionRequestPath = `${BASE_URL}/admin/actionrequest`;
export const sendInvitePath = `${BASE_URL}/admin/invite`;
export const listAllTeachersPath = `${BASE_URL}/admin/listallteachers`; // <-- NEW PATH


export const getMyChildrenDetailsPath = `${BASE_URL}/parent/mychildrendetails`;




export const getAllStudentDetailsPath = `${BASE_URL}/admin/getallstudentdetails`;



export const setupGeneralChatThreadPath = `${BASE_URL}/student/setupchatthread`;
export const loadGeneralChatHistoryPath = `${BASE_URL}/student/chathistory`;
export const askGeneralQuestionPath = `${BASE_URL}/student/askq`;







//// for teacher to getch his studnts
export const listMyStudentsPath = `${BASE_URL}/teacher/listmystudent`;






export const getStudentHistoryPath = `${BASE_URL}/studenthistory`;

export const getMyChildHistoryPath = `${BASE_URL}/parent/mychildhistory`;


export const listAllBatchesPath = `${BASE_URL}/admin/listallbatches`;
export const updateBatchStatusPath = `${BASE_URL}/admin/updatebatchstatus`;
export const createBatchPath = `${BASE_URL}/admin/createCourse`; // Note: Backend uses 'createCourse' route for batches



export const getWeeksForBatchPath = `${BASE_URL}/admin/weekinforabatch`;
export const createBatchWeekPath = `${BASE_URL}/admin/createbatchweek`;

export const linkStudentToBatchPath = `${BASE_URL}/admin/linkstudentinabatch`;


export const getStudentsInBatchPath = `${BASE_URL}/admin/getstudentsinbatch`;



export const getMyLiveBatchesPath = `${BASE_URL}/student/mylivebatchlist`;
export const getTodaysLiveBatchInfoPath = `${BASE_URL}/student/todayslivebatchinfo`;


export const getMyEnrolledBatchesPath = `${BASE_URL}/student/myenrolledbatches`;
export const getWeeksForBatchStudentPath = `${BASE_URL}/student/weeksinfoofbatch`;

export const getAllBatchesForStudentPath = `${BASE_URL}/student/getallbatches`;

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








export const sendInvite = async (email, role, parentEmails = [], childEmails = []) => {
  try {
    const response = await fetch(sendInvitePath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Sends admin cookie
      body: JSON.stringify({ 
        email, 
        role, 
        parentEmails, 
        childEmails 
      }),
    });
    return await response.json(); // Returns { success, message }
  } catch (error) {
    console.error("Send Invite error:", error);
    return { success: false, message: "Network error sending invite." };
  }
};












/**
 * (PARENT) Fetches details for the logged-in parent's children.
 */
export const getMyChildrenDetails = async () => {
  try {
    const response = await fetch(getMyChildrenDetailsPath, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      },
      // This is CRITICAL. It sends your 'auth_token' cookie
      // to the backend so you can pass 'requireAuthCookie'.
      credentials: 'include', 
    });

    // Get the JSON response from the server
    const data = await response.json();

    if (!response.ok) {
      // This will catch 401, 403, and 500 errors.
      // The 'data' object will contain { success: false, message: "..." }
      // from your backend's sendResponse function.
      return data;
    }

    // If successful (status 200), the 'data' object is
    // { success: true, message: "...", data: [...] }
    return data;
    
  } catch (error) {
    // This catches network errors (e.g., server is down)
    console.error("Get My Children Details error:", error);
    return { 
      success: false, 
      message: "Network error: Could not fetch children's details." 
    };
  }
};










export const listAllTeachers = async () => {
  try {
    const response = await fetch(listAllTeachersPath, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      },
      // This sends the admin's auth_token cookie
      credentials: 'include', 
    });

    const data = await response.json();
    
    // The AdminLayout already handles 401/403 auth errors,
    // but we still pass the full response for data handling.
    return data; 
    
  } catch (error) {
    // This catches network errors (e.g., server is down)
    console.error("List All Teachers error:", error);
    return { 
      success: false, 
      message: "Network error: Could not fetch teachers." 
    };
  }
};

































/**
 * ADMIN: Lists all students.
 */
export const getAllStudentDetails = async () => {
  try {
    const response = await fetch(getAllStudentDetailsPath, { method: 'GET', credentials: 'include' });
    return await response.json();
  } catch (error) {
    console.error("getAllStudentDetails error:", error);
    return { success: false, message: "Network error fetching students." };
  }
};
















export const listMyStudents = async () => {
  try {
    const response = await fetch(listMyStudentsPath, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      },
      credentials: 'include', // Sends teacher's auth cookie
    });

    const data = await response.json();
    if (!response.ok) {
      // Handles 401, 403, 500 errors
      return data; 
    }
    
    // Returns { success: true, message: "...", data: [...] }
    return data;
    
  } catch (error) {
    console.error("List My Students error:", error);
    return { 
      success: false, 
      message: "Network error: Could not fetch students." 
    };
  }
};
















export const getStudentFullHistory = async (studentId) => {
  try {
    // We send the studentId as a query parameter, as your backend requires
    const response = await fetch(`${getStudentHistoryPath}?studentId=${studentId}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      },
      credentials: 'include', // Sends admin/teacher auth cookie
    });

    const data = await response.json();
    if (!response.ok) {
      // Handles 401, 403, 500 errors
      return { success: false, message: data.message || "Failed to fetch history." };
    }
    
    // Returns { success: true, message: "...", data: [...] }
    return data;
    
  } catch (error) {
    console.error("Get Student Full History error:", error);
    return { 
      success: false, 
      message: "Network error: Could not fetch history." 
    };
  }
};




export const getMyChildHistory = async (childEmail) => {
  try {
    // We send the childEmail as a query parameter, as your backend requires
    const response = await fetch(`${getMyChildHistoryPath}?childEmail=${childEmail}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      },
      credentials: 'include', // Sends parent's auth cookie
    });

    const data = await response.json();
    if (!response.ok) {
      // Handles 401, 403, 500 errors
      return { success: false, message: data.message || "Failed to fetch history." };
    }
    
    // Returns { success: true, message: "...", data: [...] }
    return data;
    
  } catch (error) {
    console.error("Get My Child History error:", error);
    return { 
      success: false, 
      message: "Network error: Could not fetch history." 
    };
  }
};












export const setupGeneralChatThread = async () => {
  try {
    const response = await fetch(setupGeneralChatThreadPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}) // Send empty body
    });
    return await response.json(); // Returns { success: true, data: { thread_id: "..." } }
  } catch (error) {
    console.error("Setup General Chat Thread error:", error);
    return { success: false, message: "Network error setting up chat." };
  }
};

/**
 * (STUDENT) Loads the student's entire chat history.
 */
export const loadGeneralChatHistory = async () => {
  try {
    const response = await fetch(loadGeneralChatHistoryPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}) // Send empty body
    });
    return await response.json(); // Returns { success: true, data: [...] }
  } catch (error) {
    console.error("Load General Chat History error:", error);
    return { success: false, message: "Network error loading chat." };
  }
};

/**
 * (STUDENT) Asks a GENERAL question to the AI assistant.
 */
export const askGeneralQuestion = async (threadId, promptText) => {
  try {
    const response = await fetch(askGeneralQuestionPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      // This 'askQ' controller does not need worksheetId
      body: JSON.stringify({ threadId, promptText }),
    });
    return await response.json(); // Returns { success: true, data: { answer: "..." } }
  } catch (error) {
    console.error("Ask General Question error:", error);
    return { success: false, message: "Network error asking question." };
  }
};



















/**
 * ADMIN: Fetches all active (Live/Upcoming) batches.
 */
export const listAllActiveBatches = async () => {
  try {
    const response = await fetch(listAllBatchesPath, {
      method: 'GET',
      credentials: 'include',
    });
    return await response.json();
  } catch (error) {
    console.error("List Batches error:", error);
    return { success: false, message: "Network error fetching batches." };
  }
};

/**
 * ADMIN: Updates the status of a batch (UPCOMING -> LIVE -> ENDED).
 * @param {string} batchId - The human-readable ID (e.g. "SP-A-C-01")
 * @param {string} status - "LIVE" or "ENDED"
 */
export const updateBatchStatus = async (batchId, status) => {
  try {
    const response = await fetch(updateBatchStatusPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ batchId, status }),
    });
    return await response.json();
  } catch (error) {
    console.error("Update Batch Status error:", error);
    return { success: false, message: "Network error updating status." };
  }
};

/**
 * ADMIN: Creates a new batch.
 * @param {object} batchData - Form data
 */
export const createBatch = async (batchData) => {
  try {
    const response = await fetch(createBatchPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(batchData),
    });
    return await response.json();
  } catch (error) {
    console.error("Create Batch error:", error);
    return { success: false, message: "Network error creating batch." };
  }
};





/**
 * ADMIN: Fetches all weeks for a specific batch.
 * @param {string} batch_obj_id - The MongoDB _id of the batch
 */
export const getWeeksForBatch = async (batch_obj_id) => {
  try {
    // Using query param as per your backend controller
    const response = await fetch(`${getWeeksForBatchPath}?batch_obj_id=${batch_obj_id}`, {
      method: 'GET',
      credentials: 'include',
    });
    return await response.json();
  } catch (error) {
    console.error("Get Weeks error:", error);
    return { success: false, message: "Network error fetching weeks." };
  }
};

/**
 * ADMIN: Creates a new week for a batch.
 */
export const createBatchWeek = async (formData) => {
  try {
    const response = await fetch(createBatchWeekPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData),
    });
    return await response.json();
  } catch (error) {
    console.error("Create Week error:", error);
    return { success: false, message: "Network error creating week." };
  }
};



















/**
 * ADMIN: Links a student (by GZST number) to a batch (by Batch ID).
 */
export const linkStudentToBatch = async (batchId, student_number) => {
  try {
    const response = await fetch(linkStudentToBatchPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ batchId, student_number }),
    });
    return await response.json();
  } catch (error) {
    console.error("Link Student error:", error);
    return { success: false, message: "Network error linking student." };
  }
};





/**
 * ADMIN: Fetches all students linked to a specific batch.
 * @param {string} batch_obj_id - The MongoDB _id of the batch
 */
export const getStudentsInBatch = async (batch_obj_id) => {
  try {
    const response = await fetch(`${getStudentsInBatchPath}?batch_obj_id=${batch_obj_id}`, {
      method: 'GET',
      credentials: 'include',
    });
    return await response.json();
  } catch (error) {
    console.error("Get Students in Batch error:", error);
    return { success: false, message: "Network error fetching students." };
  }
};












export const getMyLiveBatches = async () => {
  try {
    const response = await fetch(getMyLiveBatchesPath, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Sends student auth cookie
    });
    return await response.json(); // Returns { success, data: [{ batchId, batch_obj_id }, ...] }
  } catch (error) {
    console.error("Get My Live Batches error:", error);
    return { success: false, message: "Network error fetching batches." };
  }
};

/**
 * (STUDENT) Fetches today's class info for a specific batch.
 */
export const getTodaysLiveBatchInfo = async (batch_obj_id) => {
  try {
    const response = await fetch(getTodaysLiveBatchInfoPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ batch_obj_id }),
    });
    return await response.json(); // Returns { success, data: { hasClassToday, calculatedWeek, ... } }
  } catch (error) {
    console.error("Get Today's Batch Info error:", error);
    return { success: false, message: "Network error fetching batch info." };
  }
};


















export const getMyEnrolledBatches = async () => {
  try {
    const response = await fetch(getMyEnrolledBatchesPath, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await response.json();
  } catch (error) {
    console.error("Get My Enrolled Batches error:", error);
    return { success: false, message: "Network error fetching batches." };
  }
};

/**
 * (STUDENT) Fetches the weeks/schedule for a specific batch.
 * @param {string} batch_obj_id - The MongoDB _id of the batch
 */
export const getWeeksForBatchStudent = async (batch_obj_id) => {
  try {
    const response = await fetch(`${getWeeksForBatchStudentPath}?batch_obj_id=${batch_obj_id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await response.json();
  } catch (error) {
    console.error("Get Weeks for Batch Student error:", error);
    return { success: false, message: "Network error fetching batch weeks." };
  }
};



export const getAllBatchesForStudent = async () => {
  try {
    const response = await fetch(getAllBatchesForStudentPath, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await response.json(); // Returns { success, data: [{ ..., amIEnrolled: true/false }] }
  } catch (error) {
    console.error("Get All Batches for Student error:", error);
    return { success: false, message: "Network error fetching batches." };
  }
};