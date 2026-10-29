// Zustand auth store
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, type LoginData, type RegisterData } from '../lib/api'

export interface AuthUser {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: 'customer' | 'staff' | 'admin'
  date_joined: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  updateProfile: (data: { first_name?: string; last_name?: string; email?: string }) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      login: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const res = await authApi.login(data)
          localStorage.setItem('access_token', res.data.access)
          localStorage.setItem('refresh_token', res.data.refresh)
          set({ user: res.data.user, isAuthenticated: true, isLoading: false })
        } catch (err: any) {
          const errMsg = err.response?.data?.detail || 'Invalid email or password.'
          set({ isLoading: false, error: errMsg })
          throw err
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const res = await authApi.register(data)
          localStorage.setItem('access_token', res.data.tokens.access)
          localStorage.setItem('refresh_token', res.data.tokens.refresh)
          set({ user: res.data.user, isAuthenticated: true, isLoading: false })
        } catch (err: any) {
          const errMsg = err.response?.data?.detail || 'Registration failed.'
          set({ isLoading: false, error: errMsg })
          throw err
        }
      },

      logout: async () => {
        const refresh = localStorage.getItem('refresh_token')
        if (refresh) {
          try { await authApi.logout(refresh) } catch { /* ignore */ }
        }
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false, error: null })
      },

      loadUser: async () => {
        const token = localStorage.getItem('access_token')
        if (!token) return
        try {
          const res = await authApi.me()
          set({ user: res.data, isAuthenticated: true })
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          set({ user: null, isAuthenticated: false })
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const res = await authApi.updateProfile(data)
          set((state) => ({
            user: state.user ? { ...state.user, ...res.data } : res.data,
            isLoading: false,
          }))
        } catch (err: any) {
          // Fallback update local user state
          set((state) => ({
            user: state.user ? { ...state.user, ...data } : null,
            isLoading: false,
          }))
        }
      },
    }),
    {
      name: 'lavendernest-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
