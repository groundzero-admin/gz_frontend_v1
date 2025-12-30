// App.jsx
import { Routes, Route } from 'react-router-dom'
import Landing_Page from './Landing_page.jsx' // Make sure this path is correct
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
import StudentMyBatches from './StudentPages/StudentMyBatches.jsx'
// import StudentAllBatchesPage from './StudentPages/StudentAllBatches.jsx'
import TeacherAllLiveBatchesPage from './TeacherPages/TeacherAllBatchesPage.jsx'
import TeacherSpecificBatchDetailPage from './TeacherPages/TeacherSpecificBatchDetails.jsx'
import StudentDoubtsPage from './StudentPages/StudentDoubtPage.jsx'
import TeacherDoubtsPage from './TeacherPages/TeacherDoubts.jsx'
import AttendancePage from './AdminPages/AdminAttendance.jsx'
import BuyCourse from './BuyCourse.jsx'
import PaymentSuccess from './paymentsuccess.jsx'
import PaymentFailure from './paymentfailure.jsx'
import StudentRegistration from './StudentNewOnBoardingPage.jsx'
import StudentRemainingSessionPurchase from './StudentPages/StudentRemainingSessionPurchase.jsx'
import StudentPaymentStatusHandler from './StudentPages/StudentPaymentStatusHandler.jsx'
import TeacherSignupPage from './TeacherPages/TeacherSignupPage.jsx'
import ParentSignupPage from './ParentPages/ParentRegistration.jsx'
import StudentSignupDirectPage from './StudentPages/StudentSignupDirectPage.jsx'
import LandingPageMain from './LandingPageMain.jsx'
import BookingPage from './BookDiscoveryCall.jsx'
import BookOneOnOneSession from './BookOneOnOneSessions.jsx'
import FormSquad from './FormSquad.jsx'
import TestPage from './TestPage.jsx'






function App() {
  return (
    <Routes>
      {/* Route for the Landing Page */}
      <Route path="/" element={< LandingPageMain />} />
      <Route path="/book-discovery-call" element={< BookingPage />} />
      <Route path="/book-one-on-one-session" element={< BookOneOnOneSession />} />
      <Route path="/form-a-squad" element={< FormSquad />} />

      <Route path="/spark" element={<Landing_Page />} />
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
      <Route path="/test" element={<TestPage />} />




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

      </Route>





       <Route path="/student/dashboard" element={< StudentLayout />}>
              {/* Default page at /admin/dashboard */}
              <Route index element={< StudentWelcomePage />} /> 
              <Route path="asktoai" element={< StudentAskToAIPage />} />
              <Route path = "mybatches" element={ <StudentMyBatches/>     } />
              {/* <Route path = "allbatches" element={ <StudentAllBatchesPage/>     } /> */}
              <Route path = "doubts" element={ <StudentDoubtsPage/>     } />
              <Route path = "remaingsessionpurchase" element={ <StudentRemainingSessionPurchase/>     } />
              <Route path = "payment-result" element={ < StudentPaymentStatusHandler/>     } />
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