'use client'

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import { authService, User } from '../services/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, username: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        // Ensure we're in browser environment
        if (typeof window === 'undefined') {
          setLoading(false)
          return
        }

        const token = localStorage.getItem('token')
        if (token) {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Starting login...', { email })
      const { access_token, user: userData } = await authService.login(email, password)
      
      console.log('AuthContext: Login response received', { access_token: !!access_token, user: userData })
      
      localStorage.setItem('token', access_token)
      setUser(userData)
      console.log('AuthContext: Login completed successfully')
    } catch (error) {
      console.error('AuthContext: Login failed', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const register = async (email: string, password: string, username: string) => {
    const { access_token, user: userData } = await authService.register(email, password, username)
    localStorage.setItem('token', access_token)
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

