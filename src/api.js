// (Or update this to your backend URL)
const BASE_URL = "http://localhost:4011/api"; 

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
export const listAllCoursesPath = `${BASE_URL}/admin/listallcourse`; // <-- NEW
export const getWorksheetsForCoursePath = `${BASE_URL}/admin/worksheetfromcouse`; // <-- NEW

export const createCoursePath = `${BASE_URL}/admin/createcourse` ;
export const uploadWorksheetPath = `${BASE_URL}/admin/uploadworksheet`;

export const getMyChildrenDetailsPath = `${BASE_URL}/parent/mychildrendetails`;


export const listStudentsCoursesPath = `${BASE_URL}/student/listmycourses`;
// --- 1. CORRECTED PATH ---
export const enrollInCoursePath = `${BASE_URL}/student/enrollment`;
export const listStudentWorksheetsPath = `${BASE_URL}/student/worksheetsfromcourse`;
export const getAllStudentDetailsPath = `${BASE_URL}/admin/getallstudentdetails`;




export const listTeachersCoursesPath = `${BASE_URL}/teacher/listmycourses`;

export const listTeacherWorksheetsPath = `${BASE_URL}/teacher/worksheetfromcouse`;




//// for teacher to getch his studnts
export const listMyStudentsPath = `${BASE_URL}/teacher/listmystudent`;




export const setupChatThreadPath = `${BASE_URL}/student/setupchatthread`;
export const loadChatHistoryPath = `${BASE_URL}/student/loadchatofspecificworksheet`;
export const askQuestionPath = `${BASE_URL}/student/askq`;

export const getStudentHistoryPath = `${BASE_URL}/studenthistory`;

export const getMyChildHistoryPath = `${BASE_URL}/parent/mychildhistory`;


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






export const listAllCourses = async () => {
  try {
    const response = await fetch(listAllCoursesPath, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Sends admin auth cookie
    });
    const data = await response.json();
    return data; // Returns { success: true, message: "...", data: [...] }
  } catch (error) {
    console.error("List All Courses error:", error);
    return { success: false, message: "Network error: Could not fetch courses." };
  }
};







export const getWorksheetsForCourse = async (courseId) => {
  try {
    // We send the courseId as a query parameter, just like your backend API is setup
    const response = await fetch(`${getWorksheetsForCoursePath}?courseId=${courseId}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      },
      credentials: 'include', // Sends admin auth cookie
    });

    const data = await response.json();
    // data is { success, message, data: [...] }
    return data;
    
  } catch (error) {
    console.error("Get Worksheets For Course error:", error);
    return { 
      success: false, 
      message: "Network error: Could not fetch worksheets." 
    };
  }
};







export const createCourse = async (formData) => {
  try {
    const response = await fetch(createCoursePath, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      credentials: 'include', // Sends admin auth cookie
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    // data is { success, message, data: { courseId, ... } }
    return data;
    
  } catch (error) {
    console.error("Create Course error:", error);
    return { 
      success: false, 
      message: "Network error: Could not create course." 
    };
  }
};










export const uploadWorksheet = async (courseId, title, description, worksheetNumber, file) => {
  // 1. Create a FormData object to send file + text
  const formData = new FormData();
  
  // 2. Append all the fields
  formData.append("courseId", courseId);
  formData.append("title", title);
  formData.append("description", description);
  formData.append("worksheetNumber", worksheetNumber);
  // This field name "worksheetFile" MUST match your backend
  formData.append("worksheetFile", file); 


 




  try {
    const response = await fetch(uploadWorksheetPath, {
      method: 'POST',
      credentials: 'include', // Sends admin auth cookie
      // 3. DO NOT set Content-Type. The browser sets it
      // automatically for FormData, including the boundary.
      body: formData, 
    });

    const data = await response.json();
    // data is { success, message, data: { worksheetId, ... } }
    return data;
    
  } catch (error) {
    console.error("Upload Worksheet error:", error);
    return { 
      success: false, 
      message: "Network error: Could not upload worksheet." 
    };
  }
};








export const listStudentsCourses = async () => {
  try {
    const response = await fetch(listStudentsCoursesPath, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      },
      credentials: 'include', // Sends student auth cookie
    });
    return await response.json(); // Returns { success: true, data: [...] }
  } catch (error) {
    console.error("List Student Courses error:", error);
    return { 
      success: false, 
      message: "Network error: Could not fetch courses." 
    };
  }
};








export const enrollInCourse = async (courseId) => {
  try {
    // --- 2. THIS IS NOW A REAL API CALL ---
    const response = await fetch(enrollInCoursePath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Sends the auth cookie
      body: JSON.stringify({ courseId }) // Sends the courseId in the body
    });
    
    const data = await response.json();
    // The backend sends { success, message, data: { created, skipped } }
    // The frontend logic in StudentCoursesPage only needs 'success' and 'message'
    return data;
    // --- END REAL API CALL ---

  } catch (error) {
    console.error("Enroll in Course error:", error);
    return { 
      success: false, 
      message: "Network error: Could not enroll." 
    };
  }
};







export const listStudentWorksheets = async (courseId) => {
  try {
    // --- THIS IS THE FIX ---
    // Use a GET request and send courseId as a query parameter
    const response = await fetch(`${listStudentWorksheetsPath}?courseId=${courseId}`, {
      method: 'GET', // <-- CORRECT
      headers: { 
        'Content-Type': 'application/json' 
      },
      credentials: 'include', // Sends student auth cookie
      // No body for a GET request
    });
    // --- END FIX ---

    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || "Failed to fetch worksheets." };
    }
    return data; // Returns { success: true, data: [...] }
    
  } catch (error) {
    console.error("List Student Worksheets error:", error);
    return { 
      success: false, 
      message: "Network error: Could not fetch worksheets." 
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










export const listTeachersCourses = async () => {
  try {
    const response = await fetch(listTeachersCoursesPath, {
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
    console.error("List Teacher Courses error:", error);
    return { 
      success: false, 
      message: "Network error: Could not fetch courses." 
    };
  }
};




export const listTeacherWorksheets = async (courseId) => {
  try {
    // We send the courseId as a query parameter, as your backend requires
    const response = await fetch(`${listTeacherWorksheetsPath}?courseId=${courseId}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      },
      credentials: 'include', // Sends teacher's auth cookie
    });

    const data = await response.json();
    if (!response.ok) {
      // Handles 401, 403, 500 errors
      return { success: false, message: data.message || "Failed to fetch worksheets." };
    }
    
    // Returns { success: true, message: "...", data: [...] }
    return data;
    
  } catch (error) {
    console.error("List Teacher Worksheets error:", error);
    return { 
      success: false, 
      message: "Network error: Could not fetch worksheets." 
    };
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












export const setupChatThread = async (worksheetId) => {
  try {
    const response = await fetch(setupChatThreadPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ worksheetId }),
    });
    return await response.json(); // Returns { success: true, data: { thread_id: "..." } }
  } catch (error) {
    console.error("Setup Chat Thread error:", error);
    return { success: false, message: "Network error setting up chat." };
  }
};

/**
 * (STUDENT) Loads the chat history for a specific worksheet.
 */
export const loadChatOfSpecificWorksheet = async (worksheetId) => {
  try {
    const response = await fetch(loadChatHistoryPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ worksheetId }),
    });
    return await response.json(); // Returns { success: true, data: [...] }
  } catch (error) {
    console.error("Load Chat History error:", error);
    return { success: false, message: "Network error loading chat." };
  }
};

/**
 * (STUDENT) Asks a question to the AI assistant.
 */
export const askQ = async (threadId, worksheetId, promptText) => {
  try {
    const response = await fetch(askQuestionPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ threadId, worksheetId, promptText }),
    });
    return await response.json(); // Returns { success: true, data: { answer: "..." } }
  } catch (error) {
    console.error("Ask Question error:", error);
    return { success: false, message: "Network error asking question." };
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