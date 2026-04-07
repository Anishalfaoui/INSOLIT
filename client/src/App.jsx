import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PartnerAuthProvider } from './context/PartnerAuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import ProtectedPartnerRoute from './components/ProtectedPartnerRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PromoDetail from './pages/PromoDetail'
import MapView from './pages/MapView'
import Account from './pages/Account'
import PartnerLogin from './pages/partner/PartnerLogin'
import PartnerRegister from './pages/partner/PartnerRegister'
import PartnerDashboard from './pages/partner/PartnerDashboard'

function AppRoutes() {
  return (
    <div className="min-h-screen bg-dark-bg pb-20 md:pb-0">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/partner/login" element={<PartnerLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/partner/register" element={<PartnerRegister />} />
        <Route path="/login-partner" element={<Navigate to="/partner/login" replace />} />
        <Route path="/register-partner" element={<Navigate to="/partner/register" replace />} />
        <Route
          path="/partner/dashboard"
          element={
            <ProtectedPartnerRoute>
              <PartnerDashboard />
            </ProtectedPartnerRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/promo/:id"
          element={
            <ProtectedRoute>
              <PromoDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PartnerAuthProvider>
          <AppRoutes />
        </PartnerAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
