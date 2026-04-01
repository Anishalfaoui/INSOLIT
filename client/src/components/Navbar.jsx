import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { pathname } = useLocation()
  const onLoginPage = pathname === '/login'

  function navPillClass({ isActive }) {
    return `text-sm rounded-lg border px-3 py-2 transition-colors ${
      isActive
        ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10'
        : 'border-dark-border bg-dark-surface text-slate-600 dark:text-gray-300 hover:border-neon-purple/50'
    }`
  }

  const signOutPillClass =
    'text-sm rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-slate-600 dark:text-gray-300 hover:border-neon-purple/50 transition-colors cursor-pointer'

  return (
    <>
      <div className="fixed top-3 right-3 z-[60] md:hidden">
        <ThemeToggle />
      </div>
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
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            {user ? (
              <>
                {user.is_admin ? (
                  <NavLink to="/admin" className={navPillClass}>
                    ⚙️ Admin
                  </NavLink>
                ) : (
                  <>
                    <NavLink to="/" className={navPillClass} end>
                      Bons Plans
                    </NavLink>
                    <NavLink to="/favorites" className={navPillClass}>
                      Favoris
                    </NavLink>
                    <NavLink to="/map" className={navPillClass}>
                      Carte
                    </NavLink>
                    <NavLink to="/account" className={navPillClass}>
                      Compte
                    </NavLink>
                  </>
                )}
                <button type="button" onClick={signOut} className={signOutPillClass}>
                  Déconnexion
                </button>
              </>
            ) : onLoginPage ? (
              <Link
                to="/register"
                className="text-sm bg-linear-to-r from-neon-purple to-neon-cyan px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
              >
                Inscription
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-sm bg-linear-to-r from-neon-purple to-neon-cyan px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </nav>

      {user ? (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-dark-border bg-dark-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
          <div className={`grid ${user.is_admin ? 'grid-cols-2' : 'grid-cols-4'} px-1 py-1`}>
            {user.is_admin ? (
              <>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `mx-0.5 flex flex-col items-center rounded-lg border py-2 text-xs transition-colors ${isActive ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan' : 'border-dark-border bg-dark-surface text-slate-500 dark:text-gray-400'}`
                  }
                >
                  <span className="text-base">⚙️</span>
                  <span>Admin</span>
                </NavLink>
                <button
                  type="button"
                  onClick={signOut}
                  className="mx-0.5 flex flex-col items-center rounded-lg border border-dark-border bg-dark-surface py-2 text-xs text-slate-500 transition-colors cursor-pointer dark:text-gray-400"
                >
                  <span className="text-base">🚪</span>
                  <span>Déco</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `mx-0.5 flex flex-col items-center rounded-lg border py-2 text-xs transition-colors ${isActive ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan' : 'border-dark-border bg-dark-surface text-slate-500 dark:text-gray-400'}`
                  }
                >
                  <span className="text-base">🎟️</span>
                  <span>Offres</span>
                </NavLink>
                <NavLink
                  to="/favorites"
                  className={({ isActive }) =>
                    `mx-0.5 flex flex-col items-center rounded-lg border py-2 text-xs transition-colors ${isActive ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan' : 'border-dark-border bg-dark-surface text-slate-500 dark:text-gray-400'}`
                  }
                >
                  <span className="text-base">❤️</span>
                  <span>Favoris</span>
                </NavLink>
                <NavLink
                  to="/map"
                  className={({ isActive }) =>
                    `mx-0.5 flex flex-col items-center rounded-lg border py-2 text-xs transition-colors ${isActive ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan' : 'border-dark-border bg-dark-surface text-slate-500 dark:text-gray-400'}`
                  }
                >
                  <span className="text-base">📍</span>
                  <span>Carte</span>
                </NavLink>
                <NavLink
                  to="/account"
                  className={({ isActive }) =>
                    `mx-0.5 flex flex-col items-center rounded-lg border py-2 text-xs transition-colors ${isActive ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan' : 'border-dark-border bg-dark-surface text-slate-500 dark:text-gray-400'}`
                  }
                >
                  <span className="text-base">👤</span>
                  <span>Compte</span>
                </NavLink>
              </>
            )}
          </div>
        </nav>
      ) : (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-dark-border bg-dark-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
          <div className={`grid gap-2 px-3 py-2 ${onLoginPage ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {!onLoginPage && (
              <Link
                to="/login"
                className="text-center rounded-lg bg-dark-surface border border-dark-border py-2 text-sm text-slate-700 dark:text-gray-200"
              >
                Connexion
              </Link>
            )}
            <Link
              to="/register"
              className="text-center rounded-lg bg-linear-to-r from-neon-purple to-neon-cyan py-2 text-sm font-semibold text-white"
            >
              Inscription
            </Link>
          </div>
        </nav>
      )}
    </>
  )
}
