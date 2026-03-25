import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { pathname } = useLocation()

  function linkClass(path) {
    const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path)
    return `text-sm transition-colors ${isActive ? 'text-neon-cyan font-semibold' : 'text-gray-300 hover:text-neon-cyan'}`
  }

  return (
    <nav className="border-b border-dark-border bg-dark-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
            INSOLIT
          </span>
          <span className="text-xs bg-neon-purple/20 text-neon-purple px-2 py-0.5 rounded-full font-medium">
            -26 ans
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/" className={linkClass('/')}>
                Bons Plans
              </Link>
              <Link to="/map" className={linkClass('/map')}>
                Carte
              </Link>
              <Link to="/account" className={linkClass('/account')}>
                Compte
              </Link>
              <button
                onClick={signOut}
                className="text-sm bg-dark-surface border border-dark-border px-4 py-2 rounded-lg hover:border-neon-purple/50 transition-colors cursor-pointer"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm bg-gradient-to-r from-neon-purple to-neon-cyan px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
