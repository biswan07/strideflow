import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface Profile {
  id: string
  profile_image_url: string | null
  display_name: string | null
  created_at: string
  updated_at: string
}

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            display_name: user.email?.split('@')[0] || 'User'
          }, { onConflict: 'id' })
          .select()
          .single()

        if (createError) throw createError
        setProfile(newProfile)
      } else if (error) {
        throw error
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfileImage = async (imageUrl: string) => {
    if (!user) return { success: false, error: 'No user found' }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          profile_image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return { success: true, data }
    } catch (error) {
      console.error('Error updating profile image:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { success: false, error: 'No user found' }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return { success: true, data }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  return {
    profile,
    loading,
    updateProfileImage,
    updateProfile,
    refreshProfile: fetchProfile
  }
}