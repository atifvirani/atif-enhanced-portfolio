import { useState, type FormEvent } from 'react'
import { Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { api } from '../../services/api'

interface AdminLoginProps {
  isSetupMode: boolean
  onAuthenticated: (token: string, username: string) => void
}

export function AdminLogin({ isSetupMode, onAuthenticated }: AdminLoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (isSetupMode && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      if (isSetupMode) {
        const res = await api.setupAdmin(username, password)
        localStorage.setItem('atif_admin_token', res.token)
        onAuthenticated(res.token, res.username)
      } else {
        const res = await api.login(username, password)
        localStorage.setItem('atif_admin_token', res.token)
        onAuthenticated(res.token, res.username)
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12">
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-md p-8 sm:p-10 border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-2xl">
        {/* Header */}
        <div className="space-y-2 mb-8 border-b border-white/[0.08] pb-6">
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-[11px] uppercase tracking-[0.2em] text-zinc-400">
              {isSetupMode ? 'Initial Security Setup' : 'Terminal Access'}
            </span>
            <span className="px-2 py-0.5 border border-white/10 text-[10px] font-mono-code text-zinc-400">
              v1.0 CMS
            </span>
          </div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-medium tracking-tight text-white">
            {isSetupMode ? 'Create Admin Account' : 'Portfolio Admin'}
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            {isSetupMode
              ? 'Initialize the primary administrative credential for portfolio content control.'
              : 'Sign in to manage projects, verify real data, and configure portfolio assets.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs font-mono-code flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block font-mono-code text-[10px] uppercase tracking-widest text-zinc-400"
            >
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin username"
                className="w-full bg-black/60 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono-code transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block font-mono-code text-[10px] uppercase tracking-widest text-zinc-400"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSetupMode ? 'Minimum 8 characters' : 'Enter password'}
                className="w-full bg-black/60 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono-code transition-colors"
              />
            </div>
          </div>

          {isSetupMode && (
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block font-mono-code text-[10px] uppercase tracking-widest text-zinc-400"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-black/60 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono-code transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-4 bg-white text-black font-semibold uppercase tracking-[0.2em] text-xs font-mono-code hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{isSetupMode ? 'Create Account & Sign In' : 'Authenticate'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-white/[0.08] text-center">
          <a
            href="/"
            className="font-mono-code text-[11px] text-zinc-500 hover:text-white transition-colors"
          >
            &larr; Return to Portfolio
          </a>
        </div>
      </div>
    </div>
  )
}
