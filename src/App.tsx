import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Import pages
import WebPage from './pages/web'
import CustomerPage from './pages/customer'
import AdminPage from './pages/admin'
import AuthPage from './pages/auth'
import LoginPage from './pages/auth/login'
import SignupPage from './pages/auth/signup'
import AdminLoanRequestDetails from './pages/admin/LoanDetails'

// Import customer components and pages
import { Admin, Customer } from './components'
import Dashboard from './pages/customer/Dashboard'
import LoanRequests from './pages/customer/LoanRequests'
import LoanRequestDetails from './pages/customer/LoanRequestDetails'
import NewLoan from './pages/customer/NewLoan'
import Profile from './pages/customer/Profile'
import AdminDashboard from './pages/admin/Dashboard'
import AdminLoanRequests from './pages/admin/LoanRequests'
import AdminRequests from './pages/admin/Requests'
import AdminProfile from './pages/admin/Profile'
import AdminRequestView from './pages/admin/RequestDetails'
import AdminPerceptions from './pages/admin/Perceptions'
import AdminPerceptionView from './pages/admin/PerceptionDetails'
import AdminCustomers from './pages/admin/Customers'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Redirect root to web page */}
          <Route path="/" element={<Navigate to="/web" replace />} />
          
          {/* Main routes */}
          <Route path="/web" element={<WebPage />} />
          
          {/* Customer routes with layout */}
          <Route path="/customer" element={<Customer.Layout />}>
            <Route index element={<Navigate to="/customer/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="loan-requests" element={<LoanRequests />} />
            
            <Route path="new-loan" element={<NewLoan />} />
            <Route path="profile" element={<Profile />} />


          </Route>
          
          {/* <Route path="/admin" element={<AdminPage />} /> */}

          <Route path='/admin' element={<Admin.Layout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="loans" element={<AdminLoanRequests />} />
          <Route path='profile' element={<AdminProfile />} />
          <Route path="loan-requests/:id" element={ <AdminLoanRequestDetails /> } />
          <Route path="request-view/:id" element={ <AdminRequestView /> } />
          <Route path="perception" element={ <AdminPerceptions /> } />

          <Route path="perception-view/:id" element={ <AdminPerceptionView /> } />

          <Route path="customers" element={ <AdminCustomers /> } />




          </Route>
          
          {/* Auth routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/web" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App