import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PartnerAuthProvider } from './context/PartnerAuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { FavoritesProvider } from './context/FavoritesContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import ProtectedPartnerRoute from './components/ProtectedPartnerRoute'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PromoDetail from './pages/PromoDetail'
import MapView from './pages/MapView'
import Account from './pages/Account'
import PartnerLogin from './pages/partner/PartnerLogin'
import PartnerRegister from './pages/partner/PartnerRegister'
import PartnerDashboard from './pages/partner/PartnerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Favorites from './pages/Favorites'

function MemberOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user?.is_admin) return <Navigate to="/admin" replace />
  return children
}

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
              <MemberOnlyRoute>
                <Dashboard />
              </MemberOnlyRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/promo/:id"
          element={
            <ProtectedRoute>
              <MemberOnlyRoute>
                <PromoDetail />
              </MemberOnlyRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MemberOnlyRoute>
                <MapView />
              </MemberOnlyRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <MemberOnlyRoute>
                <Account />
              </MemberOnlyRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <MemberOnlyRoute>
                <Favorites />
              </MemberOnlyRoute>
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
      <ThemeProvider>
        <AuthProvider>
          <PartnerAuthProvider>
            <FavoritesProvider>
              <AppRoutes />
            </FavoritesProvider>
          </PartnerAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
