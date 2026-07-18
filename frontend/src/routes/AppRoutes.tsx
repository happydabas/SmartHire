import React from 'react'
import { Routes, Route } from 'react-router-dom'
import RootLayout from '../layouts/RootLayout'
import Home from '../pages/Home'

// Placeholder views for other routes (to keep imports clean)
const JobsPlaceholder = () => <div className="text-center py-10 font-medium">Job Search Listings View (Placeholder)</div>
const ResumePlaceholder = () => <div className="text-center py-10 font-medium">Resume Upload & Parsing View (Placeholder)</div>
const DashboardPlaceholder = () => <div className="text-center py-10 font-medium">Candidate/Recruiter Dashboard View (Placeholder)</div>
const LoginPlaceholder = () => <div className="text-center py-10 font-medium">Login Form (Placeholder)</div>
const RegisterPlaceholder = () => <div className="text-center py-10 font-medium">Registration Form (Placeholder)</div>

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        {/* Main Routes */}
        <Route index element={<Home />} />
        <Route path="jobs" element={<JobsPlaceholder />} />
        <Route path="resume" element={<ResumePlaceholder />} />
        <Route path="dashboard" element={<DashboardPlaceholder />} />
        
        {/* Auth Routes */}
        <Route path="login" element={<LoginPlaceholder />} />
        <Route path="register" element={<RegisterPlaceholder />} />
        
        {/* Fallback route */}
        <Route path="*" element={<div className="text-center py-10">404 - Page Not Found</div>} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
