import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePartner } from '../context/usePartner'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { partner, partnerSignOut } = usePartner()
  const { pathname } = useLocation()

  const isAuthPage = [
    '/login',
    '/register',
    '/partner/login',
    '/partner/register',
    '/login-partner',
    '/register-partner',
  ].includes(pathname)

  function navLinkClass({ isActive }) {
    return `text-sm transition-colors ${isActive ? 'text-neon-cyan' : 'text-gray-300 hover:text-neon-cyan'}`
  }

  return (
    <>
      <nav className="hidden md:block border-b border-dark-border bg-dark-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-linear-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
              INSOLIT
            </span>
            <span className="text-xs bg-neon-purple/20 text-neon-purple px-2 py-0.5 rounded-full font-medium">
              -26 ans
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <NavLink to="/" className={navLinkClass} end>
                  Bons Plans
                </NavLink>
                <NavLink to="/map" className={navLinkClass}>
                  Carte
                </NavLink>
                <NavLink to="/account" className={navLinkClass}>
                  Compte
                </NavLink>
                <button
                  onClick={signOut}
                  className="text-sm bg-dark-surface border border-dark-border px-4 py-2 rounded-lg hover:border-neon-purple/50 transition-colors cursor-pointer"
                >
                  Déconnexion
                </button>
              </>
            ) : partner ? (
              <>
                <NavLink to="/partner/dashboard" className={navLinkClass}>
                  Dashboard partner
                </NavLink>
                <button
                  onClick={partnerSignOut}
                  className="text-sm bg-dark-surface border border-dark-border px-4 py-2 rounded-lg hover:border-neon-cyan/50 transition-colors cursor-pointer"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              !isAuthPage && (
                <Link
                  to="/login"
                  className="text-sm bg-linear-to-r from-neon-purple to-neon-cyan px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                >
                  Connexion
                </Link>
              )
            )}
          </div>
        </div>
      </nav>

      {user ? (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-dark-border bg-dark-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
          <div className="grid px-1 py-1 grid-cols-3">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex flex-col items-center rounded-lg py-2 text-xs transition-colors ${isActive ? 'text-neon-cyan bg-dark-surface' : 'text-gray-400'}`
              }
            >
              <span className="text-base">🎟️</span>
              <span>Offres</span>
            </NavLink>

            <NavLink
              to="/map"
              className={({ isActive }) =>
                `flex flex-col items-center rounded-lg py-2 text-xs transition-colors ${isActive ? 'text-neon-cyan bg-dark-surface' : 'text-gray-400'}`
              }
            >
              <span className="text-base">📍</span>
              <span>Carte</span>
            </NavLink>

            <NavLink
              to="/account"
              className={({ isActive }) =>
                `flex flex-col items-center rounded-lg py-2 text-xs transition-colors ${isActive ? 'text-neon-cyan bg-dark-surface' : 'text-gray-400'}`
              }
            >
              <span className="text-base">👤</span>
              <span>Compte</span>
            </NavLink>
          </div>
        </nav>
      ) : partner ? (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-dark-border bg-dark-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
          <div className="grid grid-cols-2 px-1 py-1">
            <NavLink
              to="/partner/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center rounded-lg py-2 text-xs transition-colors ${isActive ? 'text-neon-cyan bg-dark-surface' : 'text-gray-400'}`
              }
            >
              <span className="text-base">🧾</span>
              <span>Dashboard</span>
            </NavLink>
            <button
              onClick={partnerSignOut}
              className="flex flex-col items-center rounded-lg py-2 text-xs text-gray-400 border border-dark-border bg-dark-surface cursor-pointer"
            >
              <span className="text-base">🚪</span>
              <span>Déconnexion</span>
            </button>
          </div>
        </nav>
      ) : !isAuthPage ? (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-dark-border bg-dark-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
          <div className="grid grid-cols-2 gap-2 px-3 py-2">
            <Link
              to="/login"
              className="text-center rounded-lg bg-dark-surface border border-dark-border py-2 text-sm text-gray-200"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="text-center rounded-lg bg-linear-to-r from-neon-purple to-neon-cyan py-2 text-sm font-semibold text-white"
            >
              Inscription
            </Link>
          </div>
        </nav>
      ) : null}
    </>
  )
}
