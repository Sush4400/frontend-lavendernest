import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import './Auth.css'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error, clearError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await login({ email, password })
      toast.success('Welcome back to LavenderNest!', { icon: '💜' })
      navigate(from, { replace: true })
    } catch {
      toast.error('Invalid email or password.')
    }
  }

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    try {
      await login({ email: demoEmail, password: demoPass })
      toast.success(`Logged in as ${demoEmail}`, { icon: '✨' })
      navigate(from, { replace: true })
    } catch {
      toast.error('Failed to log in with demo account')
    }
  }

  return (
    <div className="auth-page container">
      <div className="auth-card glass">
        <div className="auth-header text-center">
          <div className="auth-badge">
            <Sparkles size={14} />
            <span>Welcome Back</span>
          </div>
          <h1 className="auth-title">Sign In to Your Nest</h1>
          <p className="auth-subtitle">
            Access your curated wishlist, track handcrafted orders, and enjoy member perks.
          </p>
        </div>

        {error && <div className="auth-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-icon-wrap">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="flex-between">
              <label>Password</label>
              <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); toast('Password reset link sent to your email.', { icon: '📧' }) }}>
                Forgot?
              </a>
            </div>
            <div className="input-icon-wrap">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-auth-submit"
          >
            {isLoading ? <span>Signing In...</span> : <span>Sign In</span>}
          </button>
        </form>

        <div className="demo-accounts-box">
          <span className="demo-label">⚡ 1-Click Quick Demo Sign-In:</span>
          <div className="demo-btns">
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleQuickDemoLogin('customer@lavendernest.com', 'customer12345')}
            >
              Sophia Rose (Customer)
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleQuickDemoLogin('admin@lavendernest.com', 'admin12345')}
            >
              Eleanor Vane (Admin/Staff)
            </button>
          </div>
        </div>

        <div className="auth-footer text-center">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
export default LoginPage
