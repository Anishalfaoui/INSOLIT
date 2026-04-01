import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { resolved, setTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-dark-surface hover:text-insolit-pink dark:text-gray-300 dark:hover:text-insolit-pink ${className}`}
      aria-label={resolved === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={resolved === 'dark' ? 'Mode clair' : 'Mode sombre'}
    >
      {resolved === 'dark' ? (
        <Sun className="h-5 w-5" strokeWidth={2} aria-hidden />
      ) : (
        <Moon className="h-5 w-5" strokeWidth={2} aria-hidden />
      )}
    </button>
  )
}
