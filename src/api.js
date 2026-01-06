// (Or update this to your backend URL)
const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL  ; 

// console.log("API BASE_URL is:", BASE_URL);

// --- Paths (add these) ---
export const whoamipath = `${BASE_URL}/whoami`;
export const loginPath = `${BASE_URL}/login`;
// export const requestAccessPath = `${BASE_URL}/requestaccess`;
export const validateInvitePath = `${BASE_URL}/invite-validate`;
export const onboardUserPath = `${BASE_URL}/onboard`;
export const checkRolePath = `${BASE_URL}/checkrole`;
export const logoutPath = `${BASE_URL}/logout`;
// export const getAllRequestsPath = `${BASE_URL}/admin/getallrequest`;
// export const actionRequestPath = `${BASE_URL}/admin/actionrequest`;
// export const sendInvitePath = `${BASE_URL}/admin/invite`;
export const listAllTeachersPath = `${BASE_URL}/admin/listallteachers`; // <-- NEW PATH


export const getMyChildrenDetailsPath = `${BASE_URL}/parent/mychildrendetails`;




export const getAllStudentDetailsPath = `${BASE_URL}/admin/getallstudentdetails`;



export const setupGeneralChatThreadPath = `${BASE_URL}/student/setupchatthread`;
export const loadGeneralChatHistoryPath = `${BASE_URL}/student/chathistory`;
export const askGeneralQuestionPath = `${BASE_URL}/student/askq`;







//// for teacher to getch his studnts




export const getStudentHistoryPath = `${BASE_URL}/studenthistory`;

export const getMyChildHistoryPath = `${BASE_URL}/parent/mychildhistory`;


// export const listAllBatchesPath = `${BASE_URL}/admin/listallbatches`;
// export const updateBatchStatusPath = `${BASE_URL}/admin/updatebatchstatus`;
// export const createBatchPath = `${BASE_URL}/admin/createCourse`; // Note: Backend uses 'createCourse' route for batches



// export const getWeeksForBatchPath = `${BASE_URL}/admin/weekinforabatch`;
// export const createBatchWeekPath = `${BASE_URL}/admin/createbatchweek`;

// export const linkStudentToBatchPath = `${BASE_URL}/admin/linkstudentinabatch`;


// export const getStudentsInBatchPath = `${BASE_URL}/admin/getstudentsinbatch`;
// /api/student/getbatchprogress


export const getMyLiveBatchesPath = `${BASE_URL}/student/mylivebatches`;
export const getTodaysLiveBatchInfoPath = `${BASE_URL}/student/gettodaylivebatchinfo`;

export const getstudentsbatchprogressPath = `${BASE_URL}/student/getbatchprogress`;



// export const getMyEnrolledBatchesPath = `${BASE_URL}/student/myenrolledbatches`;
export const getSessionsForBatchStudentPath = `${BASE_URL}/student/getsessionforabatch`;

// export const getAllBatchesForStudentPath = `${BASE_URL}/student/getallbatches`;

export const getLiveBatchInfoTeacherPath = `${BASE_URL}/teacher/getlivebatchinfo`;
export const getTodaysLiveBatchesForTeacherPath = `${BASE_URL}/teacher/todayslivebatchinfo`  ;


export const getBatchDetailsForTeacherPath = `${BASE_URL}/teacher/batchdetails`;


export const raiseDoubtPath = `${BASE_URL}/student/raisedoubt`;
export const getMyDoubtsPath = `${BASE_URL}/student/mydoubts`  ;



export const getUnresolvedDoubtsPath = `${BASE_URL}/teacher/unresolveddoubts`; // Assuming this route name based on your controller
export const resolveDoubtPath = `${BASE_URL}/teacher/resolvedoubt`;


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
// export const requestAccess = async (name, email, role) => {
//   try {
//     const response = await fetch(requestAccessPath, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ name, email, role }),
//     });
//     const data = await response.json();
//     alert(data.message);
//     return data.success;
//   } catch (error) {
//     console.error("Request Access error:", error);
//     alert("Request failed: Network error or server is down.");
//     return false;
//   }
// };

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
  navigate("/spark"); // Always redirect to login
};

/**
 * (ADMIN) Fetches all pending access requests.
 */
// export const getAllAccessRequests = async () => {
//   try {
//     const response = await fetch(getAllRequestsPath, {
//       method: 'GET',
//       credentials: 'include', // Sends admin cookie
//     });
//     return await response.json(); // Returns { success, message, data: [...] }
//   } catch (error) {
//     console.error("Get All Requests error:", error);
//     return { success: false, message: "Network error fetching requests." };
//   }
// };

/**
 * (ADMIN) Approves an access request.
 * @param {string} requestId - The _id of the request to approve.
 */
// export const approveAccessRequest = async (requestId) => {
//   try {
//     const response = await fetch(actionRequestPath, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include', // Sends admin cookie
//       body: JSON.stringify({ 
//         requestId: requestId,
//         action: "allow" 
//       }),
//     });
//     return await response.json(); // Returns { success, message }
//   } catch (error) {
//     console.error("Action Request error:", error);
//     return { success: false, message: "Network error processing action." };
//   }
// };








// export const sendInvite = async (email, role, parentEmails = [], childEmails = []) => {
//   try {
//     const response = await fetch(sendInvitePath, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include', // Sends admin cookie
//       body: JSON.stringify({ 
//         email, 
//         role, 
//         parentEmails, 
//         childEmails 
//       }),
//     });
//     return await response.json(); // Returns { success, message }
//   } catch (error) {
//     console.error("Send Invite error:", error);
//     return { success: false, message: "Network error sending invite." };
//   }
// };












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
// export const listAllActiveBatches = async () => {
//   try {
//     const response = await fetch(listAllBatchesPath, {
//       method: 'GET',
//       credentials: 'include',
//     });
//     return await response.json();
//   } catch (error) {
//     console.error("List Batches error:", error);
//     return { success: false, message: "Network error fetching batches." };
//   }
// };

/**
 * ADMIN: Updates the status of a batch (UPCOMING -> LIVE -> ENDED).
 * @param {string} batchId - The human-readable ID (e.g. "SP-A-C-01")
 * @param {string} status - "LIVE" or "ENDED"
 */
// export const updateBatchStatus = async (batchId, status) => {
//   try {
//     const response = await fetch(updateBatchStatusPath, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//       body: JSON.stringify({ batchId, status }),
//     });
//     return await response.json();
//   } catch (error) {
//     console.error("Update Batch Status error:", error);
//     return { success: false, message: "Network error updating status." };
//   }
// };

/**
 * ADMIN: Creates a new batch.
 * @param {object} batchData - Form data
 */
// export const createBatch = async (batchData) => {
//   try {
//     const response = await fetch(createBatchPath, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//       body: JSON.stringify(batchData),
//     });
//     return await response.json();
//   } catch (error) {
//     console.error("Create Batch error:", error);
//     return { success: false, message: "Network error creating batch." };
//   }
// };





/**
 * ADMIN: Fetches all weeks for a specific batch.
 * @param {string} batch_obj_id - The MongoDB _id of the batch
 */
// export const getWeeksForBatch = async (batch_obj_id) => {
//   try {
//     // Using query param as per your backend controller
//     const response = await fetch(`${getWeeksForBatchPath}?batch_obj_id=${batch_obj_id}`, {
//       method: 'GET',
//       credentials: 'include',
//     });
//     return await response.json();
//   } catch (error) {
//     console.error("Get Weeks error:", error);
//     return { success: false, message: "Network error fetching weeks." };
//   }
// };

/**
 * ADMIN: Creates a new week for a batch.
 */
// export const createBatchWeek = async (formData) => {
//   try {
//     const response = await fetch(createBatchWeekPath, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//       body: JSON.stringify(formData),
//     });
//     return await response.json();
//   } catch (error) {
//     console.error("Create Week error:", error);
//     return { success: false, message: "Network error creating week." };
//   }
// };



















/**
 * ADMIN: Links a student (by GZST number) to a batch (by Batch ID).
 */
// export const linkStudentToBatch = async (batchId, student_number) => {
//   try {
//     const response = await fetch(linkStudentToBatchPath, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//       body: JSON.stringify({ batchId, student_number }),
//     });
//     return await response.json();
//   } catch (error) {
//     console.error("Link Student error:", error);
//     return { success: false, message: "Network error linking student." };
//   }
// };





/**
 * ADMIN: Fetches all students linked to a specific batch.
 * @param {string} batch_obj_id - The MongoDB _id of the batch
 */
// export const getStudentsInBatch = async (batch_obj_id) => {
//   try {
//     const response = await fetch(`${getStudentsInBatchPath}?batch_obj_id=${batch_obj_id}`, {
//       method: 'GET',
//       credentials: 'include',
//     });
//     return await response.json();
//   } catch (error) {
//     console.error("Get Students in Batch error:", error);
//     return { success: false, message: "Network error fetching students." };
//   }
// };












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





// getstudentsbatchprogressPath
/**
 * (STUDENT) Fetches today's class info for a specific batch.
 */
export const getstudentsbatchprogress = async (input) => {
  try {
    // FIX: specific check to handle if input is passed as { batch_obj_id: "..." } or just "..."
    const batch_obj_id = typeof input === 'object' && input.batch_obj_id 
      ? input.batch_obj_id 
      : input;

    const response = await fetch(getstudentsbatchprogressPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ batch_obj_id }), // Now batch_obj_id is guaranteed to be a string
    });
    
    return await response.json(); 
  } catch (error) {
    console.error("Get Today's Batch Info error:", error);
    return { success: false, message: "Network error fetching batch info." };
  }
};














// export const getMyEnrolledBatches = async () => {
//   try {
//     const response = await fetch(getMyEnrolledBatchesPath, {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//     });
//     return await response.json();
//   } catch (error) {
//     console.error("Get My Enrolled Batches error:", error);
//     return { success: false, message: "Network error fetching batches." };
//   }
// };

// /**
//  * (STUDENT) Fetches the weeks/schedule for a specific batch.
//  * @param {string} batch_obj_id - The MongoDB _id of the batch
//  */
export const getSessiosnForBatchStudent  = async (batch_obj_id) => {
  try {
    const response = await fetch(`${getSessionsForBatchStudentPath}?batch_obj_id=${batch_obj_id}`, {
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



// export const getAllBatchesForStudent = async () => {
//   try {
//     const response = await fetch(getAllBatchesForStudentPath, {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//     });
//     return await response.json(); // Returns { success, data: [{ ..., amIEnrolled: true/false }] }
//   } catch (error) {
//     console.error("Get All Batches for Student error:", error);
//     return { success: false, message: "Network error fetching batches." };
//   }
// };












/**
 * (TEACHER) Fetches a list of live batches (minor details for buttons).
 */
export const getLiveBatchInfoTeacherMinor = async () => {
  try {
    // Fetch 'minor' details as requested
    const response = await fetch(`${getLiveBatchInfoTeacherPath}?details=minor`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await response.json(); // Returns { success, data: [{ _id, batchId }, ...] }
  } catch (error) {
    console.error("Get Live Batch Info (Teacher) error:", error);
    return { success: false, message: "Network error fetching live batches." };
  }
};

/**
 * (TEACHER) Fetches today's schedule for ALL live batches.
 */
export const getTodaysLiveBatchesForTeacher = async () => {
  try {
    const response = await fetch(getTodaysLiveBatchesForTeacherPath, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await response.json(); // Returns { success, data: [{ batchId, classLocation, ... }, ...] }
  } catch (error) {
    console.error("Get Today's Live Batches (Teacher) error:", error);
    return { success: false, message: "Network error fetching schedule." };
  }
};




export const getLiveBatchInfoTeacherMajor = async () => {
  try {
    const response = await fetch(`${getLiveBatchInfoTeacherPath}?details=major`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await response.json(); // Returns { success, data: [ ...fullBatchInfo ] }
  } catch (error) {
    console.error("Get Live Batch Major Info error:", error);
    return { success: false, message: "Network error fetching live batches." };
  }
};




export const getBatchAndSessionDetailsForTeacher = async (batch_obj_id) => {
  try {
    const response = await fetch(`${getBatchDetailsForTeacherPath}?batch_obj_id=${batch_obj_id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Sends teacher's auth cookie
    });
    return await response.json(); // Returns { success, data: { weeks: [], students: [] } }
  } catch (error) {
    console.error("Get Batch Details (Teacher) error:", error);
    return { success: false, message: "Network error fetching batch details." };
  }
};


















/**
 * (STUDENT) Raises a new doubt for a specific batch.
 */
export const raiseDoubt = async (batch_obj_id, doubt_content) => {
  try {
    const response = await fetch(raiseDoubtPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ batch_obj_id, doubt_content }),
    });
    return await response.json(); 
  } catch (error) {
    console.error("Raise Doubt error:", error);
    return { success: false, message: "Network error raising doubt." };
  }
};

/**
 * (STUDENT) Fetches all doubts raised by the student.
 */
export const getMyDoubts = async () => {
  try {
    const response = await fetch(getMyDoubtsPath, {
      method: 'GET',
      credentials: 'include',
    });
    return await response.json(); 
  } catch (error) {
    console.error("Get My Doubts error:", error);
    return { success: false, message: "Network error fetching doubts." };
  }
};






export const getUnresolvedDoubts = async (batch_obj_id = "") => {
  try {
    const url = batch_obj_id 
      ? `${getUnresolvedDoubtsPath}?batch_obj_id=${batch_obj_id}` 
      : getUnresolvedDoubtsPath;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Sends teacher auth cookie
    });
    return await response.json(); // Returns { success, data: [...] }
  } catch (error) {
    console.error("Get Unresolved Doubts error:", error);
    return { success: false, message: "Network error fetching doubts." };
  }
};

/**
 * (TEACHER) Marks a doubt as resolved.
 * @param {string} doubtId - The ID of the doubt to resolve.
 */
export const resolveDoubt = async (doubtId) => {
  try {
    const response = await fetch(resolveDoubtPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ doubtId }),
    });
    return await response.json(); // Returns { success, message, data: ... }
  } catch (error) {
    console.error("Resolve Doubt error:", error);
    return { success: false, message: "Network error resolving doubt." };
  }
};
















// ... (existing paths)
export const getStudentsInBatchPath = `${BASE_URL}/admin/getstudentofabatch`;
// --- NEW SESSION PATHS ---
export const createSessionPath = `${BASE_URL}/admin/createsession`;
export const getSessionsForBatchPath = `${BASE_URL}/admin/getsessionforabatch`;
export const linkStudentToBatchPath = `${BASE_URL}/admin/linkstudenttobatch`;

// ... (existing functions)

/**
 * ADMIN: Fetches all sessions for a specific batch.
 * @param {string} batch_obj_id - The MongoDB _id of the batch
 */
export const getSessionsForBatch = async (batch_obj_id) => {
  try {
    const response = await fetch(`${getSessionsForBatchPath}?batch_obj_id=${batch_obj_id}`, {
      method: 'GET',
      credentials: 'include',
    });
    return await response.json(); // Returns { success, data: [...] }
  } catch (error) {
    console.error("Get Sessions error:", error);
    return { success: false, message: "Network error fetching sessions." };
  }
};

/**
 * ADMIN: Creates a new session for a batch.
 */
export const createSession = async (formData) => {
  try {
    const response = await fetch(createSessionPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData),
    });
    return await response.json();
  } catch (error) {
    console.error("Create Session error:", error);
    return { success: false, message: "Network error creating session." };
  }
};

// ... (Keep getStudentsInBatch and linkStudentToBatch as they are reused)
export const getStudentsInBatch = async (batch_obj_id) => {
  try { return await (await fetch(`${getStudentsInBatchPath}?batch_obj_id=${batch_obj_id}`, { method: 'GET', credentials: 'include' })).json(); } catch (e) { return { success: false }; }
};

export const linkStudentToBatch = async (batch_obj_id, student_number) => {
  try { return await (await fetch(linkStudentToBatchPath, { method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include', body: JSON.stringify({ batch_obj_id, student_number }) })).json(); } catch (e) { return { success: false }; }
};



















/**
 * Helper function to handle response errors
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  return response.json();
};

/**
 * Creates a new batch.
 * Route: POST /api/admin/createbatch
 */
export const createBatch = async (batchData) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/createbatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(batchData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error creating batch:", error);
    throw error;
  }
};

/**
 * Lists all active batches.
 * Route: GET /api/admin/listallactivebatches
 */
export const listAllActiveBatches = async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/listallactivebatches`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching active batches:", error);
    throw error;
  }
};

/**
 * Updates the status of a specific batch.
 * Route: POST /api/admin/updatebatchstatus
 */
export const updateBatchStatus = async (batch_obj_id, status) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/updatebatchstatus`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ batch_obj_id, status }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error updating batch status for ID ${batch_obj_id}:`, error);
    throw error;
  }
};












export const updateSessionDetails = async (sessionData) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/update-session`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(sessionData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error updating session:", error);
    throw error;
  }
};















// Fetch the list of new joiners (Orders where credentials aren't sent yet)
export const getNewJoinersList = async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/newjoinneslist`, {
      method: "GET",
      credentials: "include",
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching new joiners:", error);
    throw error;
  }
};




// Fetch list of active batches
export const getBatches = async () => {
  try {
    // ✅ Updated endpoint
    const response = await fetch(`${BASE_URL}/admin/listallactivebatches`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching batches:", error);
    return { success: false, message: "Network Error" };
  }
};




export const sendCredentials = async (orderId, selectedBatches = []) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/send-credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ 
        course_order_id: orderId,
        // ✅ only send IDs
        assigned_batches: selectedBatches.map(b => b.batch_obj_id)
      }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error sending credentials for order ID ${orderId}:`, error);
    throw error;
  }
};








// --- Validate invitation token ---
export const validateInvitation = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/validate-invitation?token=${token}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Error validating token:", error);
    throw error;
  }
};

// --- Complete Student Registration ---
export const completeRegistration = async (payload) => {
  try {
    const response = await fetch(`${BASE_URL}/complete-student-registration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Error completing registration:", error);
    throw error;
  }
};















// Assuming you have your base URL or paths defined similar to getStudentHistoryPath
const updateStudentCreditsPath = `${BASE_URL}/admin/update-credits`;

export const updateStudentCreditWallet = async (studentId, studentNumber, onlineCredits, offlineCredits) => {
  try {
    const response = await fetch(updateStudentCreditsPath, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      credentials: 'include', // Sends admin/teacher auth cookie
      body: JSON.stringify({
        student_obj_id: studentId,
        student_number: studentNumber,
        online_amount: onlineCredits,
        offline_amount: offlineCredits
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Failed to update credits." };
    }
    
    // Returns { success: true, message: "Credits updated successfully.", data: { ... } }
    return data;

  } catch (error) {
    console.error("Update Student Credits error:", error);
    return { 
      success: false, 
      message: "Network error: Could not update credits." 
    };
  }
};







// Add this to your api.js file

// Assuming the route is /api/student/remaining-session-info
const remainingSessionInfoPath = `${BASE_URL}/student/remaining-session-info`; 

export const remainingSessionInfoBatchForStudent = async () => {
  try {
    const response = await fetch(remainingSessionInfoPath, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      },
      credentials: 'include', // Sends auth cookie
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, message: data.message || "Failed to fetch session info." };
    }
    
    return data;
    
  } catch (error) {
    console.error("Remaining Session Info error:", error);
    return { 
      success: false, 
      message: "Network error: Could not fetch session info." 
    };
  }
};



// Path to the top-up session creation
const createTopUpSessionPath = `${BASE_URL}/student/create-credit-topup-session`  ;



export const createCreditTopUpSession = async (batchId, batchType, noOfClasses, description) => {
  try {
    const response = await fetch(createTopUpSessionPath, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      credentials: 'include', // Important: Sends the student auth cookie
      body: JSON.stringify({
        batch_obj_id: batchId,
        batchType: batchType,      // 'ONLINE' or 'OFFLINE'
        no_of_classes: noOfClasses,
        purchaseType: description  // Description string
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, message: data.message || "Failed to initiate payment." };
    }
    
    // Returns { success: true, data: { url: "...", amount: ... } }
    return data;
    
  } catch (error) {
    console.error("Create TopUp Session error:", error);
    return { 
      success: false, 
      message: "Network error: Could not connect to payment gateway." 
    };
  }
};














// ... existing imports and setup ...

export const inviteTeacher = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/invite-teacher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Assuming you use cookies for auth, otherwise add Authorization header
      credentials: 'include', 
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || "Failed to invite teacher." 
      };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Invite Teacher API Error:", error);
    return { success: false, message: "Network error. Please try again." };
  }
};















// --- Teacher Onboarding APIs ---

export const validateTeacherInvite = async (token) => {
  try {
    // We send token as query param
    const response = await fetch(`${BASE_URL}/validate-teacher-invite?token=${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, message: data.message || "Invalid invitation link." };
    }
    
    // Returns { success: true, data: { email: "..." } }
    return data;

  } catch (error) {
    console.error("Validate Invite Error:", error);
    return { success: false, message: "Network error validating token." };
  }
};

export const completeTeacherOnboarding = async (payload) => {
  try {
    const response = await fetch(`${BASE_URL}/complete-teacher-onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, message: data.message || "Registration failed." };
    }
    
    return data; // { success: true, ... }

  } catch (error) {
    console.error("Onboarding Error:", error);
    return { success: false, message: "Network error during registration." };
  }
};












// --- Admin Invitation APIs ---

export const inviteParentOnly = async (parentEmail, studentEmail) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/invite-parent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Sends admin cookie
      body: JSON.stringify({ parentEmail, studentEmail }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || "Failed to invite parent." };
    }
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Invite Parent Error:", error);
    return { success: false, message: "Network error." };
  }
};











export const inviteStudentAndParent = async (studentEmail, parentEmail, onlineCredit, offlineCredit, batches = []) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/invite-student-direct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ 
        studentEmail, 
        parentEmail, 
        onlineCredit: Number(onlineCredit), 
        offlineCredit: Number(offlineCredit),
        batches // Passing array of { batch_obj_id, batchName }
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || "Failed to send invites." };
    }
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Invite Student+Parent Error:", error);
    return { success: false, message: "Network error." };
  }
};

















// --- Parent Onboarding APIs ---

export const validateParentInvite = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/validate-parent-invite?token=${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, message: data.message || "Invalid invitation link." };
    }
    
    // Returns { success: true, data: { email: "parent@...", ... } }
    return data;

  } catch (error) {
    console.error("Validate Parent Invite Error:", error);
    return { success: false, message: "Network error validating token." };
  }
};

export const completeParentOnboarding = async (payload) => {
  try {
    const response = await fetch(`${BASE_URL}/complete-parent-onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, message: data.message || "Registration failed." };
    }
    
    return data;

  } catch (error) {
    console.error("Parent Onboarding Error:", error);
    return { success: false, message: "Network error during registration." };
  }
};














// --- Student Direct Onboarding APIs ---

export const validateDirectStudentInvite = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/validate-direct-student-invite?token=${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, message: data.message || "Invalid invitation link." };
    }
    
    // Returns { success: true, data: { email: "...", parentEmail: "..." } }
    return data;

  } catch (error) {
    console.error("Validate Student Invite Error:", error);
    return { success: false, message: "Network error validating token." };
  }
};

export const completeDirectStudentOnboarding = async (payload) => {
  try {
    const response = await fetch(`${BASE_URL}/complete-direct-student-onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, message: data.message || "Registration failed." };
    }
    
    return data;

  } catch (error) {
    console.error("Student Onboarding Error:", error);
    return { success: false, message: "Network error during registration." };
  }
};




















const createCheckoutPath = `${BASE_URL}/create-checkout-session`;

/**
 * Creates a checkout session for course purchase.
 * * @param {Object} parentDetails - { parentName, parentPhone, parentEmail }
 * @param {Object} studentDetails - { studentName, studentEmail, board, classGrade, schoolName }
 * @param {string} batchType - 'ONLINE' or 'OFFLINE'
 * @param {string} purchaseType - 'FULL_BUNDLE' or 'SINGLE_SESSION'
 */
export const createCheckoutSession = async (parentDetails, studentDetails, batchType, purchaseType) => {
  try {
    const response = await fetch(createCheckoutPath, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      // credentials: 'include', // Uncomment if you need cookies/session passed
      body: JSON.stringify({
        ...parentDetails,
        ...studentDetails,
        batchType,
        purchaseType,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success || !data.order) {
      return { 
        success: false, 
        message: data.message || "Failed to generate payment order." 
      };
    }

    // Returns { success: true, key: "...", order: { id: "...", amount: ... } }
    return { success: true, ...data };

  } catch (error) {
    console.error("Create Checkout Session error:", error);
    return { 
      success: false, 
      message: "Network error: Could not connect to payment gateway." 
    };
  }
};





















// --- Student Profile API ---
export const updateStudentProfilePath = `${BASE_URL}/student/update-profile`;

export const updateStudentProfile = async (updates) => {
  try {
    const response = await fetch(updateStudentProfilePath, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates), // { name: "...", class: "..." }
    });
    return await response.json();
  } catch (error) {
    console.error("Update Student Profile error:", error);
    return { success: false, message: "Network error updating profile." };
  }
};
















// Add this path definition if not already present
const unlinkStudentFromBatchPath = `${BASE_URL}/admin/unlinkstudentfrombatch`; 

export const unlinkStudentFromBatch = async (batch_obj_id, student_number) => {
  try { 
    return await (await fetch(unlinkStudentFromBatchPath, { 
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      credentials: 'include', 
      body: JSON.stringify({ batch_obj_id, student_number }) 
    })).json(); 
  } catch (e) { 
    return { success: false, message: "Network error" }; 
  }
};