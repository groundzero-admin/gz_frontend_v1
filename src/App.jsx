// App.jsx
import { Routes, Route } from 'react-router-dom'
import Landing_Page from './Landing_page.jsx' // Make sure this path is correct
import AuthPage from './Login_Page'         // The component you just made
import InviteOnboardPage from './registration_onboarding.jsx'
import AdminDashBoardLayout from './AdminDashboardLayout.jsx'
import AdminWelcomePage from './AdminWelcome.jsx'
import AdminRequestPage from './AdminLoginRequestPage.jsx'




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

        {/* Add other admin pages here */}
        {/* <Route path="course" element={<AdminCoursesPage />} /> */}
        {/* <Route path="teacher" element={<AdminTeachersPage />} /> */}
        {/* <Route path="student" element={<AdminStudentsPage />} /> */}
        {/* <Route path="invitation" element={<AdminInvitationsPage />} /> */}
      </Route>






    </Routes>
  )
}

export default App