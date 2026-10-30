import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { api } from '../../services/api'
import { AdminLogin } from './AdminLogin'
import { AdminDashboard } from './AdminDashboard'

export function AdminApp() {
  const [loading, setLoading] = useState(true)
  const [hasAdmin, setHasAdmin] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState<string>('')

  useEffect(() => {
    async function checkSession() {
      try {
        const status = await api.getAuthStatus()
        setHasAdmin(status.hasAdmin)

        const savedToken = localStorage.getItem('atif_admin_token')
        if (savedToken) {
          try {
            const me = await api.verifySession(savedToken)
            setToken(savedToken)
            setUsername(me.user.username)
          } catch {
            localStorage.removeItem('atif_admin_token')
            setToken(null)
          }
        }
      } catch (err) {
        console.warn('[AdminApp] Error checking session status:', err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleAuthenticated = (newToken: string, user: string) => {
    setToken(newToken)
    setUsername(user)
    setHasAdmin(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('atif_admin_token')
    setToken(null)
    setUsername('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-3 font-mono-code text-xs">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        <span>Initializing CMS Terminal...</span>
      </div>
    )
  }

  if (!token) {
    return (
      <AdminLogin
        isSetupMode={!hasAdmin}
        onAuthenticated={handleAuthenticated}
      />
    )
  }

  return (
    <AdminDashboard
      token={token}
      username={username}
      onLogout={handleLogout}
    />
  )
}
