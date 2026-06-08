"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js"
import type { Profile } from "@/types"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      if (data.profile) {
        setProfile(data.profile)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      setUser(data.user)
      setProfile(data.profile)
      setSession(data.session)
    } catch (error) {
      console.error("Error refreshing auth:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    refresh()

    // Listen for auth changes
    const { data: { subscription } } = (window as any).supabase?.auth?.onAuthStateChange(
      (event: string, session: Session | null) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    ) || { data: { subscription: null } }

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { error: data.error || "Login failed" }
      }

      setUser(data.user)
      setSession(data.session)
      await fetchProfile(data.user.id)
      return { error: null }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error: "Network error" }
    }
  }

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signIn, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}