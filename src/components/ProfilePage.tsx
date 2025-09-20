import React, { useState, useRef } from 'react'
import { User, Camera, Upload, Check, AlertCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'

interface ProfilePageProps {
  onBack: () => void
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { user } = useAuth()
  const { profile, loading: profileLoading, updateProfileImage } = useProfile()
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please select a JPEG, PNG, or WebP image' })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be smaller than 5MB' })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const filePath = fileName

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(data.path)

      // Update profile in database
      const updateResult = await updateProfileImage(publicUrl)
      
      if (updateResult.success) {
        setMessage({ type: 'success', text: 'Profile picture uploaded successfully!' })
      } else {
        throw new Error(updateResult.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setMessage({ type: 'error', text: 'Failed to upload image. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-white mt-4 text-center">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Profile Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl">
          {/* Card Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-white/70">Manage your profile information</p>
          </div>

          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-6">
            {/* Image Preview */}
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 overflow-hidden shadow-lg">
                {profile?.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 sm:w-20 sm:h-20 text-white/50" />
                  </div>
                )}
              </div>
              
              {/* Camera Icon Overlay */}
              <button
                onClick={triggerFileInput}
                disabled={uploading}
                className="absolute bottom-2 right-2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* User Info */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-1">
                {profile?.display_name || user?.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-white/70 text-sm">{user?.email}</p>
            </div>

            {/* Upload Button */}
            <button
              onClick={triggerFileInput}
              disabled={uploading}
              className="w-full max-w-sm py-3 sm:py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-2xl text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Profile Picture
                </>
              )}
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Message Display */}
            {message && (
              <div className={`w-full max-w-sm p-3 rounded-xl backdrop-blur-sm border ${
                message.type === 'success' 
                  ? 'bg-green-500/20 border-green-400/30' 
                  : 'bg-red-500/20 border-red-400/30'
              }`}>
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? (
                    <Check className="w-5 h-5 text-green-200" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-200" />
                  )}
                  <p className={`text-sm ${
                    message.type === 'success' ? 'text-green-200' : 'text-red-200'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
            )}

            {/* Upload Guidelines */}
            <div className="w-full max-w-sm bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <h3 className="text-white font-medium mb-2 text-sm">Upload Guidelines</h3>
              <ul className="text-white/70 text-xs space-y-1">
                <li>• Supported formats: JPEG, PNG, WebP</li>
                <li>• Maximum file size: 5MB</li>
                <li>• Recommended: Square images (1:1 ratio)</li>
                <li>• Minimum resolution: 200x200 pixels</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}