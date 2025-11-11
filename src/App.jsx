// App.jsx
import { Routes, Route } from 'react-router-dom'
import Landing_Page from './Landing_page.jsx' // Make sure this path is correct
import AuthPage from './Login_Page'         // The component you just made
import InviteOnboardPage from './registration_onboarding.jsx'
import AdminDashBoardLayout from './AdminPages/AdminDashboardLayout.jsx'
import AdminWelcomePage from './AdminPages/AdminWelcome.jsx'
import AdminRequestPage from './AdminPages/AdminLoginRequestPage.jsx'
import AdminNewInvitationsPage from './AdminPages/AdminNewInvitationPage.jsx'
import ParentDashboardPage from './ParentDahboardPage.jsx'
import AdminListAllTeacherPage from './AdminPages/Admin_List_All_Teachers.jsx'
import AdminCoursesPage from './AdminPages/AdminAllCoursePage.jsx'
import AdminWorksheetListPage from './AdminPages/AdminSpecificCoursePage.jsx'
import AdminViewedWorksheet from './AdminPages/AdminViewedWorksheet.jsx'
import StudentLayout from './StudentPages/StudentDashboardLayout.jsx'
import StudentWelcomePage from './StudentPages/StudentWelcomePage.jsx'
import StudentCoursesPage from './StudentPages/StudentAllCoursePage.jsx'
import StudentWorksheetPage from './StudentPages/StudentSpecificCourse.jsx'
import StudentDocViewerPage from './StudentPages/StudentSpecificWorkSheet.jsx'






function App() {
  return (
    <Routes>
      {/* Route for the Landing Page */}
      <Route path="/" element={<Landing_Page />} />
      
      {/* Route for the Login/Auth Page */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/invite/onboard" element={<InviteOnboardPage />} />




      <Route path="/admin/dashboard" element={<AdminDashBoardLayout />}>
              {/* Default page at /admin/dashboard */}
              <Route index element={<AdminWelcomePage />} /> 
              
              {/* Page at /admin/dashboard/request */}
              <Route path="request" element={<AdminRequestPage />} />
            
              <Route path="invitation" element={<AdminNewInvitationsPage />} />

              {/* Add other admin pages here */}
              <Route path="course" element={<AdminCoursesPage />} />
              <Route path="course/:courseId" element={<AdminWorksheetListPage />} />
              <Route path="course/:courseId/:worksheetId" element={< AdminViewedWorksheet  />} />
              <Route path="teacher" element={<AdminListAllTeacherPage />} />
              {/* <Route path="student" element={<AdminStudentsPage />} /> */}
    </Route>





       <Route path="/student/dashboard" element={< StudentLayout />}>
              {/* Default page at /admin/dashboard */}
              <Route index element={< StudentWelcomePage />} /> 
              
              {/* Page at /admin/dashboard/request */}
              {/* <Route path="request" element={<AdminRequestPage />} />
            
              <Route path="invitation" element={<AdminNewInvitationsPage />} />

              {/* Add other admin pages here */}
              <Route path="course" element={< StudentCoursesPage />} />
              <Route path="course/:courseId" element={<StudentWorksheetPage />} />
              <Route path="course/:courseId/:worksheetId" element={< StudentDocViewerPage />} />

              {/* <Route path="student" element={<AdminStudentsPage />} /> */}
    </Route>




    <Route path="/parent/dashboard" element={<ParentDashboardPage />} />

    </Routes>
  )
}

export default App