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
import Favorites from './pages/Favorites'
import AdminDashboard from './pages/AdminDashboard'
import PartnerLogin from './pages/partner/PartnerLogin'
import PartnerRegister from './pages/partner/PartnerRegister'
import PartnerDashboard from './pages/partner/PartnerDashboard'

function MemberOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user?.is_admin) return <Navigate to="/admin" replace />
  return children
}

function AppRoutes() {
  return (
    <div className="page-shell min-h-screen pb-20 md:pb-0">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/partner/login" element={<PartnerLogin />} />
        <Route path="/partner/register" element={<PartnerRegister />} />
        <Route
          path="/partner/dashboard"
          element={(
            <ProtectedPartnerRoute>
              <PartnerDashboard />
            </ProtectedPartnerRoute>
          )}
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
          path="/favorites"
          element={
            <ProtectedRoute>
              <MemberOnlyRoute>
                <Favorites />
              </MemberOnlyRoute>
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<AdminDashboard />} />
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
