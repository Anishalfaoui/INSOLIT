import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  Heart,
  LogOut,
  MapPin,
  Settings,
  Ticket,
  User,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePartner } from '../context/usePartner'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { partner, partnerSignOut } = usePartner()
  const { pathname } = useLocation()
  const onLoginPage = pathname === '/login'

  function navPillClass({ isActive }) {
    return `inline-flex items-center gap-1.5 text-sm rounded-lg border px-3 py-2 transition-colors ${
      isActive
        ? 'border-insolit-pink bg-insolit-pink/10 text-insolit-pink'
        : 'border-dark-border bg-dark-surface text-slate-600 hover:border-insolit-pink/35 dark:text-gray-300'
    }`
  }

  const signOutPillClass =
    'inline-flex items-center gap-1.5 text-sm rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-slate-600 transition-colors hover:border-insolit-pink/35 dark:text-gray-300 cursor-pointer'

  const mobileNavClass = (isActive) =>
    `mx-0.5 flex flex-col items-center gap-0.5 rounded-lg border py-2 text-xs transition-colors ${
      isActive
        ? 'border-insolit-pink bg-insolit-pink/10 text-insolit-pink'
        : 'border-dark-border bg-dark-surface text-slate-500 dark:text-gray-400'
    }`

  return (
    <>
      <div className="fixed top-3 right-3 z-[60] md:hidden">
        <ThemeToggle />
      </div>
      <nav className="sticky top-0 z-50 hidden border-b border-dark-border bg-dark-card/80 backdrop-blur-md md:block">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold lowercase tracking-tight text-insolit-pink">insolit</span>
              <span className="rounded-full bg-insolit-pink/15 px-2 py-0.5 text-xs font-medium text-insolit-pink">
                -26 ans
              </span>
            </Link>
            <Link
              to="/partner/login"
              className="mt-1 text-[11px] text-theme-subtle transition-colors hover:text-neon-cyan"
            >
              Espace partenaire
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            {user ? (
              <>
                {user.is_admin ? (
                  <NavLink to="/admin" className={navPillClass}>
                    <Settings className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                    Admin
                  </NavLink>
                ) : (
                  <>
                    <NavLink to="/" className={navPillClass} end>
                      <Ticket className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                      Bons plans
                    </NavLink>
                    <NavLink to="/favorites" className={navPillClass}>
                      <Heart className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                      Favoris
                    </NavLink>
                    <NavLink to="/map" className={navPillClass}>
                      <MapPin className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                      Carte
                    </NavLink>
                    <NavLink to="/account" className={navPillClass}>
                      <User className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                      Compte
                    </NavLink>
                  </>
                )}
                <button type="button" onClick={signOut} className={signOutPillClass}>
                  <LogOut className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                  Déconnexion
                </button>
              </>
            ) : partner ? (
              <>
                <NavLink to="/partner/dashboard" className={navPillClass}>
                  <Ticket className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                  Dashboard merchant
                </NavLink>
                <button type="button" onClick={partnerSignOut} className={signOutPillClass}>
                  <LogOut className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                  Déconnexion
                </button>
              </>
            ) : onLoginPage ? (
              <Link
                to="/register"
                className="rounded-full bg-insolit-pink px-5 py-2 text-sm font-semibold text-white transition-opacity hover:bg-insolit-pink-hover hover:opacity-95"
              >
                Inscription
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-insolit-pink px-5 py-2 text-sm font-semibold text-white transition-opacity hover:bg-insolit-pink-hover hover:opacity-95"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </nav>

      {user ? (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-dark-border bg-dark-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
          <div className={`grid px-1 py-1 ${user.is_admin ? 'grid-cols-2' : 'grid-cols-4'}`}>
            {user.is_admin ? (
              <>
                <NavLink
                  to="/admin"
                  className={({ isActive }) => mobileNavClass(isActive)}
                >
                  <Settings className="h-5 w-5" strokeWidth={2} aria-hidden />
                  <span>Admin</span>
                </NavLink>
                <button
                  type="button"
                  onClick={signOut}
                  className="mx-0.5 flex flex-col items-center gap-0.5 rounded-lg border border-dark-border bg-dark-surface py-2 text-xs text-slate-500 transition-colors cursor-pointer dark:text-gray-400"
                >
                  <LogOut className="h-5 w-5" strokeWidth={2} aria-hidden />
                  <span>Déco</span>
                </button>
              </>
            ) : (
              <>
                <NavLink to="/" end className={({ isActive }) => mobileNavClass(isActive)}>
                  <Ticket className="h-5 w-5" strokeWidth={2} aria-hidden />
                  <span>Offres</span>
                </NavLink>
                <NavLink to="/favorites" className={({ isActive }) => mobileNavClass(isActive)}>
                  <Heart className="h-5 w-5" strokeWidth={2} aria-hidden />
                  <span>Favoris</span>
                </NavLink>
                <NavLink to="/map" className={({ isActive }) => mobileNavClass(isActive)}>
                  <MapPin className="h-5 w-5" strokeWidth={2} aria-hidden />
                  <span>Carte</span>
                </NavLink>
                <NavLink to="/account" className={({ isActive }) => mobileNavClass(isActive)}>
                  <User className="h-5 w-5" strokeWidth={2} aria-hidden />
                  <span>Compte</span>
                </NavLink>
              </>
            )}
          </div>
          <div className="pb-1 text-center">
            <Link to="/partner/login" className="text-[11px] text-theme-subtle">
              Espace partenaire
            </Link>
          </div>
        </nav>
      ) : partner ? (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-dark-border bg-dark-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
          <div className="grid grid-cols-2 px-1 py-1">
            <NavLink to="/partner/dashboard" className={({ isActive }) => mobileNavClass(isActive)}>
              <Ticket className="h-5 w-5" strokeWidth={2} aria-hidden />
              <span>Dashboard</span>
            </NavLink>
            <button
              type="button"
              onClick={partnerSignOut}
              className="mx-0.5 flex flex-col items-center gap-0.5 rounded-lg border border-dark-border bg-dark-surface py-2 text-xs text-slate-500 transition-colors cursor-pointer dark:text-gray-400"
            >
              <LogOut className="h-5 w-5" strokeWidth={2} aria-hidden />
              <span>Déco</span>
            </button>
          </div>
          <div className="pb-1 text-center">
            <Link to="/partner/dashboard" className="text-[11px] text-theme-subtle">
              Espace partenaire
            </Link>
          </div>
        </nav>
      ) : (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-dark-border bg-dark-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
          <div className={`grid gap-2 px-3 py-2 ${onLoginPage ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {!onLoginPage && (
              <Link
                to="/login"
                className="rounded-lg border border-dark-border bg-dark-surface py-2 text-center text-sm text-slate-700 dark:text-gray-200"
              >
                Connexion
              </Link>
            )}
            <Link
              to="/register"
              className="rounded-full bg-insolit-pink py-2 text-center text-sm font-semibold text-white hover:bg-insolit-pink-hover"
            >
              Inscription
            </Link>
          </div>
          <div className="pb-1 text-center">
            <Link to="/partner/login" className="text-[11px] text-theme-subtle">
              Espace partenaire
            </Link>
          </div>
        </nav>
      )}
    </>
  )
}
