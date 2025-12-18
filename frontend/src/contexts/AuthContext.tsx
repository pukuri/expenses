import { createContext, useContext, useEffect, useState } from "react"
import { Navigate } from "react-router-dom";

interface User {
  id: number;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
}
      
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
      
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  
  const fetchUser = async (): Promise<void> => {
    try {
      const response = await fetch("/api/auth/logged_user")
      if (!response.ok) {
        setUser(null)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } else {
        const result = await response.json()
        setUser(result.data)
      }
    } catch (err) {
      console.error(err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchUser()
  }, [])
  
  return (
    <AuthContext.Provider value={{ user, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function ProtectedRoute({children}: { children: React.ReactNode}) {
  const { user, loading } = useAuth()
  
  if(loading) {
    return <div>Loading...</div>
  }
  
  if (!user) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}