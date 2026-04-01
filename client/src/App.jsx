import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { FavoritesProvider } from './context/FavoritesContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PromoDetail from './pages/PromoDetail'
import MapView from './pages/MapView'
import Account from './pages/Account'
import Favorites from './pages/Favorites'
import AdminDashboard from './pages/AdminDashboard'

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
        <Route path="/register" element={<Register />} />
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
          <FavoritesProvider>
            <AppRoutes />
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
