// App.jsx
import { Routes, Route } from 'react-router-dom'
import Landing_Page_spark from './Landing_page_Spark.jsx' // Make sure this path is correct
import AuthPage from './Login_Page'         // The component you just made
import InviteOnboardPage from './registration_onboarding.jsx'
import AdminDashBoardLayout from './AdminPages/AdminDashboardLayout.jsx'
import AdminWelcomePage from './AdminPages/AdminWelcome.jsx'
import AdminRequestPage from './AdminPages/AdminNewJoineesRequestPage.jsx'
import AdminNewInvitationsPage from './AdminPages/AdminNewInvitationPage.jsx'
import ParentDashboardPage from './ParentDahboardPage.jsx'
import AdminListAllTeacherPage from './AdminPages/Admin_List_All_Teachers.jsx'

import StudentLayout from './StudentPages/StudentDashboardLayout.jsx'
import StudentWelcomePage from './StudentPages/StudentWelcomePage.jsx'
import AdminStudentPage from './AdminPages/Admin_List_All_Students.jsx'
import TeacherLayout from './TeacherPages/TeacherDashboard_layoutPage.jsx'
import TeacherWelcome from './TeacherPages/TeacherWelcome.jsx'


import AdminStudentPromptHistory from './AdminPages/AdminSpecificStudentHistory.jsx'
import StudentAskToAIPage from './StudentPages/StudentAskToAIPage.jsx'
import AdminBatchesPage from './AdminPages/AdminBatchesPage.jsx'
import AdminBatchWeekPage from './AdminPages/AdminBatchSessionPage.jsx'
// import StudentMyBatches from './StudentPages/StudentMyBatches.jsx'
// import StudentAllBatchesPage from './StudentPages/StudentAllBatches.jsx'
import TeacherAllLiveBatchesPage from './TeacherPages/TeacherAllBatchesPage.jsx'
import TeacherSpecificBatchDetailPage from './TeacherPages/TeacherSpecificBatchDetails.jsx'
// import StudentDoubtsPage from './StudentPages/StudentDoubtPage.jsx'
import TeacherDoubtsPage from './TeacherPages/TeacherDoubts.jsx'
import AttendancePage from './AdminPages/AdminAttendance.jsx'
import BuyCourse from './BuyCourse.jsx'
import PaymentSuccess from './paymentsuccess.jsx'
import PaymentFailure from './paymentfailure.jsx'
import StudentRegistration from './StudentNewOnBoardingPage.jsx'
// import StudentRemainingSessionPurchase from './StudentPages/StudentRemainingSessionPurchase.jsx'
// import StudentPaymentStatusHandler from './StudentPages/StudentPaymentStatusHandler.jsx'
import TeacherSignupPage from './TeacherPages/TeacherSignupPage.jsx'
import ParentSignupPage from './ParentPages/ParentRegistration.jsx'
import StudentSignupDirectPage from './StudentPages/StudentSignupDirectPage.jsx'
import LandingPageMain from './LandingPageMain.jsx'
import BookingPage_BuilderOs from './BookDiscoveryCall_BuilderOS.jsx'
import BookOneOnOneSession_BuilderOS from './BookOneOnOneSession_BuilderOSs.jsx'
import FormSquad_BuilderOS from './FormSquad_BuilderOS.jsx'
// import TestPage from './TestPage.jsx'
import BookingPage_Spark from './BookDiscoveryCall_Spark.jsx'
import BookOneOnOneSession_Spark from './BookOneOnOne_Spark.jsx'
import StudentMySpacePage from './StudentPages/StudentWorkspace.jsx'
import Admin_GetAllLinksOtp from './AdminPages/Admin_get_all_link_otp_for_mail.jsx'
import SparkBookCatchUpSession from './StudentPages/StudentZohoCatchUpPage.jsx'
import NotFoundPage from './NotFound404Page.jsx'
import StudentAssignments from './StudentPages/StudentAssignment.jsx'
import ActiveBatchesPageForBoard from './AdminPages/AdminActiveBatchPageForWhiteBoard.jsx'
import AdminAllBoardsForABatch from './AdminPages/AdminListAllBoardsForABstch.jsx'
// import StudentWhiteboardPage from './StudentPages/StudentWhiteBoard.jsx'






function App() {
  return (
    <Routes>
      {/* Route for the Landing Page */}

      <Route path="*" element={<NotFoundPage />} />


      <Route path="/" element={< LandingPageMain />} />
      <Route path="/book-discovery-call-builderos" element={< BookingPage_BuilderOs />} />
      <Route path="/book-discovery-call-spark" element={< BookingPage_Spark />} />
      <Route path="/book-one-on-one-session-builderos" element={< BookOneOnOneSession_BuilderOS />} />
      <Route path="/book-one-on-one-session-spark" element={< BookOneOnOneSession_Spark />} />
      <Route path="/form-a-squad-builderos" element={< FormSquad_BuilderOS />} />

      <Route path="/spark" element={<Landing_Page_spark />} />
      <Route path="/buycourse" element={<BuyCourse />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={< PaymentFailure />} />



      <Route path="/register-student" element={<StudentRegistration />} />
      <Route path="/teacher-signup" element={<TeacherSignupPage />} />

      <Route path="/parent-signup" element={<ParentSignupPage />} />

      <Route path="/student-signup-direct" element={<StudentSignupDirectPage />} />




      
      {/* Route for the Login/Auth Page */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/invite/onboard" element={<InviteOnboardPage />} />
      {/* <Route path="/test" element={<TestPage />} /> */}




      <Route path="/admin/dashboard" element={<AdminDashBoardLayout />}>
              {/* Default page at /admin/dashboard */}
              <Route index element={<AdminWelcomePage />} /> 
              
              {/* Page at /admin/dashboard/request */}
              <Route path="request" element={<AdminRequestPage />} />
            
              <Route path="invitation" element={<AdminNewInvitationsPage />} />


              <Route path="batches" element={<  AdminBatchesPage  />} />

              <Route path="batches/:batchId" element={<  AdminBatchWeekPage  />} />



              <Route path="teacher" element={<AdminListAllTeacherPage />} />
              <Route path="student" element={<AdminStudentPage />} />
              <Route path="student/:studentId" element={< AdminStudentPromptHistory />    } />

              <Route path="attendance" element={< AttendancePage />} />

              <Route path="email-otp"   element={   <Admin_GetAllLinksOtp/>   }  />


              <Route path="collaborativeboard/batches"   element={   < ActiveBatchesPageForBoard />   }  />
              <Route path="collaborativeboard/batches/:batchId"   element={   <  AdminAllBoardsForABatch />   }  />


      </Route>





       <Route path="/student/dashboard" element={< StudentLayout />}>
              {/* Default page at /admin/dashboard */}
              <Route index element={< StudentWelcomePage />} /> 
              <Route path="asktoai" element={< StudentAskToAIPage />} />
              {/* <Route path = "mybatches" element={ <StudentMyBatches/>     } /> */}
              {/* <Route path = "allbatches" element={ <StudentAllBatchesPage/>     } /> */}
              {/* <Route path = "doubts" element={ <StudentDoubtsPage/>     } /> */}
              {/* <Route path = "remaingsessionpurchase" element={ <StudentRemainingSessionPurchase/>     } /> */}
              {/* <Route path = "payment-result" element={ < StudentPaymentStatusHandler/>     } /> */}
              <Route path="workspace" element={< StudentMySpacePage />} />

              <Route path="catchup-session" element={< SparkBookCatchUpSession />} />
              <Route path="my-assignments" element={<  StudentAssignments />} />

              {/* <Route path="whiteboard" element={<  StudentWhiteboardPage />} /> */}






    </Route>




         <Route path="/teacher/dashboard" element={< TeacherLayout />}>
              {/* Default page at /admin/dashboard */}
              <Route index element={< TeacherWelcome />} /> 
              
              <Route path="batches" element={<  TeacherAllLiveBatchesPage />} />
              <Route path="batches/:batchId" element={<  TeacherSpecificBatchDetailPage  />} />
              <Route path="doubts" element={<  TeacherDoubtsPage  />} />

           

              
    </Route>




    <Route path="/parent/dashboard" element={<ParentDashboardPage />} />

    </Routes>
  )
}

export default App