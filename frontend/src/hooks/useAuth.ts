import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be executed within an AuthProvider provider element')
  }
  return context
}
