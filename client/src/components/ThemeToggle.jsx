import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { resolved, setTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
      className={`text-sm transition-colors cursor-pointer text-slate-600 hover:text-neon-cyan dark:text-gray-300 ${className}`}
      aria-label={resolved === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={resolved === 'dark' ? 'Mode clair' : 'Mode sombre'}
    >
      <span className="text-base leading-none" aria-hidden>
        {resolved === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  )
}
