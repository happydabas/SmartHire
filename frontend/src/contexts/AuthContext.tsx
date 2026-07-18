import React, { createContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  role: 'candidate' | 'recruiter' | 'admin'
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, refresh: string, userProfile: User) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Check local storage on mount to initialize auth session
    setIsLoading(false)
  }, [])

  const login = (token: string, refresh: string, userProfile: User) => {
    setUser(userProfile)
  };

  const logout = () => {
    setUser(null)
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
